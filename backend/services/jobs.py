import threading
import time
import uuid
from typing import Any, Dict, Optional


class JobStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


_jobs: Dict[str, Dict[str, Any]] = {}
_jobs_lock = threading.Lock()


def create_job(filename: str) -> str:
    cleanup_old_jobs()
    job_id = str(uuid.uuid4())
    with _jobs_lock:
        _jobs[job_id] = {
            "job_id": job_id,
            "filename": filename,
            "status": JobStatus.PENDING,
            "stage": "Document uploaded and queued for processing...",
            "progress": 5,
            "result": None,
            "error": None,
            "cancelled": False,
            "created_at": time.time(),
            "updated_at": time.time(),
        }
    return job_id


def update_job(
    job_id: str,
    status: Optional[str] = None,
    stage: Optional[str] = None,
    progress: Optional[int] = None,
    result: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None,
):
    with _jobs_lock:
        job = _jobs.get(job_id)
        if not job:
            return
        if status:
            job["status"] = status
        if stage:
            job["stage"] = stage
        if progress is not None:
            job["progress"] = progress
        if result is not None:
            job["result"] = result
        if error is not None:
            job["error"] = error
        job["updated_at"] = time.time()


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    with _jobs_lock:
        job = _jobs.get(job_id)
        return dict(job) if job else None


def cancel_job(job_id: str) -> bool:
    with _jobs_lock:
        job = _jobs.get(job_id)
        if not job:
            return False
        job["cancelled"] = True
        job["status"] = JobStatus.CANCELLED
        job["stage"] = "Analysis cancelled by user."
        job["updated_at"] = time.time()
        return True


def is_job_cancelled(job_id: str) -> bool:
    with _jobs_lock:
        job = _jobs.get(job_id)
        return bool(job and job.get("cancelled"))


def cleanup_old_jobs(max_age_seconds: int = 3600):
    now = time.time()
    with _jobs_lock:
        to_del = [
            jid
            for jid, j in _jobs.items()
            if now - j.get("created_at", now) > max_age_seconds
        ]
        for jid in to_del:
            del _jobs[jid]
