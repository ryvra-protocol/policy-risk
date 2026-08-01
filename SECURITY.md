# Security Policy

## Reporting vulnerabilities
Report potential vulnerabilities privately via GitHub Security Advisories or the designated security contact channel.

Include:
- affected component/path
- impact summary
- reproduction details
- mitigation suggestions (if available)

Do not publicly disclose exploitable details before coordinated remediation.

## Triage and response SLA
- Initial acknowledgment: within 24 hours
- Triage severity assignment: within 2 business days
- Containment plan for Sev1/Sev2: same day when confirmed
- Remediation target:
  - Sev1: immediate mitigation and patch as fast as possible
  - Sev2: patch target within 7 days
  - Sev3/Sev4: patch target within normal release cadence

## Severity levels
- Severity 1 (Critical): active exploit with material protocol risk
- Severity 2 (High): likely exploit path with strong impact potential
- Severity 3 (Medium): constrained exploitability or mitigated impact
- Severity 4 (Low): hard-to-exploit or limited impact findings

## Policy integrity and abuse escalation
This repository defines policy decision logic and interfaces. Integrity of policy artifacts (`decision`, `reason_codes`, `policy_version`) is security-sensitive. Suspected policy bypass or abuse-evasion attempts must be escalated through incident response immediately.
