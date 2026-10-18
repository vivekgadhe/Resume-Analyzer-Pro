import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setShowForgotPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setShowForgotPassword(false);
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");

        // Show password recovery option after incorrect credentials.
        if (response.status === 401) {
          setShowForgotPassword(true);
        }

        // If email is not verified, allow the user to verify it.
        if (response.status === 403 && data.requires_verification) {
          setError(
            data.message || "Please verify your email before signing in."
          );
        }

        return;
      }

      // Store JWT token.
      localStorage.setItem("access_token", data.access_token);

      // Store basic user information.
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 px-3 py-6 text-slate-800 sm:px-5 sm:py-10 lg:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl items-center justify-center sm:min-h-[calc(100vh-150px)]">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border sm:rounded-3xl border-slate-200 bg-white shadow-2xl shadow-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-2">

          {/* Left Section */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-8 text-white lg:flex lg:p-10 lg:flex-col lg:justify-center">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="relative z-10">
              <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg backdrop-blur-md">
                <i className="fa-solid fa-file-circle-check" />
              </div>

              <h1 className="text-4xl font-extrabold leading-tight">
                Welcome Back
              </h1>

              <p className="mt-4 max-w-md text-base leading-7 text-white/85">
                Sign in to ResumeAI Pro and continue analyzing resumes,
                exploring candidate insights, and managing your resume data.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <i className="fa-solid fa-file-lines" />
                  </div>
                  <span className="text-sm font-medium">
                    AI-powered resume analysis
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <i className="fa-solid fa-chart-line" />
                  </div>
                  <span className="text-sm font-medium">
                    Interactive resume analytics
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <i className="fa-solid fa-users" />
                  </div>
                  <span className="text-sm font-medium">
                    Centralized candidate management
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Sign In Form */}
          <section className="p-5 sm:p-8 lg:p-12">
            <div className="mx-auto max-w-md">

              {/* Mobile Logo */}
              <div className="mb-6 flex items-center gap-3 sm:mb-7 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-xl text-white shadow-lg">
                  <i className="fa-solid fa-file-lines" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                    ResumeAI Pro
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI Resume Analyzer
                  </p>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white sm:text-3xl">
                  Sign In
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Enter your credentials to access your account.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <i className="fa-solid fa-circle-exclamation mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <i className="fa-solid fa-envelope pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="email"
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
                        focus:ring-4 focus:ring-violet-500/10
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

                {/* Password */}
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-violet-600 transition hover:text-violet-700 dark:text-violet-400"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="relative">
                    <i className="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="
                        h-12 w-full rounded-xl
                        border border-slate-200
                        bg-slate-50 pl-11 pr-12
                        text-sm text-slate-800
                        outline-none transition
                        placeholder:text-slate-400
                        focus:border-violet-400
                        focus:bg-slate-50
                        focus:text-slate-800
                        focus:ring-4 focus:ring-violet-500/10
                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-white
                        dark:placeholder:text-slate-400
                        dark:focus:border-violet-500
                        dark:focus:bg-slate-800
                        dark:focus:text-white
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-500"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <i
                        className={`fa-solid ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Forgot Password After Failed Login */}
                {showForgotPassword && (
                  <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Forgot your password?
                    </p>

                    <Link
                      to="/forgot-password"
                      className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400"
                    >
                      Reset your password
                      <i className="fa-solid fa-arrow-right text-xs" />
                    </Link>
                  </div>
                )}

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                  />

                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-600 dark:text-slate-400"
                  >
                    Remember me
                  </label>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    flex h-12 w-full
                    items-center justify-center gap-2
                    rounded-xl
                    bg-gradient-to-r from-violet-600 to-cyan-500
                    px-6 text-sm font-bold text-white
                    shadow-lg shadow-violet-500/20
                    transition-all duration-300
                    hover:-translate-y-1 hover:shadow-xl
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-right-to-bracket" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3 sm:my-7 sm:gap-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />

                <span className="text-xs font-medium text-slate-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Register */}
              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Don't have an account?
                </p>

                <Link
                  to="/register"
                  className="
                    mt-3 inline-flex items-center gap-2
                    rounded-xl border border-violet-200
                    bg-violet-50 px-5 py-3
                    text-sm font-bold text-violet-700
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:border-violet-300
                    hover:bg-violet-100
                    dark:border-violet-500/20
                    dark:bg-violet-500/10
                    dark:text-violet-300
                    dark:hover:bg-violet-500/20
                  "
                >
                  <i className="fa-solid fa-user-plus" />
                  Register Now
                </Link>
              </div>

              {/* Back to Home */}
              <div className="mt-6 text-center sm:mt-7">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
                >
                  <i className="fa-solid fa-arrow-left" />
                  Back to Home
                </Link>
              </div>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default SignIn;