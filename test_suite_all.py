import time
import requests
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"


def poll_job_until_done(job_id, timeout_sec=120):
    start = time.time()
    url = f"{BASE_URL}/api/jobs/{job_id}"
    while time.time() - start < timeout_sec:
        res = requests.get(url, timeout=10)
        assert res.status_code == 200, f"Poll failed: {res.text}"
        data = res.json()
        status = data.get("status")
        stage = data.get("stage")
        print(f"   [Poll] Job {job_id[:8]} -> status: {status}, stage: {stage}")
        if status == "completed":
            return data.get("result")
        elif status == "failed":
            raise RuntimeError(f"Job failed: {data.get('error')}")
        elif status == "cancelled":
            raise RuntimeError("Job was cancelled")
        time.sleep(2)
    raise TimeoutError(f"Job {job_id} timed out after {timeout_sec}s")


def test_1_small_pdf_contract():
    print("\n--- Test 1: Small PDF Contract (Sync & Async) ---")
    url = f"{BASE_URL}/api/analyze?async_mode=true"
    with open("test_contract.pdf", "rb") as f:
        res = requests.post(url, files={"file": ("test_contract.pdf", f, "application/pdf")}, timeout=15)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    job_id = res.json()["job_id"]
    print(f"Created job: {job_id}")
    result = poll_job_until_done(job_id)
    assert result["summary"], "Missing summary"
    assert "contract_type" in result, "Missing contract_type"
    print(f"Contract type: {result['contract_type']['contract_type']}")
    print(f"Summary excerpt: {result['summary'][:120]}...")
    print("Test 1 PASSED!")


