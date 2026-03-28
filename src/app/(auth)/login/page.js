"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Login failed. Please try again.");
      }

      if (!data?.token || !data?.user) {
        throw new Error("Invalid login response from server.");
      }

      const role = data?.user?.role;

      if (role === "authority") {
        router.push("/dashboard/authority");
      } else if (role === "citizen") {
        router.push("/dashboard/citizen");
      } else {
        router.push("/dashboard/citizen");
      }
    } catch (submitError) {
      setError(submitError.message || "Something went wrong. Please try again.");
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
        style={{ border: "0.5px solid #E8E1D5", boxShadow: "none" }}
      >
        <p className="text-center text-[16px] font-semibold" style={{ color: "#4A6FA9" }}>
          NyaySetu
        </p>

        <h1 className="mt-2 text-center text-[22px] font-medium" style={{ color: "#171717" }}>
          Welcome back
        </h1>

        <p className="mt-1 text-center text-[13px]" style={{ color: "#666666" }}>
          Login to report and track civic issues
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              style={{
                border: "0.5px solid #E8E1D5",
                background: "#F5F2ED",
                color: "#171717",
              }}
              onFocus={(event) => {
                event.target.style.borderColor = "#4A6FA9";
              }}
              onBlur={(event) => {
                event.target.style.borderColor = "#E8E1D5";
              }}
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
                style={{
                  border: "0.5px solid #E8E1D5",
                  background: "#F5F2ED",
                  color: "#171717",
                }}
                onFocus={(event) => {
                  event.target.style.borderColor = "#4A6FA9";
                }}
                onBlur={(event) => {
                  event.target.style.borderColor = "#E8E1D5";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#999999" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 inline-flex w-full items-center justify-center rounded-[10px] px-4 py-[11px] text-[14px] font-medium text-white transition-colors ${
              loading ? "" : "hover:bg-[#5B79B3]"
            }`}
            style={{ background: loading ? "#5B79B3" : "#4A6FA9" }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden="true"
                />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>

          {error ? (
            <p className="text-[13px]" style={{ color: "#B91C1C" }}>
              {error}
            </p>
          ) : null}
        </form>

        <div className="my-4 flex items-center gap-3">
          <hr className="h-px w-full border-0" style={{ background: "#E8E1D5" }} />
          <span className="text-[12px]" style={{ color: "#999999" }}>
            or
          </span>
          <hr className="h-px w-full border-0" style={{ background: "#E8E1D5" }} />
        </div>

        <button
          type="button"
          onClick={() => setShowOtp((prev) => !prev)}
          className="w-full rounded-[10px] px-4 py-[10px] text-[13px]"
          style={{
            background: "#F5F2ED",
            border: "0.5px solid #E8E1D5",
            color: "#555555",
          }}
        >
          Login with Phone OTP
        </button>

        {showOtp ? (
          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-[12px] font-medium"
                style={{ color: "#555555" }}
              >
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-[10px] border px-[14px] py-[10px] text-[14px] focus:outline-none focus:ring-0"
                style={{
                  border: "0.5px solid #E8E1D5",
                  background: "#F5F2ED",
                  color: "#171717",
                }}
                onFocus={(event) => {
                  event.target.style.borderColor = "#4A6FA9";
                }}
                onBlur={(event) => {
                  event.target.style.borderColor = "#E8E1D5";
                }}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label
                htmlFor="otp"
                className="mb-1.5 block text-[12px] font-medium"
                style={{ color: "#555555" }}
              >
                OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                className="w-full rounded-[10px] border px-[14px] py-[10px] text-[14px] focus:outline-none focus:ring-0"
                style={{
                  border: "0.5px solid #E8E1D5",
                  background: "#F5F2ED",
                  color: "#171717",
                }}
                onFocus={(event) => {
                  event.target.style.borderColor = "#4A6FA9";
                }}
                onBlur={(event) => {
                  event.target.style.borderColor = "#E8E1D5";
                }}
                placeholder="Enter OTP"
              />
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-center text-[13px]" style={{ color: "#666666" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="no-underline" style={{ color: "#4A6FA9" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
