/* ─── Types ──────────────────────────────────────────────── */

interface StatItem {
  value: string;
  label: string;
}

import { Link } from 'react-router-dom';

/* ─── Constants ──────────────────────────────────────────── */

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4';

const STATS: StatItem[] = [
  { value: '24',      label: 'Running Runtimes' },
  { value: '99.6%',   label: 'Success Rate'      },
  { value: '210 ms',  label: 'Avg Latency'       },
  { value: '152',     label: 'Deployments'       },
];

/* ─── Sub-components ─────────────────────────────────────── */

const GithubIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="white"
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839
      9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605
      -3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069
      -.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088
      2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951
      0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27
      2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909
      -1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028
      1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678
      1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02
      0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const PulseIcon = () => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
  </span>
);

/* ─── Main Component ─────────────────────────────────────── */

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen w-full flex flex-col items-center
        justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* ── Video Background ─────────────────────────────── */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      {/* ── Hero Content ─────────────────────────────────── */}
      <div
        className="relative z-10 w-full flex flex-col items-center
          text-center pt-28 pb-16 px-6"
      >

        {/* Live status pill */}
        <div
          className="inline-flex items-center gap-2 h-[38px] px-3 mb-8
            rounded-[10px] border"
          style={{
            background:    'rgba(85, 80, 110, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderColor:   'rgba(164, 132, 215, 0.5)',
          }}
          aria-label="Live platform status"
        >

          <span
            className="font-cabin font-medium text-[12px] text-white
              bg-[#7b39fc] rounded-[6px] px-2 py-0.5 leading-none"
          >
            Live
          </span>
          <span className="font-cabin font-medium text-[14px] text-white">
            AgentOps Dashboard — real-time runtime monitoring
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-instrument text-white text-5xl lg:text-[88px]
            w-full max-w-[960px] leading-[1.08] mb-6"
        >
          Deploy, Monitor{' '}
          <span className="italic">&amp;</span>{' '}
          Manage AI Apps at Scale
        </h1>

        {/* Subtext */}
        <p
          className="font-inter font-normal text-[18px] text-white/70
            w-full max-w-[660px] mb-10 leading-relaxed"
        >
          R Agent Cloud gives your team a centralized platform to deploy AI
          applications from GitHub, monitor runtime health in real-time, manage
          agents, and track full AgentOps — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center
          justify-center gap-4 mb-14">
          <Link
            to="/signup"
            id="hero-start-deploying-btn"
            className="inline-flex items-center gap-2 font-cabin font-medium
              text-[16px] text-white no-underline
              bg-[#7b39fc] rounded-[10px]
              px-8 py-4 cursor-pointer border-none
              hover:bg-[#6620f0] transition-colors duration-200
              shadow-[0_4px_24px_rgba(123,57,252,0.5)]
              whitespace-nowrap"
          >
            <GithubIcon />
            Start Deploying
          </Link>
          <Link
            to="/login"
            id="hero-view-dashboard-btn"
            className="inline-flex items-center gap-2 font-cabin font-medium text-[16px] text-white no-underline
              bg-white/10 rounded-[10px] border border-white/20
              px-8 py-4 cursor-pointer backdrop-blur-md
              hover:bg-white/20 hover:border-white/30 transition-all duration-200
              whitespace-nowrap"
          >
            View Dashboard &amp; Logs
          </Link>
        </div>

        {/* Live Stats Strip */}
        <div
          className="inline-flex flex-wrap justify-center gap-px
            rounded-[14px] overflow-hidden border"
          style={{
            background:    'rgba(43, 35, 68, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderColor:   'rgba(123, 57, 252, 0.25)',
          }}
          aria-label="Platform statistics"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col items-center px-7 py-4
                ${i < STATS.length - 1
                  ? 'border-r border-white/10'
                  : ''}`}
            >
              <span
                className="font-manrope font-semibold text-[22px] text-white
                  leading-tight"
              >
                {s.value}
              </span>
              <span
                className="font-inter text-[12px] text-white/50 mt-0.5
                  whitespace-nowrap"
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
