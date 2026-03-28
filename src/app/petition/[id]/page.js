"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Download, Trophy, Trash2, PenLine } from "lucide-react";

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
    if (!petitionId) return;
    let isActive = true;

    async function fetchPetition() {
      setLoading(true);
      try {
        const res = await fetch(`/api/petitions/${petitionId}`);
        const json = await res.json().catch(() => ({}));
        if (!isActive) return;

        const next = json?.petition || json?.data || null;
        setPetition(next);

        const userId = String(user?._id || user?.id || "");
        const fromFlag = next?.hasSigned === true || next?.isSigned === true;
        const fromSigs = Array.isArray(next?.signatures)
          ? next.signatures.some((item) => {
              const id = typeof item === "string" ? item : item?._id || item?.id;
              return String(id || "") === userId;
            })
          : false;
        const fromEntries = Array.isArray(next?.signerEntries)
          ? next.signerEntries.some((e) => String(e?.user || "") === userId)
          : false;
        setHasSigned(Boolean(fromFlag || fromSigs || fromEntries));
      } catch {
        if (!isActive) return;
        setPetition(null);
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    }

    fetchPetition();
    return () => { isActive = false; };
  }, [petitionId, user?._id, user?.id]);

  const signatureCount = useMemo(() => {
    if (!petition) return 0;
    if (Array.isArray(petition?.signerEntries)) return petition.signerEntries.length;
    if (Number.isFinite(Number(petition?.signatureCount))) return Number(petition.signatureCount);
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
    if (!petitionId || !canManagePetition) { setSigners([]); return; }
    let isActive = true;

    async function fetchSigners() {
      setSignersLoading(true);
      setSignersError("");
      try {
        const res = await fetch(`/api/petitions/${petitionId}/signers`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "Unable to fetch signer list");
        if (!isActive) return;
        setSigners(Array.isArray(json?.signers) ? json.signers : []);
      } catch (err) {
        if (!isActive) return;
        setSigners([]);
        setSignersError(err.message || "Unable to fetch signer list");
      } finally {
        if (!isActive) return;
        setSignersLoading(false);
      }
    }

    fetchSigners();
    return () => { isActive = false; };
  }, [petitionId, canManagePetition]);

  async function handleSign() {
    if (!userLoading && !user) { router.push("/login"); return; }
    if (!petitionId || hasSigned || isClosed) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/petitions/${petitionId}/sign`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Unable to sign petition");
      setHasSigned(true);
      setPetition((prev) => prev ? { ...prev, signatureCount: Number(prev.signatureCount || signatureCount) + 1 } : prev);
      if (canManagePetition) {
        setSigners((prev) => {
          if (prev.some((item) => String(item?.id || "") === currentUserId)) return prev;
          return [{ id: currentUserId, name: user?.name || "You", city: user?.city || "N/A", state: user?.state || "N/A", signedAt: new Date().toISOString() }, ...prev];
        });
      }
    } catch {
      if (!user) router.push("/login");
    } finally {
      setSigning(false);
    }
  }

  async function handleDeclareVictory() {
    if (!petitionId || !canManagePetition || isClosed || actionLoading) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/petitions/${petitionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "declare_victory" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Unable to declare victory");
      const updated = json?.petition || json?.data || null;
      if (updated) setPetition(updated);
    } catch (err) {
      setActionError(err.message || "Unable to declare victory");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeletePetition() {
    if (!petitionId || !canManagePetition || actionLoading) return;
    if (!window.confirm("Delete this petition permanently?")) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/petitions/${petitionId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Unable to delete petition");
      router.push("/petition");
    } catch (err) {
      setActionError(err.message || "Unable to delete petition");
      setActionLoading(false);
    }
  }

  function handleExportSigners() {
    if (!Array.isArray(signers) || signers.length === 0) return;
    const header = ["Name", "City", "State", "Signed On"];
    const rows = signers.map((s) => [s?.name || "", s?.city || "", s?.state || "", s?.signedAt ? new Date(s.signedAt).toLocaleString() : ""]);
    const csv = [header, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `petition-signers-${petitionId}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#F8F7F4" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid #F5C842", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Not found ──
  if (!petition) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F7F4", fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar />
        <main style={{ maxWidth: 680, margin: "0 auto", padding: "88px 24px 64px" }}>
          <Link href="/petition" style={{ fontSize: 13, fontWeight: 600, color: "#78716C", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 50, background: "#FFFFFF", border: "1px solid #EDE8DF" }}>
            ← All Petitions
          </Link>
          <div style={{ marginTop: 20, background: "#FFFFFF", borderRadius: 16, padding: "48px 24px", textAlign: "center", border: "1px solid #EDE8DF" }}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0D1B2A" }}>Petition not found</p>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#A8A29E" }}>This petition may have been removed or the link is incorrect.</p>
          </div>
        </main>
      </div>
    );
  }

  const linkedIssueId =
    (typeof petition?.issueId === "object" ? petition?.issueId?._id || petition?.issueId?.id : petition?.issueId) ||
    petition?.grievanceId || "";
  const linkedIssueTitle =
    (typeof petition?.issueId === "object" ? petition?.issueId?.title : "") ||
    petition?.grievanceTitle || petition?.issueTitle || "";

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F4", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: 740, margin: "0 auto", padding: "88px 24px 64px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
          <Link href={dashboardHref} style={{ color: "#78716C", textDecoration: "none", padding: "6px 13px", borderRadius: 50, background: "#FFFFFF", border: "1px solid #EDE8DF" }}>
            ← Dashboard
          </Link>
          <span style={{ color: "#D6D3D1" }}>/</span>
          <Link href="/petition" style={{ color: "#78716C", textDecoration: "none", padding: "6px 13px", borderRadius: 50, background: "#FFFFFF", border: "1px solid #EDE8DF" }}>
            All Petitions
          </Link>
        </div>

        {/* ── Main card ── */}
        <article style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #EDE8DF", padding: "28px 28px 24px", marginBottom: 16 }}>

          {/* Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <span style={{ padding: "3px 11px", borderRadius: 50, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", background: "#EEF2FF", color: "#4A6FA9", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <PenLine size={11} />
              Petition
            </span>
            <span style={{
              padding: "3px 11px", borderRadius: 50, fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.07em",
              ...(isClosed
                ? { background: "#DCFCE7", color: "#16A34A" }
                : { background: "#FEF3C7", color: "#B45309" }),
            }}>
              {isClosed ? "Victory Declared" : "Active"}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ margin: "0 0 16px", fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, lineHeight: 1.18, color: "#0D1B2A" }}>
            {petition?.title || "Untitled petition"}
          </h1>

          {/* Linked issue */}
          {(linkedIssueId || linkedIssueTitle) && (
            <div style={{ marginBottom: 18, borderRadius: 12, background: "#FAFAF8", padding: "12px 14px", border: "1px solid #EDE8DF" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#A8A29E" }}>
                Linked Issue
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#44403C", fontWeight: 500 }}>
                {linkedIssueTitle || "Linked grievance"}
              </p>
              {linkedIssueId && (
                <Link href={`/grievances/${linkedIssueId}`} style={{ display: "inline-block", marginTop: 4, fontSize: 12, fontWeight: 600, color: "#4A6FA9", textDecoration: "none" }}>
                  View Issue →
                </Link>
              )}
            </div>
          )}

          {/* Description */}
          <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.8, color: "#57534E" }}>
            {petition?.description || "No description provided."}
          </p>

          <div style={{ height: 1, background: "#EDE8DF", marginBottom: 22 }} />

          {/* ── Signature block ── */}
          <div>
            {/* Count */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ margin: 0, fontFamily: "Fraunces, Georgia, serif", fontSize: 26, fontWeight: 800, color: "#0D1B2A" }}>
                {signatureCount}
                <span style={{ fontSize: 15, fontWeight: 500, color: "#A8A29E", marginLeft: 6 }}>of 100 signatures</span>
              </p>
              <span style={{ fontSize: 13, fontWeight: 700, color: progressWidth >= 100 ? "#16A34A" : "#78716C" }}>
                {progressWidth}%
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 8, borderRadius: 4, background: "#EDE8DF", overflow: "hidden", marginBottom: 14 }}>
              <div style={{
                height: "100%",
                borderRadius: 4,
                background: progressWidth >= 100 ? "#16A34A" : "#4A6FA9",
                width: `${progressWidth}%`,
                transition: "width 0.4s ease",
              }} />
            </div>

            {/* Sign button */}
            <button
              type="button"
              onClick={handleSign}
              disabled={hasSigned || signing || isClosed}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "13px 0",
                borderRadius: 50,
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: hasSigned || isClosed ? "default" : "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s, transform 0.1s",
                ...(isClosed
                  ? { background: "#F1F5F9", color: "#A8A29E" }
                  : hasSigned
                    ? { background: "#DCFCE7", color: "#16A34A" }
                    : { background: "#F5C842", color: "#0D1B2A" }),
              }}
              onMouseEnter={(e) => { if (!hasSigned && !isClosed) e.currentTarget.style.background = "#EAB800"; }}
              onMouseLeave={(e) => { if (!hasSigned && !isClosed) e.currentTarget.style.background = "#F5C842"; }}
            >
              {signing ? "Signing…" : isClosed ? "Petition closed" : hasSigned ? "✓ Signed" : "Sign this Petition"}
            </button>

            <p style={{ margin: "9px 0 0", fontSize: 13, color: "#A8A29E", textAlign: "center" }}>
              {signatureCount} {signatureCount === 1 ? "citizen has" : "citizens have"} signed this petition
            </p>
          </div>
        </article>

        {/* ── Creator controls ── */}
        {canManagePetition && (
          <section style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #EDE8DF", padding: "22px 24px" }}>
            <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A8A29E" }}>
              Creator Controls
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Declare victory */}
              {!isClosed && (
                <button
                  type="button"
                  onClick={handleDeclareVictory}
                  disabled={actionLoading}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%", padding: "11px 0", borderRadius: 50,
                    fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                    background: "#DCFCE7", color: "#16A34A",
                    border: "1px solid #BBF7D0",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <Trophy size={15} />
                  {actionLoading ? "Saving…" : "Declare Victory"}
                </button>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={handleDeletePetition}
                disabled={actionLoading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "11px 0", borderRadius: 50,
                  fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                  background: "#FEE2E2", color: "#B91C1C",
                  border: "1px solid #FCA5A5",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                <Trash2 size={15} />
                {actionLoading ? "Please wait…" : "Delete Petition"}
              </button>

              {actionError && (
                <p style={{ margin: 0, fontSize: 13, color: "#B91C1C" }}>{actionError}</p>
              )}
            </div>

            {/* Signers list */}
            <div style={{ marginTop: 20, borderRadius: 14, background: "#FAFAF8", border: "1px solid #EDE8DF", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>
                  Signer List
                  {signers.length > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "#A8A29E" }}>({signers.length})</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleExportSigners}
                  disabled={signersLoading || signers.length === 0}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "6px 13px", borderRadius: 50, fontSize: 12, fontWeight: 700,
                    background: signers.length === 0 ? "#F1F5F9" : "#EEF2FF",
                    color: signers.length === 0 ? "#A8A29E" : "#4A6FA9",
                    border: "1px solid",
                    borderColor: signers.length === 0 ? "#EDE8DF" : "#C7D2F0",
                    cursor: signers.length === 0 ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <Download size={12} />
                  Export CSV
                </button>
              </div>

              {signersError && (
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "#B91C1C" }}>{signersError}</p>
              )}

              <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {signersLoading ? (
                  [1, 2].map((i) => (
                    <div key={i} style={{ height: 60, borderRadius: 10, background: "#EDE8DF", animation: "pulse 1.4s ease-in-out infinite" }} />
                  ))
                ) : signers.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: "#A8A29E" }}>No signatures yet.</p>
                ) : (
                  signers.map((signer) => (
                    <div
                      key={`${signer.id}-${signer.signedAt}`}
                      style={{ borderRadius: 10, padding: "10px 13px", border: "1px solid #EDE8DF", background: "#FFFFFF" }}
                    >
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0D1B2A" }}>{signer.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#78716C" }}>{signer.city}, {signer.state}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#A8A29E" }}>
                        {signer.signedAt ? new Date(signer.signedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}