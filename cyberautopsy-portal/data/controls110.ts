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

/**
 * Per-control assessment objectives — the "determination statements" from
 * NIST SP 800-171A that a CMMC assessor evaluates one at a time. Each entry
 * is rendered as [a], [b], [c]… in the UI + exports by array index.
 *
 * Source: NIST SP 800-171A — "Assessing Security Requirements for Controlled
 * Unclassified Information" (public U.S. Government publication). The
 * statements below are paraphrased/summarised for portal display; consult the
 * primary document for the authoritative phrasing on assessment day.
 */
export const CONTROL_OBJECTIVES: Record<string, string[]> = {
  /* -------- 3.1 Access Control -------- */
  "3.1.1": [
    "authorized users are identified",
    "processes acting on behalf of authorized users are identified",
    "devices (and other systems) authorized to connect to the system are identified",
    "system access is limited to authorized users",
    "system access is limited to processes acting on behalf of authorized users",
    "system access is limited to authorized devices (including other systems)"
  ],
  "3.1.2": [
    "the types of transactions and functions that authorized users are permitted to execute are defined",
    "system access is limited to the defined types of transactions and functions for authorized users"
  ],
  "3.1.3": [
    "information flow control policies are defined",
    "methods and enforcement mechanisms for controlling the flow of CUI are defined",
    "designated sources and destinations (e.g., networks, individuals, devices) for CUI within the system and between interconnected systems are identified",
    "authorizations for controlling the flow of CUI are defined",
    "approved authorizations for controlling the flow of CUI are enforced"
  ],
  "3.1.4": [
    "the duties of individuals requiring separation are defined",
    "responsibilities for duties that require separation are assigned to separate individuals",
    "access privileges that enable individuals to exercise the duties that require separation are granted to separate individuals"
  ],
  "3.1.5": [
    "privileged accounts are identified",
    "access to privileged accounts is authorized in accordance with the principle of least privilege",
    "security functions are identified",
    "access to security functions is authorized in accordance with the principle of least privilege"
  ],
  "3.1.6": [
    "nonsecurity functions are identified",
    "users are required to use non-privileged accounts or roles when accessing nonsecurity functions"
  ],
  "3.1.7": [
    "privileged functions are defined",
    "non-privileged users are defined",
    "non-privileged users are prevented from executing privileged functions",
    "the execution of privileged functions is captured in audit logs"
  ],
  "3.1.8": [
    "the means of limiting unsuccessful logon attempts is defined",
    "the defined means of limiting unsuccessful logon attempts is implemented"
  ],
  "3.1.9": [
    "privacy and security notices required by CUI-specified rules are identified, consistent, and associated with the specific CUI category",
    "privacy and security notices are displayed"
  ],
  "3.1.10": [
    "the period of inactivity after which the system initiates a session lock is defined",
    "access to the system and viewing of data is prevented by initiating a session lock after the defined period of inactivity",
    "previously visible information is concealed via a pattern-hiding display after the defined period of inactivity"
  ],
  "3.1.11": [
    "conditions requiring a user session to terminate are defined",
    "a user session is automatically terminated after any of the defined conditions occur"
  ],
  "3.1.12": [
    "remote access sessions are permitted",
    "the types of permitted remote access are identified",
    "remote access sessions are controlled",
    "remote access sessions are monitored"
  ],
  "3.1.13": [
    "cryptographic mechanisms to protect the confidentiality of remote access sessions are identified",
    "cryptographic mechanisms to protect the confidentiality of remote access sessions are implemented"
  ],
  "3.1.14": [
    "managed access control points are identified and implemented",
    "remote access is routed through managed network access control points"
  ],
  "3.1.15": [
    "privileged commands authorized for remote execution are identified",
    "security-relevant information authorized to be accessed remotely is identified",
    "the execution of the identified privileged commands via remote access is authorized",
    "access to the identified security-relevant information via remote access is authorized"
  ],
  "3.1.16": [
    "wireless access points are identified",
    "wireless access is authorized prior to allowing such connections"
  ],
  "3.1.17": [
    "wireless access to the system is protected using authentication",
    "wireless access to the system is protected using encryption"
  ],
  "3.1.18": [
    "mobile devices that process, store, or transmit CUI are identified",
    "mobile device connections are authorized",
    "mobile device connections are monitored and logged"
  ],
  "3.1.19": [
    "mobile devices and mobile computing platforms that process, store, or transmit CUI are identified",
    "encryption is employed to protect CUI on identified mobile devices and mobile computing platforms"
  ],
  "3.1.20": [
    "connections to external systems are identified",
    "the use of external systems is identified",
    "connections to external systems are verified",
    "the use of external systems is verified",
    "connections to external systems are controlled/limited",
    "the use of external systems is controlled/limited"
  ],
  "3.1.21": [
    "the use of portable storage devices containing CUI on external systems is identified and documented",
    "limits on the use of portable storage devices containing CUI on external systems are defined",
    "the use of portable storage devices containing CUI on external systems is limited as defined"
  ],
  "3.1.22": [
    "individuals authorized to post or process information on publicly accessible systems are identified",
    "procedures to ensure CUI is not posted or processed on publicly accessible systems are identified",
    "a review process is in place prior to posting of any content to publicly accessible systems",
    "content on publicly accessible systems is reviewed to ensure that it does not include CUI",
    "mechanisms are in place to remove and address improper posting of CUI"
  ],

  /* -------- 3.2 Awareness & Training -------- */
  "3.2.1": [
    "security risks associated with organizational activities involving CUI are identified",
    "policies, standards, and procedures related to the security of the system are identified",
    "managers, system administrators, and users of the system are made aware of the security risks associated with their activities",
    "managers, system administrators, and users of the system are made aware of the applicable policies, standards, and procedures related to system security"
  ],
  "3.2.2": [
    "information security-related duties, roles, and responsibilities are defined",
    "information security-related duties, roles, and responsibilities are assigned to designated personnel",
    "personnel are adequately trained to carry out their assigned information security-related duties, roles, and responsibilities"
  ],
  "3.2.3": [
    "potential indicators associated with insider threats are identified",
    "security awareness training on recognizing and reporting potential indicators of insider threat is provided to managers and employees"
  ],

  /* -------- 3.3 Audit & Accountability -------- */
  "3.3.1": [
    "audit logs needed (i.e., event types to be logged) to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity are specified",
    "the content of audit records needed to support monitoring, analysis, investigation, and reporting is defined",
    "audit records are created (generated)",
    "audit records, once created, contain the defined content",
    "retention requirements for audit records are defined",
    "audit records are retained as defined"
  ],
  "3.3.2": [
    "the content of the audit records needed to support the ability to uniquely trace users to their actions is defined",
    "audit records, once created, contain the defined content"
  ],
  "3.3.3": [
    "a process for determining when to review logged events is defined",
    "event types being logged are reviewed in accordance with the defined review process",
    "event types being logged are updated based on the review"
  ],
  "3.3.4": [
    "personnel or roles to be alerted in the event of an audit logging process failure are identified",
    "types of audit logging process failures for which alert will be generated are defined",
    "identified personnel or roles are alerted in the event of an audit logging process failure"
  ],
  "3.3.5": [
    "audit record review, analysis, and reporting processes for investigation and response to indications of unlawful, unauthorized, suspicious, or unusual activity are defined",
    "defined audit record review, analysis, and reporting processes are correlated"
  ],
  "3.3.6": [
    "an audit record reduction capability that supports on-demand analysis is provided",
    "a report generation capability that supports on-demand reporting is provided"
  ],
  "3.3.7": [
    "internal system clocks are used to generate time stamps for audit records",
    "an authoritative source with which to compare and synchronize internal system clocks is specified",
    "internal system clocks used to generate time stamps for audit records are compared to and synchronized with the specified authoritative time source"
  ],
  "3.3.8": [
    "audit information is protected from unauthorized access",
    "audit information is protected from unauthorized modification",
    "audit information is protected from unauthorized deletion",
    "audit logging tools are protected from unauthorized access, modification, and deletion"
  ],
  "3.3.9": [
    "a subset of privileged users granted access to manage audit logging functionality is defined",
    "management of audit logging functionality is limited to the defined subset of privileged users"
  ],

  /* -------- 3.4 Configuration Management -------- */
  "3.4.1": [
    "a baseline configuration is established",
    "the baseline configuration includes hardware, software, firmware, and documentation",
    "the baseline configuration is maintained (reviewed and updated) throughout the system development life cycle",
    "a system inventory is established",
    "the system inventory includes hardware, software, firmware, and documentation",
    "the inventory is maintained (reviewed and updated) throughout the system development life cycle"
  ],
  "3.4.2": [
    "security configuration settings for information technology products employed in the system are established and included in the baseline configuration",
    "security configuration settings for information technology products employed in the system are enforced"
  ],
  "3.4.3": [
    "changes to the system are tracked",
    "changes to the system are reviewed",
    "changes to the system are approved or disapproved",
    "changes to the system are logged"
  ],
  "3.4.4": [
    "the security impact of changes to the system is analyzed prior to implementation"
  ],
  "3.4.5": [
    "physical access restrictions associated with changes to the system are defined",
    "physical access restrictions associated with changes to the system are documented",
    "physical access restrictions associated with changes to the system are approved",
    "physical access restrictions associated with changes to the system are enforced",
    "logical access restrictions associated with changes to the system are defined",
    "logical access restrictions associated with changes to the system are documented",
    "logical access restrictions associated with changes to the system are approved",
    "logical access restrictions associated with changes to the system are enforced"
  ],
  "3.4.6": [
    "essential system capabilities are defined based on the principle of least functionality",
    "the system is configured to provide only the defined essential capabilities"
  ],
  "3.4.7": [
    "essential programs are defined",
    "the use of nonessential programs is defined",
    "the use of nonessential programs is restricted, disabled, or prevented as defined",
    "essential functions are defined",
    "the use of nonessential functions is defined",
    "the use of nonessential functions is restricted, disabled, or prevented as defined",
    "essential ports are defined",
    "the use of nonessential ports is defined",
    "the use of nonessential ports is restricted, disabled, or prevented as defined",
    "essential protocols are defined",
    "the use of nonessential protocols is defined",
    "the use of nonessential protocols is restricted, disabled, or prevented as defined",
    "essential services are defined",
    "the use of nonessential services is defined",
    "the use of nonessential services is restricted, disabled, or prevented as defined"
  ],
  "3.4.8": [
    "a policy specifying whether allow-all/deny-by-exception or deny-all/permit-by-exception is to be applied is specified",
    "the specified policy for software execution is applied",
    "software allowed to execute (or denied execution) under the policy is specified"
  ],
  "3.4.9": [
    "a policy for controlling the installation of software by users is established",
    "installation of software by users is controlled based on the established policy",
    "installation of software by users is monitored"
  ],

  /* -------- 3.5 Identification & Authentication -------- */
  "3.5.1": [
    "system users are identified",
    "processes acting on behalf of users are identified",
    "devices accessing the system are identified"
  ],
  "3.5.2": [
    "the identities of system users are authenticated (or verified)",
    "the identities of processes acting on behalf of users are authenticated (or verified)",
    "the identities of devices accessing the system are authenticated (or verified)"
  ],
  "3.5.3": [
    "privileged accounts are identified",
    "multifactor authentication is implemented for local access to privileged accounts",
    "multifactor authentication is implemented for network access to privileged accounts",
    "multifactor authentication is implemented for network access to non-privileged accounts"
  ],
  "3.5.4": [
    "replay-resistant authentication mechanisms are implemented for network account access to privileged and non-privileged accounts"
  ],
  "3.5.5": [
    "a period within which identifiers cannot be reused is defined",
    "reuse of identifiers is prevented within the defined period"
  ],
  "3.5.6": [
    "a period of inactivity after which an identifier is disabled is defined",
    "identifiers are disabled after the defined period of inactivity"
  ],
  "3.5.7": [
    "password complexity requirements are defined",
    "password change of character requirements are defined",
    "minimum password complexity requirements as defined are enforced when new passwords are created",
    "minimum password change of character requirements as defined are enforced when new passwords are created"
  ],
  "3.5.8": [
    "the number of generations during which a password cannot be reused is specified",
    "reuse of passwords is prohibited during the specified number of generations"
  ],
  "3.5.9": [
    "an immediate change to a permanent password is required when a temporary password is used for system logon"
  ],
  "3.5.10": [
    "passwords are cryptographically protected in storage",
    "passwords are cryptographically protected in transit"
  ],
  "3.5.11": [
    "authentication information is obscured during the authentication process"
  ],

  /* -------- 3.6 Incident Response -------- */
  "3.6.1": [
    "an operational incident-handling capability is established",
    "the operational incident-handling capability includes preparation",
    "the operational incident-handling capability includes detection",
    "the operational incident-handling capability includes analysis",
    "the operational incident-handling capability includes containment",
    "the operational incident-handling capability includes recovery",
    "the operational incident-handling capability includes user response activities"
  ],
  "3.6.2": [
    "incidents are tracked",
    "incidents are documented",
    "authorities to whom incidents are to be reported are identified",
    "organizational officials to whom incidents are to be reported are identified",
    "identified authorities are notified of incidents",
    "identified organizational officials are notified of incidents"
  ],
  "3.6.3": [
    "the incident response capability is tested"
  ],

  /* -------- 3.7 Maintenance -------- */
  "3.7.1": [
    "system maintenance is performed"
  ],
  "3.7.2": [
    "tools used to conduct system maintenance are controlled",
    "techniques used to conduct system maintenance are controlled",
    "mechanisms used to conduct system maintenance are controlled",
    "personnel used to conduct system maintenance are controlled"
  ],
  "3.7.3": [
    "equipment to be removed from organizational spaces for off-site maintenance is sanitized of any CUI"
  ],
  "3.7.4": [
    "media containing diagnostic and test programs are checked for malicious code before the media are used in the system"
  ],
  "3.7.5": [
    "multifactor authentication is required to establish nonlocal maintenance sessions via external network connections",
    "nonlocal maintenance sessions established via external network connections are terminated when nonlocal maintenance is complete"
  ],
  "3.7.6": [
    "maintenance personnel without required access authorization are supervised during maintenance activities"
  ],

  /* -------- 3.8 Media Protection -------- */
  "3.8.1": [
    "paper media containing CUI is physically controlled",
    "digital media containing CUI is physically controlled",
    "paper media containing CUI is securely stored",
    "digital media containing CUI is securely stored"
  ],
  "3.8.2": [
    "access to CUI on system media is limited to authorized users"
  ],
  "3.8.3": [
    "system media containing CUI is sanitized or destroyed before disposal",
    "system media containing CUI is sanitized before it is released for reuse"
  ],
  "3.8.4": [
    "media containing CUI is marked with applicable CUI markings",
    "media containing CUI is marked with distribution limitations"
  ],
  "3.8.5": [
    "access to media containing CUI is controlled during transport outside of controlled areas",
    "accountability for media containing CUI is maintained during transport outside of controlled areas"
  ],
  "3.8.6": [
    "cryptographic mechanisms are implemented to protect the confidentiality of CUI stored on digital media during transport (unless otherwise protected by alternative physical safeguards)"
  ],
  "3.8.7": [
    "the use of removable media on system components is controlled"
  ],
  "3.8.8": [
    "the use of portable storage devices is prohibited when such devices have no identifiable owner"
  ],
  "3.8.9": [
    "the confidentiality of backup CUI is protected at storage locations"
  ],

  /* -------- 3.9 Personnel Security -------- */
  "3.9.1": [
    "individuals are screened prior to authorizing access to organizational systems containing CUI"
  ],
  "3.9.2": [
    "a policy and/or process for terminating system access and any credentials coincident with personnel actions is established",
    "system access and credentials are terminated consistent with personnel actions such as termination or transfer",
    "the system is protected during and after personnel transfer actions"
  ],

  /* -------- 3.10 Physical Protection -------- */
  "3.10.1": [
    "authorized individuals allowed physical access are identified",
    "physical access to organizational systems is limited to authorized individuals",
    "physical access to equipment is limited to authorized individuals",
    "physical access to operating environments is limited to authorized individuals"
  ],
  "3.10.2": [
    "the physical facility where organizational systems reside is protected",
    "the support infrastructure for organizational systems is protected",
    "the physical facility where organizational systems reside is monitored",
    "the support infrastructure for organizational systems is monitored"
  ],
  "3.10.3": [
    "visitors are escorted",
    "visitor activity is monitored"
  ],
  "3.10.4": [
    "audit logs of physical access are maintained"
  ],
  "3.10.5": [
    "physical access devices are identified",
    "physical access devices are controlled",
    "physical access devices are managed"
  ],
  "3.10.6": [
    "safeguarding measures for CUI at alternate work sites are defined",
    "safeguarding measures for CUI are enforced at alternate work sites"
  ],

  /* -------- 3.11 Risk Assessment -------- */
  "3.11.1": [
    "the frequency to assess risk to organizational operations, organizational assets, and individuals is defined",
    "risk to organizational operations, organizational assets, and individuals resulting from the operation of the system and the associated processing, storage, or transmission of CUI is assessed with the defined frequency"
  ],
  "3.11.2": [
    "the frequency to scan for vulnerabilities in organizational systems and applications is defined",
    "vulnerability scans are performed on organizational systems with the defined frequency",
    "vulnerability scans are performed on applications with the defined frequency",
    "vulnerability scans are performed on organizational systems when new vulnerabilities are identified",
    "vulnerability scans are performed on applications when new vulnerabilities are identified"
  ],
  "3.11.3": [
    "vulnerabilities are remediated in accordance with risk assessments"
  ],

  /* -------- 3.12 Security Assessment -------- */
  "3.12.1": [
    "the frequency of security control assessments is defined",
    "security controls are assessed with the defined frequency to determine if the controls are effective in their application"
  ],
  "3.12.2": [
    "deficiencies and vulnerabilities to be addressed by the plan of action are identified",
    "a plan of action is developed to correct identified deficiencies and reduce or eliminate identified vulnerabilities",
    "the plan of action is implemented to correct identified deficiencies and reduce or eliminate identified vulnerabilities"
  ],
  "3.12.3": [
    "security controls are monitored on an ongoing basis to ensure the continued effectiveness of those controls"
  ],
  "3.12.4": [
    "a system security plan is developed",
    "the system boundary is described and documented in the system security plan",
    "the system environment of operation is described and documented in the system security plan",
    "the security requirements identified and approved by the designated authority as non-applicable are identified",
    "the method of security requirement implementation is described and documented in the system security plan",
    "the relationship with or connection to other systems is described and documented in the system security plan",
    "the frequency to update the system security plan is defined",
    "system security plans are updated with the defined frequency"
  ],

  /* -------- 3.13 System & Communications Protection -------- */
  "3.13.1": [
    "the external system boundary is defined",
    "key internal system boundaries are defined",
    "communications are monitored at the external system boundary",
    "communications are monitored at key internal boundaries",
    "communications are controlled at the external system boundary",
    "communications are controlled at key internal boundaries",
    "communications are protected at the external system boundary",
    "communications are protected at key internal boundaries"
  ],
  "3.13.2": [
    "architectural designs that promote effective information security are identified",
    "software development techniques that promote effective information security are identified",
    "systems engineering principles that promote effective information security are identified",
    "identified architectural designs are employed",
    "identified software development techniques are employed",
    "identified systems engineering principles are employed"
  ],
  "3.13.3": [
    "user functionality is identified",
    "system management functionality is identified",
    "user functionality is separated from system management functionality"
  ],
  "3.13.4": [
    "unauthorized and unintended information transfer via shared system resources is prevented"
  ],
  "3.13.5": [
    "publicly accessible system components are identified",
    "subnetworks for publicly accessible system components are physically or logically separated from internal networks"
  ],
  "3.13.6": [
    "network communications traffic is denied by default",
    "network communications traffic is allowed by exception"
  ],
  "3.13.7": [
    "remote devices are prevented from simultaneously establishing non-remote connections with organizational systems and communicating via some other connection to resources in external networks (i.e., split tunneling)"
  ],
  "3.13.8": [
    "cryptographic mechanisms intended to prevent unauthorized disclosure of CUI are identified",
    "alternative physical safeguards intended to prevent unauthorized disclosure of CUI are identified",
    "either cryptographic mechanisms or alternative physical safeguards are implemented to prevent unauthorized disclosure of CUI during transmission"
  ],
  "3.13.9": [
    "conditions requiring a network connection to terminate are defined",
    "network connections are terminated at the end of the sessions or after any of the defined conditions occur"
  ],
  "3.13.10": [
    "cryptographic keys are established whenever cryptography is employed",
    "cryptographic keys are managed whenever cryptography is employed"
  ],
  "3.13.11": [
    "FIPS-validated cryptography is employed to protect the confidentiality of CUI"
  ],
  "3.13.12": [
    "collaborative computing devices are identified",
    "remote activation of collaborative computing devices is prohibited",
    "an explicit indication of use is provided to users physically present at the devices"
  ],
  "3.13.13": [
    "use of mobile code is controlled",
    "use of mobile code is monitored"
  ],
  "3.13.14": [
    "use of Voice over Internet Protocol (VoIP) technologies is controlled",
    "use of Voice over Internet Protocol (VoIP) technologies is monitored"
  ],
  "3.13.15": [
    "the authenticity of communications sessions is protected"
  ],
  "3.13.16": [
    "the confidentiality of CUI at rest is protected"
  ],

  /* -------- 3.14 System & Information Integrity -------- */
  "3.14.1": [
    "the time within which to identify system flaws is specified",
    "system flaws are identified within the specified time frame",
    "the time within which to report system flaws is specified",
    "system flaws are reported within the specified time frame",
    "the time within which to correct system flaws is specified",
    "system flaws are corrected within the specified time frame"
  ],
  "3.14.2": [
    "designated locations for malicious code protection are identified",
    "protection from malicious code at designated locations is provided"
  ],
  "3.14.3": [
    "response actions to system security alerts and advisories are identified",
    "system security alerts and advisories are monitored",
    "actions in response to system security alerts and advisories are taken"
  ],
  "3.14.4": [
    "malicious code protection mechanisms are updated when new releases are available"
  ],
  "3.14.5": [
    "the frequency for malicious code scans is defined",
    "malicious code scans are performed with the defined frequency",
    "real-time malicious code scans of files from external sources as files are downloaded, opened, or executed are performed"
  ],
  "3.14.6": [
    "the system is monitored to detect attacks and indicators of potential attacks",
    "inbound communications traffic is monitored to detect attacks and indicators of potential attacks",
    "outbound communications traffic is monitored to detect attacks and indicators of potential attacks"
  ],
  "3.14.7": [
    "authorized use of the system is defined",
    "unauthorized use of the system is identified"
  ]
};

/**
 * Convenience label: "[a] authorized users are identified".
 * The index-to-letter mapping matches NIST SP 800-171A convention: [a], [b],
 * [c]… wrapping through the alphabet (rare — most controls have < 15 items).
 */
export function objectiveLabel(index: number): string {
  return `[${String.fromCharCode(97 + (index % 26))}]`;
}

export const CONTROLS: Control[] = SEED.map(([id, family, name, requirement, weight, status], i) => ({
  id,
  family,
  familyName: FAMILY_NAMES[family],
  name,
  requirement,
  objectives: CONTROL_OBJECTIVES[id] ?? [],
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
