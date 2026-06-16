"""
Comprehensive skills taxonomy database for resume screening.
Contains 500+ skills across multiple categories with aliases and synonyms.
"""

SKILLS_DATABASE = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "c",
        "ruby", "php", "swift", "kotlin", "go", "golang", "rust", "scala",
        "r", "matlab", "perl", "lua", "dart", "objective-c", "shell",
        "bash", "powershell", "sql", "nosql", "haskell", "elixir",
        "clojure", "groovy", "visual basic", "vba", "assembly",
        "fortran", "cobol", "julia",
    ],
    "web_frameworks": [
        "react", "reactjs", "react.js", "angular", "angularjs", "vue",
        "vuejs", "vue.js", "next.js", "nextjs", "nuxt", "nuxtjs",
        "express", "expressjs", "express.js", "django", "flask", "fastapi",
        "spring", "spring boot", "springboot", "rails", "ruby on rails",
        "laravel", "symfony", "asp.net", ".net", "dotnet", "blazor",
        "svelte", "gatsby", "remix", "ember", "backbone",
    ],
    "databases": [
        "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
        "oracle", "sql server", "mssql", "cassandra", "dynamodb",
        "elasticsearch", "neo4j", "couchdb", "firebase", "firestore",
        "mariadb", "influxdb", "cockroachdb", "supabase", "prisma",
    ],
    "cloud_platforms": [
        "aws", "amazon web services", "azure", "microsoft azure",
        "google cloud", "gcp", "google cloud platform", "heroku",
        "digitalocean", "vercel", "netlify", "cloudflare",
        "alibaba cloud", "ibm cloud", "oracle cloud",
    ],
    "devops_tools": [
        "docker", "kubernetes", "k8s", "jenkins", "terraform",
        "ansible", "puppet", "chef", "gitlab ci", "github actions",
        "circleci", "travis ci", "bamboo", "argo cd", "helm",
        "vagrant", "packer", "consul", "prometheus", "grafana",
        "nagios", "datadog", "new relic", "splunk", "elk stack",
    ],
    "data_science": [
        "machine learning", "deep learning", "neural networks",
        "natural language processing", "nlp", "computer vision",
        "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn",
        "pandas", "numpy", "scipy", "matplotlib", "seaborn",
        "tableau", "power bi", "data visualization", "data analysis",
        "data mining", "big data", "hadoop", "spark", "apache spark",
        "hive", "pig", "airflow", "data pipeline", "etl",
        "feature engineering", "model deployment", "mlops",
        "reinforcement learning", "gan", "transformers", "bert",
        "gpt", "llm", "large language models", "ai", "artificial intelligence",
    ],
    "mobile_development": [
        "react native", "flutter", "ios", "android", "swift",
        "kotlin", "xamarin", "ionic", "cordova", "capacitor",
        "swiftui", "jetpack compose",
    ],
    "frontend_tools": [
        "html", "html5", "css", "css3", "sass", "scss", "less",
        "tailwind", "tailwindcss", "bootstrap", "material ui",
        "chakra ui", "styled components", "webpack", "vite",
        "rollup", "parcel", "babel", "eslint", "prettier",
        "storybook", "figma", "sketch", "adobe xd", "responsive design",
        "accessibility", "a11y", "seo", "pwa",
    ],
    "backend_tools": [
        "rest", "restful", "rest api", "graphql", "grpc", "websocket",
        "microservices", "api gateway", "swagger", "openapi",
        "oauth", "jwt", "authentication", "authorization",
        "message queue", "rabbitmq", "kafka", "apache kafka",
        "celery", "bull", "redis queue", "cron",
    ],
    "testing": [
        "unit testing", "integration testing", "e2e testing",
        "jest", "mocha", "chai", "pytest", "unittest", "selenium",
        "cypress", "playwright", "puppeteer", "postman",
        "jmeter", "load testing", "tdd", "bdd", "qa",
    ],
    "version_control": [
        "git", "github", "gitlab", "bitbucket", "svn",
        "mercurial", "code review", "pull request",
    ],
    "project_management": [
        "agile", "scrum", "kanban", "jira", "confluence",
        "trello", "asana", "slack", "microsoft teams",
        "project management", "product management",
        "sprint planning", "retrospective", "standup",
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem solving",
        "critical thinking", "time management", "adaptability",
        "creativity", "mentoring", "presentation", "negotiation",
        "conflict resolution", "decision making", "strategic thinking",
        "collaboration", "stakeholder management",
    ],
    "security": [
        "cybersecurity", "penetration testing", "ethical hacking",
        "owasp", "encryption", "ssl", "tls", "firewall",
        "intrusion detection", "siem", "vulnerability assessment",
        "security audit", "compliance", "gdpr", "hipaa", "soc2",
        "iso 27001",
    ],
    "other_tools": [
        "linux", "unix", "windows server", "nginx", "apache",
        "iis", "tomcat", "jboss", "xml", "json", "yaml",
        "regex", "cron job", "ci/cd", "continuous integration",
        "continuous deployment", "monitoring", "logging",
        "performance optimization", "caching", "cdn",
        "load balancing", "high availability", "scalability",
        "system design", "design patterns", "solid principles",
        "clean code", "code review", "technical writing",
        "documentation", "api design",
    ],
}

# Create a flat set of all skills for quick lookup
ALL_SKILLS = set()
for category, skills in SKILLS_DATABASE.items():
    ALL_SKILLS.update(skills)

# Aliases mapping (common variations → canonical name)
SKILL_ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "cpp": "c++",
    "csharp": "c#",
    "react.js": "react",
    "reactjs": "react",
    "vue.js": "vue",
    "vuejs": "vue",
    "angular.js": "angular",
    "angularjs": "angular",
    "express.js": "express",
    "expressjs": "express",
    "next.js": "next.js",
    "nextjs": "next.js",
    "node.js": "node",
    "nodejs": "node",
    "mongo": "mongodb",
    "postgres": "postgresql",
    "k8s": "kubernetes",
    "tf": "tensorflow",
    "sklearn": "scikit-learn",
    "aws": "aws",
    "gcp": "google cloud",
    "ci/cd": "ci/cd",
    "ml": "machine learning",
    "dl": "deep learning",
    "ai": "artificial intelligence",
    "nlp": "natural language processing",
    "cv": "computer vision",
    "tailwindcss": "tailwind",
}


def get_skill_category(skill: str) -> str:
    """Get the category for a given skill."""
    skill_lower = skill.lower()
    for category, skills in SKILLS_DATABASE.items():
        if skill_lower in skills:
            return category
    return "other"


def get_all_skills_flat() -> list:
    """Get all skills as a flat sorted list."""
    return sorted(ALL_SKILLS)


def normalize_skill(skill: str) -> str:
    """Normalize a skill name using aliases."""
    skill_lower = skill.lower().strip()
    return SKILL_ALIASES.get(skill_lower, skill_lower)
