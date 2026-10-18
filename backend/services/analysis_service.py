"""Rule-based resume analysis against the actual supplied job description.

Scores are transparent heuristic indicators, not predictions from an employer ATS.
The job match is calculated from skills and important terms found in the description.
"""
import re
from collections import OrderedDict


ROLE_SKILLS = {
    "Python Developer": ["Python", "SQL", "REST API", "Git", "Flask", "Django", "Testing"],
    "Python Full Stack Developer": ["Python", "SQL", "REST API", "Flask", "Django", "HTML", "CSS", "JavaScript", "React", "Git"],
    "Backend Developer": ["REST API", "SQL", "PostgreSQL", "Authentication", "Git", "Testing", "Python", "Flask"],
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Responsive Design", "Git"],
    "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React", "REST API", "SQL", "Git", "Backend"],
    "AI Engineer": ["Python", "Machine Learning", "LLM", "Prompt Engineering", "REST API", "Git", "Data Processing"],
    "Machine Learning Engineer": ["Python", "Machine Learning", "Statistics", "Pandas", "NumPy", "Model Evaluation", "Git"],
    "Data Analyst": ["SQL", "Excel", "Python", "Pandas", "Data Visualization", "Statistics", "Power BI"],
    "Data Scientist": ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "NumPy", "Data Visualization"],
    "Java Developer": ["Java", "SQL", "OOP", "REST API", "Spring", "Git", "Testing"],
    "MERN Stack Developer": ["MongoDB", "Express", "React", "Node.js", "JavaScript", "REST API", "Git"],
    "DevOps Engineer": ["Linux", "Docker", "CI/CD", "Cloud", "Git", "Kubernetes", "Monitoring"],
    "Software Engineer": ["Programming", "Data Structures", "Algorithms", "Git", "Testing", "SQL", "REST API"],
}

