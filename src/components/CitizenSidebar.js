"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function CitizenSidebar({ user }) {
  const pathname = usePathname();

  const sidebarLinks = [
    { label: "Dashboard", href: "/dashboard/citizen" },
    { label: "My Grievances", href: "/dashboard/citizen/my-issues" },
    { label: "My Petitions", href: "/dashboard/citizen/my-petitions" },
    { label: "AI Assistant", href: "/legal-assistant" },
    { label: "Public Petitions", href: "/petition" },
  ];

  const initials = useMemo(() => {
    const name = String(user?.name || "").trim();
    if (!name) {
      return "U";
    }

    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [user?.name]);

  return (
    <aside
      className="flex h-[calc(100vh-64px)] w-[272px] shrink-0 flex-col justify-between p-7"
      style={{
        borderRight: "0.5px solid #E8E1D5",
        background: "#FCFBF8",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div>
        <Link
          href="/"
          className="no-underline"
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#0D1B2A",
            letterSpacing: "-0.03em",
          }}
        >
          Nyay<span style={{ color: "#F5C842" }}>Setu</span>
        </Link>

        <div
          className="mt-7 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "#F2EEE7", color: "#2F3D53", fontWeight: 600, fontSize: 15 }}
        >
          {initials}
        </div>

        <p
          className="mt-4 text-[22px] font-semibold leading-[1.2]"
          style={{ color: "#0D1B2A", fontFamily: "Fraunces, serif" }}
        >
          {user?.name || "Citizen"}
        </p>

        <span
          className="mt-2 inline-block rounded-[20px] px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em]"
          style={{ background: "#FFF8DC", color: "#4A5568" }}
        >
          {user?.city || "Jalandhar"}
        </span>

        <nav className="mt-12 flex flex-col gap-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[50px] px-5 py-4 text-[16px] no-underline transition-colors"
                style={
                  isActive
                    ? {
                        background: "#FFF8DC",
                        color: "#0D1B2A",
                      fontWeight: 700,
                      }
                    : {
                        color: "#4A5568",
                      fontWeight: 600,
                      }
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3.5">
        <Link
          href="/legal-assistant"
          className="inline-flex w-full items-center justify-center rounded-[50px] px-4 py-4 text-[14px] font-semibold no-underline transition-colors"
          style={{
            border: "1px solid #D9D1C5",
            color: "#4A5568",
            background: "#FFFFFF",
          }}
        >
          Ask Legal AI
        </Link>

        <Link
          href="/petition/new"
          className="inline-flex w-full items-center justify-center rounded-[50px] px-4 py-4 text-[15px] font-semibold no-underline transition-colors"
          style={{ background: "#F5C842", color: "#0D1B2A" }}
        >
          Create Petition
        </Link>

        <Link
          href="/grievances/new"
          className="inline-flex w-full items-center justify-center rounded-[50px] px-4 py-4 text-[14px] font-semibold no-underline transition-colors"
          style={{
            border: "1px solid #D9D1C5",
            color: "#4A5568",
            background: "#FFFFFF",
          }}
        >
          Report an Issue
        </Link>
      </div>
    </aside>
  );
}
