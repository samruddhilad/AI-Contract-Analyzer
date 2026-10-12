import asyncio
import logging
from pathlib import Path
from uuid import uuid4
from typing import Optional

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from services.document import SUPPORTED_EXTENSIONS
from services.jobs import cancel_job, create_job, get_job, update_job
from services.pipeline import analyze_file

logger = logging.getLogger("analyze_route")
router = APIRouter(tags=["Analysis"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


async def _run_job_worker(job_id: str, file_path: str, filename: str):
    progress_task = None
    try:
        update_job(job_id, status="processing", stage="Extracting text and structure...", progress=15)

        async def _heartbeat():
            timeline = [
                (25, "Extracting text and document structure...", 0.8),
                (45, "Classifying document type & scanning entities...", 1.2),
                (60, "Generating semantic embeddings & citations...", 1.8),
                (75, "Running LexiGuard AI reasoning with Qwen2.5-1.5B...", 2.5),
                (80, "AI reasoning: analyzing clauses & obligations...", 4.0),
                (85, "AI reasoning: extracting entity relationships...", 5.0),
                (90, "AI reasoning: formulating executive summary...", 6.0),
                (95, "Finalizing risk profile and structured analysis...", 8.0),
            ]
            for target_p, stg, wait_sec in timeline:
                await asyncio.sleep(wait_sec)
                job = get_job(job_id)
                if not job or job.get("status") != "processing" or job.get("cancelled"):
                    break
                if job.get("progress", 0) < target_p:
                    update_job(job_id, stage=stg, progress=target_p)

        progress_task = asyncio.create_task(_heartbeat())

        # Execute CPU-bound pipeline in worker thread to prevent event loop blocking
        result = await asyncio.to_thread(analyze_file, file_path, filename=filename, job_id=job_id)
        result["file_id"] = job_id
        result["filename"] = filename
        update_job(job_id, status="completed", stage="Analysis complete!", progress=100, result=result)
    except Exception as exc:
        err_msg = str(exc)
        logger.exception("Error during analysis job %s: %s", job_id, err_msg)
        update_job(job_id, status="failed", stage="Analysis failed", error=err_msg)
    finally:
        if progress_task and not progress_task.done():
            progress_task.cancel()
        Path(file_path).unlink(missing_ok=True)


@router.post("/analyze")
async def analyze_contract(
    file: UploadFile = File(...),
    async_mode: bool = Query(default=False, description="Whether to run in async polling mode"),
):
    original_filename = file.filename or "uploaded_document"
    suffix = Path(original_filename).suffix.lower()

    if suffix not in SUPPORTED_EXTENSIONS:
        formats_list = ", ".join(sorted(list(SUPPORTED_EXTENSIONS)))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: '{suffix}'. Supported formats: {formats_list}",
        )

    data = await file.read()
    if not data or len(data) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

    file_id = str(uuid4())
    path = UPLOAD_DIR / f"{file_id}{suffix}"
    path.write_bytes(data)

    if async_mode:
        job_id = create_job(original_filename)
        # Spawn background analysis task
        asyncio.create_task(_run_job_worker(job_id, str(path), original_filename))
        return {
            "job_id": job_id,
            "status": "processing",
            "stage": "Extracting text and structure...",
            "filename": original_filename,
        }

    # Synchronous processing mode
    try:
        result = await asyncio.to_thread(analyze_file, str(path), filename=original_filename)
        result["file_id"] = file_id
        result["filename"] = original_filename
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        path.unlink(missing_ok=True)


@router.get("/jobs/{job_id}")
def get_job_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {
        "job_id": job["job_id"],
        "filename": job["filename"],
        "status": job["status"],
        "stage": job["stage"],
        "progress": job.get("progress", 0),
        "result": job.get("result"),
        "error": job.get("error"),
    }


@router.post("/jobs/{job_id}/cancel")
def cancel_analysis(job_id: str):
    success = cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"job_id": job_id, "status": "cancelled", "message": "Job cancellation requested."}


@router.get("/supported-formats")
def get_supported_formats():
    return {"supported_extensions": sorted(list(SUPPORTED_EXTENSIONS))}
