import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const aboutData = {
  pageTitle: "About Resume Analyzer Pro",

  project: {
    title: "Resume Analyzer Pro",
    subtitle: "AI-Powered Resume Analysis & Career Enhancement Platform",
    description:
      "Resume Analyzer Pro is a modern web application developed completely from scratch using Python, Flask, HTML, CSS, and JavaScript. It helps job seekers analyze resumes, understand ATS compatibility, visualize resume insights through interactive analytics, explore personalized learning recommendations, and manage candidate information from a centralized dashboard.",

    dashboard: {
      image: "/dashboard-preview.png",
      alt: "Resume Analyzer Pro Dashboard Preview",
      caption:
        "A unified dashboard that provides resume analysis, analytics, AI-powered recommendations, and candidate management in one place.",
    },

    features: [
      {
        icon: "fa-solid fa-robot",
        title: "AI Resume Analysis",
        description:
          "Analyze resumes and receive intelligent insights to improve overall quality.",
      },
      {
        icon: "fa-solid fa-file-circle-check",
        title: "ATS Compatibility",
        description:
          "Evaluate resumes using ATS-friendly guidelines to increase interview opportunities.",
      },
      {
        icon: "fa-solid fa-chart-column",
        title: "Interactive Analytics",
        description:
          "Understand resume performance through charts, statistics, and visual reports.",
      },
      {
        icon: "fa-solid fa-graduation-cap",
        title: "Course Recommendations",
        description:
          "Receive personalized learning suggestions to bridge skill gaps.",
      },
      {
        icon: "fa-solid fa-users",
        title: "Candidate Management",
        description:
          "Organize analyzed resumes and candidate records efficiently from one interface.",
      },
    ],
  },

  owner: {
    photo: "/profile-photo.png",
    photoAlt: "Professional photograph of Vivek Vijay Gadhe.",
    role: "Full Stack Developer",

    headline:
      "Passionate about building scalable, user-focused web applications with clean architecture and modern technologies.",

    description:
      "I'm a passionate Python developer specializing in backend development and full-stack web applications. I enjoy building scalable, user-focused software using Flask, modern web technologies, and clean, maintainable code that follows industry best practices.\n\nI built Resume Analyzer Pro entirely from scratch to strengthen my software engineering skills and gain practical experience with modular architecture, responsive frontend development, database integration, and real-world problem solving. I'm continuously learning and committed to creating reliable, high-quality applications.",

    skills: [
      "Python",
      "Flask",
      "FastApi",
      "React",
      "AWS",
      "Azure",
      "My SQL",
      "Postgresql",
      "Git",
      "Responsive Design",
    ],

    resume: {
      text: "Download Resume",
      file: "/Vivek_Vijay_Gadhe_Resume.pdf",
    },

    socials: {
      github: "https://github.com/vivekgadhe",
      linkedin: "https://www.linkedin.com/in/vivekgadhe/",
      email: "vivekgadhe1704@gmail.com",
    },
  },

  contact: {
    title: "Get In Touch",

    subtitle:
      "Have a question, feedback, collaboration idea, or career opportunity? I'd love to hear from you.",

    description:
      "Whether you're interested in discussing Resume Analyzer Pro, a full stack development opportunity, or simply want to connect, feel free to reach out using the contact information below or the contact form.",

    contactInfo: {
      email: "vivekgadhe1704@gmail.com",
      phone: "+91 8329823195",
      location: "Pune, Maharashtra, India",
    },

    availability: {
      status: "Open to full-time opportunities.",
      workingHours: "Monday - Friday • 9:00 AM - 6:00 PM (IST)",
    },

    // FIXED: Contact social links
    socials: {
      github: "https://github.com/vivekgadhe",
      linkedin: "https://www.linkedin.com/in/vivekgadhe/",
      portfolio: "https://www.linkedin.com/in/vivekgadhe/",
    },
  },
};

// ======================================================
// Feature Card
// ======================================================

