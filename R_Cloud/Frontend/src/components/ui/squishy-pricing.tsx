import React from 'react';
import { motion } from 'framer-motion';

interface PricingCardProps {
  label: string;
  monthlyPrice: string;
  description: string;
  cta: string;
  background: string;
  BGComponent: React.ComponentType;
  onClick?: () => void;
}

export const Component = ({
  className = '',
  showHeader = true,
}: {
  className?: string;
  showHeader?: boolean;
} = {}) => {
  return (
    <section
      className={`px-4 py-16 transition-colors relative z-10 ${className || 'bg-background min-h-screen'}`}
    >
      {showHeader && (
        <div className="text-center mb-14 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#92FF5F] text-[#0F3B27] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-xs">
            PRICING PLANS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-manrope text-[#F7F9F7] tracking-tight">
            Predictable Compute for Autonomous Fleets
          </h2>
          <p className="mt-3.5 text-[#CFF1D2]/80 text-sm sm:text-base font-inter max-w-xl mx-auto">
            Scale from local prototypes to millions of mission-critical agent executions with deterministic memory isolation.
          </p>
        </div>
      )}

      <div className="mx-auto flex w-fit flex-wrap justify-center gap-6">
        <PricingCard
          label="Individual"
          monthlyPrice="299"
          description="For developers & individual engineers deploying autonomous agents with microVM sandboxes"
          cta="Start Building"
          background="bg-[#0F3B27]"
          BGComponent={BGComponent1}
        />
        <PricingCard
          label="Company"
          monthlyPrice="999"
          description="For scaling startups and AI engineering teams operating real-time multi-agent swarms"
          cta="Deploy Swarm"
          background="bg-[#0F3B27] ring-2 ring-[#92FF5F]/70 shadow-[0_0_30px_rgba(146,255,95,0.2)]"
          BGComponent={BGComponent2}
        />
        <PricingCard
          label="Enterprise"
          monthlyPrice="4,999"
          description="For large platforms demanding dedicated hardware KMS, custom VPCs, and 99.999% SLA"
          cta="Contact Sales"
          background="bg-[#071F14] border-[#BFF2F0]/30"
          BGComponent={BGComponent3}
        />
      </div>
    </section>
  );
};

export const SquishyPricing = Component;

const PricingCard = ({
  label,
  monthlyPrice,
  description,
  cta,
  background,
  BGComponent,
  onClick,
}: PricingCardProps) => {
  return (
    <motion.div
      whileHover="hover"
      transition={{ duration: 1, ease: 'backInOut' }}
      variants={{ hover: { scale: 1.05 } }}
      className={`relative h-[410px] w-80 shrink-0 overflow-hidden rounded-2xl p-8 ${background} shadow-2xl transition-shadow border border-[#CFF1D2]/20`}
    >
      <div className="relative z-10 text-[#F7F9F7]">
        <span className="mb-3 block w-fit rounded-md bg-[#92FF5F] px-3 py-1 text-xs font-mono font-bold text-[#0F3B27] uppercase tracking-wider shadow-xs">
          {label}
        </span>
        <motion.span
          initial={{ scale: 0.85 }}
          variants={{ hover: { scale: 1 } }}
          transition={{ duration: 1, ease: 'backInOut' }}
          className="my-3 block origin-top-left font-mono text-5xl sm:text-6xl font-black leading-[1.1] tracking-tight text-[#F7F9F7]"
        >
          ${monthlyPrice}/<br />
          <span className="text-2xl sm:text-3xl font-medium tracking-normal text-[#CFF1D2]/80">Month</span>
        </motion.span>
        <p className="text-sm sm:text-base text-[#CFF1D2]/80 font-inter leading-relaxed mt-2">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="absolute bottom-5 left-6 right-6 z-20 rounded-xl border border-[#92FF5F] bg-[#92FF5F] py-2.5 text-center font-mono font-bold text-xs uppercase tracking-wider text-[#0F3B27] backdrop-blur-sm transition-all duration-200 hover:bg-[#92FF5F]/90 focus:outline-none focus:ring-2 focus:ring-[#92FF5F]/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer shadow-md"
      >
        {cta}
      </button>
      <BGComponent />
    </motion.div>
  );
};

const BGComponent1 = () => (
  <motion.svg
    width="320"
    height="384"
    viewBox="0 0 320 384"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.5 } }}
    transition={{ duration: 1, ease: 'backInOut' }}
    className="absolute inset-0 z-0 pointer-events-none"
  >
    <motion.circle
      variants={{ hover: { scaleY: 0.5, y: -25 } }}
      transition={{ duration: 1, ease: 'backInOut', delay: 0.2 }}
      cx="160.5"
      cy="114.5"
      r="101.5"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
    <motion.ellipse
      variants={{ hover: { scaleY: 2.25, y: -25 } }}
      transition={{ duration: 1, ease: 'backInOut', delay: 0.2 }}
      cx="160.5"
      cy="265.5"
      rx="101.5"
      ry="43.5"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
  </motion.svg>
);

