from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.scrapers.inspector import analyze_url

app = FastAPI(title="CodeAuthentic AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://code-authentic-ai.vercel.app", "*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InspectRequest(BaseModel):
    url: str

class BulkInspectRequest(BaseModel):
    urls: List[str]

@app.get("/")
def root():
    return {"message": "CodeAuthentic AI API is running!"}

@app.post("/api/inspect")
def inspect_project(payload: InspectRequest):
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    result = analyze_url(url)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result

@app.post("/api/bulk-inspect")
def bulk_inspect_projects(payload: BulkInspectRequest):
    urls = [url.strip() for url in payload.urls if url.strip()]
    if not urls:
        raise HTTPException(status_code=400, detail="URL list is required")

    results = []
    for url in urls:
        results.append(analyze_url(url))

    return {"batch_results": results}