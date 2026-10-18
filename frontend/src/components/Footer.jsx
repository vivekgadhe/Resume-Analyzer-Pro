// src/components/Footer.jsx
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SITE from "../config/siteConfig";

function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;

    if (!footer) return;

    const columns = footer.querySelectorAll(".footer-column");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      columns.forEach((column) => {
        column.classList.add("opacity-100", "translate-y-0");
      });

      return;
    }

    columns.forEach((column) => {
      column.classList.add(
        "opacity-0",
        "translate-y-6",
        "transition-all",
        "duration-700"
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          columns.forEach((column, index) => {
            setTimeout(() => {
              column.classList.remove("opacity-0", "translate-y-6");
              column.classList.add("opacity-100", "translate-y-0");
            }, index * 150);
          });

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="w-full bg-slate-950 text-slate-300"
    >
      {/* Main Footer */}
      <div className="mx-auto grid w-[92%] max-w-[1200px] grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
<div className="footer-column sm:col-span-2 lg:col-span-1">
  <Link
    to={SITE.footer.brand.endpoint}
    className="inline-flex items-center"
  >
    <img
      src="/resume-analyzer-pro-logo.png"
      alt="Resume Analyzer Pro"
      className="h-14 w-auto object-contain"
    />
  </Link>

  <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
    {SITE.footer.brand.description}
  </p>
          {/* Social Links */}
          <div className="mt-6 flex items-center gap-3">
            {SITE.footer.brand.social_links.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
              >
                <i className={social.icon}></i>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            {SITE.footer.quick_links.title}
          </h3>

          <ul className="mt-5 space-y-3">
            {SITE.footer.quick_links.links.map((link) => (
              <li key={link.title}>
                <Link
                  to={link.endpoint}
                  className="inline-flex text-sm text-slate-400 transition duration-200 hover:translate-x-1 hover:text-blue-400"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform */}
        <div className="footer-column">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            {SITE.footer.platform.title}
          </h3>

          <ul className="mt-5 space-y-3">
            {SITE.footer.platform.links.map((link) => (
              <li key={link.title}>
                <Link
                  to={link.endpoint}
                  className="inline-flex text-sm text-slate-400 transition duration-200 hover:translate-x-1 hover:text-blue-400"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-column">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            {SITE.footer.contact.title}
          </h3>

          <ul className="mt-5 space-y-4">
            {SITE.footer.contact.items.map((item) => (
              <li key={item.text}>
                <a
                  href={item.url}
                  className="flex items-start gap-3 text-sm text-slate-400 transition duration-200 hover:text-blue-400"
                >
                  <i
                    className={`${item.icon} mt-1 w-4 text-blue-500`}
                  ></i>

                  <span>{item.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex w-[92%] max-w-[1200px] flex-col gap-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">

          {/* Copyright */}
          <p className="text-slate-500">
            {SITE.footer.bottom.copyright}
          </p>

          {/* Signature */}
          <p className="text-slate-500">
            {SITE.footer.bottom.signature}
          </p>

          {/* Bottom Links */}
          <div className="flex flex-wrap items-center gap-4">
            {SITE.footer.bottom.links.map((link) => (
              <a
                key={link.title}
                href={link.url}
                className="text-slate-500 transition duration-200 hover:text-blue-400"
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;