SKILL_CATALOG = [
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "SQL", "NoSQL",
    "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express", "MongoDB",
    "PostgreSQL", "MySQL", "Flask", "Django", "FastAPI", "REST API", "GraphQL",
    "Git", "GitHub", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux",
    "CI/CD", "Jenkins", "Terraform", "Redis", "Kafka", "Microservices",
    "Authentication", "JWT", "Testing", "Pytest", "Unit Testing", "Agile",
    "Data Structures", "Algorithms", "OOP", "Machine Learning", "Deep Learning",
    "LLM", "Generative AI", "Prompt Engineering", "LangChain", "RAG",
    "Agentic AI", "NLP", "Computer Vision", "TensorFlow", "PyTorch",
    "Scikit-learn", "Pandas", "NumPy", "Statistics", "Excel", "Power BI",
    "Tableau", "Data Visualization", "Data Analysis", "ETL", "Power Query",
    "Communication", "Problem Solving", "Leadership", "Project Management",
    "Spring Boot", "Spring", "MERN", "Next.js", "Tailwind CSS",
]
ALIASES = {
    "rest api": ["rest api", "restful", "api development", "apis"],
    "llm": ["llm", "large language model", "large language models"],
    "generative ai": ["generative ai", "gen ai"],
    "agentic ai": ["agentic ai", "ai agents", "agent-based ai"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "power bi": ["power bi", "powerbi"],
    "node.js": ["node.js", "nodejs"],
    "ci/cd": ["ci/cd", "continuous integration", "continuous deployment"],
    "data structures": ["data structures", "data structure", "dsa"],
    "oop": ["oop", "object-oriented programming", "object oriented programming"],
    "unit testing": ["unit testing", "unit test", "unittest"],
    "problem solving": ["problem solving", "problem-solving"],
    "tailwind css": ["tailwind css", "tailwind"],
    "spring boot": ["spring boot"],
}
STOPWORDS = {
    "the", "and", "for", "with", "you", "your", "our", "are", "will", "this",
    "that", "from", "have", "has", "was", "were", "who", "what", "when",
    "where", "how", "into", "about", "their", "they", "them", "can", "may",
    "must", "should", "would", "could", "not", "all", "any", "per", "etc",
    "job", "role", "work", "team", "company", "candidate", "position",
    "experience", "years", "year", "skills", "skill", "required", "preferred",
    "responsibilities", "responsibility", "requirements", "requirement",
    "knowledge", "ability", "strong", "good", "plus", "including", "using",
    "working", "related", "based", "support", "development", "develop",
}


def _contains(text, term):
    text_l = (text or "").lower()
    term_l = term.lower()
    aliases = ALIASES.get(term_l, [term_l])
    for alias in aliases:
        if re.search(r"(?<![a-z0-9])" + re.escape(alias) + r"(?![a-z0-9])", text_l):
            return True
    return False


def _section_present(text, patterns):
    return any(re.search(pattern, text, re.I | re.M) for pattern in patterns)


def _extract_keywords(job_description, resume_text):
    """Extract meaningful JD keywords that are also testable in resume text."""
    words = re.findall(r"[A-Za-z][A-Za-z+#.-]{2,}", job_description.lower())
    counts = {}
    for word in words:
        normalized = word.strip(".-")
        if normalized not in STOPWORDS and len(normalized) >= 3:
            counts[normalized] = counts.get(normalized, 0) + 1
    # Weight repeated meaningful terms; cap list so boilerplate cannot dominate.
    ordered = sorted(counts, key=lambda w: (-counts[w], w))
    candidates = ordered[:35]
    return [word for word in candidates if _contains(resume_text, word)], candidates


class AnalysisService:
    @staticmethod
    def analyze_resume(resume_text, job_role=None, job_description=None):
        text = resume_text or ""
        description = (job_description or "").strip()
        role = (job_role or "").strip()
        if not description and not role:
            raise ValueError("Provide a job description or select a target job role.")

        # The explicit job description is the preferred source of requirements.
        # When no description is supplied, use a configured profile for the chosen role.
        role_fallback = not description.strip()
        if role_fallback:
            role_skills = ROLE_SKILLS.get(role)
            if not role_skills:
                raise ValueError(
                    "No default skill profile is configured for this job role. "
                    "Please provide a job description or choose a supported role."
                )
            description = " ".join(role_skills)

        # Detect known skills from the resume and the selected analysis target.
        detected_skills = [skill for skill in SKILL_CATALOG if _contains(text, skill)]
        target_skills = (
            list(ROLE_SKILLS.get(role, []))
            if role_fallback
            else [skill for skill in SKILL_CATALOG if _contains(description, skill)]
        )
        # If the description contains no recognized catalog skills, do not fabricate
        # skill targets: return an explicit zero-signal result and keyword comparison.
        matched_skills = [skill for skill in target_skills if _contains(text, skill)]
        missing_skills = [skill for skill in target_skills if skill not in matched_skills]
        skills_score = round(len(matched_skills) / len(target_skills) * 100, 1) if target_skills else 0.0

        matched_keywords, target_keywords = _extract_keywords(description, text)
        keyword_score = round(len(matched_keywords) / len(target_keywords) * 100, 1) if target_keywords else 0.0

        lower = text.lower()
        sections = {
            "skills": _section_present(text, [r"^\s*(technical\s+)?skills\b", r"^\s*technologies\b"]),
            "experience": _section_present(text, [r"^\s*(work\s+)?experience\b", r"^\s*employment\b", r"^\s*internships?\b"]),
            "education": _section_present(text, [r"^\s*education\b", r"^\s*academic\b", r"^\s*qualification\b"]),
            "projects": _section_present(text, [r"^\s*projects?\b", r"^\s*personal\s+projects?\b"]),
            "summary": _section_present(text, [r"^\s*(professional\s+)?summary\b", r"^\s*objective\b", r"^\s*profile\b"]),
        }
        word_count = len(re.findall(r"\b[\w+#.-]+\b", text))
        quantified_count = len(re.findall(r"\b\d+(?:\.\d+)?\s*(?:%|x|k|m|years?|months?|users?|customers?)?\b", text, re.I))
        action_count = len(re.findall(
            r"\b(developed|built|created|implemented|automated|improved|designed|led|optimized|reduced|increased|delivered|analyzed|deployed)\b",
            text, re.I
        ))
        structure_score = sum(sections.values()) / len(sections) * 100
        length_score = min(100, word_count / 4)
        action_score = min(100, action_count * 15)
        achievement_score = min(100, quantified_count * 25)

        # ATS score measures resume structure and evidence, not job fit.
        ats_score = round(max(0, min(100,
            structure_score * 0.30
            + min(100, len(detected_skills) / 8 * 100) * 0.25
            + length_score * 0.15
            + action_score * 0.15
            + achievement_score * 0.15
        )), 1)
        if not sections["experience"] and not sections["projects"]:
            ats_score = min(ats_score, 65)
        if not sections["skills"]:
            ats_score = min(ats_score, 80)
        if word_count < 100:
            ats_score = min(ats_score, 50)

        # Match is driven by description requirements, not a predefined role list.
        # Blend recognized skill coverage and relevant keyword coverage.
        if role_fallback:
            # In role-only mode, use the configured role skills directly;
            # don't score keywords from an artificial joined skill list.
            keyword_score = skills_score
            matched_keywords = list(matched_skills)
            target_keywords = list(target_skills)
            match_percentage = skills_score
        elif target_skills and target_keywords:
            match_percentage = round(skills_score * 0.75 + keyword_score * 0.25, 1)
        elif target_skills:
            match_percentage = skills_score
        else:
            match_percentage = keyword_score

        experience_match = 100 if (
            not role_fallback and _contains(description, "experience") and sections["experience"]
        ) else (60 if sections["experience"] else 25)
        education_match = 100 if (
            not role_fallback and _contains(description, "degree") and sections["education"]
        ) else (60 if sections["education"] else 25)

        strengths = []
        if matched_skills:
            strengths.append("Job-description skills detected in resume: " + ", ".join(matched_skills) + ".")
        if sections["projects"]:
            strengths.append("A projects section was detected.")
        if sections["experience"]:
            strengths.append("An experience or internship section was detected.")
        if sections["education"]:
            strengths.append("An education section was detected.")
        if quantified_count:
            strengths.append(f"Found {quantified_count} numeric result or metric that may communicate measurable outcomes.")
        if not strengths:
            strengths.append("Few direct matches were detected; verify the resume text extraction and compare the requirements manually.")

        weaknesses = []
        if missing_skills:
            weaknesses.append("Job-description skills not detected in the resume: " + ", ".join(missing_skills) + ".")
        if not sections["experience"]:
            weaknesses.append("No clearly labeled experience or internship section was detected.")
        if not sections["projects"]:
            weaknesses.append("No clearly labeled projects section was detected.")
        if not sections["skills"]:
            weaknesses.append("No clearly labeled skills section was detected.")
        if not matched_keywords:
            weaknesses.append("No meaningful job-description keywords were detected in the resume.")

        suggestions = []
        if missing_skills:
            suggestions.append("If you genuinely have these skills, add evidence in relevant projects or experience: " + ", ".join(missing_skills) + ". Do not list skills you do not have.")
        if not sections["projects"]:
            suggestions.append("Add relevant projects and explain your contribution and technologies used.")
        if not sections["experience"]:
            suggestions.append("Add relevant internships, work experience, or practical experience if applicable.")
        if not sections["skills"]:
            suggestions.append("Add a concise Skills section containing only skills you can demonstrate.")
        if not quantified_count:
            suggestions.append("Add truthful measurable project outcomes where possible.")
        if not suggestions:
            suggestions.append("Tailor the resume's project and experience bullets to the priorities in this job description.")

        return {
            "ats_score": ats_score,
            "skills_score": skills_score,
            "detected_skills": detected_skills,
            "experience_score": experience_match,
            "education_score": education_match,
            "keyword_score": keyword_score,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggestions": suggestions,
            "detected_sections": [name for name, present in sections.items() if present],
            "job_role": role or None,
            "analysis_basis": "job_role" if role_fallback else "job_description",
            "match_percentage": match_percentage,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "target_skills": target_skills,
            "matched_keywords": matched_keywords,
            "missing_keywords": [word for word in target_keywords if word not in matched_keywords],
            "word_count": word_count,
            "quantified_results_count": quantified_count,
            "job_description_word_count": 0 if role_fallback else len(re.findall(r"\b\w+\b", description)),
            "experience_match": experience_match,
            "education_match": education_match,
            "match_method": "heuristic_job_description_comparison",
        }