function FeatureCard({ feature }) {
  return (
    <article
      className="
        group rounded-2xl border border-slate-200/80
        bg-white p-6 shadow-sm
        transition-all duration-300
        hover:-translate-y-2 hover:border-violet-200
        hover:shadow-xl hover:shadow-violet-500/10
        dark:border-slate-700/70 dark:bg-slate-900/80
        dark:hover:border-violet-500/40
      "
    >
      <div
        className="
          mb-5 flex h-12 w-12 items-center justify-center
          rounded-xl bg-violet-100 text-violet-600
          transition-transform duration-300
          group-hover:scale-110
          dark:bg-violet-500/10 dark:text-violet-400
        "
      >
        <i className={`${feature.icon} text-lg`} />
      </div>

      <h3
        className="
          text-lg font-bold text-slate-800
          dark:text-white
        "
      >
        {feature.title}
      </h3>

      <p
        className="
          mt-2 text-sm leading-6 text-slate-500
          dark:text-slate-400
        "
      >
        {feature.description}
      </p>
    </article>
  );
}

// ======================================================
// Skill Badge
// ======================================================

function SkillBadge({ skill }) {
  return (
    <span
      className="
        inline-flex items-center gap-2 rounded-full
        border border-violet-200 bg-violet-50
        px-4 py-2 text-sm font-semibold text-violet-700
        transition-all duration-200
        hover:-translate-y-0.5 hover:bg-violet-100
        dark:border-violet-500/20
        dark:bg-violet-500/10 dark:text-violet-300
      "
    >
      <i className="fa-solid fa-check text-xs" />
      {skill}
    </span>
  );
}

// ======================================================
// Contact Info Card
// ======================================================

function ContactInfoCard({ icon, title, value, href }) {
  const content = (
    <>
      <div
        className="
          flex h-12 w-12 shrink-0 items-center justify-center
          rounded-xl bg-violet-100 text-violet-600
          dark:bg-violet-500/10 dark:text-violet-400
        "
      >
        <i className={`${icon} text-lg`} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <p
          className="
            mt-1 break-words text-sm font-semibold
            text-slate-700 dark:text-slate-200
          "
        >
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="
          flex items-center gap-4 rounded-2xl
          border border-slate-200 bg-white p-4
          transition-all duration-300
          hover:-translate-y-1 hover:border-violet-200
          hover:shadow-lg
          dark:border-slate-700 dark:bg-slate-900/80
          dark:hover:border-violet-500/40
        "
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className="
        flex items-center gap-4 rounded-2xl
        border border-slate-200 bg-white p-4
        transition-all duration-300
        hover:-translate-y-1 hover:border-violet-200
        hover:shadow-lg
        dark:border-slate-700 dark:bg-slate-900/80
        dark:hover:border-violet-500/40
      "
    >
      {content}
    </div>
  );
}

// ======================================================
// Main About Page
// ======================================================

