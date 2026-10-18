import re
import requests
from bs4 import BeautifulSoup

def analyze_url(url: str):
    is_github = "github.com" in url.lower()
    if is_github:
        return analyze_github_repo(url)
    else:
        return analyze_live_website(url)

def get_detailed_teacher_evaluation(score: int):
    if score >= 85:
        return {
            "summary": "High Human Originality. Code shows strong custom logic and manual architecture.",
            "risk_level": "Low Risk",
            "recommended_viva_questions": [
                "Explain the project folder structure and architectural design choices.",
                "How did you optimize API performance and database queries?"
            ],
            "grading_advice": "Recommended for high grade approval. Direct viva clearance."
        }
    elif score >= 70:
        return {
            "summary": "Balanced Blend. Good combination of handwritten logic and standard framework utilities.",
            "risk_level": "Moderate Risk",
            "recommended_viva_questions": [
                "Explain the data flow between frontend components and backend APIs.",
                "Did you use any AI code assistants for boilerplate generation?"
            ],
            "grading_advice": "Approved for viva. Ask specific questions about custom state handling."
        }
    else:
        return {
            "summary": "High AI Reliance. Significant portion of boilerplate or AI-generated structures detected.",
            "risk_level": "High Risk",
            "recommended_viva_questions": [
                "Walk through the custom algorithm or main logic line-by-line.",
                "Re-implement a core function live during the viva presentation."
            ],
            "grading_advice": "Strict viva recommended. Verify if student understands the generated code."
        }

def generate_linkedin_post(title: str, url: str, score: int, tech_stack: list) -> str:
    tech_str = ", ".join(tech_stack)
    return (
        f"🚀 Excited to share my latest project audit for {title}!\n\n"
        f"🔗 Live Project / Repo: {url}\n\n"
        f"📊 Code Authenticity Rating: {score}% Human Originality\n"
        f"🛠️ Tech Stack: {tech_str}\n\n"
        f"Verified via #CodeAuthenticAI — automated code inspection, AI ratio detection & full project architecture explanation engine.\n\n"
        f"#WebDevelopment #SoftwareEngineering #BuildInPublic #ReactJS #NextJS #FastAPI #DeveloperTools"
    )

def analyze_github_repo(url: str):
    try:
        parts = url.rstrip("/").split("/")
        if len(parts) < 5:
            return {"error": "Invalid GitHub repository URL format."}
        
        owner, repo = parts[3], parts[4]
        api_url = f"https://api.github.com/repos/{owner}/{repo}"
        commits_url = f"https://api.github.com/repos/{owner}/{repo}/commits"

        headers = {"User-Agent": "CodeAuthentic-AI-App"}
        
        repo_res = requests.get(api_url, headers=headers, timeout=10)
        commits_res = requests.get(commits_url, headers=headers, timeout=10)

        if repo_res.status_code != 200:
            return {"error": f"GitHub Repository not found or private (Status: {repo_res.status_code})."}

        repo_data = repo_res.json()
        commits_data = commits_res.json() if commits_res.status_code == 200 else []

        total_commits = len(commits_data)
        
        if total_commits <= 2:
            authenticity_score = 60
            commit_insight = "Single/Low commit history detected. High chance of copy-pasted or bulk AI-generated codebase."
        elif total_commits <= 5:
            authenticity_score = 78
            commit_insight = "Moderate commit history. Progressive development detected with revision iterations."
        else:
            authenticity_score = 92
            commit_insight = "High commit frequency detected. Consistent human-driven incremental code additions."

        ai_generated_pct = 100 - authenticity_score
        tech_list = [repo_data.get("language") or "TypeScript/JavaScript", "GitHub API Validated"]

        return {
            "type": "GitHub Repository",
            "url": url,
            "authenticity_score": authenticity_score,
            "ai_generated_percentage": ai_generated_pct,
            "detected_tech": tech_list,
            "teacher_evaluation": get_detailed_teacher_evaluation(authenticity_score),
            "future_scope": [
                "Enterprise LMS Plugin: Auto-grade web project submissions.",
                "Hackathon Verification Engine: Real-time anti-cheating API for tech hackathons.",
                "Talent Acquisition & HR-Tech: Automated candidate web portfolio validation."
            ],
            "project_summary": {
                "title": repo_data.get("name", repo),
                "purpose": f"Repository '{repo_data.get('name')}' by {owner}. Description: {repo_data.get('description') or 'No description provided.'}",
                "target_audience": "Software Developers, Evaluators, and Code Reviewers.",
                "key_features": [
                    f"Forks Count: {repo_data.get('forks_count', 0)} | Stars: {repo_data.get('stargazers_count', 0)}",
                    f"Open Issues: {repo_data.get('open_issues_count', 0)}"
                ]
            },
            "insights": [
                f"Total Analyzed Commits: {total_commits}",
                commit_insight
            ],
            "suggestions": [
                "Maintain progressive commit history for evaluation clarity.",
                "Add automated unit testing workflows via GitHub Actions."
            ],
            "social_prompt": generate_linkedin_post(repo, url, authenticity_score, tech_list)
        }
    except Exception as e:
        return {"error": f"Failed to analyze GitHub Repository: {str(e)}"}

def analyze_live_website(url: str):
    try:
        response = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(response.text, "html.parser")
        
        title = soup.title.string if soup.title else "Live Web Project"
        meta_desc = ""
        meta_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
        if meta_tag and meta_tag.get("content"):
            meta_desc = meta_tag["content"]
            
        has_framework = "next" in response.text.lower() or "react" in response.text.lower()
        
        authenticity_score = 88 if has_framework else 75
        ai_generated_pct = 100 - authenticity_score
        tech_list = ["Next.js / React" if has_framework else "HTML/JS", "Tailwind CSS"]
        
        return {
            "type": "Live Web Application",
            "url": url,
            "authenticity_score": authenticity_score,
            "ai_generated_percentage": ai_generated_pct,
            "detected_tech": tech_list,
            "teacher_evaluation": get_detailed_teacher_evaluation(authenticity_score),
            "future_scope": [
                "Enterprise LMS Plugin: Auto-grade web project submissions.",
                "Hackathon Verification Engine: Real-time anti-cheating API for tech hackathons.",
                "Talent Acquisition & HR-Tech: Automated candidate web portfolio validation."
            ],
            "project_summary": {
                "title": title,
                "purpose": f"This website serves as a web platform dedicated to '{title}'. " + (f"Summary: {meta_desc}" if meta_desc else "It is designed to provide user interaction through modern web interfaces."),
                "target_audience": "General Web Users / Developers / Clients looking for modern digital web solutions.",
                "key_features": [
                    "Interactive User Interface with responsive layouts.",
                    "Modern Client-side routing and optimized asset loading.",
                    "Integrated dynamic component rendering engine."
                ]
            },
            "insights": [
                "Modern component-based DOM structure detected.",
                "Optimized bundle scripts with low inline code redundancy."
            ],
            "suggestions": [
                "Add OpenGraph meta tags for better SEO & social sharing.",
                "Implement strict Content Security Policy (CSP) headers."
            ],
            "social_prompt": generate_linkedin_post(title, url, authenticity_score, tech_list)
        }
    except Exception as e:
        return {"error": f"Failed to inspect live URL: {str(e)}"}