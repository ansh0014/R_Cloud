import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/landing/LandingFooter';

export default function TermsPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#05180F] text-[#F7F9F7]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#92FF5F] mb-6">
          <Link to="/" className="hover:underline transition-colors">HOME</Link>
          <span className="text-[#CFF1D2]/40">/</span>
          <span className="text-[#F7F9F7] font-bold">TERMS OF SERVICE</span>
        </div>

        {/* Header */}
        <header className="border-b border-[#CFF1D2]/20 pb-8 mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-manrope text-[#F7F9F7] mb-3">
            Terms of Service
          </h1>
          <p className="text-sm font-mono text-[#CFF1D2]/80">
            Effective Date: October 17, 2026 • Version 2.4
          </p>
        </header>

        {/* Content */}
        <article className="prose prose-invert max-w-none text-[#CFF1D2]/85 font-inter space-y-8 text-sm sm:text-base leading-relaxed">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the <strong className="text-white font-semibold">R_Cloud</strong> autonomous agent execution engine, microVM sandbox orchestrator, developer dashboards, and APIs (collectively, the &quot;Service&quot;). By creating an account or accessing the Service, you agree to be bound by these Terms.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#F7F9F7] border-l-2 border-[#92FF5F] pl-4">
              1. Account Registration & Security
            </h2>
            <div className="space-y-3 pl-4">
              <p>
                To deploy and orchestrate autonomous agents, you must register via verified Google OAuth or authorized single sign-on credentials. You are solely responsible for safeguarding any API keys, KMS tokens, and secrets generated within your workspace.
              </p>
              <p className="text-xs font-mono text-[#92FF5F] bg-[#0F3B27] p-3 rounded-lg border border-[#CFF1D2]/25">
                🛡️ Notification: You must immediately notify R_Cloud security (<a href="mailto:security@rcloud.ai" className="underline text-white">security@rcloud.ai</a>) if you suspect unauthorized access to your agent control plane.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#F7F9F7] border-l-2 border-[#92FF5F] pl-4">
              2. Acceptable Use Policy (AUP)
            </h2>
            <div className="space-y-3 pl-4">
              <p>You agree not to use the R_Cloud runtime to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Deploy malicious agent payloads, automated exploitation bots, or unauthorized network scanners.</li>
                <li>Bypass rate limits, hardware isolation barriers, or KMS encryption layers of the microVM sandboxes.</li>
                <li>Conduct deceptive scraping, distributed denial-of-service (DDoS) floods, or cryptocurrency mining.</li>
                <li>Violate third-party intellectual property, privacy rights, or LLM vendor acceptable use policies (OpenAI, Anthropic, Gemini).</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#F7F9F7] border-l-2 border-[#92FF5F] pl-4">
              3. Service Level Agreement (SLA) & Runtime Uptime
            </h2>
            <div className="space-y-3 pl-4">
              <p>
                For Enterprise tier clusters, R_Cloud provides a <strong className="text-white">99.99% monthly runtime availability SLA</strong> for microVM container orchestrations and NATS streaming buses. Detailed uptime metrics, failover recovery procedures, and service credit allocations are governed by your Enterprise Order Form.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#F7F9F7] border-l-2 border-[#92FF5F] pl-4">
              4. Intellectual Property & Customer Ownership
            </h2>
            <div className="space-y-3 pl-4">
              <p>
                <strong className="text-white">Your Agent Code & Context:</strong> You retain complete, unrestricted ownership of your code repositories, prompt templates, tool definitions, contextual graphs, and trained agent weights deployed on R_Cloud.
              </p>
              <p>
                <strong className="text-white">Platform Rights:</strong> R_Cloud retains all intellectual property rights in the proprietary hypervisor orchestrator, NATS mesh drivers, and UI visualization telemetry interfaces.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#F7F9F7] border-l-2 border-[#92FF5F] pl-4">
              5. Token Billing, Subscriptions & Cancellations
            </h2>
            <div className="space-y-3 pl-4">
              <p>
                Subscription plans, compute minute rates, and token allocations are billed on a monthly or annual billing cycle. You may cancel your subscription at any time via the Control Plane dashboard. Upon termination, your microVM sandboxes will be gracefully terminated within 48 hours.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#F7F9F7] border-l-2 border-[#92FF5F] pl-4">
              6. Limitation of Liability
            </h2>
            <div className="space-y-3 pl-4">
              <p>
                To the maximum extent permitted by applicable law, R_Cloud Technologies Inc. shall not be liable for any indirect, incidental, punitive, or consequential damages arising from autonomous model outputs, third-party LLM API downtime, or network failures.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-[#F7F9F7] border-l-2 border-[#92FF5F] pl-4">
              7. Contact & Legal Inquiries
            </h2>
            <div className="space-y-2 pl-4">
              <p>If you have questions regarding these Terms, contact our legal counsel:</p>
              <div className="font-mono text-xs bg-[#0F3B27] p-4 rounded-lg border border-[#CFF1D2]/25 space-y-1">
                <p className="text-white font-bold">R_Cloud Technologies Inc. — Legal Dept.</p>
                <p>Email: <a href="mailto:legal@rcloud.ai" className="text-[#92FF5F] underline">legal@rcloud.ai</a></p>
                <p>General Inquiries: <a href="mailto:support@rcloud.ai" className="text-[#92FF5F] underline">support@rcloud.ai</a></p>
              </div>
            </div>
          </section>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