export default function About() {
  const [activeFeature, setActiveFeature] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  // ====================================================
  // Feature auto highlight
  // ====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((current) =>
        current === aboutData.project.features.length - 1
          ? 0
          : current + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // ====================================================
  // Form handler
  // ====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setIsSending(true);
    setFormMessage("");

    // Frontend-only for now.
    // Flask API will be connected later.

    setTimeout(() => {
      setIsSending(false);

      setFormMessage(
        "Your message has been prepared successfully. The contact API will be connected when the backend is integrated."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 900);
  };

  return (
    <main
      className="
        min-h-screen overflow-x-hidden
        bg-slate-50 text-slate-800
        dark:bg-slate-950 dark:text-slate-100
      "
    >
      {/* ==================================================
          HERO
      ================================================== */}

      <section
        id="about-hero"
        className="
          relative flex min-h-[520px] items-center
          overflow-hidden
          bg-gradient-to-br
          from-indigo-600 via-violet-600 to-cyan-500
          px-4 pb-14 pt-24 sm:px-5 sm:pb-20 sm:pt-28
          text-white
          md:min-h-[650px]
        "
      >
        <div
          className="
            absolute -left-32 -top-32 h-80 w-80
            rounded-full bg-white/10 blur-3xl
          "
        />

        <div
          className="
            absolute -bottom-40 -right-20 h-96 w-96
            rounded-full bg-cyan-300/20 blur-3xl
          "
        />

        <div
          className="
            absolute left-1/2 top-1/4 h-40 w-40
            rotate-45 rounded-3xl
            border border-white/10 bg-white/5
          "
        />

        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-1 sm:w-[94%] sm:px-0">
          <div className="mx-auto max-w-4xl text-center">
            <span
              className="
                inline-flex items-center gap-2 rounded-full
                border border-white/20 bg-white/10
                px-5 py-2 text-sm font-semibold
                backdrop-blur-md
              "
            >
              <i className="fa-solid fa-circle-info" />
              About Resume Analyzer Pro
            </span>

            <h1
              className="
                mt-7 text-3xl font-extrabold
                tracking-tight sm:text-5xl md:text-6xl
              "
            >
              {aboutData.pageTitle}
            </h1>

            <p
              className="
                mx-auto mt-4 max-w-3xl
                text-sm leading-7 text-white/85 sm:text-base sm:leading-8
                sm:text-lg
              "
            >
              Discover the story behind Resume Analyzer Pro, learn about the
              developer who built it, and explore how you can connect
              for collaboration, feedback, or career opportunities.
            </p>

            <div className="mt-10 flex justify-center">
              <a
                href="#about-content"
                className="
                  group inline-flex items-center gap-3
                  rounded-full border border-white/20
                  bg-white/10 px-6 py-3
                  text-sm font-semibold backdrop-blur-md
                  transition-all duration-300
                  hover:bg-white/20
                "
              >
                Explore

                <i
                  className="
                    fa-solid fa-arrow-down
                    transition-transform duration-300
                    group-hover:translate-y-1
                  "
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div
        id="about-content"
        className="mx-auto w-full max-w-[1400px] px-4 sm:w-[94%] sm:px-0"
      >
        {/* ==================================================
            PROJECT SECTION
        ================================================== */}

        <section
          id="about-project"
          className="scroll-mt-24 py-12 sm:py-16 md:py-28"
        >
          <div className="mx-auto max-w-4xl text-center">
            <span
              className="
                inline-flex rounded-full
                bg-violet-100 px-4 py-2
                text-xs font-bold uppercase
                tracking-wider text-violet-700
                dark:bg-violet-500/10 dark:text-violet-300
              "
            >
              {aboutData.project.title}
            </span>

            <h2
              className="
                mt-5 text-3xl font-extrabold
                tracking-tight text-slate-800
                md:text-4xl
                dark:text-white
              "
            >
              {aboutData.project.subtitle}
            </h2>

            <p
              className="
                mx-auto mt-5 max-w-3xl
                text-base leading-8 text-slate-500
                dark:text-slate-400
              "
            >
              {aboutData.project.description}
            </p>
          </div>

          <div
            className="
              mt-8 grid grid-cols-1 gap-6 sm:mt-14 sm:gap-10
              xl:grid-cols-[1.05fr_0.95fr]
              xl:items-center
            "
          >
            {/* Browser Mockup */}

            <div
              className="
                group rounded-2xl border border-slate-200
                bg-white p-2 shadow-xl sm:rounded-3xl sm:p-3 sm:shadow-2xl
                transition-all duration-500
                hover:-translate-y-2
                hover:shadow-violet-500/15
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <div
                className="
                  overflow-hidden rounded-2xl
                  border border-slate-200
                  dark:border-slate-700
                "
              >
                {/* Browser Header */}

                <div
                  className="
                    flex h-12 items-center gap-4
                    border-b border-slate-200
                    bg-slate-100 px-4
                    dark:border-slate-700 dark:bg-slate-800
                  "
                >
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>

                  <div
                    className="
                      flex-1 rounded-lg bg-white px-4 py-1.5
                      text-center text-xs text-slate-400
                      dark:bg-slate-700 dark:text-slate-400
                    "
                  >
                    Resume Analyzer Pro Dashboard
                  </div>
                </div>

                {/* Dashboard Image */}

                <div className="bg-slate-100 dark:bg-slate-800">
                  <img
                    src={aboutData.project.dashboard.image}
                    alt={aboutData.project.dashboard.alt}
                    className="
                      block h-auto w-full object-cover
                    "
                    onError={(event) => {
                      event.currentTarget.style.display = "none";

                      if (event.currentTarget.nextElementSibling) {
                        event.currentTarget.nextElementSibling.style.display =
                          "flex";
                      }
                    }}
                  />

                  {/* Image fallback */}

                  <div
                    className="
                      hidden min-h-[300px]
                      items-center justify-center
                      bg-gradient-to-br
                      from-violet-100 via-indigo-100 to-cyan-100
                      p-8 text-center
                      dark:from-violet-950 dark:via-indigo-950
                      dark:to-cyan-950
                    "
                  >
                    <div>
                      <i className="fa-solid fa-chart-line text-5xl text-violet-500" />

                      <p className="mt-4 font-bold text-slate-700 dark:text-slate-200">
                        Resume Analyzer Pro Dashboard
                      </p>

                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Dashboard preview
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    border-t border-slate-200
                    px-5 py-4 text-center
                    text-sm leading-6 text-slate-500
                    dark:border-slate-700 dark:text-slate-400
                  "
                >
                  {aboutData.project.dashboard.caption}
                </div>
              </div>
            </div>

            {/* Feature Cards */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {aboutData.project.features.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => setActiveFeature(index)}
                  className={`
                    group rounded-2xl border p-4 text-left sm:p-5
                    transition-all duration-300
                    ${activeFeature === index
                      ? "border-violet-300 bg-gradient-to-br from-violet-50 to-cyan-50 shadow-lg shadow-violet-500/10 dark:border-violet-500/40 dark:from-violet-500/10 dark:to-cyan-500/10"
                      : "border-slate-200 bg-white hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-violet-500/30"
                    }
                  `}
                >
                  <div
                    className={`
                      mb-4 flex h-11 w-11 items-center
                      justify-center rounded-xl
                      transition-transform duration-300
                      group-hover:scale-110
                      ${activeFeature === index
                        ? "bg-violet-600 text-white"
                        : "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                      }
                    `}
                  >
                    <i className={feature.icon} />
                  </div>

                  <h3
                    className="
                      font-bold text-slate-800
                      dark:text-white
                    "
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="
                      mt-2 text-sm leading-6
                      text-slate-500 dark:text-slate-400
                    "
                  >
                    {feature.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            ABOUT ME
        ================================================== */}

        <section
          id="about-owner"
          className="
            scroll-mt-24 border-t border-slate-200
            py-12 sm:py-16 md:py-28
            dark:border-slate-800
          "
        >
          <div className="mb-12 text-center">
            <span
              className="
                inline-flex rounded-full
                bg-cyan-100 px-4 py-2
                text-xs font-bold uppercase
                tracking-wider text-cyan-700
                dark:bg-cyan-500/10 dark:text-cyan-300
              "
            >
              About Me
            </span>
          </div>

          <div
            className="
              grid grid-cols-1 gap-8 sm:gap-12
              lg:grid-cols-[360px_1fr]
              lg:items-center
            "
          >
            {/* Profile */}

            <div className="flex justify-center">
              <div className="relative w-full max-w-[340px]">
                <div
                  className="
                    absolute -inset-3 rounded-[32px]
                    bg-gradient-to-br
                    from-violet-500 via-indigo-500 to-cyan-400
                    opacity-20 blur-xl
                  "
                />

                <div
                  className="
                    relative overflow-hidden rounded-[28px]
                    border border-slate-200
                    bg-white p-3 shadow-2xl
                    dark:border-slate-700
                    dark:bg-slate-900
                  "
                >
                  <img
                    src={aboutData.owner.photo}
                    alt={aboutData.owner.photoAlt}
                    className="
                      aspect-[4/5] w-full rounded-[20px]
                      object-cover
                    "
                    onError={(event) => {
                      event.currentTarget.style.display = "none";

                      if (event.currentTarget.nextElementSibling) {
                        event.currentTarget.nextElementSibling.style.display =
                          "flex";
                      }
                    }}
                  />

                  {/* Profile fallback */}

                  <div
                    className="
                      hidden aspect-[4/5]
                      items-center justify-center
                      rounded-[20px]
                      bg-gradient-to-br
                      from-violet-100 to-cyan-100
                      dark:from-violet-950 dark:to-cyan-950
                    "
                  >
                    <div className="text-center">
                      <div
                        className="
                          mx-auto flex h-24 w-24
                          items-center justify-center
                          rounded-full bg-white
                          text-4xl text-violet-500
                          shadow-lg
                          dark:bg-slate-800
                        "
                      >
                        <i className="fa-solid fa-user" />
                      </div>

                      <p className="mt-4 font-bold text-slate-700 dark:text-slate-200">
                        Vivek Gadhe
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Content */}

            <div>
              <p
                className="
                  text-sm font-semibold uppercase
                  tracking-wider text-violet-600
                  dark:text-violet-400
                "
              >
                Hello, I'm
              </p>

              <h2
                className="
                  mt-2 text-2xl font-extrabold
                  text-slate-800
                  sm:text-3xl md:text-4xl
                  dark:text-white
                "
              >
                Vivek Gadhe
              </h2>

              <h3
                className="
                  mt-3 text-lg font-bold
                  text-transparent
                  bg-gradient-to-r
                  from-violet-600 to-cyan-500
                  bg-clip-text
                "
              >
                {aboutData.owner.role}
              </h3>

              <p
                className="
                  mt-5 text-base font-medium
                  leading-7 text-slate-600
                  dark:text-slate-300
                "
              >
                {aboutData.owner.headline}
              </p>

              <div className="mt-5 space-y-4">
                {aboutData.owner.description
                  .split("\n\n")
                  .map((paragraph, index) => (
                    <p
                      key={index}
                      className="
                        text-sm leading-7 text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>

              {/* Skills */}

              <div className="mt-7">
                <h4
                  className="
                    mb-4 text-sm font-bold uppercase
                    tracking-wider text-slate-700
                    dark:text-slate-200
                  "
                >
                  Technical Skills
                </h4>

                <div className="flex flex-wrap gap-2">
                  {aboutData.owner.skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} />
                  ))}
                </div>
              </div>

              {/* Actions */}

              <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                <a
                  href={aboutData.owner.resume.file}
                  download
                  className="
                    inline-flex items-center gap-2
                    rounded-xl bg-gradient-to-r
                    from-violet-600 to-cyan-500
                    px-5 py-3 text-sm font-bold text-white
                    shadow-lg shadow-violet-500/20
                    transition-all duration-300
                    hover:-translate-y-1 hover:shadow-xl
                  "
                >
                  <i className="fa-solid fa-download" />
                  {aboutData.owner.resume.text}
                </a>

                <a
                  href={`mailto:${aboutData.owner.socials.email}`}
                  className="
                    inline-flex items-center gap-2
                    rounded-xl border border-slate-200
                    bg-white px-5 py-3 text-sm font-bold
                    text-slate-700
                    transition-all duration-300
                    hover:-translate-y-1 hover:border-violet-300
                    hover:text-violet-600
                    dark:border-slate-700 dark:bg-slate-900
                    dark:text-slate-200
                    dark:hover:border-violet-500/40
                    dark:hover:text-violet-400
                  "
                >
                  <i className="fa-solid fa-envelope" />
                  Contact Me
                </a>
              </div>

              {/* Owner Social Links */}

              <div className="mt-7 flex items-center gap-3">
                <span className="mr-2 text-sm text-slate-400">
                  Connect:
                </span>

                <a
                  href={aboutData.owner.socials.github}
                  onClick={(event) => {
                    if (aboutData.owner.socials.github === "#") {
                      event.preventDefault();
                    }
                  }}
                  aria-label="GitHub"
                  className="
                    flex h-10 w-10 items-center
                    justify-center rounded-xl
                    bg-slate-100 text-slate-700
                    transition hover:-translate-y-1
                    hover:bg-slate-900 hover:text-white
                    dark:bg-slate-800 dark:text-slate-300
                    dark:hover:bg-white dark:hover:text-slate-900
                  "
                >
                  <i className="fa-brands fa-github" />
                </a>

                <a
                  href={aboutData.owner.socials.linkedin}
                  onClick={(event) => {
                    if (aboutData.owner.socials.linkedin === "#") {
                      event.preventDefault();
                    }
                  }}
                  aria-label="LinkedIn"
                  className="
                    flex h-10 w-10 items-center
                    justify-center rounded-xl
                    bg-blue-50 text-blue-600
                    transition hover:-translate-y-1
                    hover:bg-blue-600 hover:text-white
                    dark:bg-blue-500/10 dark:text-blue-400
                  "
                >
                  <i className="fa-brands fa-linkedin-in" />
                </a>

                <a
                  href={`mailto:${aboutData.contact.contactInfo.email}`}
                  aria-label="Email"
                  className="
                    flex h-10 w-10 items-center
                    justify-center rounded-xl
                    bg-violet-50 text-violet-600
                    transition hover:-translate-y-1
                    hover:bg-violet-600 hover:text-white
                    dark:bg-violet-500/10 dark:text-violet-400
                  "
                >
                  <i className="fa-solid fa-envelope" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            CONTACT
        ================================================== */}

        <section
          id="contact"
          className="
            scroll-mt-24 border-t border-slate-200
            py-12 sm:py-16 md:py-28
            dark:border-slate-800
          "
        >
          <div className="mx-auto max-w-4xl text-center">
            <span
              className="
                inline-flex rounded-full
                bg-cyan-100 px-4 py-2
                text-xs font-bold uppercase
                tracking-wider text-cyan-700
                dark:bg-cyan-500/10 dark:text-cyan-300
              "
            >
              Get In Touch
            </span>

            <h2
              className="
                mt-5 text-3xl font-extrabold
                text-slate-800 md:text-4xl
                dark:text-white
              "
            >
              {aboutData.contact.title}
            </h2>

            <p
              className="
                mt-4 text-base leading-7
                text-slate-500 dark:text-slate-400
              "
            >
              {aboutData.contact.subtitle}
            </p>

            <p
              className="
                mt-3 text-sm leading-7
                text-slate-500 dark:text-slate-400
              "
            >
              {aboutData.contact.description}
            </p>
          </div>

          <div
            className="
              mt-8 grid grid-cols-1 gap-6 sm:mt-12 sm:gap-8
              lg:grid-cols-[0.85fr_1.15fr]
            "
          >
            {/* Contact Information */}

            <div>
              <div className="space-y-4">
                <ContactInfoCard
                  icon="fa-solid fa-envelope"
                  title="Email"
                  value={aboutData.contact.contactInfo.email}
                  href={`mailto:${aboutData.contact.contactInfo.email}`}
                />

                <ContactInfoCard
                  icon="fa-solid fa-phone"
                  title="Phone"
                  value={aboutData.contact.contactInfo.phone}
                  href={`tel:${aboutData.contact.contactInfo.phone.replace(
                    /\s/g,
                    ""
                  )}`}
                />

                <ContactInfoCard
                  icon="fa-solid fa-location-dot"
                  title="Location"
                  value={aboutData.contact.contactInfo.location}
                />
              </div>

              {/* Availability */}

              <div
                className="
                  mt-5 rounded-2xl
                  border border-emerald-200
                  bg-emerald-50 p-5
                  dark:border-emerald-500/20
                  dark:bg-emerald-500/10
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      mt-0.5 flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-xl bg-emerald-100
                      text-emerald-600
                      dark:bg-emerald-500/10
                      dark:text-emerald-400
                    "
                  >
                    <i className="fa-solid fa-circle-check" />
                  </div>

                  <div>
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300">
                      Availability
                    </h3>

                    <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                      {aboutData.contact.availability.status}
                    </p>

                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
                      {aboutData.contact.availability.workingHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Social Links */}

              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Connect with me
                </p>

                <div className="flex gap-3">
                  <a
                    href={aboutData.contact.socials.github}
                    onClick={(event) => {
                      if (aboutData.contact.socials.github === "#") {
                        event.preventDefault();
                      }
                    }}
                    className="
                      flex h-11 w-11 items-center justify-center
                      rounded-xl bg-slate-900 text-white
                      transition hover:-translate-y-1
                      dark:bg-slate-800
                    "
                    aria-label="GitHub"
                  >
                    <i className="fa-brands fa-github" />
                  </a>

                  <a
                    href={aboutData.contact.socials.linkedin}
                    onClick={(event) => {
                      if (aboutData.contact.socials.linkedin === "#") {
                        event.preventDefault();
                      }
                    }}
                    className="
                      flex h-11 w-11 items-center justify-center
                      rounded-xl bg-blue-600 text-white
                      transition hover:-translate-y-1
                    "
                    aria-label="LinkedIn"
                  >
                    <i className="fa-brands fa-linkedin-in" />
                  </a>

                  <a
                    href={`mailto:${aboutData.contact.contactInfo.email}`}
                    className="
                      flex h-11 w-11 items-center justify-center
                      rounded-xl bg-violet-600 text-white
                      transition hover:-translate-y-1
                    "
                    aria-label="Email"
                  >
                    <i className="fa-solid fa-envelope" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}

            <div
              className="
                rounded-2xl border border-slate-200
                bg-white p-4 shadow-xl sm:rounded-3xl sm:p-6
                dark:border-slate-700
                dark:bg-slate-900/80
                md:p-8
              "
            >
              <div className="mb-7">
                <h3
                  className="
                    text-lg font-bold text-slate-800 sm:text-xl
                    dark:text-white
                  "
                >
                  Send a Message
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Fill out the form and I'll get back to you.
                </p>
              </div>

              {formMessage && (
                <div
                  className="
                    mb-5 rounded-xl border
                    border-emerald-200 bg-emerald-50
                    p-4 text-sm leading-6 text-emerald-700
                    dark:border-emerald-500/20
                    dark:bg-emerald-500/10
                    dark:text-emerald-300
                  "
                >
                  <i className="fa-solid fa-circle-check mr-2" />
                  {formMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + Email */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="
                        mb-2 block text-sm font-semibold
                        text-slate-700 dark:text-slate-200
                      "
                    >
                      Full Name
                    </label>

                    <div className="relative">
                      <i
                        className="
                          fa-solid fa-user pointer-events-none
                          absolute left-4 top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className="
    h-12 w-full rounded-xl
    border border-slate-200
    bg-slate-50 pl-11 pr-4
    text-sm text-slate-800
    outline-none transition
    placeholder:text-slate-400

    focus:border-violet-400
    focus:bg-slate-50
    focus:text-slate-800
    focus:ring-4
    focus:ring-violet-500/10

    dark:border-slate-700
    dark:bg-slate-800
    dark:text-white
    dark:placeholder:text-slate-400

    dark:focus:border-violet-500
    dark:focus:bg-slate-800
    dark:focus:text-white
  "
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="
                        mb-2 block text-sm font-semibold
                        text-slate-700 dark:text-slate-200
                      "
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <i
                        className="
                          fa-solid fa-envelope
                          pointer-events-none absolute
                          left-4 top-1/2 -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="
                          h-12 w-full rounded-xl
                          border border-slate-200
                          bg-slate-50 pl-11 pr-4
                          text-sm text-slate-800
                          outline-none transition
                          placeholder:text-slate-400
                          focus:border-violet-400
                          focus:bg-white
                          focus:ring-4 focus:ring-violet-500/10
                          dark:border-slate-700
                          dark:bg-slate-800
                          dark:text-white
                          dark:focus:border-violet-500
                        "
                      />
                    </div>
                  </div>
                </div>

                {/* Phone + Subject */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      className="
                        mb-2 block text-sm font-semibold
                        text-slate-700 dark:text-slate-200
                      "
                    >
                      Phone Number
                    </label>

                    <div className="relative">
                      <i
                        className="
                          fa-solid fa-phone
                          pointer-events-none absolute
                          left-4 top-1/2 -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="
                          h-12 w-full rounded-xl
                          border border-slate-200
                          bg-slate-50 pl-11 pr-4
                          text-sm text-slate-800
                          outline-none transition
                          placeholder:text-slate-400
                          focus:border-violet-400
                          focus:bg-white
                          focus:ring-4 focus:ring-violet-500/10
                          dark:border-slate-700
                          dark:bg-slate-800
                          dark:text-white
                          dark:focus:border-violet-500
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="
                        mb-2 block text-sm font-semibold
                        text-slate-700 dark:text-slate-200
                      "
                    >
                      Subject
                    </label>

                    <div className="relative">
                      <i
                        className="
                          fa-solid fa-heading
                          pointer-events-none absolute
                          left-4 top-1/2 -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Enter subject"
                        required
                        className="
                          h-12 w-full rounded-xl
                          border border-slate-200
                          bg-slate-50 pl-11 pr-4
                          text-sm text-slate-800
                          outline-none transition
                          placeholder:text-slate-400
                          focus:border-violet-400
                          focus:bg-white
                          focus:ring-4 focus:ring-violet-500/10
                          dark:border-slate-700
                          dark:bg-slate-800
                          dark:text-white
                          dark:focus:border-violet-500
                        "
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}

                <div>
                  <label
                    htmlFor="message"
                    className="
                      mb-2 block text-sm font-semibold
                      text-slate-700 dark:text-slate-200
                    "
                  >
                    Message
                  </label>

                  <div className="relative">
                    <i
                      className="
                        fa-solid fa-message
                        pointer-events-none absolute
                        left-4 top-4 text-slate-400
                      "
                    />

                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message..."
                      required
                      rows={6}
                      className="
                        w-full resize-none rounded-xl
                        border border-slate-200
                        bg-slate-50 py-3 pl-11 pr-4
                        text-sm text-slate-800
                        outline-none transition
                        placeholder:text-slate-400
                        focus:border-violet-400
                        focus:bg-white
                        focus:ring-4 focus:ring-violet-500/10
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-white
                        dark:focus:border-violet-500
                      "
                    />
                  </div>
                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={isSending}
                  className="
                    flex h-12 w-full
                    items-center justify-center gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600 to-cyan-500
                    px-6 text-sm font-bold text-white
                    shadow-lg shadow-violet-500/20
                    transition-all duration-300
                    hover:-translate-y-1 hover:shadow-xl
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >
                  {isSending ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* ==================================================
          BOTTOM CTA
      ================================================== */}

      <section
        className="
          border-t border-slate-200
          bg-gradient-to-r
          from-violet-600 via-indigo-600 to-cyan-500
          px-4 py-12 text-white sm:px-5 sm:py-16
          dark:border-slate-800
        "
      >
        <div className="mx-auto max-w-4xl text-center">
          <div
            className="
              mx-auto flex h-16 w-16
              items-center justify-center
              rounded-2xl bg-white/10
              text-2xl backdrop-blur-md
            "
          >
            <i className="fa-solid fa-robot" />
          </div>

          <h2 className="mt-6 text-2xl font-extrabold md:text-3xl">
            Explore Resume Analyzer Pro
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/80">
            Analyze resumes, explore candidate insights, and discover
            the capabilities of the Resume Analyzer Pro platform.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/resume-analyzer"
              className="
                inline-flex items-center gap-2
                justify-center rounded-xl bg-white px-5 py-3
                text-sm font-bold text-violet-700
                transition hover:-translate-y-1
                hover:shadow-xl
              "
            >
              <i className="fa-solid fa-file-circle-check" />
              Analyze Resume
            </Link>

            <Link
              to="/dashboard"
              className="
                inline-flex items-center gap-2
                justify-center rounded-xl border border-white/30
                bg-white/10 px-5 py-3
                text-sm font-bold text-white
                backdrop-blur-md
                transition hover:-translate-y-1
                hover:bg-white/20
              "
            >
              <i className="fa-solid fa-chart-line" />
              View Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}