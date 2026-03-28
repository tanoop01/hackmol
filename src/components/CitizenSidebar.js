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
      className="hidden h-[calc(100vh-56px)] w-[236px] flex-col justify-between bg-white p-5 md:flex"
      style={{ borderRight: "0.5px solid #E8E1D5", background: "#FCFBF8" }}
    >
      <div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: "#F2EEE7", color: "#2F3D53", fontWeight: 600, fontSize: "15px" }}
        >
          {initials}
        </div>
        <p
          className="mt-3 text-[19px] font-semibold leading-[1.2]"
          style={{ color: "#171717", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {user?.name || "Citizen"}
        </p>
        <span
          className="mt-2 inline-block rounded-[20px] px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em]"
          style={{ background: "#F2EEE7", color: "#556070" }}
        >
          {user?.city || "Jalandhar"}
        </span>

        <nav className="mt-8 flex flex-col gap-1.5">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[12px] px-4 py-2.5 text-[15px] no-underline transition-colors"
                style={
                  isActive
                    ? {
                      background: "#F2EEE7",
                      color: "#1F2937",
                      fontWeight: 600,
                      fontFamily: "Georgia, 'Times New Roman', serif",
                    }
                    : {
                      color: "#5F636A",
                      fontWeight: 500,
                    }
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2.5">
        <Link
          href="/petition/new"
          className="inline-flex w-full items-center justify-center rounded-[12px] px-4 py-3 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-[#111827]"
          style={{ background: "#1F2937", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Create Petition
        </Link>
        <Link
          href="/grievances/new"
          className="inline-flex w-full items-center justify-center rounded-[12px] px-4 py-3 text-[14px] font-semibold no-underline transition-colors"
          style={{
            border: "1px solid #D9D1C5",
            color: "#4B5563",
            background: "#FFFFFF",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Report an Issue
        </Link>
      </div>
    </aside>
  );
}
