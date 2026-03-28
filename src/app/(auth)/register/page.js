"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Jalandhar");
  const [state, setState] = useState("Punjab");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!otpSent || countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [otpSent, countdown]);

  function getInputStyle() {
    return {
      border: "0.5px solid #E8E1D5",
      background: "#F5F2ED",
      color: "#171717",
    };
  }

  function handleInputFocus(event) {
    event.target.style.borderColor = "#4A6FA9";
  }

  function handleInputBlur(event) {
    event.target.style.borderColor = "#E8E1D5";
  }

  async function sendOtp() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to send OTP.");
      }

      setOtpSent(true);
      setCountdown(30);
    } catch (otpError) {
      setError(otpError.message || "Unable to send OTP right now.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "OTP verification failed.");
      }

      setPhoneVerified(true);
      setStep(2);
      setError("");
    } catch (verifyError) {
      setError(verifyError.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          city,
          state,
          phone,
          phoneVerified: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to create account.");
      }

      router.push("/dashboard/citizen");
    } catch (registerError) {
      setError(registerError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "#FAFAF8" }}
    >
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-[13px]"
          style={{ color: "#4A6FA9", textDecoration: "none" }}
        >
          ← Back to Home
        </Link>
      </div>

      <div
        className="w-full max-w-[420px] rounded-[14px] bg-white px-9 py-8"
        style={{ border: "0.5px solid #E8E1D5" }}
      >
        <p className="text-center text-[16px] font-semibold" style={{ color: "#4A6FA9" }}>
          NyaySetu
        </p>

        <h1 className="mt-2 text-center text-[22px] font-medium" style={{ color: "#171717" }}>
          Create your account
        </h1>

        <p className="mt-1 text-center text-[13px]" style={{ color: "#666666" }}>
          Join thousands reporting civic issues in your city
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span
            className="rounded-[20px] px-3 py-[3px] text-[12px] font-medium"
            style={
              step === 1
                ? { background: "#4A6FA9", color: "#FFFFFF" }
                : { background: "#F5F2ED", color: "#999999" }
            }
          >
            Verify Phone
          </span>
          <span
            className="rounded-[20px] px-3 py-[3px] text-[12px] font-medium"
            style={
              step === 2
                ? { background: "#4A6FA9", color: "#FFFFFF" }
                : { background: "#F5F2ED", color: "#999999" }
            }
          >
            Your Details
          </span>
        </div>

        {step === 1 ? (
          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-[12px] font-medium"
                style={{ color: "#555555" }}
              >
                Mobile Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-[10px] border px-[14px] py-[10px] text-[14px] focus:outline-none focus:ring-0"
                style={getInputStyle()}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <button
              type="button"
              onClick={sendOtp}
              disabled={loading || phone.trim().length < 10}
              className={`inline-flex w-full items-center justify-center rounded-[10px] px-4 py-[11px] text-[14px] font-medium text-white transition-colors ${
                loading ? "" : "hover:bg-[#5B79B3]"
              }`}
              style={{
                background:
                  loading || phone.trim().length < 10 ? "#5B79B3" : "#4A6FA9",
              }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden="true"
                  />
                  Sending OTP...
                </span>
              ) : (
                "Send OTP"
              )}
            </button>

            {otpSent ? (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-1.5 block text-[12px] font-medium"
                    style={{ color: "#555555" }}
                  >
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-[10px] border px-[14px] py-[10px] text-center text-[18px] tracking-[0.2em] focus:outline-none focus:ring-0"
                    style={getInputStyle()}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={loading || otp.trim().length !== 6}
                  className={`inline-flex w-full items-center justify-center rounded-[10px] px-4 py-[11px] text-[14px] font-medium text-white transition-colors ${
                    loading ? "" : "hover:bg-[#5B79B3]"
                  }`}
                  style={{
                    background:
                      loading || otp.trim().length !== 6 ? "#5B79B3" : "#4A6FA9",
                  }}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        aria-hidden="true"
                      />
                      Verifying...
                    </span>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <span className="text-[12px]" style={{ color: "#999999" }}>
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendOtp}
                      className="text-[12px]"
                      style={{ color: "#4A6FA9" }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-[12px] font-medium"
                style={{ color: "#555555" }}
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-[10px] border px-[14px] py-[10px] text-[14px] focus:outline-none focus:ring-0"
                style={getInputStyle()}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[12px] font-medium"
                style={{ color: "#555555" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-[10px] border px-[14px] py-[10px] text-[14px] focus:outline-none focus:ring-0"
                style={getInputStyle()}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[12px] font-medium"
                style={{ color: "#555555" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-[10px] border px-[14px] py-[10px] pr-10 text-[14px] focus:outline-none focus:ring-0"
                  style={getInputStyle()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#999999" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-1.5 block text-[12px] font-medium"
                style={{ color: "#555555" }}
              >
                City
              </label>
              <select
                id="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
                className="w-full rounded-[10px] border px-[14px] py-[10px] text-[14px] focus:outline-none focus:ring-0"
                style={getInputStyle()}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              >
                <option value="Jalandhar">Jalandhar</option>
                <option value="Ludhiana">Ludhiana</option>
                <option value="Amritsar">Amritsar</option>
                <option value="Chandigarh">Chandigarh</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="state"
                className="mb-1.5 block text-[12px] font-medium"
                style={{ color: "#555555" }}
              >
                State
              </label>
              <select
                id="state"
                value={state}
                onChange={(event) => setState(event.target.value)}
                required
                className="w-full rounded-[10px] border px-[14px] py-[10px] text-[14px] focus:outline-none focus:ring-0"
                style={getInputStyle()}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              >
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Chandigarh">Chandigarh</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !phoneVerified}
              className={`inline-flex w-full items-center justify-center rounded-[10px] px-4 py-[11px] text-[14px] font-medium text-white transition-colors ${
                loading ? "" : "hover:bg-[#5B79B3]"
              }`}
              style={{ background: loading || !phoneVerified ? "#5B79B3" : "#4A6FA9" }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden="true"
                  />
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        {error ? (
          <p className="mt-3 text-[13px]" style={{ color: "#B91C1C" }}>
            {error}
          </p>
        ) : null}

        <p className="mt-5 text-center text-[13px]" style={{ color: "#666666" }}>
          Already have an account?{" "}
          <Link href="/login" className="no-underline" style={{ color: "#4A6FA9" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
