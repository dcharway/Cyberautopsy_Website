import type { Control, FamilyCode } from "@/lib/types";

export const FAMILY_NAMES: Record<FamilyCode, string> = {
  AC: "Access Control",
  AT: "Awareness & Training",
  AU: "Audit & Accountability",
  CA: "Security Assessment",
  CM: "Configuration Management",
  CP: "Contingency Planning",
  IA: "Identification & Authentication",
  IR: "Incident Response",
  MA: "Maintenance",
  MP: "Media Protection",
  PE: "Physical Protection",
  PS: "Personnel Security",
  RA: "Risk Assessment",
  SC: "System & Communications Protection",
  SI: "System & Information Integrity"
};

type Seed = [string, FamilyCode, string, string, 1 | 3 | 5, Control["status"]];

// Format: [id, family, name, requirement, weight, status]
const SEED: Seed[] = [
  // AC — 22 controls
  ["3.1.1", "AC", "System Access Limitations", "Limit system access to authorized users, processes acting on behalf of authorized users, and devices (including other systems).", 5, "Implemented"],
  ["3.1.2", "AC", "Transaction & Function Limitations", "Limit system access to the types of transactions and functions that authorized users are permitted to execute.", 5, "Implemented"],
  ["3.1.3", "AC", "Control CUI Flow", "Control the flow of CUI in accordance with approved authorizations.", 1, "Implemented"],
  ["3.1.4", "AC", "Separation of Duties", "Separate the duties of individuals to reduce the risk of malevolent activity without collusion.", 1, "Partial"],
  ["3.1.5", "AC", "Least Privilege", "Employ the principle of least privilege, including for specific security functions and privileged accounts.", 3, "Partial"],
  ["3.1.6", "AC", "Non-Privileged Account Use", "Use non-privileged accounts or roles when accessing nonsecurity functions.", 1, "Implemented"],
  ["3.1.7", "AC", "Privileged Function Prevention", "Prevent non-privileged users from executing privileged functions and capture the execution of such functions in audit logs.", 1, "Implemented"],
  ["3.1.8", "AC", "Unsuccessful Logon Attempts", "Limit unsuccessful logon attempts.", 1, "Implemented"],
  ["3.1.9", "AC", "System Use Notification", "Provide privacy and security notices consistent with applicable CUI rules.", 1, "Implemented"],
  ["3.1.10", "AC", "Session Lock", "Use session lock with pattern-hiding displays to prevent access and viewing of data after a period of inactivity.", 1, "Implemented"],
  ["3.1.11", "AC", "Session Termination", "Terminate (automatically) a user session after a defined condition.", 1, "Partial"],
  ["3.1.12", "AC", "Remote Access Monitoring", "Monitor and control remote access sessions.", 1, "Implemented"],
  ["3.1.13", "AC", "Remote Access Encryption", "Employ cryptographic mechanisms to protect the confidentiality of remote access sessions.", 1, "Implemented"],
  ["3.1.14", "AC", "Remote Access Routing", "Route remote access via managed access control points.", 1, "Implemented"],
  ["3.1.15", "AC", "Privileged Remote Commands", "Authorize remote execution of privileged commands and remote access to security-relevant information.", 1, "Implemented"],
  ["3.1.16", "AC", "Wireless Access Authorization", "Authorize wireless access prior to allowing such connections.", 1, "Implemented"],
  ["3.1.17", "AC", "Wireless Access Encryption", "Protect wireless access using authentication and encryption.", 1, "Implemented"],
  ["3.1.18", "AC", "Mobile Device Connection", "Control connection of mobile devices.", 1, "Partial"],
  ["3.1.19", "AC", "Mobile Device Encryption", "Encrypt CUI on mobile devices and mobile computing platforms.", 3, "Implemented"],
  ["3.1.20", "AC", "External System Use", "Verify and control/limit connections to and use of external systems.", 1, "Under Review"],
  ["3.1.21", "AC", "Portable Storage Use", "Limit use of portable storage devices on external systems.", 1, "Implemented"],
  ["3.1.22", "AC", "Public Info Posting", "Control CUI posted or processed on publicly accessible systems.", 1, "Implemented"],
  // AT — 3 controls
  ["3.2.1", "AT", "Security Awareness Training", "Ensure that managers, system administrators, and users of organizational systems are made aware of the security risks associated with their activities and of the applicable policies, standards, and procedures related to the security of those systems.", 5, "Implemented"],
  ["3.2.2", "AT", "Role-Based Training", "Ensure that personnel are trained to carry out their assigned information security-related duties and responsibilities.", 5, "Partial"],
  ["3.2.3", "AT", "Insider Threat Training", "Provide security awareness training on recognizing and reporting potential indicators of insider threat.", 1, "Not Implemented"],
  // AU — 9 controls
  ["3.3.1", "AU", "Audit Logging", "Create and retain system audit logs and records to the extent needed to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity.", 5, "Implemented"],
  ["3.3.2", "AU", "Audit Content", "Ensure that the actions of individual system users can be uniquely traced to those users, so they can be held accountable for their actions.", 3, "Implemented"],
  ["3.3.3", "AU", "Audit Review", "Review and update logged events.", 3, "Partial"],
  ["3.3.4", "AU", "Audit Failure Alerting", "Alert in the event of an audit logging process failure.", 1, "Implemented"],
  ["3.3.5", "AU", "Audit Correlation", "Correlate audit record review, analysis, and reporting processes for investigation and response to indications of unlawful, unauthorized, suspicious, or unusual activity.", 5, "Partial"],
  ["3.3.6", "AU", "Audit Reduction & Reporting", "Provide audit record reduction and report generation to support on-demand analysis and reporting.", 1, "Implemented"],
  ["3.3.7", "AU", "Time Stamps", "Provide a system capability that compares and synchronizes internal system clocks with an authoritative source to generate time stamps for audit records.", 1, "Implemented"],
  ["3.3.8", "AU", "Audit Protection", "Protect audit information and audit logging tools from unauthorized access, modification, and deletion.", 1, "Implemented"],
  ["3.3.9", "AU", "Audit Management", "Limit management of audit logging functionality to a subset of privileged users.", 1, "Implemented"],
  // CM — 9 controls
  ["3.4.1", "CM", "Baseline Configurations", "Establish and maintain baseline configurations and inventories of organizational systems (including hardware, software, firmware, and documentation) throughout the respective system development life cycles.", 5, "Partial"],
  ["3.4.2", "CM", "Security Configurations", "Establish and enforce security configuration settings for information technology products employed in organizational systems.", 5, "Partial"],
  ["3.4.3", "CM", "Change Control", "Track, review, approve or disapprove, and log changes to organizational systems.", 5, "Implemented"],
  ["3.4.4", "CM", "Security Impact Analysis", "Analyze the security impact of changes prior to implementation.", 5, "Implemented"],
  ["3.4.5", "CM", "Access Restrictions for Change", "Define, document, approve, and enforce physical and logical access restrictions associated with changes to organizational systems.", 5, "Implemented"],
  ["3.4.6", "CM", "Least Functionality", "Employ the principle of least functionality by configuring organizational systems to provide only essential capabilities.", 5, "Implemented"],
  ["3.4.7", "CM", "Nonessential Functions", "Restrict, disable, or prevent the use of nonessential programs, functions, ports, protocols, and services.", 5, "Partial"],
  ["3.4.8", "CM", "Application Execution Policy", "Apply deny-by-exception (blacklisting) or permit-by-exception (whitelisting) policy to control software execution.", 5, "Not Implemented"],
  ["3.4.9", "CM", "User-Installed Software", "Control and monitor user-installed software.", 1, "Partial"],
  // IA — 11 controls
  ["3.5.1", "IA", "User Identification", "Identify system users, processes acting on behalf of users, and devices.", 5, "Implemented"],
  ["3.5.2", "IA", "User Authentication", "Authenticate (or verify) the identities of users, processes, or devices, as a prerequisite to allowing access to organizational systems.", 5, "Implemented"],
  ["3.5.3", "IA", "Multifactor Authentication", "Use multifactor authentication for local and network access to privileged accounts and for network access to non-privileged accounts.", 5, "Implemented"],
  ["3.5.4", "IA", "Replay Resistance", "Employ replay-resistant authentication mechanisms for network access to privileged and non-privileged accounts.", 5, "Implemented"],
  ["3.5.5", "IA", "Identifier Reuse", "Prevent reuse of identifiers for a defined period.", 1, "Implemented"],
  ["3.5.6", "IA", "Identifier Inactivity", "Disable identifiers after a defined period of inactivity.", 1, "Implemented"],
  ["3.5.7", "IA", "Password Complexity", "Enforce a minimum password complexity and change of characters when new passwords are created.", 1, "Implemented"],
  ["3.5.8", "IA", "Password Reuse", "Prohibit password reuse for a specified number of generations.", 1, "Implemented"],
  ["3.5.9", "IA", "Temporary Passwords", "Allow temporary password use for system logons with an immediate change to a permanent password.", 1, "Implemented"],
  ["3.5.10", "IA", "Cryptographic Passwords", "Store and transmit only cryptographically-protected passwords.", 5, "Implemented"],
  ["3.5.11", "IA", "Obscure Auth Feedback", "Obscure feedback of authentication information.", 1, "Implemented"],
  // IR — 3 controls
  ["3.6.1", "IR", "Incident Handling", "Establish an operational incident-handling capability for organizational systems that includes preparation, detection, analysis, containment, recovery, and user response activities.", 5, "Partial"],
  ["3.6.2", "IR", "Incident Reporting", "Track, document, and report incidents to designated officials and/or authorities both internal and external to the organization.", 5, "Implemented"],
  ["3.6.3", "IR", "Incident Response Testing", "Test the organizational incident response capability.", 5, "Not Implemented"],
  // MA — 6 controls
  ["3.7.1", "MA", "Perform Maintenance", "Perform maintenance on organizational systems.", 3, "Implemented"],
  ["3.7.2", "MA", "Maintenance Controls", "Provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance.", 3, "Implemented"],
  ["3.7.3", "MA", "Equipment Sanitization", "Ensure equipment removed for off-site maintenance is sanitized of any CUI.", 1, "Implemented"],
  ["3.7.4", "MA", "Diagnostic Media", "Check media containing diagnostic and test programs for malicious code before the media are used in organizational systems.", 5, "Partial"],
  ["3.7.5", "MA", "Nonlocal Maintenance", "Require multifactor authentication to establish nonlocal maintenance sessions via external network connections and terminate such connections when nonlocal maintenance is complete.", 5, "Implemented"],
  ["3.7.6", "MA", "Maintenance Personnel", "Supervise the maintenance activities of maintenance personnel without required access authorization.", 1, "Partial"],
  // MP — 9 controls
  ["3.8.1", "MP", "Media Protection", "Protect (i.e., physically control and securely store) system media containing CUI, both paper and digital.", 3, "Implemented"],
  ["3.8.2", "MP", "Media Access", "Limit access to CUI on system media to authorized users.", 3, "Implemented"],
  ["3.8.3", "MP", "Media Sanitization", "Sanitize or destroy system media containing CUI before disposal or release for reuse.", 5, "Implemented"],
  ["3.8.4", "MP", "Media Marking", "Mark media with necessary CUI markings and distribution limitations.", 1, "Partial"],
  ["3.8.5", "MP", "Media Transport", "Control access to media containing CUI and maintain accountability for media during transport outside of controlled areas.", 3, "Implemented"],
  ["3.8.6", "MP", "Cryptographic Media Transport", "Implement cryptographic mechanisms to protect the confidentiality of CUI stored on digital media during transport unless otherwise protected by alternative physical safeguards.", 1, "Implemented"],
  ["3.8.7", "MP", "Removable Media", "Control the use of removable media on system components.", 5, "Partial"],
  ["3.8.8", "MP", "Portable Storage Owner", "Prohibit the use of portable storage devices when such devices have no identifiable owner.", 1, "Implemented"],
  ["3.8.9", "MP", "Backup Protection", "Protect the confidentiality of backup CUI at storage locations.", 1, "Implemented"],
  // PS — 2 controls
  ["3.9.1", "PS", "Personnel Screening", "Screen individuals prior to authorizing access to organizational systems containing CUI.", 3, "Implemented"],
  ["3.9.2", "PS", "Personnel Termination", "Ensure that organizational systems containing CUI are protected during and after personnel actions such as terminations and transfers.", 3, "Implemented"],
  // PE — 6 controls
  ["3.10.1", "PE", "Physical Access Authorization", "Limit physical access to organizational systems, equipment, and the respective operating environments to authorized individuals.", 5, "Implemented"],
  ["3.10.2", "PE", "Physical Facility Monitoring", "Protect and monitor the physical facility and support infrastructure for organizational systems.", 5, "Implemented"],
  ["3.10.3", "PE", "Visitor Escort", "Escort visitors and monitor visitor activity.", 1, "Partial"],
  ["3.10.4", "PE", "Physical Access Logs", "Maintain audit logs of physical access.", 1, "Implemented"],
  ["3.10.5", "PE", "Physical Access Devices", "Control and manage physical access devices.", 1, "Implemented"],
  ["3.10.6", "PE", "Alternate Work Sites", "Enforce safeguarding measures for CUI at alternate work sites.", 1, "Partial"],
  // RA — 3 controls
  ["3.11.1", "RA", "Risk Assessments", "Periodically assess the risk to organizational operations, organizational assets, and individuals, resulting from the operation of organizational systems and the associated processing, storage, or transmission of CUI.", 3, "Implemented"],
  ["3.11.2", "RA", "Vulnerability Scanning", "Scan for vulnerabilities in organizational systems and applications periodically and when new vulnerabilities affecting those systems and applications are identified.", 5, "Partial"],
  ["3.11.3", "RA", "Vulnerability Remediation", "Remediate vulnerabilities in accordance with risk assessments.", 1, "Partial"],
  // CA — 4 controls
  ["3.12.1", "CA", "Security Control Assessments", "Periodically assess the security controls in organizational systems to determine if the controls are effective in their application.", 5, "Under Review"],
  ["3.12.2", "CA", "Plans of Action", "Develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities in organizational systems.", 3, "Implemented"],
  ["3.12.3", "CA", "Continuous Monitoring", "Monitor security controls on an ongoing basis to ensure the continued effectiveness of the controls.", 5, "Partial"],
  ["3.12.4", "CA", "System Security Plans", "Develop, document, and periodically update system security plans that describe system boundaries, system environments of operation, how security requirements are implemented, and the relationships with or connections to other systems.", 3, "Under Review"],
  // SC — 16 controls
  ["3.13.1", "SC", "Boundary Protection", "Monitor, control, and protect organizational communications at the external boundaries and key internal boundaries of organizational systems.", 5, "Implemented"],
  ["3.13.2", "SC", "Security Engineering", "Employ architectural designs, software development techniques, and systems engineering principles that promote effective information security within organizational systems.", 5, "Implemented"],
  ["3.13.3", "SC", "Role Separation", "Separate user functionality from system management functionality.", 5, "Implemented"],
  ["3.13.4", "SC", "Shared Resource Prevention", "Prevent unauthorized and unintended information transfer via shared system resources.", 5, "Implemented"],
  ["3.13.5", "SC", "Subnetworks for Public Access", "Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks.", 5, "Implemented"],
  ["3.13.6", "SC", "Default Deny", "Deny network communications traffic by default and allow network communications traffic by exception.", 5, "Implemented"],
  ["3.13.7", "SC", "Split Tunneling", "Prevent remote devices from simultaneously establishing non-remote connections with organizational systems and communicating via some other connection to resources in external networks.", 5, "Implemented"],
  ["3.13.8", "SC", "Transmission Confidentiality", "Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission unless otherwise protected by alternative physical safeguards.", 5, "Implemented"],
  ["3.13.9", "SC", "Network Disconnect", "Terminate network connections associated with communications sessions at the end of the sessions or after a defined period of inactivity.", 5, "Implemented"],
  ["3.13.10", "SC", "Cryptographic Key Management", "Establish and manage cryptographic keys for cryptography employed in organizational systems.", 5, "Partial"],
  ["3.13.11", "SC", "FIPS-Validated Cryptography", "Employ FIPS-validated cryptography when used to protect the confidentiality of CUI.", 5, "Partial"],
  ["3.13.12", "SC", "Collaborative Device Activation", "Prohibit remote activation of collaborative computing devices and provide indication of devices in use to users present at the device.", 5, "Implemented"],
  ["3.13.13", "SC", "Mobile Code Control", "Control and monitor the use of mobile code.", 5, "Partial"],
  ["3.13.14", "SC", "VoIP Control", "Control and monitor the use of Voice over Internet Protocol (VoIP) technologies.", 5, "Implemented"],
  ["3.13.15", "SC", "Communications Authenticity", "Protect the authenticity of communications sessions.", 5, "Implemented"],
  ["3.13.16", "SC", "Data at Rest Confidentiality", "Protect the confidentiality of CUI at rest.", 5, "Implemented"],
  // SI — 7 controls
  ["3.14.1", "SI", "Flaw Remediation", "Identify, report, and correct system flaws in a timely manner.", 5, "Partial"],
  ["3.14.2", "SI", "Malicious Code Protection", "Provide protection from malicious code at designated locations within organizational systems.", 5, "Implemented"],
  ["3.14.3", "SI", "Security Alerts & Advisories", "Monitor system security alerts and advisories and take action in response.", 5, "Implemented"],
  ["3.14.4", "SI", "Malicious Code Updates", "Update malicious code protection mechanisms when new releases are available.", 5, "Implemented"],
  ["3.14.5", "SI", "Periodic Scans", "Perform periodic scans of organizational systems and real-time scans of files from external sources as files are downloaded, opened, or executed.", 3, "Implemented"],
  ["3.14.6", "SI", "System Monitoring", "Monitor organizational systems, including inbound and outbound communications traffic, to detect attacks and indicators of potential attacks.", 5, "Partial"],
  ["3.14.7", "SI", "Unauthorized Use Detection", "Identify unauthorized use of organizational systems.", 3, "Implemented"]
];

const OWNERS = ["J. Smith", "A. Lee", "T. Kim", "R. Vasquez", "M. Okafor", "K. Iwu", "—"];

export const CONTROLS: Control[] = SEED.map(([id, family, name, requirement, weight, status], i) => ({
  id,
  family,
  familyName: FAMILY_NAMES[family],
  name,
  requirement,
  status,
  weight,
  owner: status === "Not Started" ? undefined : OWNERS[i % (OWNERS.length - 1)],
  evidenceIds: status === "Implemented" || status === "Partial" || status === "Under Review"
    ? [`EVD-${family}-${String(i + 1).padStart(3, "0")}`]
    : [],
  poamId: status === "Partial" || status === "Not Implemented" ? `POAM-${String(i + 1).padStart(3, "0")}` : null,
  sspSection: id,
  systemBoundary: "CUI Enclave — Primary",
  lastReviewed:
    status === "Not Started" ? undefined : new Date(2026, 3, 1 + (i % 28)).toISOString().slice(0, 10)
}));

// Sanity check at module load: must be 110 controls
if (CONTROLS.length !== 110) {
  throw new Error(`Seed must be exactly 110 controls; got ${CONTROLS.length}`);
}
