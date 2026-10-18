import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Email verification
  const [userId, setUserId] = useState(null);
  const [registrationToken, setRegistrationToken] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    // If email changes, previous verification is no longer valid.
    if (name === "email") {
      setUserId(null);
      setRegistrationToken("");
      setCodeSent(false);
      setVerificationCode("");
      setIsEmailVerified(false);
      setVerificationMessage("");
      setTimeLeft(0);
    }
  };

  // Strong password requirements
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isStrongPassword =
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.special;

  // Password requirement component
  const Requirement = ({ valid, children }) => (
    <div
      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
        valid
          ? "text-green-600 dark:text-green-400"
          : "text-slate-500 dark:text-slate-400"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
          valid
            ? "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
            : "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
        }`}
      >
        <i
          className={`fa-solid ${
            valid ? "fa-check" : "fa-circle"
          } text-[8px]`}
        />
      </span>

      <span>{children}</span>
    </div>
  );

  // Countdown timer
  useEffect(() => {
    if (!codeSent || timeLeft <= 0 || isEmailVerified) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [codeSent, timeLeft, isEmailVerified]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // Send verification code. Password validation happens after email verification.
  const handleSendCode = async () => {
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (codeSent && timeLeft > 0) {
      setError("A verification code has already been sent. Please check your email.");
      return;
    }

    setError("");
    setVerificationMessage("");
    setIsSendingCode(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/send-registration-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to send verification code.");
        return;
      }

      setUserId(data.user_id);
      setRegistrationToken("");
      setCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode("");
      setTimeLeft(120);
      setVerificationMessage(
        data.message || "A verification code has been sent to your email address."
      );
    } catch (requestError) {
      console.error("Send code error:", requestError);
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  // Verify OTP
  const handleVerifyCode = async () => {
    if (!userId) {
      setError("Please click Send Code first.");
      return;
    }

    if (!verificationCode.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (timeLeft <= 0) {
      setError("The verification code has expired. Please resend the code.");
      return;
    }

    setError("");
    setIsVerifyingCode(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            otp: verificationCode.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid verification code.");
        return;
      }

      if (!data.registration_token) {
        setError(
          data.message ||
            "Email verification succeeded, but the registration token was not returned. Please update the backend verify-otp route."
        );
        return;
      }

      setRegistrationToken(data.registration_token);
      setIsEmailVerified(true);
      setTimeLeft(0);
      setVerificationMessage(
        "Email address verified successfully. You can now create your password."
      );
    } catch (error) {
      console.error("Verification error:", error);

      setError(
        "Unable to verify the code. Please make sure the backend is running."
      );
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Resend OTP
  const handleResendCode = async () => {
    if (!userId) {
      setError("Please click Send Code first.");
      return;
    }

    setError("");
    setVerificationMessage("");
    setIsSendingCode(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to resend verification code.");
        return;
      }

      setCodeSent(true);
      setVerificationCode("");
      setRegistrationToken("");
      setIsEmailVerified(false);
      setTimeLeft(120);

      setVerificationMessage(
        "A new verification code has been sent to your email address."
      );
    } catch (error) {
      console.error("Resend code error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  // Complete registration after OTP verification and password creation.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isEmailVerified || !registrationToken) {
      setError("Please verify your email address before creating your account.");
      return;
    }

    if (!isStrongPassword) {
      setError(
        "Password must be at least 8 characters and contain uppercase, lowercase, number, and special symbol."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/complete-registration",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${registrationToken}`,
          },
          body: JSON.stringify({ password: formData.password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create your account.");
        return;
      }

      navigate("/signin", {
        state: {
          message:
            data.message ||
            "Registration successful. Please sign in with your new account.",
        },
      });
    } catch (requestError) {
      console.error("Registration error:", requestError);
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 px-3 py-6 sm:px-5 sm:py-10 md:py-12 text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-150px)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-2">

          {/* Left Section */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-10 text-white lg:flex lg:flex-col lg:justify-center">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="relative z-10">
              <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg backdrop-blur-md">
                <i className="fa-solid fa-user-plus" />
              </div>

              <h1 className="text-4xl font-extrabold leading-tight">
                Create Your Account
              </h1>

              <p className="mt-4 max-w-md text-base leading-7 text-white/85">
                Join Resume Analyzer Pro and get access to powerful resume
                analysis, ATS insights, analytics, and candidate management
                tools.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <i className="fa-solid fa-file-circle-check" />
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

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <i className="fa-solid fa-graduation-cap" />
                  </div>
                  <span className="text-sm font-medium">
                    Personalized career insights
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Register Form */}
          <section className="p-4 sm:p-7 md:p-10 lg:p-12">
            <div className="mx-auto max-w-md">

              {/* Mobile Logo */}
              <div className="mb-5 sm:mb-7 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-xl text-white shadow-lg">
                  <i className="fa-solid fa-user-plus" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                    Resume Analyzer Pro
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI Resume Analyzer
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-7">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
                  Create Account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Create your account to get started with Resume Analyzer Pro.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <i className="fa-solid fa-circle-exclamation mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <i className="fa-solid fa-user pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Email Address
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
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
                        disabled={isEmailVerified}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={isSendingCode || isEmailVerified}
                      className="h-12 shrink-0 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingCode ? (
                        <i className="fa-solid fa-spinner animate-spin" />
                      ) : isEmailVerified ? (
                        <>
                          <i className="fa-solid fa-check mr-1" />
                          Verified
                        </>
                      ) : (
                        "Send Code"
                      )}
                    </button>
                  </div>

                  {/* Verification message */}
                  {verificationMessage && (
                    <div
                      className={`mt-2 flex items-start gap-2 text-xs ${
                        isEmailVerified
                          ? "text-green-600 dark:text-green-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <i
                        className={`fa-solid ${
                          isEmailVerified
                            ? "fa-circle-check"
                            : "fa-circle-info"
                        } mt-0.5`}
                      />

                      <span>{verificationMessage}</span>
                    </div>
                  )}

                  {/* OTP Box */}
                  {codeSent && !isEmailVerified && (
                    <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                          <i className="fa-solid fa-shield-halved pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" />

                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(event) => {
                              const value = event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);

                              setVerificationCode(value);
                              setError("");
                            }}
                            placeholder="Enter 6-digit code"
                            className="h-12 w-full rounded-xl border border-violet-200 bg-white pl-11 pr-4 text-sm tracking-[0.25em] text-slate-800 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={
                            isVerifyingCode ||
                            verificationCode.length !== 6 ||
                            timeLeft <= 0
                          }
                          className="h-12 shrink-0 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isVerifyingCode ? (
                            <i className="fa-solid fa-spinner animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </div>

                      {/* Timer + Resend */}
                      <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                        <span
                          className={
                            timeLeft > 0
                              ? "text-slate-500 dark:text-slate-400"
                              : "font-semibold text-red-500"
                          }
                        >
                          <i className="fa-regular fa-clock mr-1" />

                          {timeLeft > 0
                            ? `Code expires in ${formatTime(timeLeft)}`
                            : "Code expired"}
                        </span>

                        {timeLeft <= 0 && (
                          <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isSendingCode}
                            className="font-semibold text-violet-600 transition hover:text-violet-700 disabled:opacity-50 dark:text-violet-400"
                          >
                            {isSendingCode ? "Sending..." : "Resend OTP"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verified State */}
                  {isEmailVerified && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-medium text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/15">
                        <i className="fa-solid fa-check text-[10px]" />
                      </span>

                      Email address verified successfully.
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <i className="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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

                  {/* Password Requirements */}
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                    <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Password requirements
                      </p>

                      {isStrongPassword && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                          <i className="fa-solid fa-circle-check" />
                          Strong password
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Requirement valid={passwordRequirements.minLength}>
                        At least 8 characters
                      </Requirement>

                      <Requirement valid={passwordRequirements.uppercase}>
                        One uppercase letter
                      </Requirement>

                      <Requirement valid={passwordRequirements.lowercase}>
                        One lowercase letter
                      </Requirement>

                      <Requirement valid={passwordRequirements.number}>
                        One number
                      </Requirement>

                      <Requirement valid={passwordRequirements.special}>
                        One special symbol
                      </Requirement>
                    </div>

                    {isStrongPassword && (
                      <div className="mt-3 flex items-center gap-2 border-t border-green-200 pt-3 text-xs font-medium text-green-600 dark:border-green-500/20 dark:text-green-400">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/15">
                          <i className="fa-solid fa-check text-[10px]" />
                        </span>

                        Your password meets all security requirements.
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <i className="fa-solid fa-lock pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-500"
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

                  {formData.confirmPassword && (
                    <div
                      className={`mt-2 flex items-center gap-2 text-xs ${
                        formData.password === formData.confirmPassword
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      <i
                        className={`fa-solid ${
                          formData.password === formData.confirmPassword
                            ? "fa-circle-check"
                            : "fa-circle-exclamation"
                        }`}
                      />

                      <span>
                        {formData.password === formData.confirmPassword
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(event) =>
                      setAgreeTerms(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 accent-violet-600"
                  />

                  <label
                    htmlFor="terms"
                    className="text-sm leading-6 text-slate-500 dark:text-slate-400"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
                      onClick={() =>
                        alert("Terms & Conditions will be added later.")
                      }
                    >
                      Terms & Conditions
                    </button>
                    .
                  </label>
                </div>

                {/* Create Account */}
                <button
                  type="submit"
                  disabled={isLoading || !isEmailVerified}
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
                    disabled:opacity-40
                  "
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-plus" />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              {/* Sign In */}
              <div className="mt-6 sm:mt-7 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?
                </p>

                <Link
                  to="/signin"
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
                  <i className="fa-solid fa-right-to-bracket" />
                  Sign In
                </Link>
              </div>

              {/* Back to Home */}
              <div className="mt-6 sm:mt-7 text-center">
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

export default Register;