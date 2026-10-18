// src/config/homeData.js:
const HOME_DATA = {
  hero: {
    badge: {
      icon: "fa-solid fa-sparkles",
      text: "AI Powered Resume Screening",
    },

    title: "Smarter Resume Analysis",

    highlight_title: "Powered by Artificial Intelligence",

    description:
      "ResumeAI Pro helps recruiters and job seekers analyze resumes, calculate ATS scores, identify missing skills, discover strengths, and visualize hiring analytics in seconds.",

    primary_button: {
      text: "Analyze Resume",
      endpoint: "/resume-analyzer",
    },

    secondary_button: {
      text: "Explore Dashboard",
      endpoint: "/dashboard",
    },

    highlights: [
      "ATS Compatible",
      "AI Analysis",
      "PDF & DOCX Support",
      "Instant Results",
    ],

    resume_preview: {
      filename: "Resume.pdf",

      skills: [
        "Python",
        "Flask",
        "SQL",
        "Machine Learning",
        "Communication",
      ],

      ats_score: 92,
    },

    floating_cards: [
      {
        icon: "fa-solid fa-robot",
        title: "AI Analysis",
        subtitle: "Completed",
      },
      {
        icon: "fa-solid fa-chart-column",
        title: "Skills Found",
        subtitle: "18 Skills",
      },
      {
        icon: "fa-solid fa-star",
        title: "Candidate Rating",
        subtitle: "Excellent",
      },
    ],
  },

  features: [
    {
      icon: "fa-solid fa-file-circle-check",
      title: "Resume Analyzer",
      description:
        "Upload PDF or DOCX resumes and receive detailed AI-powered insights within seconds.",
      endpoint: "/resume-analyzer",
    },
    {
      icon: "fa-solid fa-chart-line",
      title: "ATS Score",
      description:
        "Measure resume compatibility with modern Applicant Tracking Systems using intelligent scoring.",
      endpoint: "/resume-analyzer",
    },
    {
      icon: "fa-solid fa-brain",
      title: "AI Skill Detection",
      description:
        "Automatically detect technical skills, soft skills, keywords, and missing competencies.",
      endpoint: "/resume-analyzer",
    },
    {
      icon: "fa-solid fa-users",
      title: "Candidate Management",
      description:
        "Organize every analyzed candidate, compare resumes, and track hiring progress.",
      endpoint: "/candidates",
    },
    {
      icon: "fa-solid fa-chart-pie",
      title: "Analytics Dashboard",
      description:
        "Explore hiring insights with interactive charts, trends, reports, and performance metrics.",
      endpoint: "/analytics",
    },
  ],

  how_it_works: [
    {
      step: "01",
      icon: "fa-solid fa-cloud-arrow-up",
      title: "Upload Resume",
      description:
        "Upload resumes in PDF or DOCX format using a simple drag-and-drop interface.",
    },
    {
      step: "02",
      icon: "fa-solid fa-file-lines",
      title: "Extract Resume Data",
      description:
        "ResumeAI Pro extracts contact details, education, experience, and skills.",
    },
    {
      step: "03",
      icon: "fa-solid fa-robot",
      title: "AI Analysis",
      description:
        "Artificial Intelligence evaluates the resume, identifies strengths, weaknesses, and missing keywords.",
    },
    {
      step: "04",
      icon: "fa-solid fa-award",
      title: "ATS Score",
      description:
        "Calculate an ATS compatibility score with personalized recommendations.",
    },
    {
      step: "05",
      icon: "fa-solid fa-chart-simple",
      title: "Analytics Dashboard",
      description:
        "Visualize ATS trends, skills, candidate ratings, and hiring insights.",
    },
    {
      step: "06",
      icon: "fa-solid fa-users-gear",
      title: "Manage Candidates",
      description:
        "Store analyzed resumes, compare candidates, and make better hiring decisions.",
    },
  ],

  why_choose: {
    section_tag: "Why Choose Us",

    title: "Built to Make Resume Screening Faster, Smarter, and More Reliable",

    description:
      "ResumeAI Pro combines Artificial Intelligence, ATS optimization, analytics, and candidate management into one seamless platform. Whether you're a recruiter or a job seeker, every feature is designed to simplify resume evaluation and improve decision-making.",

    features: [
      {
        icon: "fa-solid fa-circle-check",
        title: "AI-Powered Analysis",
        description: "Automatically evaluate resumes with intelligent insights.",
      },
      {
        icon: "fa-solid fa-circle-check",
        title: "Modern ATS Scoring",
        description:
          "Understand how well a resume performs against ATS systems.",
      },
      {
        icon: "fa-solid fa-circle-check",
        title: "Interactive Analytics",
        description: "Track resume trends, skills, and hiring metrics.",
      },
      {
        icon: "fa-solid fa-circle-check",
        title: "Candidate Management",
        description:
          "Store, compare, and organize candidates from one dashboard.",
      },
    ],

    card: {
      icon: "fa-solid fa-robot",
      title: "ResumeAI Pro",

      progress: [
        {
          label: "ATS Compatibility",
          value: "95%",
        },
        {
          label: "AI Accuracy",
          value: "98%",
        },
        {
          label: "Skills Detection",
          value: "50+",
        },
        {
          label: "Average Analysis Time",
          value: "10 sec",
        },
      ],
    },
  },

  showcase: {
    section_tag: "Product Showcase",

    title: "Everything You Need in One Platform",

    description:
      "ResumeAI Pro provides a complete ecosystem for resume analysis, ATS scoring, candidate management, and hiring analytics.",

    modules: [
      {
        icon: "fa-solid fa-file-lines",
        title: "Resume Analyzer",
        description:
          "Upload resumes and receive AI-powered analysis with ATS scoring.",
        badge: "Core Module",
        endpoint: "/resume-analyzer",
      },
      {
        icon: "fa-solid fa-users",
        title: "Candidate Manager",
        description:
          "View, compare, and organize analyzed candidates in one place.",
        badge: "Management",
        endpoint: "/candidates",
      },
      {
        icon: "fa-solid fa-chart-column",
        title: "Analytics Dashboard",
        description:
          "Explore hiring insights using interactive charts and reports.",
        badge: "Analytics",
        endpoint: "/analytics",
      },
    ],
  },

  faq: {
    section_tag: "Frequently Asked Questions",

    title: "Have Questions? We've Got Answers.",

    description:
      "Find answers to the most common questions about ResumeAI Pro, resume analysis, ATS scoring, and candidate management.",

    questions: [
      {
        question: "What is ResumeAI Pro?",
        answer:
          "ResumeAI Pro is an AI-powered resume analysis platform that evaluates resumes, calculates ATS scores, identifies missing skills, and provides hiring analytics.",
      },
      {
        question: "Which resume formats are supported?",
        answer:
          "Currently ResumeAI Pro supports PDF and DOCX resume formats.",
      },
      {
        question: "How is the ATS score calculated?",
        answer:
          "The ATS score is generated by analyzing resume structure, keywords, formatting, skills, and job relevance.",
      },
      {
        question: "Can recruiters manage multiple candidates?",
        answer:
          "Yes. Recruiters can organize, compare, and review multiple candidates using the Candidate Management module.",
      },
      {
        question: "Does ResumeAI Pro use Artificial Intelligence?",
        answer:
          "Yes. AI is used to extract resume data, identify skills, evaluate resumes, and generate meaningful insights.",
      },
      {
        question: "Is my uploaded resume secure?",
        answer:
          "Yes. Uploaded resumes are processed securely and are only used for resume analysis within the application.",
      },
    ],
  },

  cta: {
    section_tag: "Get Started Today",

    title: "Ready to Transform Your Resume Screening Process?",

    description:
      "Experience AI-powered resume analysis, accurate ATS scoring, interactive analytics, and efficient candidate management—all in one platform.",

    primary_button: {
      text: "Analyze Resume",
      endpoint: "/resume-analyzer",
      icon: "fa-solid fa-file-circle-check",
    },

    secondary_button: {
      text: "View Dashboard",
      endpoint: "/dashboard",
      icon: "fa-solid fa-chart-line",
    },

    card: {
      icon: "fa-solid fa-robot",
      title: "ResumeAI Pro",

      items: [
        {
          icon: "fa-solid fa-circle-check",
          text: "AI Resume Analysis",
        },
        {
          icon: "fa-solid fa-circle-check",
          text: "ATS Compatibility Score",
        },
        {
          icon: "fa-solid fa-circle-check",
          text: "Smart Skill Detection",
        },
        {
          icon: "fa-solid fa-circle-check",
          text: "Candidate Management",
        },
        {
          icon: "fa-solid fa-circle-check",
          text: "Interactive Analytics",
        },
        {
          icon: "fa-solid fa-circle-check",
          text: "Learning Recommendations",
        },
      ],
    },
  },
};

export default HOME_DATA;