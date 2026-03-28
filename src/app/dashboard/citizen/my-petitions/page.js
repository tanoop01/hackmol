"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CitizenSidebar from "@/components/CitizenSidebar";
import Navbar from "@/components/Navbar";
import { useUser } from "@/lib/useUser";

export default function MyPetitionsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [activeFilter, setActiveFilter] = useState("created");
  const [petitionsLoading, setPetitionsLoading] = useState(true);
  const [petitions, setPetitions] = useState([]);
  const [signingId, setSigningId] = useState("");
  const [manageLoadingId, setManageLoadingId] = useState("");
  const [manageError, setManageError] = useState("");

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

    async function fetchPetitions() {
      setPetitionsLoading(true);

      try {
        const endpoint =
          activeFilter === "created"
            ? "/api/petitions?createdBy=me"
            : "/api/petitions?signedBy=me";

        const response = await fetch(endpoint);
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

        setPetitionsLoading(false);
      }
    }

    fetchPetitions();

    return () => {
      isActive = false;
    };
  }, [activeFilter, user]);

  const normalizedPetitions = useMemo(() => {
    const userId = String(user?._id || user?.id || "");

    return petitions.map((petition) => {
      const signatures = Array.isArray(petition?.signatures) ? petition.signatures : [];
      const signerEntries = Array.isArray(petition?.signerEntries) ? petition.signerEntries : [];
      const signatureCount = Number.isFinite(Number(petition?.signatureCount))
        ? Number(petition.signatureCount)
        : signerEntries.length > 0
          ? signerEntries.length
          : signatures.length;

      const isSigned = signatures.some((signer) => {
        const signerId = typeof signer === "string" ? signer : signer?._id || signer?.id;
        return String(signerId || "") === userId;
      }) || signerEntries.some((entry) => String(entry?.user || "") === userId);

      const progress = Math.max(0, Math.min(100, Math.round((signatureCount / 100) * 100)));

      return {
        ...petition,
        signatureCount,
        isSigned: petition?.isSigned === true || isSigned,
        progress,
        linkedIssueTitle:
          petition?.issueTitle || petition?.grievanceTitle || petition?.issueId?.title || null,
      };
    });
  }, [petitions, user?._id, user?.id]);

  async function handleSign(petitionId) {
    if (!user) {
      router.push("/login");
      return;
    }

    const id = String(petitionId || "");
    if (!id) {
      return;
    }

    setSigningId(id);

    try {
      const response = await fetch(`/api/petitions/${id}/sign`, {
        method: "POST",
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.message || "Unable to sign petition");
      }

      const userId = String(user?._id || user?.id || "");

      setPetitions((previous) =>
        previous.map((item) => {
          const itemId = String(item?._id || item?.id || "");
          if (itemId !== id) {
            return item;
          }

          const signatures = Array.isArray(item?.signatures) ? [...item.signatures] : [];
          if (userId && !signatures.some((signer) => String(signer) === userId)) {
            signatures.push(userId);
          }

          const nextSignatureCount = Number.isFinite(Number(item?.signatureCount))
            ? Number(item.signatureCount) + 1
            : signatures.length;

          return {
            ...item,
            signatures,
            signatureCount: nextSignatureCount,
            isSigned: true,
          };
        })
      );
    } catch (_error) {
      return;
    } finally {
      setSigningId("");
    }
  }

  async function handleDeclareVictory(petitionId) {
    const id = String(petitionId || "");
    if (!id || manageLoadingId) {
      return;
    }

    setManageLoadingId(id);
    setManageError("");

    try {
      const response = await fetch(`/api/petitions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "declare_victory" }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.message || "Unable to declare victory");
      }

      setPetitions((previous) =>
        previous.map((item) => {
          const itemId = String(item?._id || item?.id || "");
          if (itemId !== id) {
            return item;
          }

          return {
            ...item,
            status: "victory_declared",
            victoryDeclaredAt: new Date().toISOString(),
          };
        })
      );
    } catch (error) {
      setManageError(error.message || "Unable to declare victory");
    } finally {
      setManageLoadingId("");
    }
  }

  async function handleDeletePetition(petitionId) {
    const id = String(petitionId || "");
    if (!id || manageLoadingId) {
      return;
    }

    const shouldDelete = window.confirm("Delete this petition permanently?");
    if (!shouldDelete) {
      return;
    }

    setManageLoadingId(id);
    setManageError("");

    try {
      const response = await fetch(`/api/petitions/${id}`, {
        method: "DELETE",
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.message || "Unable to delete petition");
      }

      setPetitions((previous) =>
        previous.filter((item) => String(item?._id || item?.id || "") !== id)
      );
    } catch (error) {
      setManageError(error.message || "Unable to delete petition");
    } finally {
      setManageLoadingId("");
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
          <h1 className="text-[36px] font-semibold" style={{ color: "#171717" }}>
            My Petitions
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveFilter("created")}
              className="rounded-[20px] px-5 py-2.5 text-[15px] font-medium"
              style={
                activeFilter === "created"
                  ? { background: "#4A6FA9", color: "#FFFFFF" }
                  : { background: "#F5F2ED", color: "#666666" }
              }
            >
              Created by me
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("signed")}
              className="rounded-[20px] px-5 py-2.5 text-[15px] font-medium"
              style={
                activeFilter === "signed"
                  ? { background: "#4A6FA9", color: "#FFFFFF" }
                  : { background: "#F5F2ED", color: "#666666" }
              }
            >
              Signed by me
            </button>
          </div>

          <div className="mt-7 space-y-4">
            {petitionsLoading ? (
              <>
                <div className="h-[220px] animate-pulse rounded-[18px]" style={{ background: "#F5F2ED" }} />
                <div className="h-[220px] animate-pulse rounded-[18px]" style={{ background: "#F5F2ED" }} />
              </>
            ) : normalizedPetitions.length === 0 ? (
              <div
                className="rounded-[18px] bg-white px-6 py-12 text-center"
                style={{ border: "0.5px solid #E8E1D5" }}
              >
                <p className="text-[20px] font-semibold" style={{ color: "#171717" }}>
                  No petitions found
                </p>
                <p className="mt-2 text-[15px]" style={{ color: "#666666" }}>
                  Petitions you create or sign will appear here.
                </p>
              </div>
            ) : (
              normalizedPetitions.map((petition) => (
                <article
                  key={petition?._id || petition?.id || petition?.title}
                  className="rounded-[18px] bg-white px-6 py-6"
                  style={{ border: "0.5px solid #E8E1D5" }}
                >
                  <h2 className="text-[22px] font-semibold leading-[1.3]" style={{ color: "#171717" }}>
                    {petition?.title || "Untitled petition"}
                  </h2>

                  {activeFilter === "created" ? (
                    <span
                      className="mt-3 inline-block rounded-[20px] px-3 py-1.5 text-[12px] font-medium uppercase"
                      style={
                        petition?.status === "victory_declared"
                          ? { background: "#DCFCE7", color: "#16A34A" }
                          : { background: "#FEF3C7", color: "#B45309" }
                      }
                    >
                      {petition?.status === "victory_declared" ? "Victory Declared" : "Active"}
                    </span>
                  ) : null}

                  {petition?.linkedIssueTitle ? (
                    <span
                      className="mt-3 inline-block rounded-[20px] px-3 py-1.5 text-[12px] font-medium"
                      style={{ background: "#ECF0FF", color: "#4A6FA9" }}
                    >
                      {petition.linkedIssueTitle}
                    </span>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[15px]" style={{ color: "#666666" }}>
                      {petition.signatureCount} signatures
                    </p>
                    {petition.isSigned ? (
                      <span className="text-[14px] font-medium" style={{ color: "#2E7D32" }}>
                        Signed ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSign(petition?._id || petition?.id)}
                        disabled={
                          signingId === String(petition?._id || petition?.id || "") ||
                          petition?.status === "victory_declared"
                        }
                        className="rounded-[10px] px-4 py-2 text-[14px] font-medium"
                        style={
                          petition?.status === "victory_declared"
                            ? { border: "1.5px solid #E8E1D5", color: "#999999", background: "#F5F2ED" }
                            : { border: "1.5px solid #4A6FA9", color: "#4A6FA9", background: "transparent" }
                        }
                      >
                        {petition?.status === "victory_declared"
                          ? "Closed"
                          : signingId === String(petition?._id || petition?.id || "")
                            ? "Signing..."
                            : "Sign"}
                      </button>
                    )}
                  </div>

                  {activeFilter === "created" ? (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {petition?.status !== "victory_declared" ? (
                        <button
                          type="button"
                          onClick={() => handleDeclareVictory(petition?._id || petition?.id)}
                          disabled={manageLoadingId === String(petition?._id || petition?.id || "")}
                          className="rounded-[12px] px-5 py-3 text-[15px] font-semibold tracking-[0.01em] text-white transition-all duration-150 hover:translate-y-[-1px]"
                          style={{
                            background: "#1F2937",
                            border: "1px solid #1F2937",
                            boxShadow: "0 8px 18px rgba(31, 41, 55, 0.2)",
                            fontFamily: "Georgia, 'Times New Roman', serif",
                          }}
                        >
                          {manageLoadingId === String(petition?._id || petition?.id || "") ? "Saving..." : "Declare Victory"}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleDeletePetition(petition?._id || petition?.id)}
                        disabled={manageLoadingId === String(petition?._id || petition?.id || "")}
                        className="rounded-[12px] px-5 py-3 text-[15px] font-semibold tracking-[0.01em] transition-all duration-150 hover:translate-y-[-1px]"
                        style={{
                          background: "#FFFFFF",
                          color: "#4B5563",
                          border: "1px solid #D9D1C5",
                          boxShadow: "0 4px 10px rgba(23, 23, 23, 0.06)",
                          fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        {manageLoadingId === String(petition?._id || petition?.id || "") ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-3 h-2 w-full rounded-[4px]" style={{ background: "#F5F2ED" }}>
                    <div
                      className="h-2 rounded-[4px]"
                      style={{ width: `${petition.progress}%`, background: "#4A6FA9" }}
                    />
                  </div>

                  <div className="mt-4 text-right">
                    <Link
                      href={`/petition/${petition?._id || petition?.id || ""}`}
                      className="text-[15px] no-underline font-medium"
                      style={{ color: "#4A6FA9" }}
                    >
                      View →
                    </Link>
                  </div>
                </article>
              ))
            )}

            {manageError ? (
              <p className="text-[13px]" style={{ color: "#B91C1C" }}>
                {manageError}
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
