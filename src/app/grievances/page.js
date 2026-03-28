"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/Navbar";
import { useUser } from "@/lib/useUser";

const CATEGORY_OPTIONS = [
  "All",
  "Water",
  "Roads",
  "Electricity",
  "Sanitation",
  "Parks",
  "Other",
];

export default function GrievancesFeedPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user) {
      return;
    }

    let isActive = true;

    async function fetchIssues() {
      setLoading(true);

      try {
        const response = await fetch("/api/grievances");
        const json = await response.json().catch(() => ({}));

        if (!isActive) {
          return;
        }

        const list = Array.isArray(json?.grievances)
          ? json.grievances
          : Array.isArray(json?.data)
            ? json.data
            : [];

        setIssues(list);
      } catch (_error) {
        if (!isActive) {
          return;
        }

        setIssues([]);
      } finally {
        if (!isActive) {
          return;
        }

        setLoading(false);
      }
    }

    fetchIssues();

    return () => {
      isActive = false;
    };
  }, [user, userLoading, router]);

  const stats = useMemo(() => {
    return {
      totalCount: issues.length,
      resolvedCount: issues.filter((issue) => issue?.status === "resolved").length,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    let list = [...issues];

    if (category !== "All") {
      list = list.filter((issue) =>
        String(issue?.category || "")
          .toLowerCase()
          .includes(category.toLowerCase())
      );
    }

    if (normalizedSearch) {
      list = list.filter((issue) => {
        const title = String(issue?.title || "").toLowerCase();
        const description = String(issue?.description || "").toLowerCase();
        const location = String(issue?.location || issue?.city || "").toLowerCase();
        return (
          title.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          location.includes(normalizedSearch)
        );
      });
    }

    if (sortBy === "Newest") {
      list.sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
    } else {
      list.sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());
    }

    return list;
  }, [issues, search, category, sortBy]);

  function statusBadgeStyle(status) {
    if (status === "resolved") {
      return { background: "#DCFCE7", color: "#16A34A" };
    }

    if (status === "in_progress") {
      return { background: "#ECF0FF", color: "#4A6FA9" };
    }

    return { background: "#FEF3C7", color: "#B45309" };
  }

  function getRelativeTime(inputDate) {
    const date = new Date(inputDate || Date.now());
    const diffMs = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < hour) {
      const mins = Math.max(1, Math.floor(diffMs / minute));
      return `${mins}m ago`;
    }

    if (diffMs < day) {
      const hours = Math.max(1, Math.floor(diffMs / hour));
      return `${hours}h ago`;
    }

    const days = Math.max(1, Math.floor(diffMs / day));
    return `${days}d ago`;
  }

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: "#4A6FA9", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pageTitle = user?.role === "authority" ? "Assigned Grievances" : "My Grievances";
  const pageSubtitle =
    user?.role === "authority"
      ? `${stats.totalCount} grievances assigned to your department`
      : `${stats.totalCount} grievances reported · ${stats.resolvedCount} resolved`;
  const dashboardHref = user?.role === "authority" ? "/dashboard/authority" : "/dashboard/citizen";

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navbar />

      <main className="px-10 pb-12 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[40px] font-semibold leading-[1.15]" style={{ color: "#171717" }}>{pageTitle}</h1>
          <Link
            href={dashboardHref}
            className="inline-flex items-center justify-center rounded-[10px] px-5 py-3 text-[16px] font-medium no-underline transition-colors hover:bg-[#ECF0FF]"
            style={{ border: "1.5px solid #4A6FA9", color: "#4A6FA9", background: "transparent" }}
          >
            Back to Dashboard
          </Link>
        </div>
        <p className="mt-2 text-[18px]" style={{ color: "#666666" }}>
          {pageSubtitle}
        </p>

        <div className="mt-6 rounded-[16px] bg-white p-4" style={{ border: "0.5px solid #E8E1D5" }}>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-[220px] flex-1 rounded-[12px] px-4 py-3.5 text-[16px] focus:outline-none"
              style={{ border: "0.5px solid #E8E1D5", background: "#F5F2ED" }}
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-[210px] rounded-[12px] px-4 py-3.5 text-[16px] focus:outline-none"
              style={{ border: "0.5px solid #E8E1D5", background: "#F5F2ED" }}
            >
              <option value="All">All Categories</option>
              <option value="Water">Water</option>
              <option value="Roads">Roads</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Parks">Parks</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-[190px] rounded-[12px] px-4 py-3.5 text-[16px] focus:outline-none"
              style={{ border: "0.5px solid #E8E1D5", background: "#F5F2ED" }}
            >
              <option>Newest</option>
              <option>Oldest</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((item) => {
              const isActive = category.toLowerCase() === item.toLowerCase();

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className="rounded-[20px] px-4 py-2.5 text-[15px] font-medium"
                  style={
                    isActive
                      ? { background: "#4A6FA9", color: "#FFFFFF" }
                      : {
                          background: "#FFFFFF",
                          color: "#666666",
                          border: "0.5px solid #E8E1D5",
                        }
                  }
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <section
          className="mt-7 grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))" }}
        >
          {loading ? (
            Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="h-[280px] animate-pulse rounded-[18px]" style={{ background: "#F5F2ED" }} />
            ))
          ) : filteredIssues.length === 0 ? (
            <div
              className="col-span-full rounded-[18px] bg-white px-6 py-14 text-center"
              style={{ border: "0.5px solid #E8E1D5" }}
            >
              <p className="text-[22px] font-semibold" style={{ color: "#171717" }}>
                No issues match your filters
              </p>
              <p className="mt-2 text-[16px]" style={{ color: "#666666" }}>
                Try changing category, search term, or sort order.
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <article
                key={issue?._id || issue?.id || issue?.title}
                onClick={() => router.push(`/grievances/${issue?._id || issue?.id || ""}`)}
                className="rounded-[18px] bg-white px-7 py-7 transition-colors"
                style={{ border: "0.5px solid #E8E1D5", cursor: "pointer" }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor = "#4A6FA9";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = "#E8E1D5";
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-[20px] px-3 py-1.5 text-[11px] font-medium uppercase"
                    style={{ background: "#ECF0FF", color: "#4A6FA9" }}
                  >
                    {issue?.category || "GENERAL"}
                  </span>
                  <span
                    className="rounded-[20px] px-3 py-1.5 text-[11px] font-medium"
                    style={statusBadgeStyle(issue?.status)}
                  >
                    {String(issue?.status || "reported").replace("_", " ")}
                  </span>
                </div>

                <h2
                  className="mt-3 overflow-hidden text-[24px] font-semibold leading-[1.35]"
                  style={{ color: "#171717", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                >
                  {issue?.title || "Untitled issue"}
                </h2>

                <p
                  className="mt-3 overflow-hidden text-[16px] leading-[1.7]"
                  style={{
                    color: "#666666",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {issue?.description || "No description available."}
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-[13px]" style={{ color: "#999999" }}>
                  <MapPin size={12} />
                  <span>{issue?.location || issue?.city || "Jalandhar"}</span>
                </div>

                <div
                  className="mt-3 flex items-center justify-between border-t pt-3"
                  style={{ borderTop: "0.5px solid #E8E1D5" }}
                >
                  <span className="text-[12px] font-mono" style={{ color: "#999999" }}>
                    {getRelativeTime(issue?.createdAt)}
                  </span>

                  <Link
                    href={`/grievances/${issue?._id || issue?.id || ""}`}
                    className="text-[16px] no-underline font-medium"
                    style={{ color: "#4A6FA9" }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    View →
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <Link
        href="/grievances/new"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center rounded-[12px] px-7 py-4 text-[17px] font-medium text-white no-underline transition-colors hover:bg-[#5B79B3]"
        style={{ background: "#4A6FA9", boxShadow: "none" }}
      >
        Report Issue
      </Link>
    </div>
  );
}
