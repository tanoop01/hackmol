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
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navbar />
      <main className="flex min-h-screen pt-14">
        <CitizenSidebar user={user} />

        <section className="flex-1 px-6 py-10 md:px-12" style={{ paddingTop: "36px" }}>
          <div>
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "#6B7280" }}
            >
              Citizen Workspace
            </p>
            <h1
              className="mt-2 text-[46px] font-semibold leading-[1.08]"
              style={{ color: "#111827", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Dashboard
            </h1>
            <p className="mt-3 text-[19px] leading-[1.6]" style={{ color: "#4B5563" }}>
              Track civic activity in {user?.city || "Jalandhar"} and take the next action quickly.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row md:hidden">
              <Link
                href="/petition/new"
                className="inline-flex items-center justify-center rounded-[12px] px-6 py-3.5 text-[16px] no-underline"
                style={{ background: "#111827", color: "#FFFFFF", fontWeight: 600 }}
              >
                Create Petition
              </Link>
              <Link
                href="/grievances/new"
                className="inline-flex items-center justify-center rounded-[12px] px-6 py-3.5 text-[16px] no-underline"
                style={{ border: "1px solid #D1D5DB", background: "#FFFFFF", color: "#374151", fontWeight: 600 }}
              >
                Report an Issue
              </Link>
            </div>
          </div>

          <section className="mt-10 rounded-[20px] bg-white px-6 py-6 md:px-8" style={{ border: "1px solid #E5E7EB" }}>
            <div className="grid grid-cols-2 gap-y-6 md:grid-cols-4 md:gap-4">
              {statsLoading ? (
                <>
                  <div className="h-[74px] animate-pulse rounded-[10px]" style={{ background: "#F3F4F6" }} />
                  <div className="h-[74px] animate-pulse rounded-[10px]" style={{ background: "#F3F4F6" }} />
                  <div className="h-[74px] animate-pulse rounded-[10px]" style={{ background: "#F3F4F6" }} />
                  <div className="h-[74px] animate-pulse rounded-[10px]" style={{ background: "#F3F4F6" }} />
                </>
              ) : (
                <>
                  <div className="md:border-r md:border-[#E5E7EB] md:pr-5">
                    <p className="text-[40px] font-semibold leading-none" style={{ color: "#111827" }}>
                      {stats.issuesReported}
                    </p>
                    <p className="mt-2 text-[14px] font-medium" style={{ color: "#6B7280" }}>
                      Issues reported
                    </p>
                  </div>
                  <div className="md:border-r md:border-[#E5E7EB] md:px-5">
                    <p className="text-[40px] font-semibold leading-none" style={{ color: "#111827" }}>
                      {stats.publicPetitions}
                    </p>
                    <p className="mt-2 text-[14px] font-medium" style={{ color: "#6B7280" }}>
                      Public petitions
                    </p>
                  </div>
                  <div className="md:border-r md:border-[#E5E7EB] md:px-5">
                    <p className="text-[40px] font-semibold leading-none" style={{ color: "#111827" }}>
                      {stats.petitionsSigned}
                    </p>
                    <p className="mt-2 text-[14px] font-medium" style={{ color: "#6B7280" }}>
                      Petitions signed
                    </p>
                  </div>
                  <div className="md:pl-5">
                    <p className="text-[40px] font-semibold leading-none" style={{ color: "#111827" }}>
                      {stats.issuesResolved}
                    </p>
                    <p className="mt-2 text-[14px] font-medium" style={{ color: "#6B7280" }}>
                      Issues resolved
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2
                  className="text-[34px] font-semibold leading-[1.1]"
                  style={{ color: "#111827", fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Public petitions
                </h2>
                <p className="mt-2 text-[17px]" style={{ color: "#6B7280" }}>
                  Sign ongoing civic campaigns from your city.
                </p>
              </div>
              <Link href="/petition" className="text-[16px] no-underline font-semibold" style={{ color: "#111827" }}>
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {petitionsLoading ? (
                <>
                  <div className="h-[100px] animate-pulse rounded-[14px]" style={{ background: "#F3F4F6" }} />
                  <div className="h-[100px] animate-pulse rounded-[14px]" style={{ background: "#F3F4F6" }} />
                  <div className="h-[100px] animate-pulse rounded-[14px]" style={{ background: "#F3F4F6" }} />
                </>
              ) : publicPetitions.length === 0 ? (
                <div
                  className="rounded-[16px] bg-white px-6 py-12 text-center"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <p className="text-[21px] font-semibold" style={{ color: "#111827" }}>
                    No public petitions yet
                  </p>
                  <p className="mt-2 text-[15px]" style={{ color: "#6B7280" }}>
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
                    <div
                      key={petitionId || petition?.title}
                      className="flex flex-col gap-4 rounded-[14px] bg-white px-5 py-5 md:flex-row md:items-center"
                      style={{ border: "1px solid #E5E7EB" }}
                    >
                      <span
                        className="inline-flex w-fit rounded-[999px] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
                        style={{ background: petition?.issueId ? "#EEF2FF" : "#F3F4F6", color: petition?.issueId ? "#374151" : "#6B7280" }}
                      >
                        {petition?.issueId ? "Linked" : "Public"}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[20px] font-semibold" style={{ color: "#111827" }}>
                          {petition?.title || "Untitled petition"}
                        </p>
                        <p className="mt-1 text-[15px]" style={{ color: "#6B7280" }}>
                          {signatureCount} signatures
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleSignPetition(petitionId)}
                          disabled={isSigned || signingId === petitionId}
                          className="rounded-[10px] px-4 py-2.5 text-[14px] font-semibold transition-colors"
                          style={
                            isSigned
                              ? { background: "#ECFDF3", color: "#166534", border: "1px solid #BBF7D0" }
                              : { background: "#111827", color: "#FFFFFF", border: "1px solid #111827" }
                          }
                        >
                          {signingId === petitionId ? "Signing..." : isSigned ? "Signed" : "Sign"}
                        </button>

                        <Link
                          href={`/petition/${petitionId}`}
                          className="inline-flex items-center justify-center rounded-[10px] px-3 py-2 text-[14px] font-semibold no-underline"
                          style={{ border: "1px solid #D1D5DB", color: "#374151", background: "#FFFFFF" }}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
