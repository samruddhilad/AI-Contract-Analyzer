import logging
import os
import threading
from functools import lru_cache
from typing import Optional

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

logger = logging.getLogger("slm")

MODEL_NAME = os.getenv("SLM_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")
MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "350"))

# Optimal thread count for CPU inference (avoids P/E core thrashing)
CPU_THREADS = int(os.getenv("TORCH_THREADS", str(min(8, max(2, (os.cpu_count() or 4))))))
torch.set_num_threads(CPU_THREADS)

# Mutex to ensure sequential CPU inference and avoid CPU cache contention
_INFERENCE_LOCK = threading.Lock()


@lru_cache(maxsize=1)
def load_model():
    logger.info("Initializing tokenizer and Qwen model: %s", MODEL_NAME)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    if torch.cuda.is_available():
        dtype = torch.float16
        device_map = "auto"
    elif hasattr(torch, "bfloat16"):
        # bfloat16 delivers 2x speedup and halves memory bandwidth on modern CPUs
        dtype = torch.bfloat16
        device_map = None
    else:
        dtype = torch.float32
        device_map = None

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        dtype=dtype,
        device_map=device_map,
    )

    if not torch.cuda.is_available():
        model = model.to("cpu")

    model.eval()
    logger.info("Model loaded successfully on %s with dtype %s", "cuda" if torch.cuda.is_available() else "cpu", dtype)
    return tokenizer, model


def warmup_slm():
    """Warms up the model in memory on startup so first request has zero delay."""
    try:
        tokenizer, model = load_model()
        inp = tokenizer("Hello", return_tensors="pt")
        device = next(model.parameters()).device
        inp = {k: v.to(device) for k, v in inp.items()}
        with torch.no_grad():
            _ = model.generate(**inp, max_new_tokens=2, do_sample=False)
        logger.info("SLM warmup complete.")
    except Exception as exc:
        logger.warning("SLM warmup encountered issue: %s", exc)


def generate(
    prompt: str,
    system: str = "You are a careful document analysis assistant.",
    max_new_tokens: Optional[int] = None,
) -> str:
    limit = max_new_tokens or MAX_NEW_TOKENS
    tokenizer, model = load_model()

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt},
    ]

    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )

    # Prevent out-of-memory or excessive CPU delay if context is unusually long
    inputs = tokenizer(text, return_tensors="pt")
    if inputs["input_ids"].shape[1] > 3200:
        # Keep prompt start and end, truncate middle
        first_half = inputs["input_ids"][:, :2200]
        second_half = inputs["input_ids"][:, -800:]
        inputs["input_ids"] = torch.cat([first_half, second_half], dim=1)
        inputs["attention_mask"] = torch.ones_like(inputs["input_ids"])

    device = next(model.parameters()).device
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with _INFERENCE_LOCK:
        with torch.no_grad():
            out = model.generate(
                **inputs,
                max_new_tokens=limit,
                do_sample=False,
            )

    generated = out[0][inputs["input_ids"].shape[1] :]
    return tokenizer.decode(generated, skip_special_tokens=True).strip()
