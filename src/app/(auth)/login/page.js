"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          "radial-gradient(circle at 10% 15%, rgba(245,200,66,0.16) 0%, rgba(245,200,66,0) 44%), radial-gradient(circle at 90% 8%, rgba(13,27,42,0.08) 0%, rgba(13,27,42,0) 38%), #FAFAF8",
      }}
    >
      <div className="w-full max-w-[460px]">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#0D1B2A",
              letterSpacing: "-0.03em",
              textDecoration: "none",
            }}
          >
            Nyay<span style={{ color: "#F5C842" }}>Setu</span>
          </Link>

          <Link href="/" style={{ fontSize: 12, color: "#4A5568", textDecoration: "none" }}>
            Back to Home
          </Link>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 22,
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 12px 46px rgba(13,27,42,0.1)",
            padding: "28px 24px",
          }}
        >
          <h1
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 36,
              color: "#0D1B2A",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Log in
          </h1>

          <p style={{ fontSize: 14, color: "#4A5568", marginBottom: 20 }}>
            Continue managing grievances and petition momentum.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" style={{ display: "block", marginBottom: 7, fontSize: 12, fontWeight: 600, color: "#4A5568" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                style={{
                  width: "100%",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#FAFAF8",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 14,
                  color: "#0D1B2A",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: "block", marginBottom: 7, fontSize: 12, fontWeight: 600, color: "#4A5568" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  style={{
                    width: "100%",
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "#FAFAF8",
                    borderRadius: 12,
                    padding: "12px 44px 12px 14px",
                    fontSize: 14,
                    color: "#0D1B2A",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#4A5568",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-yellow"
              style={{
                width: "100%",
                textAlign: "center",
                opacity: loading ? 0.8 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 8,
              }}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            {error ? <p style={{ fontSize: 13, color: "#B91C1C" }}>{error}</p> : null}
          </form>

          <div className="my-7 flex items-center gap-3">
            <div style={{ height: 1, width: "100%", background: "rgba(0,0,0,0.08)" }} />
            <span style={{ fontSize: 11, color: "#8A9BAA", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              optional
            </span>
            <div style={{ height: 1, width: "100%", background: "rgba(0,0,0,0.08)" }} />
          </div>

          <button
            type="button"
            onClick={() => setShowOtp((prev) => !prev)}
            className="btn-outline-sm"
            style={{ width: "100%", textAlign: "center", marginBottom: showOtp ? 10 : 0 }}
          >
            {showOtp ? "Hide Phone OTP" : "Login with Phone OTP"}
          </button>

          {showOtp ? (
            <div
              className="mt-4"
              style={{
                background: "#FAFAF8",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div className="space-y-3">
                <div>
                  <label htmlFor="phone" style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#4A5568" }}>
                    Phone number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Enter your phone number"
                    style={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "white",
                      borderRadius: 10,
                      padding: "10px 12px",
                      fontSize: 14,
                      color: "#0D1B2A",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="otp" style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#4A5568" }}>
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter OTP"
                    style={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "white",
                      borderRadius: 10,
                      padding: "10px 12px",
                      fontSize: 14,
                      color: "#0D1B2A",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <p style={{ marginTop: 28, fontSize: 13, color: "#4A5568" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#0D1B2A", fontWeight: 700, textDecoration: "none" }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