const BGComponent2 = () => (
  <motion.svg
    width="320"
    height="384"
    viewBox="0 0 320 384"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.05 } }}
    transition={{ duration: 1, ease: 'backInOut' }}
    className="absolute inset-0 z-0 pointer-events-none"
  >
    <motion.rect
      x="14"
      width="153"
      height="153"
      rx="15"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
      variants={{ hover: { y: 219, rotate: '90deg', scaleX: 2 } }}
      style={{ y: 12 }}
      transition={{ delay: 0.2, duration: 1, ease: 'backInOut' }}
    />
    <motion.rect
      x="155"
      width="153"
      height="153"
      rx="15"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
      variants={{ hover: { y: 12, rotate: '90deg', scaleX: 2 } }}
      style={{ y: 219 }}
      transition={{ delay: 0.2, duration: 1, ease: 'backInOut' }}
    />
  </motion.svg>
);

const BGComponent3 = () => (
  <motion.svg
    width="320"
    height="384"
    viewBox="0 0 320 384"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    variants={{ hover: { scale: 1.25 } }}
    transition={{ duration: 1, ease: 'backInOut' }}
    className="absolute inset-0 z-0 pointer-events-none"
  >
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.3, duration: 1, ease: 'backInOut' }}
      d="M148.893 157.531C154.751 151.673 164.249 151.673 170.107 157.531L267.393 254.818C273.251 260.676 273.251 270.173 267.393 276.031L218.75 324.674C186.027 357.397 132.973 357.397 100.25 324.674L51.6068 276.031C45.7489 270.173 45.7489 260.676 51.6068 254.818L148.893 157.531Z"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.2, duration: 1, ease: 'backInOut' }}
      d="M148.893 99.069C154.751 93.2111 164.249 93.2111 170.107 99.069L267.393 196.356C273.251 202.213 273.251 211.711 267.393 217.569L218.75 266.212C186.027 298.935 132.973 298.935 100.25 266.212L51.6068 217.569C45.7489 211.711 45.7489 202.213 51.6068 196.356L148.893 99.069Z"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
    <motion.path
      variants={{ hover: { y: -50 } }}
      transition={{ delay: 0.1, duration: 1, ease: 'backInOut' }}
      d="M148.893 40.6066C154.751 34.7487 164.249 34.7487 170.107 40.6066L267.393 137.893C273.251 143.751 273.251 153.249 267.393 159.106L218.75 207.75C186.027 240.473 132.973 240.473 100.25 207.75L51.6068 159.106C45.7489 153.249 45.7489 143.751 51.6068 137.893L148.893 40.6066Z"
      fill="rgba(0, 0, 0, 0.2)"
      className="dark:fill-white/10"
    />
  </motion.svg>
);
