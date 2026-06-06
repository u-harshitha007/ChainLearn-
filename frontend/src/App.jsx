import React, { useState, useEffect, useCallback } from 'react';
import NetworkBackground from './components/NetworkBackground';
import BlockchainVisualizer from './components/BlockchainVisualizer';
import HashVisualizer from './components/HashVisualizer';
import EducationalGuide from './components/EducationalGuide';
import { calculateSHA256 } from './utils/crypto';
import confetti from 'canvas-confetti';
import { 
  FiShield, 
  FiAlertTriangle, 
  FiPlus, 
  FiCpu, 
  FiServer, 
  FiActivity, 
  FiRefreshCw, 
  FiLock,
  FiTerminal,
  FiBookOpen
} from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:8000';

const PRESET_TRANSACTIONS = [
  "Alice paid Bob 0.5 BTC",
  "Smart Contract Sealed: Land Registry #4092",
  "Firmware Update v2.4.1 Cryptographic Signature",
  "User hash_harshitha logged in securely",
  "Sensor Node #87: Temperature = 24.5°C"
];

export default function App() {
  // Chain and validation states
  const [chain, setChain] = useState([]);
  const [localChain, setLocalChain] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [localValid, setLocalValid] = useState(true);
  
  // UI states
  const [addData, setAddData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  
  // Tampering tracking
  const [tamperedData, setTamperedData] = useState({});
  const [tamperedIndices, setTamperedIndices] = useState([]);
  const [brokenIndices, setBrokenIndices] = useState([]);

  const fetchChain = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chain`);
      if (!response.ok) throw new Error("Server error");
      const data = await response.ok ? await response.json() : [];
      
      setChain(data);
      setLocalChain(data.map(b => ({ ...b })));
      setIsBackendOffline(false);
      
      setTamperedData({});
      setTamperedIndices([]);
      setBrokenIndices([]);
      setLocalValid(true);
      
      const valResponse = await fetch(`${API_BASE_URL}/validate`);
      const valData = await valResponse.json();
      setIsValid(valData.valid);
    } catch (error) {
      console.warn("FastAPI Backend seems offline. Falling back to local state machine.");
      setIsBackendOffline(true);
      
      if (chain.length === 0) {
        const genesisTimestamp = 1717592400;
        const genesisData = "Genesis Block";
        const genesisPrevHash = "0000";
        const genesisHash = await calculateSHA256(`0${genesisTimestamp}${genesisData}${genesisPrevHash}`);
        
        const genesisBlock = {
          index: 0,
          timestamp: genesisTimestamp,
          data: genesisData,
          previous_hash: genesisPrevHash,
          hash: genesisHash
        };
        setChain([genesisBlock]);
        setLocalChain([genesisBlock]);
        setIsValid(true);
        setLocalValid(true);
      }
    } finally {
      if (showIndicator) setIsRefreshing(false);
    }
  }, [chain.length]);

  useEffect(() => {
    fetchChain();
  }, []);

  const handleLocalDataChange = async (index, newData) => {
    const updatedTamperedData = { ...tamperedData, [index]: newData };
    setTamperedData(updatedTamperedData);

    const baseChain = [...chain];
    const newLocalChain = baseChain.map(b => ({ ...b }));
    
    for (const [idxStr, text] of Object.entries(updatedTamperedData)) {
      const idx = parseInt(idxStr);
      if (idx >= 0 && idx < newLocalChain.length) {
        newLocalChain[idx].data = text;
      }
    }

    const tIndices = [];
    const bIndices = [];

    for (let i = 0; i < newLocalChain.length; i++) {
      const block = newLocalChain[i];
      const originalBlock = chain[i];
      
      const currentHash = await calculateSHA256(
        `${block.index}${block.timestamp}${block.data}${block.previous_hash}`
      );
      
      block.hash = currentHash;

      if (updatedTamperedData[i] !== undefined && updatedTamperedData[i] !== originalBlock.data) {
        tIndices.push(i);
      }
      
      if (i > 0) {
        const prevBlock = newLocalChain[i - 1];
        if (block.previous_hash !== prevBlock.hash) {
          bIndices.push(i);
        }
      }
    }

    setLocalChain(newLocalChain);
    setTamperedIndices(tIndices);
    setBrokenIndices(bIndices);
    setLocalValid(tIndices.length === 0 && bIndices.length === 0);
  };

  const handleTamperBackend = async (index, data) => {
    if (isBackendOffline) return;
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/tamper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, data })
      });
      await fetchChain();
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#DC2626', '#D97706'],
        origin: { y: 0.8 }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    if (!addData.trim()) return;
    
    setIsLoading(true);
    const textToAdd = addData;
    setAddData('');

    if (isBackendOffline) {
      const lastBlock = chain[chain.length - 1];
      const newIndex = lastBlock.index + 1;
      const newTimestamp = Date.now() / 1000;
      const newPrevHash = lastBlock.hash;
      const newHash = await calculateSHA256(`${newIndex}${newTimestamp}${textToAdd}${newPrevHash}`);
      
      const newBlock = {
        index: newIndex,
        timestamp: newTimestamp,
        data: textToAdd,
        previous_hash: newPrevHash,
        hash: newHash
      };

      const updatedChain = [...chain, newBlock];
      setChain(updatedChain);
      setLocalChain(updatedChain.map(b => ({ ...b })));
      
      confetti({
        particleCount: 80,
        spread: 80,
        colors: ['#D97706', '#A52A2A', '#10B981'],
        origin: { y: 0.8 }
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: textToAdd })
      });
      if (!response.ok) throw new Error("Adding block failed");
      
      confetti({
        particleCount: 100,
        spread: 70,
        colors: ['#D97706', '#A52A2A', '#10B981'],
        origin: { y: 0.8 }
      });
      
      await fetchChain();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualScan = async () => {
    setIsRefreshing(true);
    await fetchChain();
    setIsRefreshing(false);
  };

  const resetLocalEdits = () => {
    setLocalChain(chain.map(b => ({ ...b })));
    setTamperedData({});
    setTamperedIndices([]);
    setBrokenIndices([]);
    setLocalValid(true);
  };

  const isChainCurrentlyValid = localValid && isValid;

  return (
    <div className="min-h-screen relative flex flex-col justify-between" style={{ background: '#080606' }}>
      {/* Atmospheric background layers */}
      <NetworkBackground />
      <div className="cyber-grid" />
      <div className="cyber-bg" />
      {/* CRT scan-line overlay */}
      <div className="vault-scanlines" />

      {/* ── HEADER ── */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="glass px-6 py-4 rounded-sm border border-[#2a1515] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Vault icon badge */}
            <div className="w-10 h-10 rounded-sm flex items-center justify-center border border-[#7A1F1F]/60 bg-[#1a0a0a]"
                 style={{ boxShadow: '0 0 14px rgba(122,31,31,0.25), inset 0 0 8px rgba(122,31,31,0.1)' }}>
              <FiShield className="w-5 h-5 text-[#A52A2A]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-[0.08em] text-[#e8d0d0] uppercase font-mono flex items-center gap-2">
                ChainLearn
                <span className="text-[9px] font-mono tracking-widest text-[#7A1F1F] border border-[#7A1F1F]/40 bg-[#1a0808] px-1.5 py-0.5 rounded-sm">
                  v1.0.0
                </span>
              </h1>
              <p className="text-[11px] text-[#6b4a4a] font-mono tracking-wide">
                Build It. Break It. Understand It.
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-3">
            {isBackendOffline ? (
              <div className="flex items-center gap-2 bg-[#1a1000]/60 border border-[#D97706]/30 rounded-sm px-3.5 py-1.5 text-xs text-[#D97706] font-mono">
                <FiServer className="w-3.5 h-3.5" />
                <span>LOCAL MODE — API OFFLINE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#081008]/60 border border-[#10B981]/25 rounded-sm px-3.5 py-1.5 text-xs text-[#10B981] font-mono">
                <FiActivity className="w-3.5 h-3.5 animate-pulse" />
                <span>CONNECTED — localhost:8000</span>
              </div>
            )}
            
            <button 
              onClick={() => fetchChain(true)}
              disabled={isRefreshing}
              className="p-2 rounded-sm bg-[#120808] border border-[#2a1515] text-[#6b4a4a] hover:text-[#D97706] hover:border-[#D97706]/40 transition-all active:scale-95"
              title="Refresh Chain State"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* ── HERO ── */}
        <section className="text-center py-8 max-w-3xl mx-auto flex flex-col gap-3">
          {/* Archive classification label */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-px w-12 bg-[#7A1F1F]/50" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#7A1F1F] uppercase">
              Cryptographic Laboratory
            </span>
            <div className="h-px w-12 bg-[#7A1F1F]/50" />
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-[#e8d0d0] sm:text-5xl font-mono uppercase leading-tight">
            Secure Ledger{' '}
            <span className="text-[#D97706] text-glow-amber">Vault</span>
          </h2>

          <p className="text-sm text-[#7a5a5a] max-w-xl mx-auto leading-relaxed font-mono">
            An interactive environment for exploring hashes, block linking, validation, and tamper detection.
          </p>
        </section>

        {/* ── 3D BLOCKCHAIN EXPLORER ── */}
        <section className="w-full flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* Section marker */}
              <div className="w-1 h-5 bg-[#A52A2A] rounded-full" />
              <h3 className="text-sm font-bold text-[#c0a0a0] flex items-center gap-2 font-mono tracking-widest uppercase">
                <FiLock className="text-[#A52A2A] w-4 h-4" />
                Archive Chain Explorer
              </h3>
            </div>
            {tamperedIndices.length > 0 && (
              <button
                onClick={resetLocalEdits}
                className="px-3 py-1 text-xs rounded-sm bg-[#1a0808] border border-[#DC2626]/40 hover:border-[#DC2626]/70 text-[#DC2626] font-mono tracking-wider transition-all active:scale-95"
              >
                ↺ RESET LOCAL EDITS
              </button>
            )}
          </div>
          <BlockchainVisualizer 
            chain={localChain}
            tamperedIndices={tamperedIndices}
            brokenIndices={brokenIndices}
            onDataChange={handleLocalDataChange}
            onTamperBackend={isBackendOffline ? null : handleTamperBackend}
            activeCardIndex={activeCardIndex}
            setActiveCardIndex={setActiveCardIndex}
          />
        </section>

        {/* ── CONTROLS: VALIDATION + ADD BLOCK ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Validation Status — Security Operations Console */}
          <div className={`lg:col-span-5 rounded-sm p-6 flex flex-col justify-between relative overflow-hidden border transition-all duration-500 ${
            isChainCurrentlyValid
              ? 'bg-[#0a0f0a] border-[#10B981]/20'
              : 'bg-[#130505] border-[#DC2626]/30 animate-border-pulse-crimson'
          }`}
          style={isChainCurrentlyValid 
            ? { boxShadow: '0 0 30px rgba(16,185,129,0.04)' }
            : { boxShadow: '0 0 30px rgba(220,38,38,0.08)' }
          }>
            {/* BG watermark */}
            <div className="absolute right-0 top-0 opacity-[0.03] -z-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
              <FiShield className="w-64 h-64 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono tracking-[0.3em] text-[#5a3a3a] uppercase">
                  Security Operations Console
                </span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <div className={`p-2 rounded-sm border ${
                  isChainCurrentlyValid 
                    ? 'bg-[#0a1008] border-[#10B981]/25 text-[#10B981]' 
                    : 'bg-[#1a0505] border-[#DC2626]/35 text-[#DC2626]'
                }`}>
                  <FiShield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#d0b0b0] font-mono tracking-wider uppercase">
                    Chain Status
                  </h3>
                  <p className="text-[10px] text-[#5a3a3a] font-mono">
                    Hash integrity + predecessor linking
                  </p>
                </div>
              </div>

              {/* Status terminal display */}
              <div className="my-4 flex flex-col items-center justify-center text-center gap-3">
                <div className={`w-full py-5 rounded-sm border flex flex-col items-center justify-center transition-all duration-500 ${
                  isChainCurrentlyValid 
                    ? 'border-[#10B981]/25 bg-[#081008]' 
                    : 'border-[#DC2626]/35 bg-[#130404]'
                }`}
                style={isChainCurrentlyValid
                  ? { boxShadow: 'inset 0 0 20px rgba(16,185,129,0.04)' }
                  : { boxShadow: 'inset 0 0 20px rgba(220,38,38,0.06)' }
                }>
                  <span className="text-[9px] font-mono tracking-[0.35em] text-[#5a3a3a] uppercase mb-2">
                    CHAIN STATUS
                  </span>
                  <span className={`text-2xl font-bold font-mono tracking-[0.15em] uppercase ${
                    isChainCurrentlyValid 
                      ? 'text-[#10B981] text-glow-green' 
                      : 'text-[#DC2626] text-glow-red animate-pulse'
                  }`}>
                    {isChainCurrentlyValid ? 'INTEGRITY\nVERIFIED' : 'INTEGRITY\nCOMPROMISED'}
                  </span>
                </div>

                <p className="text-[10px] text-[#5a3a3a] max-w-xs leading-normal font-mono">
                  {isChainCurrentlyValid 
                    ? 'All cryptographic seals intact. No tampering detected across ledger entries.' 
                    : 'ALERT: Tampered data detected. Chain link signature collapsed.'}
                </p>
              </div>
            </div>

            <button
              onClick={triggerManualScan}
              disabled={isLoading || isRefreshing}
              className={`w-full py-2.5 rounded-sm border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-mono tracking-wider uppercase ${
                isChainCurrentlyValid
                  ? 'bg-[#0a1008] border-[#10B981]/25 hover:bg-[#0d1a0d] text-[#10B981]'
                  : 'bg-[#1a0505] border-[#DC2626]/35 hover:bg-[#200606] text-[#DC2626]'
              }`}
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
              Run Verification Scan
            </button>
          </div>

          {/* Add Block — Vault Entry Form */}
          <div className="lg:col-span-7 glass rounded-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono tracking-[0.3em] text-[#5a3a3a] uppercase">
                  Ledger Entry Terminal
                </span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-sm bg-[#1a0a08] border border-[#A52A2A]/30 text-[#A52A2A]">
                  <FiPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#d0b0b0] font-mono tracking-wider uppercase">
                    Seal New Block
                  </h3>
                  <p className="text-[10px] text-[#5a3a3a] font-mono">
                    Commit a transaction record to the chain
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddBlock} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#5a3a3a] font-mono tracking-[0.2em] uppercase">
                    Block Data Payload
                  </label>
                  <input
                    type="text"
                    value={addData}
                    onChange={(e) => setAddData(e.target.value)}
                    className="w-full bg-[#0e0808] border border-[#2a1515] rounded-sm px-3.5 py-2.5 text-xs text-[#d0b0b0] focus:outline-none focus:border-[#A52A2A]/60 font-mono transition-colors placeholder:text-[#3a2020]"
                    placeholder="Enter transaction or ledger entry..."
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[9px] text-[#3a2020] font-mono tracking-[0.25em] uppercase">
                    — Quick Templates —
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TRANSACTIONS.map((tx, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAddData(tx)}
                        className="px-2.5 py-1 text-[10px] rounded-sm bg-[#0e0808] border border-[#2a1515] hover:border-[#A52A2A]/40 hover:text-[#d0b0b0] text-[#5a3a3a] font-mono transition-all text-left truncate max-w-full"
                        disabled={isLoading}
                      >
                        {tx}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !addData.trim()}
                  className="w-full mt-4 bg-[#7A1F1F] hover:bg-[#A52A2A] text-[#e8c8c8] font-bold text-xs py-2.5 rounded-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none font-mono tracking-widest uppercase border border-[#A52A2A]/40"
                  style={{ boxShadow: '0 0 20px rgba(122,31,31,0.2)' }}
                >
                  <FiPlus className="w-4 h-4" />
                  {isLoading ? 'Sealing & Hashing...' : 'Commit to Ledger'}
                </button>
              </form>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#3a2020] border-t border-[#2a1515] pt-3 font-mono">
              <FiTerminal className="w-3.5 h-3.5 text-[#A52A2A]/60" />
              <span>Block records index, timestamp, previous hash, and SHA-256 fingerprint.</span>
            </div>
          </div>

        </section>

        {/* ── SHA-256 CRYPTOGRAPHIC WORKSTATION ── */}
        <section className="w-full mt-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#D97706] rounded-full" />
            <FiCpu className="text-[#D97706] w-4 h-4" />
            <h3 className="text-sm font-bold text-[#c0a0a0] font-mono tracking-widest uppercase">
              SHA-256 Cryptographic Workstation
            </h3>
          </div>
          <HashVisualizer />
        </section>

        {/* ── EDUCATIONAL GUIDE ── */}
        <section className="w-full mt-2 bg-[#0e0808] rounded-sm p-6 border border-[#2a1515]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#7A1F1F] rounded-full" />
            <FiBookOpen className="text-[#A52A2A] w-4 h-4" />
            <h3 className="text-sm font-bold text-[#c0a0a0] font-mono tracking-widest uppercase">
              ChainLearn — Knowledge Archive
            </h3>
          </div>
          <EducationalGuide 
            activeCardIndex={activeCardIndex}
            setActiveCardIndex={setActiveCardIndex}
          />
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-[#2a1515] bg-[#080606] py-5 mt-10 text-center select-none font-mono">
        <div className="max-w-7xl mx-auto px-4 text-[10px] text-[#3a2020] flex flex-col sm:flex-row justify-between items-center gap-4 tracking-wider">
          <div className="flex items-center gap-1.5">
            <FiShield className="text-[#7A1F1F] w-3.5 h-3.5" />
            <span>ChainLearn — Built with React, Three.js & FastAPI.</span>
          </div>
          <div className="text-[#2a1515]">
            No cryptocurrency, NFTs, or mining. Dedicated to cryptographic fundamentals.
          </div>
        </div>
      </footer>
    </div>
  );
}
