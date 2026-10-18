import { useEffect, useState } from "react";
import HOME_DATA from "../config/homeData";

function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [showTop, setShowTop] = useState(false);

  // Show back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        id="hero"
        className="relative min-h-[auto] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 pb-14 pt-24 sm:min-h-[80vh] sm:pb-20 sm:pt-[110px] dark:from-slate-900 dark:to-slate-800"
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto grid w-[92%] max-w-[1320px] grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">

          {/* HERO LEFT */}
          <div className="text-center lg:text-left">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400">
              <i className={HOME_DATA.hero.badge.icon}></i>
              <span>{HOME_DATA.hero.badge.text}</span>
            </div>

            {/* Title */}
            <h1 className="text-[clamp(2.15rem,8vw,4.6rem)] font-extrabold leading-[1.12] tracking-tight sm:leading-[1.2]">
              {HOME_DATA.hero.title}

              <span className="mt-2 block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {HOME_DATA.hero.highlight_title}
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0">
              {HOME_DATA.hero.description}
            </p>

            {/* Buttons */}
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4 lg:justify-start">

              <a
                href={HOME_DATA.hero.primary_button.endpoint}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-700 sm:w-auto sm:min-w-[190px] sm:px-7"
              >
                {HOME_DATA.hero.primary_button.text}

                <i className="fa-solid fa-arrow-right"></i>
              </a>

              <a
                href={HOME_DATA.hero.secondary_button.endpoint}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-700 transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 sm:w-auto sm:min-w-[190px] sm:px-7"
              >
                {HOME_DATA.hero.secondary_button.text}
              </a>

            </div>

            {/* Highlights */}
            <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 lg:justify-start">
              {HOME_DATA.hero.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <i className="fa-solid fa-circle-check text-emerald-500"></i>

                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HERO RIGHT */}
          <div className="relative mt-4 flex justify-center px-2 sm:mt-5 lg:mt-24">

            {/* Resume Preview */}
            <div className="relative w-full max-w-[360px] rounded-3xl border border-white/60 bg-white/80 p-4 shadow-2xl backdrop-blur-xl sm:p-7 dark:border-slate-600/60 dark:bg-slate-800/80">

              {/* Resume header */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-600">

                <div>
                  <h3 className="font-bold">
                    {HOME_DATA.hero.resume_preview.filename}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    AI Resume Analysis
                  </p>
                </div>

                <i className="fa-solid fa-file-lines text-2xl text-blue-600"></i>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold">
                  Detected Skills
                </h4>

                <div className="flex flex-wrap gap-2">
                  {HOME_DATA.hero.resume_preview.skills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* ATS score */}
              <div className="rounded-2xl bg-blue-50 p-5 text-center dark:bg-blue-400/10">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  ATS Compatibility
                </p>

                <p className="mt-1 text-4xl font-extrabold text-blue-600">
                  {HOME_DATA.hero.resume_preview.ats_score}%
                </p>
              </div>

              {/* Floating cards */}
              {HOME_DATA.hero.floating_cards.map((card, index) => {
                const positions = [
                  "-left-16 top-10",
                  "-right-12 top-44",
                  "-bottom-5 -left-10",
                ];

                const backgrounds = [
                  "bg-blue-50 text-blue-600 dark:bg-blue-400/10",
                  "bg-cyan-50 text-cyan-600 dark:bg-cyan-400/10",
                  "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10",
                ];

                return (
                  <div
                    key={index}
                    className={`absolute ${positions[index]} hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-600 dark:bg-slate-800 sm:flex`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${backgrounds[index]}`}
                    >
                      <i className={card.icon}></i>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {card.title}
                      </p>

                      <p className="font-bold">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================= */}
      <section
        id="features"
        className="bg-slate-50 py-14 sm:py-20 dark:bg-slate-900"
      >
        <div className="mx-auto w-[92%] max-w-[1200px]">

          {/* Section heading */}
          <div className="mx-auto mb-10 max-w-[760px] text-center sm:mb-14">
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              Powerful Features
            </span>

            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight">
              Everything You Need for Smarter Resume Analysis
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              Analyze resumes, evaluate ATS compatibility, manage candidates,
              and understand hiring data from one platform.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">

            {HOME_DATA.features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-2.5 hover:border-blue-400 hover:shadow-2xl sm:p-8 dark:border-slate-600 dark:bg-slate-800"
              >

                {/* Top accent */}
                <div className="absolute left-0 right-0 top-0 h-1 origin-left scale-x-0 bg-blue-600 transition duration-300 group-hover:scale-x-100" />

                {/* Icon */}
                <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[18px] bg-blue-50 text-2xl text-blue-600 transition duration-300 group-hover:rotate-[-8deg] group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-400/10">
                  <i className={feature.icon}></i>
                </div>

                <h3 className="text-[1.35rem] font-bold">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>

                <a
                  href={feature.endpoint}
                  className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400"
                >
                  Explore
                  <i className="fa-solid fa-arrow-right text-sm"></i>
                </a>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section
        id="how-it-works"
        className="bg-slate-100 py-16 sm:py-20 lg:py-[120px] dark:bg-slate-800"
      >
        <div className="mx-auto w-[92%] max-w-[1200px]">

          <div className="mx-auto mb-10 max-w-[760px] text-center sm:mb-14">
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              How It Works
            </span>

            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-extrabold">
              Simple Process. Powerful Results.
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              Resume Analyzer Pro makes resume screening simple from upload to
              analytics.
            </p>
          </div>

          {/* Process cards */}
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">

            {HOME_DATA.how_it_works.map((step) => (
              <div
                key={step.step}
                className="group rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl sm:p-8 dark:border-slate-600 dark:bg-slate-900"
              >

                {/* Icon */}
                <div className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600 dark:bg-blue-400/10">
                  <i className={step.icon}></i>
                </div>

                {/* Number */}
                <div className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step.step}
                </div>

                <h3 className="mt-5 text-[1.35rem] font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =========================================================
          WHY CHOOSE
      ========================================================= */}
      <section
        id="why-choose"
        className="bg-white py-14 sm:py-20 dark:bg-slate-900"
      >
        <div className="mx-auto grid w-[92%] max-w-[1200px] grid-cols-1 items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]">

          {/* Left */}
          <div>

            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              {HOME_DATA.why_choose.section_tag}
            </span>

            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight">
              {HOME_DATA.why_choose.title}
            </h2>

            <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">
              {HOME_DATA.why_choose.description}
            </p>

            <div className="mt-8 flex flex-col gap-6">

              {HOME_DATA.why_choose.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-4"
                >

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                    <i className={feature.icon}></i>
                  </div>

                  <div>
                    <h3 className="font-bold">
                      {feature.title}
                    </h3>

                    <p className="mt-1 leading-7 text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </div>

                </div>
              ))}

            </div>
          </div>

          {/* Right card */}
          <div className="mx-auto w-full max-w-[420px] rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl transition duration-300 hover:-translate-y-2 dark:border-slate-600 dark:bg-slate-800">

            <div className="mb-8 flex items-center gap-4">

              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                <i className={HOME_DATA.why_choose.card.icon}></i>
              </div>

              <div>
                <h3 className="font-bold">
                  {HOME_DATA.why_choose.card.title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  AI-powered resume insights
                </p>
              </div>

            </div>

            <div className="flex flex-col gap-5">

              {HOME_DATA.why_choose.card.progress.map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-slate-200 pb-4 last:border-0 dark:border-slate-600"
                  >
                    <span className="text-slate-600 dark:text-slate-300">
                      {item.label}
                    </span>

                    <strong className="text-blue-600 dark:text-blue-400">
                      {item.value}
                    </strong>
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRODUCT SHOWCASE
      ========================================================= */}
      <section
        id="product-showcase"
        className="bg-slate-50 py-14 sm:py-20 dark:bg-slate-900"
      >
        <div className="mx-auto w-[92%] max-w-[1200px]">

          <div className="mx-auto mb-10 max-w-[760px] text-center sm:mb-14">

            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              {HOME_DATA.showcase.section_tag}
            </span>

            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-extrabold">
              {HOME_DATA.showcase.title}
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              {HOME_DATA.showcase.description}
            </p>

          </div>

          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">

            {HOME_DATA.showcase.modules.map((module, index) => (
              <div
                key={index}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-3 hover:border-blue-400 hover:shadow-2xl dark:border-slate-600 dark:bg-slate-800"
              >

                <div className="mb-6 flex h-[75px] w-[75px] items-center justify-center rounded-[20px] bg-blue-50 text-2xl text-blue-600 transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-400/10">
                  <i className={module.icon}></i>
                </div>

                <span className="mb-3 w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                  {module.badge}
                </span>

                <h3 className="text-[1.45rem] font-bold">
                  {module.title}
                </h3>

                <p className="mt-3 flex-1 leading-7 text-slate-600 dark:text-slate-300">
                  {module.description}
                </p>

                <a
                  href={module.endpoint}
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-blue-50 px-5 py-3 font-semibold text-blue-600 transition duration-300 hover:bg-blue-600 hover:text-white dark:bg-blue-400/10 dark:text-blue-400"
                >
                  Explore Module

                  <i className="fa-solid fa-arrow-right"></i>
                </a>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <section
        id="faq"
        className="bg-white py-14 sm:py-20 dark:bg-slate-900"
      >
        <div className="mx-auto w-[92%] max-w-[900px]">

          <div className="mx-auto mb-10 max-w-[760px] text-center sm:mb-14">

            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              {HOME_DATA.faq.section_tag}
            </span>

            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-extrabold">
              {HOME_DATA.faq.title}
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              {HOME_DATA.faq.description}
            </p>

          </div>

          <div>
            {HOME_DATA.faq.questions.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={index}
                  className={`mb-5 overflow-hidden rounded-[18px] border bg-white transition duration-300 dark:bg-slate-800 ${
                    isOpen
                      ? "border-blue-400 shadow-lg"
                      : "border-slate-200 dark:border-slate-600"
                  }`}
                >

                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:gap-5 sm:px-7 sm:py-5"
                  >
                    <span className="text-[1.08rem] font-semibold">
                      {faq.question}
                    </span>

                    <i
                      className={`fa-solid fa-chevron-down shrink-0 text-blue-600 transition duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    ></i>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-5 leading-7 text-slate-600 dark:text-slate-300 sm:px-7 sm:pb-6">
                        {faq.answer}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section
        id="cta"
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 py-16 sm:py-20 lg:py-[120px]"
      >

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-white/10 blur-2xl" />

        <div className="relative mx-auto grid w-[92%] max-w-[1200px] grid-cols-1 items-center gap-14 lg:grid-cols-[1.2fr_0.8fr]">

          {/* CTA content */}
          <div className="text-center lg:text-left">

            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              {HOME_DATA.cta.section_tag}
            </span>

            <h2 className="mt-5 text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold leading-tight text-white">
              {HOME_DATA.cta.title}
            </h2>

            <p className="mt-5 max-w-[620px] leading-7 text-white/85">
              {HOME_DATA.cta.description}
            </p>

            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4 lg:justify-start">

              <a
                href={HOME_DATA.cta.primary_button.endpoint}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-blue-600 shadow-lg transition duration-300 hover:-translate-y-1"
              >
                <i className={HOME_DATA.cta.primary_button.icon}></i>

                {HOME_DATA.cta.primary_button.text}
              </a>

              <a
                href={HOME_DATA.cta.secondary_button.endpoint}
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-transparent px-7 py-3.5 font-semibold text-white transition duration-300 hover:bg-white/10"
              >
                <i className={HOME_DATA.cta.secondary_button.icon}></i>

                {HOME_DATA.cta.secondary_button.text}
              </a>

            </div>
          </div>

          {/* CTA card */}
          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-8">

            <div className="mb-8 flex items-center gap-4">

              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-white/10 text-2xl">
                <i className={HOME_DATA.cta.card.icon}></i>
              </div>

              <div>
                <h3 className="font-bold">
                  {HOME_DATA.cta.card.title}
                </h3>

                <p className="text-sm text-white/70">
                  AI-powered resume platform
                </p>
              </div>

            </div>

            <div className="flex flex-col gap-5">

              {HOME_DATA.cta.card.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <i className={item.icon}></i>

                  <span className="text-white/90">
                    {item.text}
                  </span>
                </div>
              ))}

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          BACK TO TOP
      ========================================================= */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-4 right-4 z-50 flex h-11 w-11 sm:bottom-7 sm:right-7 sm:h-[50px] sm:w-[50px] items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 ${
          showTop
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-4 opacity-0"
        }`}
      >
        <i className="fa-solid fa-arrow-up"></i>
      </button>

    </main>
  );
}

export default Home;