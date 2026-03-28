"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import { useUser } from "@/lib/useUser";

export default function NewPetitionPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [grievanceId, setGrievanceId] = useState("");

  const dashboardHref = user?.role === "authority" ? "/dashboard/authority" : "/dashboard/citizen";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [linkedIssue, setLinkedIssue] = useState(null);
  const [issueLoading, setIssueLoading] = useState(false);
  const [ownerError, setOwnerError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setGrievanceId(params.get("grievanceId") || "");
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!grievanceId) {
      setLinkedIssue(null);
      return;
    }

    let isActive = true;

    async function fetchLinkedIssue() {
      setIssueLoading(true);

      try {
        const response = await fetch(`/api/grievances/${grievanceId}`);
        const json = await response.json().catch(() => ({}));

        if (!isActive) {
          return;
        }

        setLinkedIssue(json?.grievance || json?.data || null);
      } catch (_error) {
        if (!isActive) {
          return;
        }

        setLinkedIssue(null);
      } finally {
        if (!isActive) {
          return;
        }

        setIssueLoading(false);
      }
    }

    fetchLinkedIssue();

    return () => {
      isActive = false;
    };
  }, [grievanceId]);

  const linkedIssueCreatorId = String(
    typeof linkedIssue?.createdBy === "string"
      ? linkedIssue?.createdBy
      : linkedIssue?.createdBy?._id || linkedIssue?.createdBy?.id || ""
  );
  const currentUserId = String(user?._id || user?.id || "");
  const canEscalateThisIssue = !grievanceId || !linkedIssue || (linkedIssueCreatorId && currentUserId === linkedIssueCreatorId);

  useEffect(() => {
    if (!grievanceId) {
      setOwnerError("");
      return;
    }

    if (issueLoading) {
      return;
    }

    if (linkedIssue && !canEscalateThisIssue) {
      setOwnerError("Only the grievance creator can escalate it to a petition.");
      return;
    }

    setOwnerError("");
  }, [grievanceId, linkedIssue, issueLoading, canEscalateThisIssue]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canEscalateThisIssue) {
      setOwnerError("Only the grievance creator can escalate it to a petition.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/petitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          issueId: grievanceId || null,
          type: grievanceId ? "linked" : "independent",
        }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(json?.message || "Unable to create petition");
      }

      const newId =
        json?.petition?._id ||
        json?.petition?.id ||
        json?.id ||
        json?.data?._id ||
        json?.data?.id;

      if (newId) {
        router.push(`/petition/${newId}`);
      } else {
        router.push("/petition");
      }
    } catch (_error) {
      setSubmitting(false);
      return;
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: "#4A6FA9", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navbar />

      <main className="mx-auto max-w-[860px] px-5 pb-12 pt-24">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Link href={dashboardHref} className="text-[14px] no-underline" style={{ color: "#4A6FA9" }}>
            ← Dashboard
          </Link>
          <span className="text-[12px]" style={{ color: "#999999" }}>
            |
          </span>
          <Link href="/petition" className="text-[14px] no-underline" style={{ color: "#4A6FA9" }}>
            All Petitions
          </Link>
        </div>

        <h1 className="text-[42px] font-semibold leading-[1.15]" style={{ color: "#171717" }}>
          Start a Petition
        </h1>
        <p className="mt-2 text-[18px]" style={{ color: "#666666" }}>
          Write clearly, add context, and gather civic support faster.
        </p>

        {grievanceId ? (
          <div className="mt-5 rounded-[16px] bg-white px-7 py-5" style={{ border: "0.5px solid #E8E1D5" }}>
            <p className="text-[12px] uppercase tracking-[0.08em]" style={{ color: "#999999" }}>
              Linked Issue
            </p>
            {issueLoading ? (
              <div className="mt-2 h-[42px] animate-pulse rounded-[10px] bg-gray-100" />
            ) : (
              <div
                className="mt-2 rounded-[12px] bg-[#FAFAF8] px-4 py-3"
                style={{ border: "0.5px solid #E8E1D5" }}
              >
                <p className="text-[16px]" style={{ color: "#666666" }}>
                  {linkedIssue?.title || "Linked grievance"}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {ownerError ? (
          <div className="mt-4 rounded-[10px] px-3 py-2" style={{ background: "#FEE2E2", border: "0.5px solid #FCA5A5", color: "#B91C1C" }}>
            <p className="text-[13px]">{ownerError}</p>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-[18px] bg-white px-10 py-10"
          style={{ border: "0.5px solid #E8E1D5" }}
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="petition-title"
                className="mb-2 block text-[14px] font-medium"
                style={{ color: "#666666" }}
              >
                Title
              </label>
              <input
                id="petition-title"
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-[12px] border px-4 py-3.5 text-[16px] focus:outline-none"
                style={{ border: "0.5px solid #E8E1D5", background: "#F5F2ED", color: "#171717" }}
              />
            </div>

            <div>
              <label
                htmlFor="petition-description"
                className="mb-2 block text-[14px] font-medium"
                style={{ color: "#666666" }}
              >
                Description
              </label>
              <textarea
                id="petition-description"
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full resize-none rounded-[12px] border px-4 py-3.5 text-[16px] leading-[1.65] focus:outline-none"
                style={{
                  border: "0.5px solid #E8E1D5",
                  background: "#F5F2ED",
                  color: "#171717",
                  minHeight: "220px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !canEscalateThisIssue}
              className="inline-flex w-full items-center justify-center rounded-[12px] px-4 py-4 text-[18px] font-medium text-white"
              style={canEscalateThisIssue ? { background: "#4A6FA9" } : { background: "#999999" }}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Create Petition"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
