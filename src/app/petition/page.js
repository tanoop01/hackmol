"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/Navbar";
import { useUser } from "@/lib/useUser";

export default function PetitionsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [petitions, setPetitions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const dashboardHref = user?.role === "authority" ? "/dashboard/authority" : "/dashboard/citizen";

  useEffect(() => {
    let isActive = true;

    async function fetchPetitions() {
      setLoading(true);

      try {
        const params = new URLSearchParams();
        params.set("limit", "100");
        const normalized = search.trim();
        if (normalized) {
          params.set("q", normalized);
        }

        const response = await fetch(`/api/petitions?${params.toString()}`);
        const json = await response.json().catch(() => ({}));

        if (!isActive) {
          return;
        }

        const list = Array.isArray(json?.petitions)
          ? json.petitions
          : Array.isArray(json?.data)
            ? json.data
            : [];

        setPetitions(list);
      } catch (_error) {
        if (!isActive) {
          return;
        }

        setPetitions([]);
      } finally {
        if (!isActive) {
          return;
        }

        setLoading(false);
      }
    }

    fetchPetitions();

    return () => {
      isActive = false;
    };
  }, [search]);

  const visiblePetitions = useMemo(() => {
    if (filter === "linked") {
      return petitions.filter((petition) => Boolean(petition?.issueId));
    }

    if (filter === "independent") {
      return petitions.filter((petition) => !petition?.issueId);
    }

    return petitions;
  }, [petitions, filter]);

  function signatureCount(petition) {
    if (Array.isArray(petition?.signerEntries)) {
      return petition.signerEntries.length;
    }

    if (Number.isFinite(Number(petition?.signatureCount))) {
      return Number(petition.signatureCount);
    }

    return Array.isArray(petition?.signatures) ? petition.signatures.length : 0;
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-6 pb-10 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[32px] font-semibold" style={{ color: "#171717" }}>
            Public Petitions
          </h1>
          {user ? (
            <Link
              href={dashboardHref}
              className="inline-flex items-center justify-center rounded-[10px] px-4 py-2.5 text-[15px] font-medium no-underline transition-colors hover:bg-[#ECF0FF]"
              style={{ border: "1.5px solid #4A6FA9", color: "#4A6FA9", background: "transparent" }}
            >
              Back to Dashboard
            </Link>
          ) : null}
        </div>
        <p className="mt-1 text-[16px]" style={{ color: "#666666" }}>
          Browse, sign, and track civic petitions.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search petitions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-[260px] flex-1 rounded-[10px] px-4 py-3 text-[15px] focus:outline-none"
            style={{ border: "0.5px solid #E8E1D5", background: "#F5F2ED" }}
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-[200px] rounded-[10px] px-4 py-3 text-[15px] focus:outline-none"
            style={{ border: "0.5px solid #E8E1D5", background: "#F5F2ED" }}
          >
            <option value="all">All Petitions</option>
            <option value="linked">Linked to Grievance</option>
            <option value="independent">Independent</option>
          </select>

          <Link
            href="/petition/new"
            className="inline-flex items-center justify-center rounded-[10px] px-6 py-3 text-[15px] font-medium text-white no-underline transition-colors hover:bg-[#5B79B3]"
            style={{ background: "#4A6FA9" }}
          >
            Start Petition
          </Link>
        </div>

        <section
          className="mt-6 grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[220px] animate-pulse rounded-[14px]" style={{ background: "#F5F2ED" }} />
            ))
          ) : visiblePetitions.length === 0 ? (
            <div
              className="col-span-full rounded-[14px] bg-white px-6 py-10 text-center"
              style={{ border: "0.5px solid #E8E1D5" }}
            >
              <p className="text-[18px] font-semibold" style={{ color: "#171717" }}>
                No petitions found
              </p>
              <p className="mt-1 text-[14px]" style={{ color: "#666666" }}>
                Try a different keyword or start a new petition.
              </p>
            </div>
          ) : (
            visiblePetitions.map((petition) => {
              const id = petition?._id || petition?.id || "";
              const linkedIssueTitle =
                (typeof petition?.issueId === "object" ? petition?.issueId?.title : "") || "";

              return (
                <article
                  key={id || petition?.title}
                  className="rounded-[14px] bg-white px-6 py-6"
                  style={{ border: "0.5px solid #E8E1D5" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-[20px] px-3 py-1.5 text-[11px]"
                      style={{
                        background: linkedIssueTitle ? "#ECF0FF" : "#F5F2ED",
                        color: linkedIssueTitle ? "#4A6FA9" : "#666666",
                      }}
                    >
                      {linkedIssueTitle ? "Linked" : "Independent"}
                    </span>
                    <span className="text-[13px]" style={{ color: "#999999" }}>
                      {new Date(petition?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="mt-3 text-[20px] font-semibold" style={{ color: "#171717" }}>
                    {petition?.title || "Untitled petition"}
                  </h2>

                  <p className="mt-2 text-[15px] leading-[1.6]" style={{ color: "#666666" }}>
                    {String(petition?.description || "No description available.").slice(0, 140)}
                    {String(petition?.description || "").length > 140 ? "..." : ""}
                  </p>

                  {linkedIssueTitle ? (
                    <p className="mt-2 text-[13px]" style={{ color: "#666666" }}>
                      Linked issue: {linkedIssueTitle}
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[14px] font-medium" style={{ color: "#4A6FA9" }}>
                      {signatureCount(petition)} signatures
                    </span>
                    <Link
                      href={`/petition/${id}`}
                      className="text-[14px] no-underline"
                      style={{ color: "#4A6FA9" }}
                    >
                      View →
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
