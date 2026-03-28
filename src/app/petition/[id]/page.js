"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/Navbar";
import { useUser } from "@/lib/useUser";

export default function PetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const dashboardHref = user?.role === "authority" ? "/dashboard/authority" : "/dashboard/citizen";

  const petitionId = params?.id;

  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [petition, setPetition] = useState(null);
  const [hasSigned, setHasSigned] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [signersLoading, setSignersLoading] = useState(false);
  const [signersError, setSignersError] = useState("");
  const [signers, setSigners] = useState([]);

  useEffect(() => {
    if (!petitionId) {
      return;
    }

    let isActive = true;

    async function fetchPetition() {
      setLoading(true);

      try {
        const response = await fetch(`/api/petitions/${petitionId}`);
        const json = await response.json().catch(() => ({}));

        if (!isActive) {
          return;
        }

        const nextPetition = json?.petition || json?.data || null;
        setPetition(nextPetition);

        const userId = String(user?._id || user?.id || "");
        const signedFromFlag = nextPetition?.hasSigned === true || nextPetition?.isSigned === true;
        const signedFromSignatures = Array.isArray(nextPetition?.signatures)
          ? nextPetition.signatures.some((item) => {
              const id = typeof item === "string" ? item : item?._id || item?.id;
              return String(id || "") === userId;
            })
          : false;

        const signedFromEntries = Array.isArray(nextPetition?.signerEntries)
          ? nextPetition.signerEntries.some((entry) => String(entry?.user || "") === userId)
          : false;

        setHasSigned(Boolean(signedFromFlag || signedFromSignatures || signedFromEntries));
      } catch (_error) {
        if (!isActive) {
          return;
        }

        setPetition(null);
      } finally {
        if (!isActive) {
          return;
        }

        setLoading(false);
      }
    }

    fetchPetition();

    return () => {
      isActive = false;
    };
  }, [petitionId, user?._id, user?.id]);

  const signatureCount = useMemo(() => {
    if (!petition) {
      return 0;
    }

    if (Array.isArray(petition?.signerEntries)) {
      return petition.signerEntries.length;
    }

    if (Number.isFinite(Number(petition?.signatureCount))) {
      return Number(petition.signatureCount);
    }

    return Array.isArray(petition?.signatures) ? petition.signatures.length : 0;
  }, [petition]);

  const progressWidth = Math.max(0, Math.min(100, Math.round((signatureCount / 100) * 100)));
  const petitionStatus = String(petition?.status || "active");
  const isClosed = petitionStatus === "victory_declared";
  const petitionCreatorId = String(
    typeof petition?.createdBy === "string"
      ? petition?.createdBy
      : petition?.createdBy?._id || petition?.createdBy?.id || ""
  );
  const currentUserId = String(user?._id || user?.id || "");
  const canManagePetition = Boolean(currentUserId && petitionCreatorId && currentUserId === petitionCreatorId);

  useEffect(() => {
    if (!petitionId || !canManagePetition) {
      setSigners([]);
      return;
    }

    let isActive = true;

    async function fetchSigners() {
      setSignersLoading(true);
      setSignersError("");

      try {
        const response = await fetch(`/api/petitions/${petitionId}/signers`);
        const json = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(json?.message || "Unable to fetch signer list");
        }

        if (!isActive) {
          return;
        }

        setSigners(Array.isArray(json?.signers) ? json.signers : []);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setSigners([]);
        setSignersError(error.message || "Unable to fetch signer list");
      } finally {
        if (!isActive) {
          return;
        }

        setSignersLoading(false);
      }
    }

    fetchSigners();

    return () => {
      isActive = false;
    };
  }, [petitionId, canManagePetition]);

  async function handleSign() {
    if (!userLoading && !user) {
      router.push("/login");
      return;
    }

    if (!petitionId || hasSigned || isClosed) {
      return;
    }

    setSigning(true);

    try {
      const response = await fetch(`/api/petitions/${petitionId}/sign`, {
        method: "POST",
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(json?.message || "Unable to sign petition");
      }

      setHasSigned(true);
      setPetition((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          signatureCount: Number(previous.signatureCount || signatureCount) + 1,
        };
      });

      if (canManagePetition) {
        setSigners((previous) => {
          const alreadyInList = previous.some((item) => String(item?.id || "") === currentUserId);
          if (alreadyInList) {
            return previous;
          }

          return [
            {
              id: currentUserId,
              name: user?.name || "You",
              city: user?.city || "N/A",
              state: user?.state || "N/A",
              signedAt: new Date().toISOString(),
            },
            ...previous,
          ];
        });
      }
    } catch (_error) {
      if (!user) {
        router.push("/login");
      }
    } finally {
      setSigning(false);
    }
  }

  async function handleDeclareVictory() {
    if (!petitionId || !canManagePetition || isClosed || actionLoading) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const response = await fetch(`/api/petitions/${petitionId}`, {
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

      const updated = json?.petition || json?.data || null;
      if (updated) {
        setPetition(updated);
      }
    } catch (error) {
      setActionError(error.message || "Unable to declare victory");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeletePetition() {
    if (!petitionId || !canManagePetition || actionLoading) {
      return;
    }

    const shouldDelete = window.confirm("Delete this petition permanently?");
    if (!shouldDelete) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const response = await fetch(`/api/petitions/${petitionId}`, {
        method: "DELETE",
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.message || "Unable to delete petition");
      }

      router.push("/petition");
    } catch (error) {
      setActionError(error.message || "Unable to delete petition");
      setActionLoading(false);
    }
  }

  function handleExportSigners() {
    if (!Array.isArray(signers) || signers.length === 0) {
      return;
    }

    const header = ["Name", "City", "State", "Signed On"];
    const rows = signers.map((signer) => [
      signer?.name || "",
      signer?.city || "",
      signer?.state || "",
      signer?.signedAt ? new Date(signer.signedAt).toLocaleString() : "",
    ]);

    const csvLines = [header, ...rows].map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    );

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.setAttribute("download", `petition-signers-${petitionId}.csv`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: "#4A6FA9", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
        <Navbar />
        <main className="mx-auto max-w-[700px] px-5 pt-24">
          <Link href="/petition" className="text-[14px] no-underline" style={{ color: "#4A6FA9" }}>
            ← All Petitions
          </Link>
          <div className="mt-4 rounded-[14px] bg-white px-6 py-10 text-center" style={{ border: "0.5px solid #E8E1D5" }}>
            <p className="text-[18px] font-semibold" style={{ color: "#171717" }}>
              Petition not found
            </p>
          </div>
        </main>
      </div>
    );
  }

  const linkedIssueId =
    (typeof petition?.issueId === "object" ? petition?.issueId?._id || petition?.issueId?.id : petition?.issueId) ||
    petition?.grievanceId ||
    "";
  const linkedIssueTitle =
    (typeof petition?.issueId === "object" ? petition?.issueId?.title : "") ||
    petition?.grievanceTitle ||
    petition?.issueTitle ||
    "";

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navbar />

      <main className="mx-auto max-w-[700px] px-5 pb-10 pt-24">
        <div className="flex flex-wrap items-center gap-3">
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

        <article className="mt-4 rounded-[14px] bg-white px-9 py-8" style={{ border: "0.5px solid #E8E1D5" }}>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-block rounded-[20px] px-3 py-1.5 text-[11px] uppercase"
              style={{ background: "#ECF0FF", color: "#4A6FA9" }}
            >
              Petition
            </span>
            <span
              className="inline-block rounded-[20px] px-3 py-1.5 text-[11px] uppercase"
              style={isClosed ? { background: "#DCFCE7", color: "#16A34A" } : { background: "#FEF3C7", color: "#B45309" }}
            >
              {isClosed ? "Victory Declared" : "Active"}
            </span>
          </div>

          <h1 className="mt-3 text-[32px] font-semibold" style={{ color: "#171717" }}>
            {petition?.title || "Untitled petition"}
          </h1>

          {linkedIssueId || linkedIssueTitle ? (
            <div className="mt-4">
              <p className="text-[12px]" style={{ color: "#999999" }}>
                Linked Issue
              </p>
              <div
                className="mt-1.5 rounded-[10px] bg-[#FAFAF8] px-3.5 py-2.5"
                style={{ border: "0.5px solid #E8E1D5" }}
              >
                <p className="text-[14px]" style={{ color: "#666666" }}>
                  {linkedIssueTitle || "Linked grievance"}
                </p>
                {linkedIssueId ? (
                  <Link
                    href={`/grievances/${linkedIssueId}`}
                    className="mt-1 inline-block text-[12px] no-underline"
                    style={{ color: "#4A6FA9" }}
                  >
                    View Issue →
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <p className="mt-4 text-[16px] leading-[1.8]" style={{ color: "#666666" }}>
            {petition?.description || "No description provided."}
          </p>

          <section className="mt-6">
            <p className="text-[22px] font-semibold" style={{ color: "#171717" }}>
              {signatureCount} of 100 signatures
            </p>

            <div className="mt-2 h-2 w-full rounded-[4px]" style={{ background: "#F5F2ED" }}>
              <div className="h-2 rounded-[4px]" style={{ width: `${progressWidth}%`, background: "#4A6FA9" }} />
            </div>

            <button
              type="button"
              onClick={handleSign}
              disabled={hasSigned || signing || isClosed}
              className="mt-5 inline-flex w-full items-center justify-center rounded-[10px] px-4 py-3.5 text-[16px] font-medium"
              style={
                isClosed
                  ? { background: "#F5F2ED", color: "#999999" }
                  : hasSigned
                  ? { background: "#ECF0FF", color: "#4A6FA9" }
                  : { background: "#4A6FA9", color: "#FFFFFF" }
              }
            >
              {signing
                ? "Signing..."
                : isClosed
                  ? "Petition closed by creator"
                  : hasSigned
                    ? "You've signed this ✓"
                    : "Sign this Petition"}
            </button>

            <p className="mt-2 text-[14px]" style={{ color: "#666666" }}>
              {signatureCount} citizens have signed
            </p>

            {canManagePetition ? (
              <div className="mt-5 space-y-3">
                {!isClosed ? (
                  <button
                    type="button"
                    onClick={handleDeclareVictory}
                    disabled={actionLoading}
                    className="inline-flex w-full items-center justify-center rounded-[10px] px-4 py-3 text-[15px] font-medium"
                    style={{ background: "#ECF0FF", color: "#4A6FA9", border: "1px solid #D4DFF5" }}
                  >
                    {actionLoading ? "Saving..." : "Declare Victory"}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleDeletePetition}
                  disabled={actionLoading}
                  className="inline-flex w-full items-center justify-center rounded-[10px] px-4 py-3 text-[15px] font-medium"
                  style={{ background: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5" }}
                >
                  {actionLoading ? "Please wait..." : "Delete Petition"}
                </button>

                {actionError ? (
                  <p className="text-[13px]" style={{ color: "#B91C1C" }}>
                    {actionError}
                  </p>
                ) : null}

                <div className="mt-4 rounded-[12px] px-4 py-4" style={{ background: "#FAFAF8", border: "0.5px solid #E8E1D5" }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[15px] font-semibold" style={{ color: "#171717" }}>
                      Signer List
                    </p>
                    <button
                      type="button"
                      onClick={handleExportSigners}
                      disabled={signersLoading || signers.length === 0}
                      className="rounded-[9px] px-3 py-1.5 text-[13px] font-medium"
                      style={{
                        background: signers.length === 0 ? "#F5F2ED" : "#ECF0FF",
                        color: signers.length === 0 ? "#999999" : "#4A6FA9",
                        border: "1px solid #D4DFF5",
                      }}
                    >
                      Export CSV
                    </button>
                  </div>

                  {signersError ? (
                    <p className="mt-2 text-[13px]" style={{ color: "#B91C1C" }}>
                      {signersError}
                    </p>
                  ) : null}

                  <div className="mt-3 max-h-[230px] space-y-2 overflow-y-auto pr-1">
                    {signersLoading ? (
                      <>
                        <div className="h-[48px] animate-pulse rounded-[9px]" style={{ background: "#F5F2ED" }} />
                        <div className="h-[48px] animate-pulse rounded-[9px]" style={{ background: "#F5F2ED" }} />
                      </>
                    ) : signers.length === 0 ? (
                      <p className="text-[13px]" style={{ color: "#666666" }}>
                        No signatures yet.
                      </p>
                    ) : (
                      signers.map((signer) => (
                        <div
                          key={`${signer.id}-${signer.signedAt}`}
                          className="rounded-[9px] px-3 py-2"
                          style={{ border: "0.5px solid #E8E1D5", background: "#FFFFFF" }}
                        >
                          <p className="text-[14px] font-medium" style={{ color: "#171717" }}>
                            {signer.name}
                          </p>
                          <p className="mt-0.5 text-[12px]" style={{ color: "#666666" }}>
                            {signer.city}, {signer.state}
                          </p>
                          <p className="mt-0.5 text-[12px]" style={{ color: "#999999" }}>
                            Signed on: {signer.signedAt ? new Date(signer.signedAt).toLocaleString() : "N/A"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </article>
      </main>
    </div>
  );
}