def test_2_docx_contract():
    print("\n--- Test 2: DOCX Contract ---")
    url = f"{BASE_URL}/api/analyze?async_mode=true"
    with open("test_contract.docx", "rb") as f:
        res = requests.post(url, files={"file": ("test_contract.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}, timeout=15)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    result = poll_job_until_done(res.json()["job_id"])
    assert result["summary"], "Missing summary"
    print(f"Entities found: {list(result['entities'].keys())}")
    print("Test 2 PASSED!")


def test_3_txt_contract():
    print("\n--- Test 3: TXT Contract ---")
    url = f"{BASE_URL}/api/analyze?async_mode=true"
    with open("test_contract.txt", "rb") as f:
        res = requests.post(url, files={"file": ("test_contract.txt", f, "text/plain")}, timeout=15)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    result = poll_job_until_done(res.json()["job_id"])
    assert result["clean_text"], "Missing clean text"
    print(f"Executive summary: {result['executive_summary'][:120]}...")
    print("Test 3 PASSED!")


def test_4_long_contract():
    print("\n--- Test 4: Long Contract ---")
    url = f"{BASE_URL}/api/analyze?async_mode=true"
    with open("test_long_contract.txt", "rb") as f:
        res = requests.post(url, files={"file": ("test_long_contract.txt", f, "text/plain")}, timeout=15)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    result = poll_job_until_done(res.json()["job_id"])
    assert result["chunk_count"] > 1, "Expected multiple chunks for long document"
    print(f"Chunk count: {result['chunk_count']}")
    print(f"Parties: {result['entities']['parties']}")
    print(f"Risk analysis: {result['risk_analysis'][:120]}...")
    print("Test 4 PASSED!")


def test_5_general_non_legal_document():
    print("\n--- Test 5: General Non-Legal Document (Markdown Tech Spec) ---")
    url = f"{BASE_URL}/api/analyze?async_mode=true"
    with open("test_tech_spec.md", "rb") as f:
        res = requests.post(url, files={"file": ("test_tech_spec.md", f, "text/markdown")}, timeout=15)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    result = poll_job_until_done(res.json()["job_id"])
    print(f"Detected Category / Type: {result['contract_type']['contract_type']}, is_contract={result['is_contract']}")
    assert result["is_contract"] is False, "Technical spec should not be treated as a contract"
    print("Test 5 PASSED!")


def test_6_empty_file():
    print("\n--- Test 6: Empty File (0 Bytes) ---")
    url = f"{BASE_URL}/api/analyze"
    with open("test_empty.txt", "rb") as f:
        res = requests.post(url, files={"file": ("test_empty.txt", f, "text/plain")}, timeout=10)
    print(f"Status Code: {res.status_code} (Expected 400)")
    assert res.status_code == 400, f"Expected 400, got {res.status_code}"
    print(f"Error detail: {res.json()['detail']}")
    print("Test 6 PASSED!")


def test_7_corrupted_file():
    print("\n--- Test 7: Corrupted PDF File ---")
    url = f"{BASE_URL}/api/analyze"
    with open("test_corrupt.pdf", "rb") as f:
        res = requests.post(url, files={"file": ("test_corrupt.pdf", f, "application/pdf")}, timeout=10)
    print(f"Status Code: {res.status_code} (Expected 400)")
    assert res.status_code == 400, f"Expected 400, got {res.status_code}"
    print(f"Error detail: {res.json()['detail']}")
    print("Test 7 PASSED!")


def test_8_ask_ai_present_in_document():
    print("\n--- Test 8: Ask AI (Answer Present) ---")
    contract_text = Path("test_contract.txt").read_text(encoding="utf-8")
    url = f"{BASE_URL}/api/ask"
    res = requests.post(url, json={
        "contract_text": contract_text,
        "question": "What is the monthly rent amount and when is it due?",
    }, timeout=120)
    assert res.status_code == 200, f"Ask AI failed: {res.text}"
    data = res.json()
    print(f"Question: {data['question']}")
    print(f"Answer: {data['answer']}")
    print(f"Retrieved sources: {len(data['retrieved_sections'])} sections")
    assert "$1,500" in data["answer"] or "1500" in data["answer"], "Expected $1,500 in answer"
    print("Test 8 PASSED!")


def test_9_ask_ai_absent_from_document():
    print("\n--- Test 9: Ask AI (Answer Absent from Document) ---")
    contract_text = Path("test_contract.txt").read_text(encoding="utf-8")
    url = f"{BASE_URL}/api/ask"
    res = requests.post(url, json={
        "contract_text": contract_text,
        "question": "Are pets like dogs and cats permitted on the premises?",
    }, timeout=120)
    assert res.status_code == 200, f"Ask AI failed: {res.text}"
    data = res.json()
    print(f"Question: {data['question']}")
    print(f"Answer: {data['answer']}")
    lower_ans = data["answer"].lower()
    assert "not specified" in lower_ans or "not contain" in lower_ans or "no" in lower_ans, "Expected acknowledgment of absent detail"
    print("Test 9 PASSED!")


def test_10_ask_ai_follow_up():
    print("\n--- Test 10: Ask AI Follow-up Questions with Conversation Context ---")
    contract_text = Path("test_long_contract.txt").read_text(encoding="utf-8")
    url = f"{BASE_URL}/api/ask"
    
    # Turn 1
    res1 = requests.post(url, json={
        "contract_text": contract_text,
        "question": "What is the annual subscription fee for the platform?",
    }, timeout=90)
    assert res1.status_code == 200
    ans1 = res1.json()["answer"]
    print(f"Turn 1 Q: What is the annual subscription fee?")
    print(f"Turn 1 A: {ans1}")
    
    # Turn 2: Follow up referring to turn 1
    res2 = requests.post(url, json={
        "contract_text": contract_text,
        "question": "How often are installments paid for that fee and what is the installment amount?",
        "conversation_history": [
            {"sender": "user", "text": "What is the annual subscription fee for the platform?"},
            {"sender": "ai", "text": ans1},
        ],
    }, timeout=90)
    assert res2.status_code == 200
    ans2 = res2.json()["answer"]
    print(f"\nTurn 2 Q: How often are installments paid for that fee and what is the installment amount?")
    print(f"Turn 2 A: {ans2}")
    assert "18,750" in ans2 or "quarter" in ans2.lower(), "Expected installment details in follow up"
    print("Test 10 PASSED!")


def test_11_job_cancellation():
    print("\n--- Test 11: Background Job Cancellation ---")
    url = f"{BASE_URL}/api/analyze?async_mode=true"
    with open("test_long_contract.txt", "rb") as f:
        res = requests.post(url, files={"file": ("test_long_contract.txt", f, "text/plain")}, timeout=15)
    assert res.status_code == 200
    job_id = res.json()["job_id"]
    
    # Cancel immediately
    cancel_res = requests.post(f"{BASE_URL}/api/jobs/{job_id}/cancel", timeout=5)
    assert cancel_res.status_code == 200
    print(f"Cancel response: {cancel_res.json()}")
    
    # Verify status is cancelled
    status_res = requests.get(f"{BASE_URL}/api/jobs/{job_id}", timeout=5)
    assert status_res.status_code == 200
    print(f"Status after cancel: {status_res.json()['status']}")
    assert status_res.json()["status"] == "cancelled"
    print("Test 11 PASSED!")


if __name__ == "__main__":
    t0 = time.time()
    test_6_empty_file()
    test_7_corrupted_file()
    test_11_job_cancellation()
    test_8_ask_ai_present_in_document()
    test_9_ask_ai_absent_from_document()
    test_3_txt_contract()
    test_1_small_pdf_contract()
    test_2_docx_contract()
    test_4_long_contract()
    test_10_ask_ai_follow_up()
    test_5_general_non_legal_document()
    print(f"\n==========================================")
    print(f"ALL 11 TEST SUITES PASSED in {time.time()-t0:.1f}s!")
    print(f"==========================================")
