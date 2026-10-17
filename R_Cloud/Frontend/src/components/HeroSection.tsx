import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';
import FloatingStoryCanvas from './landing/FloatingStoryCanvas';
import ScrollStorytelling from './landing/ScrollStorytelling';
import BentoFeatures from './landing/BentoFeatures';
import ComparisonTable from './landing/ComparisonTable';
import ValuePillars from './landing/ValuePillars';
import FAQSection from './landing/FAQSection';
import CTASection from './landing/CTASection';
import LandingFooter from './landing/LandingFooter';
import { SquishyPricing } from './ui/squishy-pricing';

const GithubIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const STAT_ITEMS = [
  {
    value: '100,000+',
    label: 'Active Agent Nodes',
    desc: 'Autonomous agent swarms connected & orchestrating in real time.',
    icon: Activity,
  },
  {
    value: '99.99%',
    label: 'Runtime Uptime SLA',
    desc: 'Deterministic failover & zero-downtime microVM sandboxes.',
    icon: ShieldCheck,
  },
  {
    value: '12.5 ms',
    label: 'Median Query Latency',
    desc: 'Sub-millisecond semantic graph traversals across global edge nodes.',
    icon: Zap,
  },
];

export default function HeroSection() {
  const [storyStep, setStoryStep] = useState(0);
  const [effectiveStep, setEffectiveStep] = useState(-1);
  const storyStepRef = useRef(0);

  const handleStepChange = (step: number) => {
    storyStepRef.current = step;
    setStoryStep(step);
    const storySection = document.getElementById('how-it-works');
    const windowHeight = window.innerHeight;

    if (storySection && storySection.getBoundingClientRect().top <= windowHeight * 0.6) {
      setEffectiveStep(step);
    } else {
      setEffectiveStep(-1);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const storySection = document.getElementById('how-it-works');
      if (!storySection) return;

      const windowHeight = window.innerHeight;
      const storyTop = storySection.getBoundingClientRect().top;

      if (storyTop <= windowHeight * 0.5) {
        setEffectiveStep(storyStepRef.current);
      } else {
        setEffectiveStep(-1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="w-full flex flex-col bg-white relative">
      {/* ── Global Floating Morphing Particle Canvas ─────────── */}
      <FloatingStoryCanvas currentStep={effectiveStep} />

      {/* ── First Page (Hero Screen): Top to Bottom ───────────── */}
      <section
        id="hero"
        className="relative w-full min-h-screen flex flex-col justify-start pt-[64px] pb-6 px-6 lg:px-10 overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, #0F3B27 0%, #0A2619 55%, #05180F 100%)',
        }}
        aria-label="Hero section"
      >
        {/* Subtle mesh background noise */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient Deep Emerald Glow Spheres (Rich contrast, zero white glare) */}
        <div className="absolute top-1/4 right-1/4 w-[460px] h-[460px] bg-[#0F3B27]/60 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-8 w-[400px] h-[400px] bg-[#071F14]/70 blur-[110px] rounded-full pointer-events-none" />

        {/* 3-Section Full Screen Layout: Left Text Div | Center Shape | Right Stats List */}
        <div className="relative z-10 w-full flex-1 flex flex-col lg:flex-row items-start justify-between gap-6 xl:gap-8 pt-4 sm:pt-6 pb-4">
          
          {/* 1. Div directly under Logo: Main Text & CTAs (Tight gap under logo) */}
          <div className="w-full lg:w-[42%] xl:w-[40%] flex flex-col items-start text-left shrink-0 self-start pt-1 sm:pt-2">
            
            {/* Small box in Signal Lime with Move Green text & mono font from image */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#92FF5F] text-[#0F3B27] font-mono font-bold text-xs tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(146,255,95,0.35)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F3B27] animate-pulse" />
              <span>v2.0 • Autonomous Agent Graph</span>
            </div>

            {/* Headline */}
            <h1 className="font-instrument text-[#F7F9F7] text-5xl sm:text-6xl lg:text-[68px] xl:text-[74px] leading-[1.04] tracking-tight mb-4">
              The knowledge graph{' '}
              <br className="hidden sm:inline" />
              context cloud for{' '}
              <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#92FF5F]">
                enterprise software.
              </span>
            </h1>

            {/* Subtext */}
            <p className="font-inter font-normal text-[15px] sm:text-[17px] text-[#F7F9F7]/80 max-w-[520px] mb-6 leading-relaxed">
              Connect unstructured data, enterprise APIs, and autonomous agents in real-time.
              Full-stack observability and instant deployment on dedicated MicroVMs.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to="/signup"
                id="hero-book-demo-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-manrope font-bold text-[15px] text-[#0F3B27] bg-[#92FF5F] hover:bg-[#92FF5F]/90 rounded-full px-7 py-3.5 cursor-pointer no-underline transition-all duration-200 shadow-[0_4px_24px_rgba(146,255,95,0.4)] group"
              >
                <span>Book Demo</span>
                <ArrowRight className="w-4 h-4 text-[#0F3B27] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                id="hero-start-trial-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-manrope font-semibold text-[15px] text-[#F7F9F7] bg-[#0F3B27]/70 hover:bg-[#0F3B27] border border-[#CFF1D2]/30 rounded-full px-7 py-3.5 cursor-pointer no-underline backdrop-blur-md transition-all duration-200"
              >
                <GithubIcon />
                <span>Start Free Trial</span>
              </Link>
            </div>
          </div>

          {/* 2. Center Stage: Continuous 3D Shape Playing (Expanded larger size with no box behind it) */}
          <div className="flex-1 lg:w-[46%] xl:w-[48%] flex items-center justify-center relative my-auto self-center">
            <div
              id="hero-sphere-slot"
              className="relative w-[440px] sm:w-[520px] lg:w-[620px] xl:w-[700px] h-[440px] sm:h-[520px] lg:h-[620px] xl:h-[700px] flex items-center justify-center pointer-events-none"
            />
          </div>

          {/* 3. Right Space: List with Number & Label only (Clean, compact, highly visible) */}
          <div className="w-auto flex flex-col justify-end self-end mt-auto shrink-0 ml-auto lg:ml-0 lg:mb-2 z-20">
            <div className="flex flex-col">
              {STAT_ITEMS.map((item, index) => {
                return (
                  <div
                    key={item.label}
                    className={`flex flex-col ${
                      index !== STAT_ITEMS.length - 1
                        ? 'border-b border-[#CFF1D2]/25 pb-2 mb-2'
                        : 'pb-0'
                    }`}
                  >
                    {/* Metric Number */}
                    <div className="font-manrope font-extrabold text-xl sm:text-[22px] lg:text-[24px] leading-none text-[#92FF5F] tracking-tight">
                      {item.value}
                    </div>

                    {/* Uppercase Metric Label */}
                    <div className="font-mono font-bold text-[9.5px] sm:text-[10px] tracking-widest uppercase text-[#CFF1D2] mt-1">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ── Scroll Storytelling Section (The requested block animation) ── */}
      <ScrollStorytelling
        activeStep={storyStep}
        onStepChange={handleStepChange}
      />

      {/* ── 6 Bento Features Grid (Soft mint green cards) ─────── */}
      <BentoFeatures />

      {/* ── Comparison Matrix Table ───────────────────────────── */}
      <ComparisonTable />

      {/* ── 4 Core Value Pillars ──────────────────────────────── */}
      <ValuePillars />

      {/* ── Pricing Section (Squishy Pricing Interactive Cards) ─ */}
      <div id="pricing" className="relative w-full bg-[#020b08] pt-12 pb-6 border-t border-emerald-950/40 scroll-mt-16">
        <SquishyPricing className="bg-transparent min-h-0 py-8" showHeader={true} />
      </div>

      {/* ── FAQ Accordion ─────────────────────────────────────── */}
      <FAQSection />

      {/* ── Final Call to Action ──────────────────────────────── */}
      <CTASection />

      {/* ── Dark Footer with Giant Watermark Typography ───────── */}
      <LandingFooter />
    </div>
  );
}
