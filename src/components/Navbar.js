"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useUser } from "@/lib/useUser";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, mutate } = useUser();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [cityInput, setCityInput] = useState("Jalandhar");
  const [stateInput, setStateInput] = useState("Punjab");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState("");
  const dashboardHref =
    user?.role === "authority" ? "/dashboard/authority" : "/dashboard/citizen";
  const isOnDashboard = pathname.startsWith("/dashboard");

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "GET" });
      router.push("/");
      await mutate();
    } catch (_error) {
      router.push("/");
      await mutate();
    }
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    setCityInput(user.city || "Jalandhar");
    setStateInput(user.state || "Punjab");
  }, [user]);

  async function handleProfileSave(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: cityInput,
          state: stateInput,
        }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.message || "Unable to update profile");
      }

      await mutate();
      setShowProfileModal(false);
    } catch (error) {
      setProfileError(error.message || "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAutoFetchLocation() {
    setProfileError("");
    setLocationNotice("");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setProfileError("Geolocation is not supported in this browser.");
      return;
    }

    setDetectingLocation(true);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 120000,
        });
      });

      const latitude = position?.coords?.latitude;
      const longitude = position?.coords?.longitude;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Unable to detect coordinates.");
      }

      const reverseResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      const reverseJson = await reverseResponse.json().catch(() => ({}));
      if (!reverseResponse.ok) {
        throw new Error("Unable to resolve your location details.");
      }

      const detectedCity =
        String(
          reverseJson?.city ||
            reverseJson?.locality ||
            reverseJson?.principalSubdivision ||
            ""
        ).trim();
      const detectedState = String(reverseJson?.principalSubdivision || "").trim();

      if (!detectedCity) {
        throw new Error("Could not determine city from your current location.");
      }

      setCityInput(detectedCity);
      setStateInput(detectedState || stateInput || "Punjab");
      setLocationNotice("Location detected. Review and click Save Location to confirm.");
    } catch (error) {
      if (error?.code === 1) {
        setProfileError("Location access was denied. Please allow permission and try again.");
      } else if (error?.code === 2) {
        setProfileError("Position unavailable right now. Please try again.");
      } else if (error?.code === 3) {
        setProfileError("Location request timed out. Please try again.");
      } else {
        setProfileError(error?.message || "Unable to auto fetch location.");
      }
    } finally {
      setDetectingLocation(false);
    }
  }

  const navLinks = isOnDashboard
    ? []
    : [
      { label: "Home", href: "/" },
      { label: "Issues", href: "/grievances" },
      { label: "Petitions", href: "/petition" },
    ];

  const navigationItems =
    !isLoading && user && !isOnDashboard
      ? [...navLinks, { label: "Dashboard", href: dashboardHref }]
      : navLinks;

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[100] h-16 w-full"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 2px 10px rgba(17, 24, 39, 0.04)",
        transform: "translateZ(0)",
      }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center no-underline">
          <Image
            src="/logo.png"
            alt="NyaySetu logo"
            width={208}
            height={52}
            className="h-[52px] w-[208px] object-contain"
            priority
          />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navigationItems.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline transition-colors hover:text-[#111827]"
                style={{
                  fontSize: "16px",
                  color: isActive ? "#111827" : "#4B5563",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {!isLoading && !user ? (
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center"
              style={{
                border: "1px solid #D1D5DB",
                color: "#111827",
                background: "#FFFFFF",
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "15px",
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              Login
            </Link>
          ) : null}

          {!isLoading && user ? (
            <>
              <span className="hidden md:inline-block" style={{ color: "#4B5563", fontSize: "15px", fontWeight: 500 }}>
                {user.name} · {user.city || "Jalandhar"}
              </span>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="inline-flex items-center justify-center"
                style={{
                  border: "1px solid #D1D5DB",
                  color: "#374151",
                  background: "#FFFFFF",
                  borderRadius: "10px",
                  padding: "9px 14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Location
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden md:inline-flex items-center justify-center"
                style={{
                  background: "#111827",
                  border: "1px solid #111827",
                  color: "#FFFFFF",
                  borderRadius: "10px",
                  padding: "9px 16px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>

      {showProfileModal ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 px-4">
          <form
            onSubmit={handleProfileSave}
            className="w-full max-w-[460px] rounded-[14px] bg-white px-6 py-6"
            style={{ border: "0.5px solid #E8E1D5" }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[20px] font-semibold" style={{ color: "#171717" }}>
                Update Location
              </h2>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="rounded-[8px] px-2 py-1 text-[13px]"
                style={{ background: "#F5F2ED", color: "#666666" }}
              >
                Close
              </button>
            </div>

            <p className="mt-1 text-[14px]" style={{ color: "#666666" }}>
              This city will be used for new grievance routing.
            </p>

            <button
              type="button"
              onClick={handleAutoFetchLocation}
              disabled={detectingLocation || savingProfile}
              className="mt-4 inline-flex w-full items-center justify-center rounded-[10px] px-4 py-2.5 text-[14px] font-semibold"
              style={{ border: "1px solid #D1D5DB", background: "#FFFFFF", color: "#111827" }}
            >
              {detectingLocation ? "Detecting current location..." : "Auto Fetch Current Location"}
            </button>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="profile-city"
                  className="mb-1.5 block text-[13px] font-medium"
                  style={{ color: "#666666" }}
                >
                  City
                </label>
                <select
                  id="profile-city"
                  value={cityInput}
                  onChange={(event) => setCityInput(event.target.value)}
                  className="w-full rounded-[10px] px-4 py-3 text-[15px] focus:outline-none"
                  style={{ border: "0.5px solid #E8E1D5", background: "#F5F2ED", color: "#171717" }}
                >
                  {![
                    "Jalandhar",
                    "Ludhiana",
                    "Amritsar",
                    "Chandigarh",
                  ].includes(cityInput) ? <option value={cityInput}>{cityInput}</option> : null}
                  <option value="Jalandhar">Jalandhar</option>
                  <option value="Ludhiana">Ludhiana</option>
                  <option value="Amritsar">Amritsar</option>
                  <option value="Chandigarh">Chandigarh</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="profile-state"
                  className="mb-1.5 block text-[13px] font-medium"
                  style={{ color: "#666666" }}
                >
                  State
                </label>
                <select
                  id="profile-state"
                  value={stateInput}
                  onChange={(event) => setStateInput(event.target.value)}
                  className="w-full rounded-[10px] px-4 py-3 text-[15px] focus:outline-none"
                  style={{ border: "0.5px solid #E8E1D5", background: "#F5F2ED", color: "#171717" }}
                >
                  {![
                    "Punjab",
                    "Haryana",
                    "Himachal Pradesh",
                    "Chandigarh",
                  ].includes(stateInput) ? <option value={stateInput}>{stateInput}</option> : null}
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Chandigarh">Chandigarh</option>
                </select>
              </div>
            </div>

            {locationNotice ? (
              <p className="mt-3 text-[13px]" style={{ color: "#2563EB" }}>
                {locationNotice}
              </p>
            ) : null}

            {profileError ? (
              <p className="mt-3 text-[13px]" style={{ color: "#B91C1C" }}>
                {profileError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-5 inline-flex w-full items-center justify-center rounded-[10px] px-4 py-3 text-[15px] font-medium text-white"
              style={{ background: "#4A6FA9" }}
            >
              {savingProfile ? "Saving..." : "Save Location"}
            </button>
          </form>
        </div>
      ) : null}
    </nav>
  );
}
