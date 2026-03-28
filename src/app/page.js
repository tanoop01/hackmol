import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Landmark,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  const stats = [
    { label: "Private grievances processed", value: "2,400+" },
    { label: "Public petition signatures", value: "31,000+" },
    { label: "Departments onboarded", value: "40+" },
  ];

  const featureCards = [
    {
      icon: FileText,
      title: "Private Grievance Desk",
      text: "Report an issue privately. Only you and the assigned authority can access details and updates.",
      tint: "#EEF4FF",
      iconColor: "#2F4D86",
    },
    {
      icon: ScrollText,
      title: "Public Petition Layer",
      text: "Mobilize civic pressure transparently. Citizens discover public petitions and sign in one click.",
      tint: "#EEF8F7",
      iconColor: "#2B6B68",
    },
    {
      icon: ShieldCheck,
      title: "Accountability by Design",
      text: "Status timelines, authority ownership, and proof-based updates keep action visible and trackable.",
      tint: "#F3F0FF",
      iconColor: "#4A4A85",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-6 pb-24 pt-[108px] md:px-10">
          <div
            className="pointer-events-none absolute -right-28 -top-10 h-[320px] w-[320px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(74,111,169,0.18) 0%, rgba(74,111,169,0) 72%)" }}
          />
          <div
            className="pointer-events-none absolute -left-24 top-24 h-[240px] w-[240px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,80,88,0.12) 0%, rgba(16,80,88,0) 72%)" }}
          />

          <div className="mx-auto max-w-6xl">
            <span
              className="inline-flex items-center rounded-full px-4 py-1.5 text-[12px] font-medium tracking-[0.04em]"
              style={{ background: "#EAE6DF", color: "#3A3A3A" }}
            >
              Civic operations platform for Indian cities
            </span>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h1
                  className="text-[48px] font-semibold leading-[1.08] tracking-[-0.02em] md:text-[64px]"
                  style={{ color: "#171717", fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Make civic issues impossible to ignore.
                </h1>

                <p
                  className="mt-6 max-w-[720px] text-[19px] leading-[1.75] md:text-[22px]"
                  style={{ color: "#3F3F3F" }}
                >
                  NyaySetu combines private grievance handling with public petition momentum. Citizens
                  get secure reporting, authorities get structured workflows, and cities get faster
                  resolution with measurable accountability.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link
                    href="/grievances/new"
                    className="inline-flex items-center justify-center rounded-[12px] px-7 py-3.5 text-[16px] font-medium text-white no-underline"
                    style={{ background: "#4A6FA9" }}
                  >
                    Report a Grievance
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/petition"
                    className="inline-flex items-center justify-center rounded-[12px] px-7 py-3.5 text-[16px] font-medium no-underline"
                    style={{ border: "1.5px solid #4A6FA9", color: "#4A6FA9", background: "transparent" }}
                  >
                    Explore Petitions
                  </Link>
                </div>
              </div>

              <aside
                className="rounded-[24px] bg-white p-7"
                style={{ border: "1px solid #E8E1D5" }}
              >
                <p className="text-[12px] font-semibold tracking-[0.12em]" style={{ color: "#6A6A6A" }}>
                  WHY CITIES CHOOSE THIS
                </p>

                <div className="mt-5 space-y-5">
                  <div className="rounded-[16px] px-4 py-4" style={{ background: "#F5F7FC" }}>
                    <div className="inline-flex items-center gap-2 text-[15px] font-medium" style={{ color: "#4A6FA9" }}>
                      <Landmark className="h-4 w-4" />
                      Authority-first workflow
                    </div>
                    <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: "#4B4B4B" }}>
                      Every grievance is directly assigned to relevant departments with status tracking.
                    </p>
                  </div>

                  <div className="rounded-[16px] px-4 py-4" style={{ background: "#F1F7F6" }}>
                    <div className="inline-flex items-center gap-2 text-[15px] font-medium" style={{ color: "#1B5B68" }}>
                      <CheckCircle2 className="h-4 w-4" />
                      Clear citizen journey
                    </div>
                    <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: "#4B4B4B" }}>
                      Private issue resolution first. Public petition signing only when collective push is needed.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="px-6 pb-16 md:px-10">
          <div
            className="mx-auto grid max-w-6xl grid-cols-1 gap-4 rounded-[24px] bg-white p-7 md:grid-cols-3 md:p-10"
            style={{ border: "1px solid #E8E1D5" }}
          >
            {stats.map((item) => (
              <div key={item.label} className="rounded-[16px] px-4 py-3" style={{ background: "#FAF8F2" }}>
                <p className="text-[38px] font-semibold leading-none md:text-[46px]" style={{ color: "#171717" }}>
                  {item.value}
                </p>
                <p className="mt-2 text-[14px] md:text-[15px]" style={{ color: "#666666" }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-10 md:px-10 md:py-16">
          <div className="mx-auto max-w-6xl">
            <p className="text-[12px] font-semibold tracking-[0.12em]" style={{ color: "#6A6A6A" }}>
              PLATFORM CAPABILITIES
            </p>
            <h2
              className="mt-4 max-w-4xl text-[36px] font-semibold leading-[1.15] md:text-[52px]"
              style={{ color: "#171717", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Built for calm operations, trusted data, and visible civic outcomes.
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-[22px] bg-white p-7"
                    style={{ border: "1px solid #E8E1D5" }}
                  >
                    <div
                      className="inline-flex h-11 w-11 items-center justify-center rounded-[12px]"
                      style={{ background: item.tint }}
                    >
                      <Icon className="h-5 w-5" style={{ color: item.iconColor }} />
                    </div>
                    <h3 className="mt-5 text-[24px] font-semibold leading-[1.25]" style={{ color: "#171717" }}>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[16px] leading-[1.75]" style={{ color: "#555555" }}>
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 md:px-10">
          <div
            className="mx-auto max-w-6xl rounded-[28px] bg-white px-7 py-10 md:px-12 md:py-14"
            style={{ border: "1px solid #E8E1D5" }}
          >
            <h2
              className="text-[34px] font-semibold leading-[1.18] md:text-[46px]"
              style={{ color: "#171717", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              One platform. Two focused civic channels.
            </h2>

            <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-[18px] px-5 py-5" style={{ background: "#FAF8F2" }}>
                <p className="text-[12px] font-semibold tracking-[0.1em]" style={{ color: "#6A6A6A" }}>
                  PRIVATE CHANNEL
                </p>
                <p className="mt-2 text-[24px] font-semibold" style={{ color: "#171717" }}>
                  Grievance to authority workflow
                </p>
                <p className="mt-2 text-[16px] leading-[1.75]" style={{ color: "#555555" }}>
                  Citizens report securely, authorities respond with status and proof, and ownership stays clear.
                </p>
              </div>

              <div className="rounded-[18px] px-5 py-5" style={{ background: "#EEF4FF" }}>
                <p className="text-[12px] font-semibold tracking-[0.1em]" style={{ color: "#425A8B" }}>
                  PUBLIC CHANNEL
                </p>
                <p className="mt-2 text-[24px] font-semibold" style={{ color: "#1B2D55" }}>
                  Petition discovery and signatures
                </p>
                <p className="mt-2 text-[16px] leading-[1.75]" style={{ color: "#425A8B" }}>
                  Community momentum happens through petitions. Citizens sign, track, and escalate together.
                </p>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/grievances/new"
                className="inline-flex items-center justify-center rounded-[12px] px-6 py-3 text-[15px] font-medium text-white no-underline"
                style={{ background: "#4A6FA9" }}
              >
                Start with a Grievance
              </Link>
              <Link
                href="/petition"
                className="inline-flex items-center justify-center rounded-[12px] px-6 py-3 text-[15px] font-medium no-underline"
                style={{ border: "1.5px solid #4A6FA9", color: "#4A6FA9", background: "transparent" }}
              >
                Browse Public Petitions
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-8 py-10 text-center" style={{ background: "#141414" }}>
        <Image
          src="/logo2.png"
          alt="NyaySetu"
          width={190}
          height={46}
          className="mx-auto h-[46px] w-[190px] object-contain"
        />
        <p className="mt-2 text-[14px]" style={{ color: "#B7B7B7" }}>
          Clean civic operations for citizens, departments, and modern city governance.
        </p>
        <p className="mt-4 text-[12px]" style={{ color: "#8A8A8A" }}>
          © 2026 NyaySetu
        </p>
      </footer>
    </div>
  );
}
