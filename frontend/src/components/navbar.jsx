import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import SITE from "../config/siteConfig";

const THEME_KEY = "theme";
const DARK = "dark";
const LIGHT = "light";

function Navbar() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === DARK || savedTheme === LIGHT) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === DARK);
    root.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === DARK ? LIGHT : DARK);
  const closeMobileMenu = () => setMobileOpen(false);

  // Exclude Dashboard even if it is still configured in siteConfig.js.
  const navLinks = SITE.navbar.links.filter(
    (link) => link.title?.trim().toLowerCase() !== "dashboard"
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#292D36] bg-[#111318] text-white shadow-sm">
      <nav className="mx-auto w-[94%] max-w-[1600px]">
        <div className="flex min-h-[72px] items-center justify-between gap-5">
          <Link to="/" onClick={closeMobileMenu} className="flex shrink-0 items-center" aria-label="Resume Analyzer Pro home">
            <img
              src="/resume-analyzer-pro-logo.png"
              alt="Resume Analyzer Pro"
              className="h-10 w-auto max-w-[240px] object-contain"
            />
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.title}
                to={link.endpoint}
                className={({ isActive }) =>
                  `relative whitespace-nowrap px-3.5 py-3 text-[15px] font-semibold transition-colors duration-200 ${
                    isActive
                      ? "text-white after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-1 after:rounded-full after:bg-sky-400"
                      : "text-gray-300 hover:text-sky-400"
                  }`
                }
              >
                {link.title}
              </NavLink>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-5 lg:flex">
            <Link
              to="/signin"
              className="rounded-2xl border border-sky-400 px-6 py-3 text-sm font-semibold text-sky-400 transition-colors duration-200 hover:bg-sky-400 hover:text-[#111318]"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === DARK ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#292929] text-white transition-colors duration-200 hover:bg-[#383838]"
            >
              <i className={theme === DARK ? "fas fa-sun text-lg" : "fas fa-moon text-lg"} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#343943] text-gray-200 transition hover:bg-[#1E293B] lg:hidden"
          >
            <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"} text-lg`} aria-hidden="true" />
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 lg:hidden ${mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="border-t border-[#292D36] py-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.title}
                  to={link.endpoint}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                      isActive ? "bg-[#1E293B] text-sky-400" : "text-gray-300 hover:bg-[#1E293B] hover:text-sky-400"
                    }`
                  }
                >
                  {link.title}
                </NavLink>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 border-t border-[#292D36] pt-4">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === DARK ? "Switch to light mode" : "Switch to dark mode"}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#292929] text-white transition hover:bg-[#383838]"
              >
                <i className={theme === DARK ? "fas fa-sun" : "fas fa-moon"} aria-hidden="true" />
              </button>
              <Link
                to="/signin"
                onClick={closeMobileMenu}
                className="flex-1 rounded-xl border border-sky-400 px-4 py-3 text-center text-sm font-semibold text-sky-400 transition hover:bg-sky-400 hover:text-[#111318]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
