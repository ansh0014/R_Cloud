import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/landing/LandingFooter';

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#020b08] text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/70 mb-6">
          <Link to="/" className="hover:text-emerald-300 transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-white">PRIVACY POLICY</span>
        </div>

        {/* Header */}
        <header className="border-b border-emerald-900/60 pb-8 mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-manrope text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm font-mono text-emerald-400/80">
            Effective Date: October 10, 2026 • Last Updated: October 10, 2026
          </p>
        </header>

        {/* Content */}
        <article className="prose prose-invert max-w-none text-emerald-100/80 font-inter space-y-8 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to <strong className="text-white font-semibold">R_Cloud</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit and use the R_Cloud platform, our AI agent deployment infrastructure, dashboard, and associated developer tools (collectively, the &quot;Service&quot;).
          </p>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-white border-l-2 border-emerald-500 pl-4">
              1. Information We Collect
            </h2>

            <div className="space-y-3 pl-4">
              <h3 className="text-lg font-semibold text-emerald-300">A. Personal Information You Provide</h3>
              <p>
                When you sign in via Google OAuth or other identity providers, we collect your name, email address, profile picture URL, and provider-assigned identifier (<code className="text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded text-xs font-mono">google_subject</code>). We also collect account settings and support inquiries submitted voluntarily.
              </p>

              <h3 className="text-lg font-semibold text-emerald-300 pt-2">B. Repository & Source Code Information</h3>
              <p>
                We process repository URLs, branch names, commit hashes, application manifest configurations (<code className="text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded text-xs font-mono">ragent.yaml</code>), and repository structures strictly to compile, validate, containerize, and deploy your autonomous AI agents.
              </p>
              <p className="text-xs font-mono text-emerald-400 bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/50">
                🔒 Environment secrets and API keys (OpenAI, Anthropic, Gemini, DB credentials) are encrypted at rest with hardware-backed KMS vaults and are never logged or exposed in plain text.
              </p>

              <h3 className="text-lg font-semibold text-emerald-300 pt-2">C. Telemetry & Execution Data</h3>
              <p>
                HTTP request counts, response latency (ms), token consumption logs, container health metrics, and agent error logs generated during deployment and runtime execution are tracked for observability.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-white border-l-2 border-emerald-500 pl-4">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li><strong className="text-white">Service Operation:</strong> Authenticating users, cloning repositories, validating manifests, provisioning microVM containers, and routing agent traffic.</li>
              <li><strong className="text-white">Observability:</strong> Real-time traces, token counters, distributed tracing, and container health dashboards.</li>
              <li><strong className="text-white">Security:</strong> Enforcing rate limits, validating JWT signatures, isolating memory spaces, and preventing abuse.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-white border-l-2 border-emerald-500 pl-4">
              3. Data Storage & Multi-Tenant Isolation
            </h2>
            <p className="pl-4">
              User identity records are isolated in secure PostgreSQL clusters with SSL encryption. Project and deployment records are linked via tenancy-isolated identifiers. Injected secrets are passed directly into ephemeral microVM containers and are never shared across tenant boundaries.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-white border-l-2 border-emerald-500 pl-4">
              4. Data Retention & Deletion Rights
            </h2>
            <p className="pl-4">
              You retain full ownership of your agent repositories and configurations. When you delete a project from R_Cloud, runtime containers are immediately terminated and ephemeral disks are permanently wiped. You may request complete erasure of your account data by contacting <a href="mailto:privacy@rcloud.dev" className="text-emerald-400 underline">privacy@rcloud.dev</a>.
            </p>
          </section>

          <section className="space-y-4 border-t border-emerald-900/40 pt-6">
            <h2 className="text-xl sm:text-2xl font-bold font-manrope text-white">Contact Us</h2>
            <p>
              For privacy queries or data subject access requests:
              <br />
              <strong>Email:</strong> <a href="mailto:privacy@rcloud.dev" className="text-emerald-400">privacy@rcloud.dev</a>
              <br />
              <strong>Security Team:</strong> <a href="mailto:security@rcloud.dev" className="text-emerald-400">security@rcloud.dev</a>
              <br />
              <strong>Website:</strong> <a href="https://rcloud.dev" className="text-emerald-400">https://rcloud.dev</a>
            </p>
          </section>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
