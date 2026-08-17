# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of **inQUIZitive**:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Client-Side Security & Data Privacy

**inQUIZitive** is engineered as a **100% client-side Progressive Web App (PWA)**.

- **Zero External Data Transmission**: All quiz questions, loaded `.xlsx` spreadsheets, team scores, audio preferences, and application states are processed and stored strictly within your local browser (`localStorage`).
- **No Telemetry or Tracking**: The application does not collect, record, or transmit user data, quiz content, or usage analytics to any external remote servers or third-party tracking services.
- **Offline Security**: Because the app functions entirely offline, live event data is protected against public Wi-Fi interception or cloud service outages during live presentations.

---

## Host Admin Passcode Notice

The application features an administrative passcode lock to protect host-only controls (e.g., question bank resets and score modifications) during stage events.

> ⚠️ **Important Notice for Event Hosts**: Since inQUIZitive executes locally in the client browser, administrative locks are designed to prevent casual participant tampering during live events. Hosts should update default passcodes in **Settings** prior to hosting public competitions.

---

## Reporting a Vulnerability

If you discover a potential security vulnerability within **inQUIZitive**, we appreciate your help in disclosing it responsibly.

### How to Report

Please **do not** open a public GitHub issue for security vulnerabilities. Instead:

1. **GitHub Private Security Advisory**: Submit a private disclosure through the [GitHub Vulnerability Reporting](https://github.com/denzven/inQUIZitive/security/advisories/new) tab.
2. **Direct Maintainer Contact**: Reach out to the maintainer via GitHub profile contact options.

### What to Include in Your Report:
- A clear description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
- Any recommended mitigation or fix steps.

---

## Response & Patch Timeline

When a security vulnerability is reported:

1. **Acknowledgement**: Receipt of your report will be acknowledged within **48 hours**.
2. **Assessment & Resolution**: The report will be investigated, and if verified, a security fix will be committed to the `main` branch within **7 days**.
3. **Public Credit**: Responsible reporters will be credited in the security advisory release notes (unless anonymity is requested).

---

Thank you for helping keep **inQUIZitive** safe and secure!
