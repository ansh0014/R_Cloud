# Privacy Policy

**Effective Date:** October 10, 2026  
**Last Updated:** October 10, 2026

Welcome to **R_Cloud** ("Company", "we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit and use the R_Cloud platform, our AI agent deployment infrastructure, dashboard, and associated developer tools (collectively, the "Service").

Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access or use our Service.

---

## 1. Information We Collect

### A. Personal Information You Provide to Us
- **Authentication Credentials:** When you sign in via Google OAuth or other OAuth identity providers, we collect your name, email address, profile picture URL, and provider-assigned identifier (`google_subject`).
- **Account Settings & Profile:** Basic profile information associated with your account on R_Cloud.
- **Support & Feedback:** Information you voluntarily provide when contacting customer support or submitting feedback.

### B. Repository & Source Code Information
- **Git Metadata & Repositories:** Repository URLs, branch names, commit hashes, application manifest configurations (`ragent.yaml`), and repository structures necessary to compile, validate, containerize, and deploy your AI agents.
- **Environment Variables & Secrets:** API keys (such as OpenAI, Google Gemini, Anthropic), database connection strings, and application configuration variables you supply for agent runtimes. *Environment secrets are encrypted at rest and never logged in plain text.*

### C. Automatically Collected Usage & Telemetry Data
- **Agent Execution Logs & Traces:** HTTP request counts, response latency (ms), token consumption counts, container health metrics, and agent error logs generated during deployment and runtime proxy execution.
- **Device & Log Data:** IP address, browser type, operating system, referring URLs, access timestamps, and interactions with our dashboard.
- **WebSocket Activity:** Connection and event subscription status for real-time deployment and agent state streaming.

---

## 2. How We Use Your Information

We process your data for lawful purposes including:
1. **Providing & Operating the Service:** Authenticating users, cloning authorized repositories, validating manifests (`ragent.yaml`), provisioning runtime containers, and routing agent execution traffic.
2. **Monitoring & Observability:** Displaying real-time execution logs, request latency, token consumption, and agent health metrics within your dashboard.
3. **Security & Abuse Prevention:** Enforcing API rate limits, validating JSON Web Tokens (JWT), preventing unauthorized access, and guarding against denial-of-service threats.
4. **Platform Improvements:** Diagnosing infrastructure bottlenecks, improving deployment speed, and enhancing AI repository validation agents.

---

## 3. Data Storage, Security & Encryption

- **Database Separation:** User identity records are isolated in secure PostgreSQL databases with SSL encryption. Project, deployment, and runtime records are strictly linked through tenancy-isolated identifiers.
- **Secrets Management:** Injected environment variables and LLM keys are passed directly into ephemeral container runtimes and are not shared across tenant workspaces.
- **Encryption:** All network transit is protected by Transport Layer Security (TLS 1.3/HTTPS and WSS). Data at rest in primary database stores is encrypted.

---

## 4. Sharing & Disclosure of Information

We **do not** sell, rent, or trade your personal information or source code. We disclose information only under the following circumstances:
- **Cloud Infrastructure & Service Providers:** Trusted third-party hosting, container orchestration (e.g., Railway, AWS), and managed database providers who assist in operating R_Cloud under strict confidentiality and security agreements.
- **AI Model Providers (Third-Party):** When your agents call external LLMs (e.g., Google Gemini, OpenAI), requests pass according to your agent's configuration and the respective provider's terms.
- **Legal Compliance:** If required by law, subpoena, or valid regulatory directive.

---

## 5. Data Retention & Deletion

- **Account Data:** Retained as long as your account remains active.
- **Deployment Records & Code:** You can delete your projects or deployments from R_Cloud at any time. When a project is deleted, associated runtime containers are terminated, and temporary clone directories are wiped.
- **Data Deletion Requests:** You may request complete erasure of your personal data by contacting `privacy@rcloud.dev`.

---

## 6. Your Rights & Choices

Depending on your jurisdiction (such as GDPR or CCPA), you may have the right to:
- Access, review, or obtain a copy of your personal data.
- Request correction of inaccurate information.
- Request deletion of your account and associated records.
- Revoke OAuth access through your Google Account settings.

---

## 7. Third-Party Services & Links

Our platform may integrate with third-party platforms (such as GitHub, Google Identity, Railway, and Vercel). We are not responsible for the privacy practices of external services. We encourage you to review their respective privacy policies.

---

## 8. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the "Last Updated" date at the top of this document or via email/dashboard banner notifications.

---

## 9. Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy:
- **Email:** `privacy@rcloud.dev`
- **Security:** `security@rcloud.dev`
- **Website:** `https://rcloud.dev`
