// src/config/siteConfig.js
const SITE = {
  app_name: "ResumeAI Pro",

  navbar: {
    brand: {
      endpoint: "/",
      logo: "/images/logo.png",
    },

    links: [
      { title: "Home", endpoint: "/" },
      { title: "Resume Analyzer", endpoint: "/resume-analyzer" },
      { title: "Analytics", endpoint: "/analytics" },
      { title: "Candidates", endpoint: "/candidates" },
      { title: "About", endpoint: "/about" },
    ],
  },

  footer: {
    brand: {
      name: "ResumeAI Pro",
      icon: "fas fa-file-alt",
      description:
        "AI-powered resume analyzer designed to help job seekers " +
        "build ATS-friendly resumes and improve interview success.",
      endpoint: "/",
      social_links: [
        {
          label: "GitHub",
          icon: "fab fa-github",
          url: "https://github.com/vivekgadhe",
        },
        {
          label: "LinkedIn",
          icon: "fab fa-linkedin",
          url: "https://www.linkedin.com/in/vivekgadhe/",
        },
        {
          label: "Twitter",
          icon: "fab fa-x-twitter",
          url: "https://x.com/",
        },
        {
          label: "Instagram",
          icon: "fab fa-instagram",
          url: "https://instagram.com/vivekgadhe1764/",
        },
      ],
    },

    quick_links: {
      title: "Quick Links",
      links: [
        { title: "Home", endpoint: "/" },
        { title: "About", endpoint: "/about" },
        { title: "Analytics", endpoint: "/analytics" },
      ],
    },

    platform: {
      title: "Platform",
      links: [
        { title: "Resume Analyzer", endpoint: "/resume-analyzer" },
        { title: "Analytics", endpoint: "/analytics" },
        { title: "Candidates", endpoint: "/candidates" },
      ],
    },

    contact: {
      title: "Contact",
      items: [
        {
          icon: "fas fa-envelope",
          text: "vivekgadhe1704@gmail.com",
          url: "mailto:vivekgadhe1704@gmail.com",
        },
        {
          icon: "fas fa-phone",
          text: "+91 8329823195",
          url: "tel:+918329823195",
        },
        {
          icon: "fas fa-location-dot",
          text: "Pune, Maharashtra, India",
          url: "https://maps.google.com/?q=Pune,Maharashtra,India",
        },
      ],
    },

    bottom: {
      copyright: "© 2026 ResumeAI Pro. All Rights Reserved.",
      signature: "Made with ❤️ and ☕ in India by Vivek Gadhe",
      links: [
        {
          title: "Privacy Policy",
          url: "#",
        },
        {
          title: "Terms of Service",
          url: "#",
        },
      ],
    },
  },
};

export default SITE;