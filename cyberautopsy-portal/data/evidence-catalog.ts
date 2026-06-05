/**
 * CMMC Level 2 acceptable-evidence catalog.
 *
 * For each of the 110 NIST 800-171 Rev. 2 controls, this catalog lists the
 * canonical artifacts an assessor expects to see and explains why those
 * artifacts together are sufficient to support a passing assessment
 * objective for that control.
 *
 * Keys are the SSP §-section numeric IDs (e.g. "3.1.1") so they line up with
 * Control.sspSection in data/controls110.ts. The `cmmcLabel` field carries
 * the formal CMMC label (e.g. "AC.L1-3.1.1") for display.
 *
 * Source: CyberAutopsy RPO assessor handbook. Justifications are written for
 * the assessor's defence to the C3PAO + the senior official's affirmation,
 * not as marketing copy. Keep them tight.
 */

export type EvidenceCatalogEntry = {
  controlId: string;       // SSP-section ID, matches Control.sspSection
  cmmcLabel: string;       // formal CMMC label, e.g. "AC.L1-3.1.1"
  artifacts: string[];     // canonical artifacts an assessor expects
  justification: string;   // why these artifacts together suffice
};

export const EVIDENCE_CATALOG: Record<string, EvidenceCatalogEntry> = {
  /* ---------- AC — Access Control ---------- */
  "3.1.1": {
    controlId: "3.1.1",
    cmmcLabel: "AC.L1-3.1.1",
    artifacts: ["Access Control Policy", "AD user export", "New hire ticket"],
    justification:
      "Policy defines the rule. AD export proves only authorized users exist. Ticket shows the joiner process was followed. Together they cover design + implementation + operation."
  },
  "3.1.2": {
    controlId: "3.1.2",
    cmmcLabel: "AC.L1-3.1.2",
    artifacts: ["RBAC matrix", "System permission screenshots", "Privileged access ticket"],
    justification:
      "Matrix documents approved functions. Screenshots prove technical enforcement. Ticket shows exception handling."
  },
  "3.1.3": {
    controlId: "3.1.3",
    cmmcLabel: "AC.L2-3.1.3",
    artifacts: ["CUI Data Flow Diagram", "Firewall / DLP rules", "Network enclave diagram"],
    justification:
      "DFD shows the CUI flow by design. Firewall / DLP rules prove the technical control. Enclave diagram proves boundaries are defined."
  },
  "3.1.4": {
    controlId: "3.1.4",
    cmmcLabel: "AC.L2-3.1.4",
    artifacts: ["Segregation of Duties matrix", "Job descriptions", "Audit logs of admin actions"],
    justification:
      "SoD matrix defines the separation. Job descriptions assign roles. Logs prove no single person can execute critical functions alone."
  },
  "3.1.5": {
    controlId: "3.1.5",
    cmmcLabel: "AC.L2-3.1.5",
    artifacts: ["Quarterly access reviews", "Privileged account inventory", "Local admin group screenshots"],
    justification:
      "Reviews prove periodic validation of least privilege. Inventory tracks privilege. Screenshots prove endpoints are hardened."
  },
  "3.1.6": {
    controlId: "3.1.6",
    cmmcLabel: "AC.L2-3.1.6",
    artifacts: ["Privileged access policy", "Admin workstation logs showing separate accounts"],
    justification:
      "Policy mandates separate accounts. Logs prove admins use a non-privileged account for email and web."
  },
  "3.1.7": {
    controlId: "3.1.7",
    cmmcLabel: "AC.L2-3.1.7",
    artifacts: ["Sudo / PAM config", "SIEM alerts for privilege-escalation attempts"],
    justification:
      "Config technically blocks non-privileged users from privileged functions. SIEM proves monitoring and capture of violations."
  },
  "3.1.8": {
    controlId: "3.1.8",
    cmmcLabel: "AC.L2-3.1.8",
    artifacts: ["Password policy", "GPO / Intune lockout config", "Account-lockout event logs"],
    justification:
      "Policy sets the threshold. Config enforces the lockout. Logs prove it triggers on failed attempts."
  },
  "3.1.9": {
    controlId: "3.1.9",
    cmmcLabel: "AC.L2-3.1.9",
    artifacts: ["System-use banner screenshot", "Banner config on all CUI systems"],
    justification:
      "Screenshot proves the banner is present. Config shows it is deployed org-wide on CUI assets."
  },
  "3.1.10": {
    controlId: "3.1.10",
    cmmcLabel: "AC.L2-3.1.10",
    artifacts: ["Session-lock policy", "GPO screenshot of 15-min lock", "User demo"],
    justification:
      "Policy sets the 15-minute standard. GPO proves enforcement. Demo proves pattern-hiding works."
  },
  "3.1.11": {
    controlId: "3.1.11",
    cmmcLabel: "AC.L2-3.1.11",
    artifacts: ["Session-timeout config", "VPN idle disconnect logs"],
    justification:
      "Config defines the condition. Logs prove sessions terminate automatically after the idle period."
  },
  "3.1.12": {
    controlId: "3.1.12",
    cmmcLabel: "AC.L2-3.1.12",
    artifacts: ["Remote-access policy", "VPN config with MFA", "90-day VPN logs"],
    justification:
      "Policy sets MFA and monitoring. Config enforces it. Logs prove remote sessions are logged and controlled."
  },
  "3.1.13": {
    controlId: "3.1.13",
    cmmcLabel: "AC.L2-3.1.13",
    artifacts: ["Encryption standard", "VPN tunnel config showing AES-256", "Packet capture"],
    justification:
      "Standard defines the crypto. Config proves the implementation. PCAP proves traffic is encrypted in transit."
  },
  "3.1.14": {
    controlId: "3.1.14",
    cmmcLabel: "AC.L2-3.1.14",
    artifacts: ["Network diagram", "Firewall rules allowing VPN only via concentrator"],
    justification:
      "Diagram shows managed access points. FW rules prove no split-tunnel or direct access."
  },
  "3.1.15": {
    controlId: "3.1.15",
    cmmcLabel: "AC.L2-3.1.15",
    artifacts: ["Privileged remote-access procedure", "Approval tickets", "Session-recording samples"],
    justification:
      "Procedure requires approval. Tickets prove authorization. Recordings prove oversight."
  },
  "3.1.16": {
    controlId: "3.1.16",
    cmmcLabel: "AC.L2-3.1.16",
    artifacts: ["Wireless policy", "NAC / 802.1X config", "Authorized AP inventory"],
    justification:
      "Policy requires authentication. NAC proves only authorized devices connect. Inventory tracks approved APs."
  },
  "3.1.17": {
    controlId: "3.1.17",
    cmmcLabel: "AC.L2-3.1.17",
    artifacts: ["Wireless-encryption standard", "WAP config showing WPA3", "Wireless scan report"],
    justification:
      "Standard mandates WPA3. Config proves it. Scan proves no open / weak SSIDs in CUI areas."
  },
  "3.1.18": {
    controlId: "3.1.18",
    cmmcLabel: "AC.L2-3.1.18",
    artifacts: ["Mobile-device policy", "MDM enrolment report", "Blocked-device logs"],
    justification:
      "Policy defines the control. MDM proves enrolment. Logs prove unauthorized devices are blocked."
  },
  "3.1.19": {
    controlId: "3.1.19",
    cmmcLabel: "AC.L2-3.1.19",
    artifacts: ["Mobile-encryption policy", "MDM config showing AES-256", "Device-compliance report"],
    justification:
      "Policy requires encryption. MDM enforces. Compliance report proves devices are encrypted."
  },
  "3.1.20": {
    controlId: "3.1.20",
    cmmcLabel: "AC.L2-3.1.20",
    artifacts: ["External-system-connection policy", "Firewall allow-list", "Connection approval tickets"],
    justification:
      "Policy requires vetting. FW proves the technical limit. Tickets prove business approval."
  },
  "3.1.21": {
    controlId: "3.1.21",
    cmmcLabel: "AC.L2-3.1.21",
    artifacts: ["Removable-media policy", "GPO blocking USB", "DLP logs of blocked writes"],
    justification:
      "Policy prohibits use. GPO enforces the block. Logs prove attempts are blocked."
  },
  "3.1.22": {
    controlId: "3.1.22",
    cmmcLabel: "AC.L2-3.1.22",
    artifacts: ["Public-posting policy", "DLP rules for CUI keywords", "Training attestation"],
    justification:
      "Policy bans CUI on public sites. DLP enforces. Training proves users are aware."
  },

  /* ---------- AT — Awareness & Training ---------- */
  "3.2.1": {
    controlId: "3.2.1",
    cmmcLabel: "AT.L2-3.2.1",
    artifacts: ["Security-awareness program doc", "New-hire training completion records"],
    justification:
      "Doc defines audience and roles. Records prove managers, admins, and users received training."
  },
  "3.2.2": {
    controlId: "3.2.2",
    cmmcLabel: "AT.L2-3.2.2",
    artifacts: ["Role-based training matrix", "Admin cert records", "Training content samples"],
    justification:
      "Matrix maps duties to training. Certs prove completion. Content proves relevance."
  },
  "3.2.3": {
    controlId: "3.2.3",
    cmmcLabel: "AT.L2-3.2.3",
    artifacts: ["Insider-threat training module", "Quiz scores", "Reporting procedure"],
    justification:
      "Module covers indicators. Scores prove comprehension. Procedure proves a reporting channel exists."
  },

  /* ---------- AU — Audit & Accountability ---------- */
  "3.3.1": {
    controlId: "3.3.1",
    cmmcLabel: "AU.L2-3.3.1",
    artifacts: ["Logging procedure", "SIEM ingestion screenshot", "1-year retention config"],
    justification:
      "Procedure defines logged events. SIEM proves collection. Config proves retention per requirement."
  },
  "3.3.2": {
    controlId: "3.3.2",
    cmmcLabel: "AU.L2-3.3.2",
    artifacts: ["Unique-ID policy", "AD naming standard", "Sample logs with user ID + timestamp"],
    justification:
      "Policy bans shared accounts. Standard enforces naming. Logs prove traceability."
  },
  "3.3.3": {
    controlId: "3.3.3",
    cmmcLabel: "AU.L2-3.3.3",
    artifacts: ["Log-review SOP", "Quarterly log-review reports with sign-off"],
    justification:
      "SOP defines the review cadence. Reports prove reviews occur and are signed."
  },
  "3.3.4": {
    controlId: "3.3.4",
    cmmcLabel: "AU.L2-3.3.4",
    artifacts: ["SIEM alert for log failure", "Test result showing alert sent"],
    justification:
      "Alert proves monitoring of logging itself. Test proves it triggers on failure."
  },
  "3.3.5": {
    controlId: "3.3.5",
    cmmcLabel: "AU.L2-3.3.5",
    artifacts: ["SOC correlation rules", "Investigation ticket using correlated logs"],
    justification:
      "Rules show capability. Ticket proves correlation is used for actual incidents."
  },
  "3.3.6": {
    controlId: "3.3.6",
    cmmcLabel: "AU.L2-3.3.6",
    artifacts: ["SIEM dashboard", "On-demand report for user activity"],
    justification:
      "Dashboard proves the reduction capability. Report proves on-demand generation works."
  },
  "3.3.7": {
    controlId: "3.3.7",
    cmmcLabel: "AU.L2-3.3.7",
    artifacts: ["NTP policy", "Domain-controller config pointing to time.nist.gov", "Time-sync logs"],
    justification:
      "Policy requires sync. Config proves the source. Logs prove clocks are aligned."
  },
  "3.3.8": {
    controlId: "3.3.8",
    cmmcLabel: "AU.L2-3.3.8",
    artifacts: ["Log RBAC config", "WORM / immutable storage setting", "Failed-deletion screenshot"],
    justification:
      "RBAC limits access. WORM prevents alteration. Screenshot proves tamper protection."
  },
  "3.3.9": {
    controlId: "3.3.9",
    cmmcLabel: "AU.L2-3.3.9",
    artifacts: ["SIEM admin-group membership", "Change tickets for log config"],
    justification:
      "Group shows the limited admin set. Tickets prove changes are controlled and approved."
  },

  /* ---------- CM — Configuration Management ---------- */
  "3.4.1": {
    controlId: "3.4.1",
    cmmcLabel: "CM.L2-3.4.1",
    artifacts: ["Baseline config doc", "Gold-image inventory", "Deviation report"],
    justification:
      "Doc defines the baseline. Inventory proves use. Report proves monitoring."
  },
  "3.4.2": {
    controlId: "3.4.2",
    cmmcLabel: "CM.L2-3.4.2",
    artifacts: ["Change-management procedure", "Sample CR with approval / test / rollback"],
    justification:
      "Procedure defines the process. The CR proves it is followed for security-impacting changes."
  },
  "3.4.3": {
    controlId: "3.4.3",
    cmmcLabel: "CM.L2-3.4.3",
    artifacts: ["Change-impact SOP", "CR showing security-review sign-off"],
    justification:
      "SOP requires analysis. The CR proves the security review occurred before the change."
  },
  "3.4.4": {
    controlId: "3.4.4",
    cmmcLabel: "CM.L2-3.4.4",
    artifacts: ["Access-restriction list for config settings", "PAM logs of config access"],
    justification:
      "List defines who can change. Logs prove only authorized admins accessed it."
  },
  "3.4.5": {
    controlId: "3.4.5",
    cmmcLabel: "CM.L2-3.4.5",
    artifacts: ["Least-functionality policy", "Installed-software inventory", "Removal tickets"],
    justification:
      "Policy mandates a minimal footprint. Inventory proves compliance. Tickets prove the removal process."
  },
  "3.4.6": {
    controlId: "3.4.6",
    cmmcLabel: "CM.L2-3.4.6",
    artifacts: ["Software allow-list", "AppLocker / WDAC config", "Blocked-execution logs"],
    justification:
      "Policy defines allowed software. Config enforces. Logs prove unauthorized apps are blocked."
  },
  "3.4.7": {
    controlId: "3.4.7",
    cmmcLabel: "CM.L2-3.4.7",
    artifacts: ["User software-install policy", "Admin-rights report", "Software-request ticket"],
    justification:
      "Policy restricts installs. Report proves users are not local admins. Ticket proves the approval path."
  },
  "3.4.8": {
    controlId: "3.4.8",
    cmmcLabel: "CM.L2-3.4.8",
    artifacts: ["Grey-list", "Exception approval", "Monitoring dashboard"],
    justification:
      "Grey-list defines restricted software. Approval proves the control. Dashboard proves monitoring."
  },
  "3.4.9": {
    controlId: "3.4.9",
    cmmcLabel: "CM.L2-3.4.9",
    artifacts: ["Asset inventory", "Network scan", "Reconciliation report"],
    justification:
      "Inventory lists assets. Scan verifies. Reconciliation proves accuracy and updates."
  },

  /* ---------- IA — Identification & Authentication ---------- */
  "3.5.1": {
    controlId: "3.5.1",
    cmmcLabel: "IA.L2-3.5.1",
    artifacts: ["ID management procedure", "AD account-lifecycle tickets"],
    justification:
      "Procedure defines creation and disable. Tickets prove the process for joiners, movers, and leavers."
  },
  "3.5.2": {
    controlId: "3.5.2",
    cmmcLabel: "IA.L2-3.5.2",
    artifacts: ["Auth policy", "System config showing unique auth", "Test login"],
    justification:
      "Policy requires authentication. Config proves enforcement. Test proves it works."
  },
  "3.5.3": {
    controlId: "3.5.3",
    cmmcLabel: "IA.L2-3.5.3",
    artifacts: ["MFA policy", "Entra ID CA policy for admins", "Sign-in logs with MFA"],
    justification:
      "Policy mandates MFA. Config enforces. Logs prove challenges occur."
  },
  "3.5.4": {
    controlId: "3.5.4",
    cmmcLabel: "IA.L2-3.5.4",
    artifacts: ["Replay-resistant standard", "MFA-type list", "Vendor docs"],
    justification:
      "Standard defines the requirement. List proves methods used. Docs prove replay-resistance."
  },
  "3.5.5": {
    controlId: "3.5.5",
    cmmcLabel: "IA.L2-3.5.5",
    artifacts: ["ID-reuse-prevention policy", "AD tombstone / config", "Rehire test"],
    justification:
      "Policy bans reuse. Config prevents it. Test proves an old ID is not reassigned."
  },
  "3.5.6": {
    controlId: "3.5.6",
    cmmcLabel: "IA.L2-3.5.6",
    artifacts: ["Min-password standard", "GPO fine-grained policy", "Password-audit report"],
    justification:
      "Standard defines the minimum. GPO enforces. Audit proves compliance."
  },
  "3.5.7": {
    controlId: "3.5.7",
    cmmcLabel: "IA.L2-3.5.7",
    artifacts: ["Password-complexity policy", "GPO config", "Crack-test results"],
    justification:
      "Policy defines complexity. GPO enforces. Test proves weak passwords are rejected."
  },
  "3.5.8": {
    controlId: "3.5.8",
    cmmcLabel: "IA.L2-3.5.8",
    artifacts: ["Alt-auth policy", "Temporary-password procedure", "Expiration logs"],
    justification:
      "Policy allows temp credentials. Procedure enforces change. Logs prove expiration."
  },
  "3.5.9": {
    controlId: "3.5.9",
    cmmcLabel: "IA.L2-3.5.9",
    artifacts: ["Obscure-feedback policy", "System screenshot", "Login test"],
    justification:
      "Policy requires masking. Screenshot proves config. Test proves no information disclosure."
  },
  "3.5.10": {
    controlId: "3.5.10",
    cmmcLabel: "IA.L2-3.5.10",
    artifacts: ["Crypto-auth standard", "Cert-based VPN config", "PKI policy"],
    justification:
      "Standard requires crypto. Config proves cert use. PKI proves key management."
  },
  "3.5.11": {
    controlId: "3.5.11",
    cmmcLabel: "IA.L2-3.5.11",
    artifacts: ["Auth-lifecycle procedure", "Authenticator inventory", "Revocation tickets"],
    justification:
      "Procedure covers the lifecycle. Inventory tracks. Tickets prove revocation on exit."
  },

  /* ---------- IR — Incident Response ---------- */
  "3.6.1": {
    controlId: "3.6.1",
    cmmcLabel: "IR.L2-3.6.1",
    artifacts: ["IR Plan", "Tabletop exercise report", "Contact list"],
    justification:
      "Plan defines the process. TTX proves testing. Contacts prove operational readiness."
  },
  "3.6.2": {
    controlId: "3.6.2",
    cmmcLabel: "IR.L2-3.6.2",
    artifacts: ["Incident-handling SOP", "Sample incident ticket", "Lessons-learned doc"],
    justification:
      "SOP defines the steps. Ticket proves use. Lessons learned prove improvement."
  },
  "3.6.3": {
    controlId: "3.6.3",
    cmmcLabel: "IR.L2-3.6.3",
    artifacts: ["Incident-testing policy", "Annual TTX report", "After-action report"],
    justification:
      "Policy requires test. TTX proves execution. AAR proves findings were addressed."
  },

  /* ---------- MA — Maintenance ---------- */
  "3.7.1": {
    controlId: "3.7.1",
    cmmcLabel: "MA.L2-3.7.1",
    artifacts: ["Maintenance policy", "Approved-vendor list", "Maintenance tickets"],
    justification:
      "Policy controls maintenance. List limits who. Tickets prove tracking."
  },
  "3.7.2": {
    controlId: "3.7.2",
    cmmcLabel: "MA.L2-3.7.2",
    artifacts: ["Maintenance-control SOP", "MFA for remote maintenance", "Session logs"],
    justification:
      "SOP defines controls. MFA is enforced. Logs prove monitoring."
  },
  "3.7.3": {
    controlId: "3.7.3",
    cmmcLabel: "MA.L2-3.7.3",
    artifacts: ["Media-sanitization procedure", "Sanitization certs / logs"],
    justification:
      "Procedure defines the wipe. Certs prove execution before removal."
  },
  "3.7.4": {
    controlId: "3.7.4",
    cmmcLabel: "MA.L2-3.7.4",
    artifacts: ["Offsite-maint policy", "Escort logs", "Equipment-custody forms"],
    justification:
      "Policy requires control. Logs prove escort. Forms prove tracking."
  },
  "3.7.5": {
    controlId: "3.7.5",
    cmmcLabel: "MA.L2-3.7.5",
    artifacts: ["Maintenance-tool policy", "Check-in / out log", "Scan before connect"],
    justification:
      "Policy controls tools. Log tracks. Scan proves a malware check."
  },
  "3.7.6": {
    controlId: "3.7.6",
    cmmcLabel: "MA.L2-3.7.6",
    artifacts: ["Remote-maint approval procedure", "Approval tickets", "Session-termination logs"],
    justification:
      "Procedure requires approval. Tickets prove it. Logs prove termination."
  },

  /* ---------- MP — Media Protection ---------- */
  "3.8.1": {
    controlId: "3.8.1",
    cmmcLabel: "MP.L2-3.8.1",
    artifacts: ["Media-protection policy", "Encrypted USB inventory", "Storage-location photos"],
    justification:
      "Policy defines protection. Inventory proves encryption. Photos prove physical control."
  },
  "3.8.2": {
    controlId: "3.8.2",
    cmmcLabel: "MP.L2-3.8.2",
    artifacts: ["Media-access procedure", "Access log", "Authorization forms"],
    justification:
      "Procedure limits access. Log tracks who. Forms prove approval."
  },
  "3.8.3": {
    controlId: "3.8.3",
    cmmcLabel: "MP.L2-3.8.3",
    artifacts: ["Sanitization standard", "NIST 800-88 certs", "Witnessed-destruction logs"],
    justification:
      "Standard defines the method. Certs prove execution. Logs prove witness."
  },
  "3.8.4": {
    controlId: "3.8.4",
    cmmcLabel: "MP.L2-3.8.4",
    artifacts: ["Media-marking procedure", "Sample labelled media", "Storage photos"],
    justification:
      "Procedure requires marking. Sample proves labelling. Photos prove control."
  },
  "3.8.5": {
    controlId: "3.8.5",
    cmmcLabel: "MP.L2-3.8.5",
    artifacts: ["Media-transport policy", "Chain-of-custody forms", "Encryption proof"],
    justification:
      "Policy controls transport. Forms track. Encryption proves protection."
  },
  "3.8.6": {
    controlId: "3.8.6",
    cmmcLabel: "MP.L2-3.8.6",
    artifacts: ["Portable-device control policy", "DLP blocking USB", "Exception tickets"],
    justification:
      "Policy restricts. DLP enforces. Tickets prove managed exceptions."
  },
  "3.8.7": {
    controlId: "3.8.7",
    cmmcLabel: "MP.L2-3.8.7",
    artifacts: ["Backup-media policy", "Offsite-storage contract", "Inventory logs"],
    justification:
      "Policy defines control. Contract proves offsite. Logs track media."
  },
  "3.8.8": {
    controlId: "3.8.8",
    cmmcLabel: "MP.L2-3.8.8",
    artifacts: ["Media-use prohibition policy", "Network shares for CUI", "USB block logs"],
    justification:
      "Policy prohibits media. Shares provide the alternative. Logs prove enforcement."
  },
  "3.8.9": {
    controlId: "3.8.9",
    cmmcLabel: "MP.L2-3.8.9",
    artifacts: ["CUI protection policy", "System screenshots of CUI stores", "Access logs"],
    justification:
      "Policy defines protection. Screenshots prove location. Logs prove access control."
  },

  /* ---------- PS — Personnel Security ---------- */
  "3.9.1": {
    controlId: "3.9.1",
    cmmcLabel: "PS.L2-3.9.1",
    artifacts: ["Personnel-screening policy", "Background-check records", "Role-risk list"],
    justification:
      "Policy requires screening. Records prove completion. List ties level to risk."
  },
  "3.9.2": {
    controlId: "3.9.2",
    cmmcLabel: "PS.L2-3.9.2",
    artifacts: ["Personnel-protection policy", "Access-termination checklist", "Deactivation logs"],
    justification:
      "Policy defines the action. Checklist proves execution. Logs prove timely disable."
  },

  /* ---------- PE — Physical Protection ---------- */
  "3.10.1": {
    controlId: "3.10.1",
    cmmcLabel: "PE.L2-3.10.1",
    artifacts: ["Physical-access policy", "Badge-system report", "Visitor log"],
    justification:
      "Policy limits access. Badge proves control. Log tracks visitors."
  },
  "3.10.2": {
    controlId: "3.10.2",
    cmmcLabel: "PE.L2-3.10.2",
    artifacts: ["Facility-monitoring SOP", "Camera-footage samples", "Guard logs"],
    justification:
      "SOP requires monitoring. Footage proves coverage. Logs prove patrols."
  },
  "3.10.3": {
    controlId: "3.10.3",
    cmmcLabel: "PE.L2-3.10.3",
    artifacts: ["Visitor-escort policy", "Signed visitor logs", "Badge photos"],
    justification:
      "Policy requires escort. Logs prove execution. Photos prove badging."
  },
  "3.10.4": {
    controlId: "3.10.4",
    cmmcLabel: "PE.L2-3.10.4",
    artifacts: ["Access-log review procedure", "Quarterly review report"],
    justification:
      "Procedure requires review. Report proves it occurs with findings."
  },
  "3.10.5": {
    controlId: "3.10.5",
    cmmcLabel: "PE.L2-3.10.5",
    artifacts: ["Physical-key inventory", "Access list", "Key-issue log"],
    justification:
      "Inventory tracks keys. List limits holders. Log proves issuance control."
  },
  "3.10.6": {
    controlId: "3.10.6",
    cmmcLabel: "PE.L2-3.10.6",
    artifacts: ["Alt-work-site policy", "Home-office checklist", "Signed agreements"],
    justification:
      "Policy defines standards. Checklist proves assessment. Agreements prove accountability."
  },

  /* ---------- RA — Risk Assessment ---------- */
  "3.11.1": {
    controlId: "3.11.1",
    cmmcLabel: "RA.L2-3.11.1",
    artifacts: ["Risk-assessment procedure", "Annual risk-assessment report"],
    justification:
      "Procedure defines the method. Report proves execution and risk identification."
  },
  "3.11.2": {
    controlId: "3.11.2",
    cmmcLabel: "RA.L2-3.11.2",
    artifacts: ["Vuln-scan policy", "Quarterly Nessus reports", "Remediation tickets"],
    justification:
      "Policy requires scans. Reports prove execution. Tickets prove remediation."
  },
  "3.11.3": {
    controlId: "3.11.3",
    cmmcLabel: "RA.L2-3.11.3",
    artifacts: ["Vuln-remediation SOP", "SLA tracking", "Exception approvals"],
    justification:
      "SOP defines timelines. Tracking proves SLA. Exceptions prove risk acceptance."
  },

  /* ---------- CA — Security Assessment ---------- */
  "3.12.1": {
    controlId: "3.12.1",
    cmmcLabel: "CA.L2-3.12.1",
    artifacts: ["Security-assessment policy", "Annual assessment report", "POA&M"],
    justification:
      "Policy requires assessment. Report proves execution. POA&M tracks remediation."
  },
  "3.12.2": {
    controlId: "3.12.2",
    cmmcLabel: "CA.L2-3.12.2",
    artifacts: ["Plan-of-Action SOP", "POA&M tracker", "Closure evidence"],
    justification:
      "SOP defines POA&M. Tracker shows status. Evidence proves closure."
  },
  "3.12.3": {
    controlId: "3.12.3",
    cmmcLabel: "CA.L2-3.12.3",
    artifacts: ["Continuous-monitoring strategy", "Dashboard", "Monthly review minutes"],
    justification:
      "Strategy defines the approach. Dashboard proves monitoring. Minutes prove review."
  },
  "3.12.4": {
    controlId: "3.12.4",
    cmmcLabel: "CA.L2-3.12.4",
    artifacts: ["SSP template", "Current SSP", "Last review sign-off"],
    justification:
      "Template ensures coverage. SSP documents controls. Sign-off proves review."
  },

  /* ---------- SC — System & Communications Protection ---------- */
  "3.13.1": {
    controlId: "3.13.1",
    cmmcLabel: "SC.L2-3.13.1",
    artifacts: ["Boundary-protection policy", "Network diagram", "Firewall rule export"],
    justification:
      "Policy defines boundaries. Diagram maps them. FW proves enforcement."
  },
  "3.13.2": {
    controlId: "3.13.2",
    cmmcLabel: "SC.L2-3.13.2",
    artifacts: ["Security engineering principles", "Architecture review records"],
    justification:
      "Principles guide design. Reviews prove they are applied to CUI systems."
  },
  "3.13.3": {
    controlId: "3.13.3",
    cmmcLabel: "SC.L2-3.13.3",
    artifacts: ["Role-separation doc", "Network-segmentation diagram", "VLAN config"],
    justification:
      "Doc defines separation. Diagram shows it. Config proves technical enforcement."
  },
  "3.13.4": {
    controlId: "3.13.4",
    cmmcLabel: "SC.L2-3.13.4",
    artifacts: ["Info-in-shared-resources policy", "VDI / memory-isolation config"],
    justification:
      "Policy prohibits leakage. Config proves memory / CPU isolation."
  },
  "3.13.5": {
    controlId: "3.13.5",
    cmmcLabel: "SC.L2-3.13.5",
    artifacts: ["Traffic-control policy", "Internal FW rules", "Block logs"],
    justification:
      "Policy defines what is allowed. Rules enforce. Logs prove deny-by-default."
  },
  "3.13.6": {
    controlId: "3.13.6",
    cmmcLabel: "SC.L2-3.13.6",
    artifacts: ["Split-tunnelling policy", "VPN config disabling split tunnel", "Test result"],
    justification:
      "Policy prohibits split-tunnel. Config disables. Test proves traffic routes via VPN."
  },
  "3.13.7": {
    controlId: "3.13.7",
    cmmcLabel: "SC.L2-3.13.7",
    artifacts: ["CUI at-rest encryption standard", "BitLocker / Intune report", "Disk audit"],
    justification:
      "Standard mandates AES-256. Report proves deployment. Audit verifies."
  },
  "3.13.8": {
    controlId: "3.13.8",
    cmmcLabel: "SC.L2-3.13.8",
    artifacts: ["CUI in-transit encryption standard", "TLS 1.2+ config", "SSL Labs scan"],
    justification:
      "Standard mandates TLS. Config enforces. Scan proves no weak ciphers."
  },
  "3.13.9": {
    controlId: "3.13.9",
    cmmcLabel: "SC.L2-3.13.9",
    artifacts: ["Connection-termination policy", "IDS session timeout", "Termination logs"],
    justification:
      "Policy defines termination. IDS enforces. Logs prove sessions end."
  },
  "3.13.10": {
    controlId: "3.13.10",
    cmmcLabel: "SC.L2-3.13.10",
    artifacts: ["Key-management policy", "HSM / KMS config", "Key-rotation logs"],
    justification:
      "Policy governs keys. HSM proves protection. Logs prove rotation."
  },
  "3.13.11": {
    controlId: "3.13.11",
    cmmcLabel: "SC.L2-3.13.11",
    artifacts: ["Crypto-binding policy", "FIPS 140-2 certs", "Module inventory"],
    justification:
      "Policy requires FIPS. Certs prove modules. Inventory tracks use."
  },
  "3.13.12": {
    controlId: "3.13.12",
    cmmcLabel: "SC.L2-3.13.12",
    artifacts: ["Collaborative-device policy", "Conference-room sweep logs", "Disable-feature config"],
    justification:
      "Policy controls devices. Sweeps prove checks. Config disables remote activation."
  },
  "3.13.13": {
    controlId: "3.13.13",
    cmmcLabel: "SC.L2-3.13.13",
    artifacts: ["Mobile-code policy", "Browser GPO blocking", "Exception list"],
    justification:
      "Policy restricts. GPO enforces. List proves managed exceptions."
  },
  "3.13.14": {
    controlId: "3.13.14",
    cmmcLabel: "SC.L2-3.13.14",
    artifacts: ["VoIP-protection policy", "VLAN for voice", "Call-encryption proof"],
    justification:
      "Policy requires protection. VLAN segments. Encryption proves confidentiality."
  },
  "3.13.15": {
    controlId: "3.13.15",
    cmmcLabel: "SC.L2-3.13.15",
    artifacts: ["Comms-authenticity policy", "Email DKIM / SPF config", "Test email headers"],
    justification:
      "Policy requires authentication. Config implements. Headers prove signing."
  },
  "3.13.16": {
    controlId: "3.13.16",
    cmmcLabel: "SC.L2-3.13.16",
    artifacts: ["Data-integrity policy", "File-hash monitoring", "Alert samples"],
    justification:
      "Policy requires integrity. Monitoring detects change. Alerts prove response."
  },

  /* ---------- SI — System & Information Integrity ---------- */
  "3.14.1": {
    controlId: "3.14.1",
    cmmcLabel: "SI.L2-3.14.1",
    artifacts: ["Flaw-remediation policy", "Patch-SLA report", "WSUS / SCCM logs"],
    justification:
      "Policy sets timelines. Report tracks SLA. Logs prove deployment."
  },
  "3.14.2": {
    controlId: "3.14.2",
    cmmcLabel: "SI.L2-3.14.2",
    artifacts: ["Malicious-code policy", "AV / EDR deployment report", "Quarantine logs"],
    justification:
      "Policy requires protection. Report proves coverage. Logs prove detection."
  },
  "3.14.3": {
    controlId: "3.14.3",
    cmmcLabel: "SI.L2-3.14.3",
    artifacts: ["Malicious-code update procedure", "AV update logs", "Version report"],
    justification:
      "Procedure defines updates. Logs prove they run automatically. Report proves currency."
  },
  "3.14.4": {
    controlId: "3.14.4",
    cmmcLabel: "SI.L2-3.14.4",
    artifacts: ["AV scan config", "Weekly scan reports", "Scan logs"],
    justification:
      "Config sets the schedule. Reports prove execution. Logs show results."
  },
  "3.14.5": {
    controlId: "3.14.5",
    cmmcLabel: "SI.L2-3.14.5",
    artifacts: ["System-monitoring policy", "IDS / IPS alerts", "SOC ticket samples"],
    justification:
      "Policy requires monitoring. Alerts prove detection. Tickets prove response."
  },
  "3.14.6": {
    controlId: "3.14.6",
    cmmcLabel: "SI.L2-3.14.6",
    artifacts: ["Monitoring-tool update SOP", "Signature-update logs"],
    justification:
      "SOP requires updates. Logs prove IDS / AV signatures are current."
  },
  "3.14.7": {
    controlId: "3.14.7",
    cmmcLabel: "SI.L2-3.14.7",
    artifacts: ["Unauthorized-use policy", "User-activity monitoring", "Violation reports"],
    justification:
      "Policy defines what is unauthorized. Monitoring detects. Reports prove handling."
  }
};

export function getCatalogEntry(controlId: string): EvidenceCatalogEntry | null {
  return EVIDENCE_CATALOG[controlId] ?? null;
}
