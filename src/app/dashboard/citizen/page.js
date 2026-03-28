"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CitizenSidebar from "@/components/CitizenSidebar";
import Navbar from "@/components/Navbar";
import { useUser } from "@/lib/useUser";

export default function CitizenDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [statsLoading, setStatsLoading] = useState(true);
  const [petitionsLoading, setPetitionsLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [publicPetitions, setPublicPetitions] = useState([]);
  const [signedPetitionIds, setSignedPetitionIds] = useState([]);
  const [signingId, setSigningId] = useState("");

  const stats = useMemo(() => {
    const issuesReported = issues.length;
    const issuesResolved = issues.filter((item) => item?.status === "resolved").length;
    const petitionsSigned = signedPetitionIds.length;

    return {
      issuesReported,
      petitionsSigned,
      issuesResolved,
      publicPetitions: publicPetitions.length,
    };
  }, [issues, signedPetitionIds, publicPetitions]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "citizen")) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user || user.role !== "citizen") {
      return;
    }

    let isActive = true;

    async function loadCitizenData() {
      setStatsLoading(true);
      setPetitionsLoading(true);

      try {
        const [grievancesRes, signedRes, publicRes] = await Promise.all([
          fetch("/api/grievances"),
          fetch("/api/petitions?signedBy=me&limit=100"),
          fetch("/api/petitions?limit=12"),
        ]);

        const grievancesJson = await grievancesRes.json().catch(() => ({}));
        const signedJson = await signedRes.json().catch(() => ({}));
        const publicJson = await publicRes.json().catch(() => ({}));

        if (!isActive) {
          return;
        }

        const grievancesList = Array.isArray(grievancesJson?.grievances)
          ? grievancesJson.grievances
          : Array.isArray(grievancesJson?.data)
            ? grievancesJson.data
            : [];

        const signedList = Array.isArray(signedJson?.petitions)
          ? signedJson.petitions
          : Array.isArray(signedJson?.data)
            ? signedJson.data
            : [];

        const publicList = Array.isArray(publicJson?.petitions)
          ? publicJson.petitions
          : Array.isArray(publicJson?.data)
            ? publicJson.data
            : [];

        const signedIds = signedList
          .map((item) => String(item?._id || item?.id || ""))
          .filter(Boolean);

        setIssues(grievancesList);
        setPublicPetitions(publicList);
        setSignedPetitionIds(signedIds);
      } catch (_error) {
        if (!isActive) {
          return;
        }

        setIssues([]);
        setPublicPetitions([]);
        setSignedPetitionIds([]);
      } finally {
        if (!isActive) {
          return;
        }

        setStatsLoading(false);
        setPetitionsLoading(false);
      }
    }

    loadCitizenData();

    return () => {
      isActive = false;
    };
  }, [user]);

  async function handleSignPetition(petitionId) {
    const id = String(petitionId || "");
    if (!id || signingId || signedPetitionIds.includes(id)) {
      return;
    }

    setSigningId(id);

    try {
      const response = await fetch(`/api/petitions/${id}/sign`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to sign petition");
      }

      setSignedPetitionIds((previous) => Array.from(new Set([...previous, id])));
      setPublicPetitions((previous) =>
        previous.map((petition) => {
          const petitionIdValue = String(petition?._id || petition?.id || "");
          if (petitionIdValue !== id) {
            return petition;
          }

          const signatures = Array.isArray(petition?.signatures) ? [...petition.signatures] : [];
          signatures.push("signed");

          return {
            ...petition,
            signatures,
          };
        })
      );
    } catch (_error) {
      return;
    } finally {
      setSigningId("");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4A6FA9] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "citizen") {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", fontFamily: "DM Sans, sans-serif" }}>
      <Navbar />

      <main className="mx-auto flex min-h-screen w-full max-w-[1380px] pt-16">
        <CitizenSidebar user={user} />

        <section className="min-w-0 flex-1 px-6 py-12 md:px-9 lg:px-12">
          <div className="mx-auto w-full max-w-[980px] space-y-14">
            <section
              className="rounded-[24px] bg-white px-7 py-9 md:px-9"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#4A5568" }}
              >
                Citizen Workspace
              </p>

              <h1
                className="mt-4 text-[38px] leading-[1.02] md:text-[46px]"
                style={{ color: "#0D1B2A", fontFamily: "Fraunces, serif", fontWeight: 700 }}
              >
                Dashboard
              </h1>

              <p className="mt-5 max-w-[700px] text-[17px] leading-[1.8]" style={{ color: "#4A5568" }}>
                Track civic activity in {user?.city || "Jalandhar"}, review petition momentum, and
                take your next action quickly.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row md:hidden">
                <Link
                  href="/legal-assistant"
                  className="inline-flex items-center justify-center rounded-[50px] px-6 py-3.5 text-[15px] font-semibold no-underline"
                  style={{ border: "1px solid #D1D5DB", background: "#FFFFFF", color: "#4A5568" }}
                >
                  Ask Legal AI
                </Link>
                <Link
                  href="/petition/new"
                  className="inline-flex items-center justify-center rounded-[50px] px-6 py-3.5 text-[15px] font-semibold no-underline"
                  style={{ background: "#F5C842", color: "#0D1B2A" }}
                >
                  Create Petition
                </Link>
                <Link
                  href="/grievances/new"
                  className="inline-flex items-center justify-center rounded-[50px] px-6 py-3.5 text-[15px] font-semibold no-underline"
                  style={{ border: "1px solid #D1D5DB", background: "#FFFFFF", color: "#4A5568" }}
                >
                  Report an Issue
                </Link>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {statsLoading ? (
                <>
                  <div className="h-[130px] animate-pulse rounded-[20px]" style={{ background: "#F3F4F6" }} />
                  <div className="h-[130px] animate-pulse rounded-[20px]" style={{ background: "#F3F4F6" }} />
                  <div className="h-[130px] animate-pulse rounded-[20px]" style={{ background: "#F3F4F6" }} />
                  <div className="h-[130px] animate-pulse rounded-[20px]" style={{ background: "#F3F4F6" }} />
                </>
              ) : (
                <>
                  <div className="rounded-[20px] bg-white px-5 py-7" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <p style={{ color: "#4A5568", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Issues Reported
                    </p>
                    <p className="mt-4 text-[36px] leading-none" style={{ color: "#0D1B2A", fontFamily: "Fraunces, serif", fontWeight: 800 }}>
                      {stats.issuesReported}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-white px-5 py-7" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <p style={{ color: "#4A5568", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Public Petitions
                    </p>
                    <p className="mt-4 text-[36px] leading-none" style={{ color: "#0D1B2A", fontFamily: "Fraunces, serif", fontWeight: 800 }}>
                      {stats.publicPetitions}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-white px-5 py-7" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <p style={{ color: "#4A5568", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Petitions Signed
                    </p>
                    <p className="mt-4 text-[36px] leading-none" style={{ color: "#0D1B2A", fontFamily: "Fraunces, serif", fontWeight: 800 }}>
                      {stats.petitionsSigned}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-white px-5 py-7" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <p style={{ color: "#4A5568", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Issues Resolved
                    </p>
                    <p className="mt-4 text-[36px] leading-none" style={{ color: "#0D1B2A", fontFamily: "Fraunces, serif", fontWeight: 800 }}>
                      {stats.issuesResolved}
                    </p>
                  </div>
                </>
              )}
            </section>

            <section className="space-y-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2
                    className="text-[32px] leading-[1.06]"
                    style={{ color: "#0D1B2A", fontFamily: "Fraunces, serif", fontWeight: 700 }}
                  >
                    Public petitions
                  </h2>
                  <p className="mt-3 text-[16px]" style={{ color: "#4A5568" }}>
                    Sign ongoing civic campaigns from your city.
                  </p>
                </div>

                <Link
                  href="/petition"
                  className="inline-flex items-center justify-center rounded-[50px] px-4 py-2 text-[14px] font-semibold no-underline"
                  style={{ border: "1px solid #D1D5DB", color: "#4A5568", background: "#FFFFFF" }}
                >
                  View all
                </Link>
              </div>

              <div className="space-y-5">
                {petitionsLoading ? (
                  <>
                    <div className="h-[110px] animate-pulse rounded-[20px]" style={{ background: "#F3F4F6" }} />
                    <div className="h-[110px] animate-pulse rounded-[20px]" style={{ background: "#F3F4F6" }} />
                    <div className="h-[110px] animate-pulse rounded-[20px]" style={{ background: "#F3F4F6" }} />
                  </>
                ) : publicPetitions.length === 0 ? (
                  <div
                    className="rounded-[20px] bg-white px-6 py-12 text-center"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                  >
                    <p className="text-[21px] font-semibold" style={{ color: "#0D1B2A" }}>
                      No public petitions yet
                    </p>
                    <p className="mt-2 text-[15px]" style={{ color: "#4A5568" }}>
                      Community petitions will appear here.
                    </p>
                  </div>
                ) : (
                  publicPetitions.map((petition) => {
                    const petitionId = String(petition?._id || petition?.id || "");
                    const isSigned = signedPetitionIds.includes(petitionId);
                    const signatureCount = Array.isArray(petition?.signatures)
                      ? petition.signatures.length
                      : Number(petition?.signatureCount || 0);

                    return (
                      <article
                        key={petitionId || petition?.title}
                        className="flex flex-col gap-5 rounded-[20px] bg-white px-6 py-6 md:flex-row md:items-center md:gap-6"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                      >
                        <span
                          className="inline-flex w-fit rounded-[999px] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
                          style={{
                            background: petition?.issueId ? "#FFF8DC" : "#F3F4F6",
                            color: petition?.issueId ? "#0D1B2A" : "#4A5568",
                          }}
                        >
                          {petition?.issueId ? "Linked" : "Public"}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[19px] font-semibold" style={{ color: "#0D1B2A" }}>
                            {petition?.title || "Untitled petition"}
                          </p>
                          <p className="mt-2 text-[14px]" style={{ color: "#4A5568" }}>
                            {signatureCount} signatures
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleSignPetition(petitionId)}
                            disabled={isSigned || signingId === petitionId}
                            className="rounded-[50px] px-4 py-2.5 text-[14px] font-semibold transition-colors"
                            style={
                              isSigned
                                ? { background: "#ECFDF3", color: "#166534", border: "1px solid #BBF7D0" }
                                : {
                                    background: "#F5C842",
                                    color: "#0D1B2A",
                                    border: "1px solid #F5C842",
                                  }
                            }
                          >
                            {signingId === petitionId ? "Signing..." : isSigned ? "Signed" : "Sign"}
                          </button>

                          <Link
                            href={`/petition/${petitionId}`}
                            className="inline-flex items-center justify-center rounded-[50px] px-4 py-2.5 text-[14px] font-semibold no-underline"
                            style={{ border: "1px solid #D1D5DB", color: "#4A5568", background: "#FFFFFF" }}
                          >
                            View
                          </Link>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
