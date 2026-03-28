"use client";

import { useEffect } from "react";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import HoverCard from "@/components/HoverCard";

const tickerItems = [
  ["No water supply - Model Town", "Water", "142 supporters"],
  ["Broken streetlights on GT Road", "Roads", "87 supporters"],
  ["Garbage not collected for a week", "Sanitation", "203 supporters"],
  ["Daily power cuts - Basti Sheikh", "Electricity", "178 supporters"],
  ["Pothole near railway crossing", "Roads", "56 supporters"],
  ["Park encroachment - Lajpat Nagar", "Parks", "91 supporters"],
];

const tagColors = {
  Water: { bg: "#EAF4F0", color: "#1A5C4A" },
  Roads: { bg: "#FEF3C7", color: "#92400E" },
  Electricity: { bg: "#EEF0FB", color: "#3730A3" },
  Sanitation: { bg: "#FDF2F8", color: "#9D174D" },
  Parks: { bg: "#EAF4F0", color: "#1A5C4A" },
};

const whyCards = [
  {
    icon: "🏛️",
    title: "Authority-first workflow",
    desc: "Every grievance is directly assigned to relevant departments with clear ownership and status tracking.",
  },
  {
    icon: "🛤️",
    title: "Clear citizen journey",
    desc: "Private issue resolution first. Public petition signing only when collective push is needed.",
  },
  {
    icon: "📊",
    title: "Measurable accountability",
    desc: "Proof-based resolution, status timelines, and public visibility make every outcome traceable.",
  },
];

const capabilityCards = [
  {
    num: "01",
    title: "Private Grievance Desk",
    desc: "Report privately. Only you and the assigned authority can access details and status updates. Secure by design.",
  },
  {
    num: "02",
    title: "Public Petition Layer",
    desc: "Mobilize civic pressure transparently. Citizens discover public petitions and sign in one click. Momentum is visible.",
  },
  {
    num: "03",
    title: "Accountability by Design",
    desc: "Status timelines, authority ownership, and proof-based updates keep every action visible and every outcome trackable.",
  },
];

