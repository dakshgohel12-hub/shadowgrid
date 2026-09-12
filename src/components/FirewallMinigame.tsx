import React, { useState, useEffect, useCallback } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

const FirewallMinigame = () => {
  const [targetCode, setTargetCode] = useState(['A', '1', 'X', 'Y', 'Z']);
  const [lockedCode, setLockedCode] = useState<(string | null)>([null, null, null, null, null]);
  const [activeColumn, setActiveColumn] = useState(0);
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused' | 'success' | 'failed'>('idle');
  const [scrollingChars, setScrollingChars] = useState<string[][]>([[], [], [], [], []]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const initGame = useCallback((autoStart = false) => {
    const newTarget = Array(5).fill(null).map(() => CHARS[Math.floor(Math.random() * CHARS.length)]);
    setTargetCode(newTarget);
    setLockedCode([null, null, null, null, null]);
    setActiveColumn(0);
    setStatus(autoStart ? 'playing' : 'idle');
    
    // Initialize 5 columns, each with 7 random characters
    const initScrollers = Array(5).fill(null).map(() => 
      Array(7).fill(null).map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
    );
    setScrollingChars(initScrollers);
  }, []);

  useEffect(() => {
    initGame(false);
  }, [initGame]);

  useEffect(() => {
    if (status !== 'playing') return;
    
    let speed = 200;
    if (difficulty === 'easy') speed = 350;
    if (difficulty === 'hard') speed = 100;
    
    const interval = setInterval(() => {
      setScrollingChars(prev => prev.map((colChars, colIndex) => {
        // If this column is already locked, don't scroll it
        if (colIndex < activeColumn) return colChars;
        
        // Generate new top char, shift the rest down
        const newChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        return [newChar, ...colChars.slice(0, 6)]; // Keep 7 elements
      }));
    }, speed);

    return () => clearInterval(interval);
  }, [status, activeColumn, difficulty]);

  const handleInjection = () => {
    if (status === 'success' || status === 'failed') {
      initGame(true);
      return;
    }
    
    if (status !== 'playing') return;
    
    // Lock current character for active column. 
    // The "locked" character is the center one (index 3 in the array of 7)
    const lockedChar = scrollingChars[activeColumn][3];
    const newLocked = [...lockedCode];
    newLocked[activeColumn] = lockedChar;
    setLockedCode(newLocked);
    
    const nextCol = activeColumn + 1;
    setActiveColumn(nextCol);
    
    if (nextCol === 5) {
      // Game over, check result
      if (newLocked.join('') === targetCode.join('')) {
        setStatus('success');
      } else {
        setStatus('failed');
      }
    }
  };

  const togglePlay = () => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'idle' || status === 'paused') {
      setStatus('playing');
    } else {
      initGame(true);
    }
  };

  return (
    <div className={`terminal-box p-4 p-md-5 ${status === 'failed' ? 'fail-glitch' : ''}`} style={{ backgroundColor: '#050a0f', border: `2px solid ${status === 'success' ? 'var(--cyber-green)' : (status === 'failed' ? 'var(--cyber-red)' : 'var(--cyber-blue)')}` }}>
      <div className="text-center mb-5">
        <h4 className="text-secondary mb-3" style={{ letterSpacing: '2px' }}>TARGET PASSCODE</h4>
        <div className="d-flex justify-content-center gap-4 fs-1 fw-bold text-info" style={{ textShadow: '0 0 10px rgba(0, 216, 255, 0.5)' }}>
          {targetCode.map((char, idx) => (
            <span key={idx}>{char}</span>
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-center gap-2 gap-md-4 mb-5 overflow-hidden">
        {scrollingChars.map((col, cIdx) => (
          <div key={cIdx} className="d-flex flex-column align-items-center rounded p-1 p-md-2" style={{ width: '60px', backgroundColor: 'rgba(0,0,0,0.5)', border: cIdx === activeColumn ? '1px solid var(--cyber-blue)' : '1px solid #1a2333', transition: 'all 0.2s', boxShadow: cIdx === activeColumn && status === 'playing' ? '0 0 15px rgba(0,216,255,0.2)' : 'none' }}>
            {col.map((char, rIdx) => {
              const isCenter = rIdx === 3;
              const isLocked = cIdx < activeColumn;
              const isCorrect = isLocked && lockedCode[cIdx] === targetCode[cIdx];
              
              let charColor = 'text-secondary opacity-25';
              if (isCenter) {
                if (isLocked) {
                  charColor = isCorrect ? 'text-success' : 'text-danger';
                } else if (cIdx === activeColumn) {
                  charColor = status === 'playing' ? 'text-white border-top border-bottom border-info' : 'text-secondary border-top border-bottom border-secondary';
                } else {
                  charColor = 'text-white opacity-75';
                }
              } else if (isLocked) {
                 charColor = 'text-secondary opacity-0'; // Hide surrounding chars when locked
              } else {
                 charColor = 'text-secondary opacity-50'; // Scrolling blur
              }

              return (
                <div key={rIdx} className={`fs-3 fw-bold w-100 text-center py-1 ${charColor}`} style={{ height: '40px', transition: 'all 0.1s' }}>
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="text-center" style={{ minHeight: '80px' }}>
        {status === 'success' && (
          <h2 className="text-success fw-bold flash-green-text mb-4" style={{ textShadow: '0 0 20px var(--cyber-green)' }}>FIREWALL BYPASSED</h2>
        )}
        {status === 'failed' && (
          <h2 className="text-danger fw-bold mb-4" style={{ textShadow: '0 0 20px var(--cyber-red)' }}>BREACH FAILED - TRACING IP</h2>
        )}
        
        <div className="d-flex justify-content-center gap-3 mb-4 mx-auto" style={{ maxWidth: '500px' }}>
          <button 
            className={`btn btn-lg flex-grow-1 ${status === 'playing' ? 'btn-cyber' : 'btn-outline-secondary'}`}
            style={{ fontWeight: 'bold', letterSpacing: '2px', border: status === 'playing' ? '' : '1px solid #333' }}
            onClick={handleInjection}
            disabled={status === 'idle' || status === 'paused'}
          >
            {status === 'success' || status === 'failed' ? '[ RETRY ]' : '[ INJECT ]'}
          </button>
          
          <button 
            className={`btn btn-lg ${(status === 'idle' || status === 'paused') ? 'btn-outline-success' : 'btn-outline-danger'}`}
            style={{ fontWeight: 'bold', letterSpacing: '2px', minWidth: '140px' }}
            onClick={togglePlay}
          >
            {status === 'playing' ? '[ STOP ]' : '[ START ]'}
          </button>
        </div>

        <div className="mt-2">
          <p className="text-secondary small mb-2" style={{ letterSpacing: '1px' }}>DIFFICULTY LEVEL</p>
          <div className="btn-group" role="group">
            <button type="button" className={`btn btn-sm ${difficulty === 'easy' ? 'btn-success' : 'btn-outline-secondary'}`} style={{ fontWeight: 'bold' }} onClick={() => { setDifficulty('easy'); initGame(true); }}>EASY</button>
            <button type="button" className={`btn btn-sm ${difficulty === 'medium' ? 'btn-warning' : 'btn-outline-secondary'}`} style={{ fontWeight: 'bold' }} onClick={() => { setDifficulty('medium'); initGame(true); }}>MEDIUM</button>
            <button type="button" className={`btn btn-sm ${difficulty === 'hard' ? 'btn-danger' : 'btn-outline-secondary'}`} style={{ fontWeight: 'bold' }} onClick={() => { setDifficulty('hard'); initGame(true); }}>HARD</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirewallMinigame;
