import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetToken, setResetToken] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // STEP 1 — Send Reset OTP
  const handleSendOTP = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to send reset OTP.");
        return;
      }

      setMessage(
        "If an account exists with this email, a password reset OTP has been sent."
      );

      setStep(2);
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 — Verify Reset OTP
  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/verify-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP.");
        return;
      }

      setResetToken(data.reset_token);

      setMessage(
        "OTP verified successfully. You can now create a new password."
      );

      setStep(3);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // RESEND RESET OTP
  const handleResendOTP = async () => {
    setError("");
    setMessage("");
    setOtp("");

    setIsResending(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to resend OTP.");
        return;
      }

      setMessage("A new password reset OTP has been sent to your email.");
    } catch (error) {
      console.error("Resend OTP error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsResending(false);
    }
  };

  // STEP 3 — Reset Password
  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!resetToken) {
      setError("Password reset session has expired. Please request a new OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resetToken}`,
          },
          body: JSON.stringify({
            new_password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to reset password.");
        return;
      }

      setMessage(
        "Password reset successfully. Redirecting to Sign In..."
      );

      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (error) {
      console.error("Password reset error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    setMessage("");

    if (step === 2) {
      setStep(1);
      setOtp("");
    } else if (step === 3) {
      setStep(2);
      setPassword("");
      setConfirmPassword("");
      setResetToken("");
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 px-3 py-6 sm:px-5 sm:py-10 md:py-12 text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-168px)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 md:p-10 shadow-2xl shadow-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 sm:p-10">

          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl text-white shadow-lg">
              <i
                className={`fa-solid ${
                  step === 1
                    ? "fa-key"
                    : step === 2
                    ? "fa-envelope-circle-check"
                    : "fa-lock"
                }`}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Create New Password"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {step === 1 &&
                "Enter your registered email address and we'll send you a password reset OTP."}

              {step === 2 &&
                `Enter the 6-digit OTP sent to ${email}.`}

              {step === 3 &&
                "Create a new password for your ResumeAI Pro account."}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-5 sm:mb-7 flex items-center justify-center gap-1.5 sm:gap-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold ${
                    step >= item
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  }`}
                >
                  {step > item ? (
                    <i className="fa-solid fa-check" />
                  ) : (
                    item
                  )}
                </div>

                {item < 3 && (
                  <div
                    className={`h-0.5 w-5 sm:w-8 ${
                      step > item
                        ? "bg-violet-600"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <i className="fa-solid fa-circle-exclamation mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <i className="fa-solid fa-circle-check mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
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
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your registered email"
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
                      focus:ring-4 focus:ring-violet-500/10
                      dark:border-slate-700
                      dark:bg-slate-800
                      dark:text-white
                      dark:placeholder:text-slate-400
                      dark:focus:border-violet-500
                    "
                  />
                </div>
              </div>

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
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane" />
                    Send Reset OTP
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Reset OTP
                </label>

                <div className="relative">
                  <i className="fa-solid fa-key pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "");
                      setOtp(value);
                      setError("");
                    }}
                    placeholder="Enter 6-digit OTP"
                    autoComplete="one-time-code"
                    required
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-slate-50 pl-11 pr-4
                      text-center text-base sm:text-lg font-bold tracking-[0.25em] sm:tracking-[0.35em]
                      text-slate-800
                      outline-none transition
                      placeholder:text-slate-400
                      placeholder:tracking-normal
                      focus:border-violet-400
                      focus:ring-4 focus:ring-violet-500/10
                      dark:border-slate-700
                      dark:bg-slate-800
                      dark:text-white
                      dark:placeholder:text-slate-400
                      dark:focus:border-violet-500
                    "
                  />
                </div>
              </div>

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
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-circle-check" />
                    Verify OTP
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-sm font-semibold text-violet-600 hover:text-violet-700 disabled:opacity-50 dark:text-violet-400"
                >
                  {isResending
                    ? "Sending..."
                    : "Didn't receive the OTP? Resend"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  New Password
                </label>

                <div className="relative">
                  <i className="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-slate-50 pl-11 pr-12
                      text-sm text-slate-800
                      outline-none transition
                      placeholder:text-slate-400
                      focus:border-violet-400
                      focus:ring-4 focus:ring-violet-500/10
                      dark:border-slate-700
                      dark:bg-slate-800
                      dark:text-white
                      dark:placeholder:text-slate-400
                      dark:focus:border-violet-500
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <i className="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-slate-50 pl-11 pr-12
                      text-sm text-slate-800
                      outline-none transition
                      placeholder:text-slate-400
                      focus:border-violet-400
                      focus:ring-4 focus:ring-violet-500/10
                      dark:border-slate-700
                      dark:bg-slate-800
                      dark:text-white
                      dark:placeholder:text-slate-400
                      dark:focus:border-violet-500
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <i
                      className={`fa-solid ${
                        showConfirmPassword
                          ? "fa-eye-slash"
                          : "fa-eye"
                      }`}
                    />
                  </button>
                </div>
              </div>

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
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-key" />
                    Reset Password
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back Button */}
          {step > 1 && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
              >
                <i className="fa-solid fa-arrow-left" />
                Back
              </button>
            </div>
          )}

          {/* Sign In */}
          <div className="mt-7 text-center">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
            >
              <i className="fa-solid fa-right-to-bracket" />
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;