const signRows = [
  { initials: "RK", bg: "#F5C842", color: "#0D1B2A", name: "Ravi Kumar", time: "2 min ago" },
  { initials: "PS", bg: "#EAF4F0", color: "#1A5C4A", name: "Priya Sharma", time: "5 min ago" },
  { initials: "AM", bg: "#EEF0FB", color: "#3730A3", name: "Amit Malhotra", time: "8 min ago" },
];

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    setTimeout(() => {
      document.querySelectorAll(".hero-anim").forEach((el) => el.classList.add("visible"));
    }, 100);
    const navbar = document.getElementById("main-navbar");
    const onScroll = () => navbar?.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div style={{ background: "#FAFAF8" }}>
      <div id="main-navbar">
        <Navbar />
      </div>

      <main>
        <section
          style={{
            background: "#FFF8DC",
            padding: "120px 24px 100px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="fade-up hero-anim d1">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "white",
                borderRadius: 50,
                padding: "6px 18px 6px 8px",
                fontSize: 13,
                fontWeight: 500,
                color: "#4A5568",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                marginBottom: 36,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#F5C842",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              Civic accountability for Jalandhar · AI-powered
            </span>
          </div>

          <h1
            className="fade-up hero-anim d2"
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "clamp(42px,7vw,72px)",
              fontWeight: 800,
              color: "#0D1B2A",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              maxWidth: 760,
              margin: "0 auto 24px",
            }}
          >
            Make civic issues
            <br />
            <em style={{ fontStyle: "italic", color: "#4A5568", fontWeight: 300 }}>
              impossible to ignore.
            </em>
          </h1>

          <p
            className="fade-up hero-anim d3"
            style={{
              fontSize: 19,
              color: "#4A5568",
              lineHeight: 1.65,
              maxWidth: 560,
              margin: "0 auto 44px",
            }}
          >
            NyaySetu combines private grievance handling with public petition momentum. Citizens get
            secure reporting, authorities get structured workflows.
          </p>

          <div
            className="fade-up hero-anim d4 flex"
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/grievances/new" className="btn-yellow">
              Report a Grievance
            </Link>
            <Link href="/grievances" className="btn-dark">
              Explore Petitions
            </Link>
          </div>

          <div className="fade-up hero-anim d4" style={{ marginTop: 64 }}>
            <div
              style={{
                overflow: "hidden",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <div className="ticker-track flex" style={{ display: "flex", gap: 16, width: "max-content" }}>
                {tickerItems.concat(tickerItems).map((item, idx) => {
                  const colors = tagColors[item[1]];
                  return (
                    <div
                      key={`${item[0]}-${idx}`}
                      style={{
                        flexShrink: 0,
                        width: 230,
                        background: "white",
                        borderRadius: 18,
                        padding: "16px 18px",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: 50,
                          display: "inline-block",
                          marginBottom: 8,
                          background: colors.bg,
                          color: colors.color,
                        }}
                      >
                        {item[1]}
                      </span>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0D1B2A",
                          lineHeight: 1.4,
                          marginBottom: 8,
                        }}
                      >
                        {item[0]}
                      </div>
                      <div style={{ fontSize: 11, color: "#8A9BAA" }}>{item[2]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="why" style={{ background: "white", padding: "110px 0" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
            <span
              className="fade-up"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8A9BAA",
                marginBottom: 18,
                display: "block",
              }}
            >
              WHY CITIES CHOOSE THIS
            </span>

            <h2
              className="fade-up"
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "clamp(32px,4vw,48px)",
                fontWeight: 700,
                color: "#0D1B2A",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
                maxWidth: 500,
                marginBottom: 56,
              }}
            >
              A platform authorities actually use.
            </h2>

            <div className="grid md:grid-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {whyCards.map((card, idx) => {
                const delayClass = idx === 0 ? "d1" : idx === 1 ? "d2" : "d3";
                return (
                  <HoverCard
                    key={card.title}
                    className={`fade-up ${delayClass}`}
                    style={{
                      background: "#FAFAF8",
                      borderRadius: 22,
                      padding: "28px 26px",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "default",
                      boxShadow: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "#F5C842",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        marginBottom: 18,
                      }}
                    >
                      {card.icon}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#0D1B2A", marginBottom: 8 }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.6 }}>{card.desc}</div>
                  </HoverCard>
                );
              })}
            </div>
          </div>
        </section>

        <section style={{ background: "#0D1B2A", padding: "80px 0" }}>
          <div className="grid md:grid-cols-3" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
            {[
              ["2,400+", "Private grievances processed"],
              ["31,000+", "Public petition signatures"],
              ["40+", "Departments onboarded"],
            ].map((stat, idx) => (
              <div
                key={stat[0]}
                style={{
                  textAlign: "center",
                  padding: 20,
                  borderRight: idx === 2 ? "none" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: "clamp(40px,5vw,58px)",
                    fontWeight: 800,
                    color: "#F5C842",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {stat[0]}
                </div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>{stat[1]}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: 32,
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            All in Jalandhar · Growing every day
          </div>
        </section>

        <section id="how" style={{ background: "#FAFAF8", padding: "110px 0" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", textAlign: "center", marginBottom: 64 }}>
            <span
              className="fade-up"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8A9BAA",
                marginBottom: 18,
                display: "block",
              }}
            >
              PLATFORM CAPABILITIES
            </span>
            <h2
              className="fade-up"
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "clamp(32px,4vw,48px)",
                fontWeight: 700,
                color: "#0D1B2A",
                lineHeight: 1.2,
                letterSpacing: "-0.025em",
                maxWidth: 600,
                margin: "0 auto",
              }}
            >
              Built for calm operations, trusted data, and visible civic outcomes.
            </h2>
          </div>

          <div className="grid md:grid-cols-3" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {capabilityCards.map((card) => {
              return (
                <HoverCard
                  key={card.num}
                  className="fade-up"
                  style={{
                    background: "white",
                    borderRadius: 22,
                    padding: "30px 26px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    transition: "transform 0.25s, box-shadow 0.25s",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Fraunces, serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#F5C842",
                      marginBottom: 16,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {card.num}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0D1B2A",
                      marginBottom: 10,
                      lineHeight: 1.3,
                    }}
                  >
                    {card.title}
                  </div>
                  <div style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.65 }}>{card.desc}</div>
                </HoverCard>
              );
            })}
          </div>
        </section>

        <section style={{ background: "white", padding: "100px 0" }}>
          <div
            className="flex"
            style={{
              maxWidth: 1080,
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              gap: 72,
              alignItems: "center",
            }}
          >
            <div className="fade-up" style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#8A9BAA",
                  marginBottom: 18,
                  display: "block",
                }}
              >
                PRIVATE CHANNEL
              </span>
              <h2
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: "clamp(32px,4vw,48px)",
                  fontWeight: 700,
                  color: "#0D1B2A",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  marginBottom: 20,
                }}
              >
                Grievance to authority, securely.
              </h2>
              <p style={{ fontSize: 18, color: "#4A5568", lineHeight: 1.7, maxWidth: 440 }}>
                Citizens report issues privately. Authorities respond with status updates and
                resolution proof. Ownership stays clear from start to finish.
              </p>
            </div>

            <div className="fade-up d2" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  background: "white",
                  borderRadius: 24,
                  padding: 28,
                  maxWidth: 400,
                  width: "100%",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -16,
                    right: -16,
                    background: "#F5C842",
                    color: "#0D1B2A",
                    borderRadius: 50,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔒 Private
                </div>

                <span
                  style={{
                    background: "#FFF8DC",
                    borderRadius: 50,
                    padding: "4px 12px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#92400E",
                    display: "inline-block",
                    marginBottom: 20,
                  }}
                >
                  YOUR GRIEVANCE DESK
                </span>

                <div className="mock-input">No water supply - Model Town Phase 2</div>
                <div className="mock-input" style={{ height: 56 }}>
                  Locality has had no supply since Monday...
                </div>

                <div className="flex" style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <span
                    style={{
                      background: "#EAF4F0",
                      color: "#1A5C4A",
                      borderRadius: 50,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Water Supply
                  </span>
                  <span
                    style={{
                      background: "#FFF8DC",
                      color: "#92400E",
                      borderRadius: 50,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Jalandhar
                  </span>
                </div>

                <button type="button" className="mock-btn">
                  Submit Grievance →
                </button>

                <div style={{ height: 1, background: "rgba(0,0,0,0.07)", margin: "18px 0 10px" }} />

                <div
                  style={{
                    fontSize: 11,
                    color: "#8A9BAA",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 2,
                  }}
                >
                  STATUS UPDATES
                </div>

                {[
                  ["#22C55E", "Assigned to Water Supply Dept", "Assigned", "#DCFCE7", "#166534"],
                  ["#F59E0B", "Site inspection scheduled", "In Progress", "#FEF3C7", "#92400E"],
                  ["#3B82F6", "Resolution proof uploaded", "Resolved", "#DBEAFE", "#1E40AF"],
                ].map((row) => (
                  <div
                    key={row[1]}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(0,0,0,0.07)",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: row[0],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, color: "#4A5568", flex: 1 }}>{row[1]}</span>
                    <span
                      style={{
                        background: row[3],
                        color: row[4],
                        borderRadius: 50,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row[2]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: "#EAF4F0", padding: "100px 0" }}>
          <div
            className="flex"
            style={{
              maxWidth: 1080,
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              gap: 72,
              alignItems: "center",
              flexDirection: "row-reverse",
            }}
          >
            <div className="fade-up" style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#8A9BAA",
                  marginBottom: 18,
                  display: "block",
                }}
              >
                PUBLIC CHANNEL
              </span>
              <h2
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: "clamp(32px,4vw,48px)",
                  fontWeight: 700,
                  color: "#0D1B2A",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  marginBottom: 20,
                }}
              >
                Petition discovery and collective momentum.
              </h2>
              <p style={{ fontSize: 18, color: "#4A5568", lineHeight: 1.7, maxWidth: 440 }}>
                Community pressure happens through petitions. Citizens discover, sign, and track
                public campaigns. Momentum is transparent, visible, and measurable.
              </p>
            </div>

            <div className="fade-up d2" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  background: "white",
                  borderRadius: 24,
                  padding: 28,
                  maxWidth: 400,
                  width: "100%",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -16,
                    right: -16,
                    background: "#0D1B2A",
                    color: "white",
                    borderRadius: 50,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    whiteSpace: "nowrap",
                  }}
                >
                  📢 Public
                </div>

                <span
                  style={{
                    background: "#EAF4F0",
                    borderRadius: 50,
                    padding: "4px 12px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#1A5C4A",
                    display: "inline-block",
                    marginBottom: 20,
                  }}
                >
                  ACTIVE PETITION
                </span>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0D1B2A",
                    marginBottom: 6,
                    lineHeight: 1.35,
                  }}
                >
                  Fix the GT Road potholes before monsoon
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#4A5568",
                    marginBottom: 16,
                    lineHeight: 1.5,
                  }}
                >
                  3 accidents reported this week. PWD must act before rains make this critical.
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" />
                </div>

                <div className="flex" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8A9BAA" }}>
                  <span>6,740 signed</span>
                  <span>Goal: 10,000</span>
                </div>

                <button type="button" className="mock-btn dark" style={{ marginTop: 16 }}>
                  Sign this Petition →
                </button>

                <div style={{ height: 1, background: "rgba(0,0,0,0.07)", margin: "18px 0 12px" }} />

                {signRows.map((row) => (
                  <div
                    key={row.initials}
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: row.bg,
                        color: row.color,
                      }}
                    >
                      {row.initials}
                    </div>
                    <div style={{ fontSize: 13, color: "#4A5568" }}>
                      {row.name} signed · {row.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: "#0D1B2A", padding: "110px 24px", textAlign: "center" }}>
          <div className="fade-up">
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 18,
                display: "block",
              }}
            >
              MODERN CIVIC OPERATIONS
            </span>
            <h2
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "clamp(32px,4vw,50px)",
                fontWeight: 700,
                color: "white",
                lineHeight: 1.2,
                letterSpacing: "-0.025em",
                maxWidth: 780,
                margin: "0 auto 20px",
              }}
            >
              Clean civic operations for citizens, departments, and modern cities.
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.5)",
                maxWidth: 520,
                margin: "0 auto 44px",
              }}
            >
              Start with a grievance. Escalate with a petition. Every step is tracked, every
              authority accountable.
            </p>
            <div className="flex" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/grievances/new" className="btn-yellow">
                Start with a Grievance
              </Link>
              <Link href="/grievances" className="btn-outline-white">
                Browse Public Petitions
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="flex"
        style={{
          background: "#0D1B2A",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 700, color: "white" }}>
          Nyay<span style={{ color: "#F5C842" }}>Setu</span>
        </div>

        <div className="flex" style={{ display: "flex", gap: 24 }}>
          {[
            ["Privacy", "#"],
            ["Terms", "#"],
            ["Help", "#"],
            ["About", "#"],
          ].map((item) => (
            <Link
              key={item[0]}
              href={item[1]}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
            >
              {item[0]}
            </Link>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2025 NyaySetu · Jalandhar</div>
      </footer>
    </div>
  );
}
