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
  const [tamperedData, setTamperedData] = useState({}); // index -> text
  const [tamperedIndices, setTamperedIndices] = useState([]);
  const [brokenIndices, setBrokenIndices] = useState([]);

  // Fetch the current blockchain from the FastAPI backend
  const fetchChain = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chain`);
      if (!response.ok) throw new Error("Server error");
      const data = await response.ok ? await response.json() : [];
      
      setChain(data);
      setLocalChain(data.map(b => ({ ...b })));
      setIsBackendOffline(false);
      
      // Clear local tamper states upon a fresh fetch
      setTamperedData({});
      setTamperedIndices([]);
      setBrokenIndices([]);
      setLocalValid(true);
      
      // Validate the fetched chain
      const valResponse = await fetch(`${API_BASE_URL}/validate`);
      const valData = await valResponse.json();
      setIsValid(valData.valid);
    } catch (error) {
      console.warn("FastAPI Backend seems offline. Falling back to local state machine.");
      setIsBackendOffline(true);
      
      // If we don't have a local chain yet, initialize Genesis block
      if (chain.length === 0) {
        const genesisTimestamp = 1717592400; // static timestamp
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

  // Initial load
  useEffect(() => {
    fetchChain();
  }, []);

  // Handle local block data changes (Tamper Detection Sandbox)
  const handleLocalDataChange = async (index, newData) => {
    const updatedTamperedData = { ...tamperedData, [index]: newData };
    setTamperedData(updatedTamperedData);

    const baseChain = [...chain];
    const newLocalChain = baseChain.map(b => ({ ...b }));
    
    // Apply all edits stored in updatedTamperedData
    for (const [idxStr, text] of Object.entries(updatedTamperedData)) {
      const idx = parseInt(idxStr);
      if (idx >= 0 && idx < newLocalChain.length) {
        newLocalChain[idx].data = text;
      }
    }

    // Compute hashes sequentially
    const tIndices = [];
    const bIndices = [];

    // Recalculate hashes for everything starting from index 0
    // In our learning sandbox:
    // 1. If block data changes, its current hash changes. We label it [Tampered].
    // 2. For all subsequent blocks, their `previous_hash` points to the old hash, 
    //    so the chain link breaks! We label them [Chain Broken].
    for (let i = 0; i < newLocalChain.length; i++) {
      const block = newLocalChain[i];
      const originalBlock = chain[i];
      
      // Calculate hash based on current values in the local inputs
      const currentHash = await calculateSHA256(
        `${block.index}${block.timestamp}${block.data}${block.previous_hash}`
      );
      
      block.hash = currentHash;

      // Has this specific block's data changed compared to the server db?
      if (updatedTamperedData[i] !== undefined && updatedTamperedData[i] !== originalBlock.data) {
        tIndices.push(i);
      }
      
      // Check link integrity for index > 0
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

  // Sync tamper action with the backend database
  const handleTamperBackend = async (index, data) => {
    if (isBackendOffline) return;
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/tamper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, data })
      });
      // Refetch chain state from server to prove database is tampered
      await fetchChain();
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#ef4444', '#f59e0b'],
        origin: { y: 0.8 }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new block
  const handleAddBlock = async (e) => {
    e.preventDefault();
    if (!addData.trim()) return;
    
    setIsLoading(true);
    const textToAdd = addData;
    setAddData('');

    if (isBackendOffline) {
      // Offline local simulation add block
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
      
      // Trigger success animations
      confetti({
        particleCount: 80,
        spread: 80,
        colors: ['#06b6d4', '#8b5cf6', '#10b981'],
        origin: { y: 0.8 }
      });
      setIsLoading(false);
      return;
    }

    // Online FastAPI add block
    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: textToAdd })
      });
      if (!response.ok) throw new Error("Adding block failed");
      
      // Trigger success animations
      confetti({
        particleCount: 100,
        spread: 70,
        colors: ['#06b6d4', '#8b5cf6', '#10b981'],
        origin: { y: 0.8 }
      });
      
      await fetchChain();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-verify chain manually
  const triggerManualScan = async () => {
    setIsRefreshing(true);
    await fetchChain();
    setIsRefreshing(false);
  };

  // Reset locally tampered values
  const resetLocalEdits = () => {
    setLocalChain(chain.map(b => ({ ...b })));
    setTamperedData({});
    setTamperedIndices([]);
    setBrokenIndices([]);
    setLocalValid(true);
  };

  // Global visual indicator mapping
  const isChainCurrentlyValid = localValid && isValid;

  return (
    <div className="min-h-screen relative flex flex-col justify-between">
      {/* 3D background animation and cyber grid */}
      <NetworkBackground />
      <div className="cyber-grid" />
      <div className="cyber-bg" />

      {/* Header / Landing Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="glass px-6 py-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-white/10">
              <FiShield className="w-5 h-5 text-glow-blue animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-outfit">
                ChainLearn <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 bg-cyan-950/50 border border-cyan-500/20 px-2 py-0.5 rounded">v1.0.0</span>
              </h1>
              <p className="text-[11px] text-gray-400 font-medium">Learn Blockchain by Building and Breaking One</p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-3">
            {isBackendOffline ? (
              <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-500/30 rounded-full px-3.5 py-1.5 text-xs text-amber-400 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                <FiServer className="w-3.5 h-3.5" />
                <span>Local Simulation Mode (API Offline)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/30 rounded-full px-3.5 py-1.5 text-xs text-emerald-400 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                <FiActivity className="w-3.5 h-3.5 text-glow-green animate-pulse" />
                <span>Connected to FastAPI (localhost:8000)</span>
              </div>
            )}
            
            <button 
              onClick={() => fetchChain(true)}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              title="Refresh Chain State"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Educational Application Body */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* HERO SECTION / DEMO PREVIEW */}
        <section className="text-center py-6 max-w-3xl mx-auto flex flex-col gap-2.5">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl font-outfit">
            Master Blockchain in <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent text-glow-purple">30 Seconds</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            Interact with the 3D block nodes below. Edit transactions to tamper data, witness block hash changes, and see chain security break in real time.
          </p>
        </section>

        {/* 3D BLOCKCHAIN VISUALIZER PANELS */}
        <section className="w-full flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <FiLock className="text-cyan-400" /> Interactive 3D Chain Explorer
            </h3>
            {tamperedIndices.length > 0 && (
              <button 
                onClick={resetLocalEdits}
                className="px-3 py-1 text-xs rounded bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-400 font-semibold transition-all active:scale-95"
              >
                Reset Local Edits
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

        {/* CONTROLS: VALIDATION DASHBOARD AND ADD BLOCK CARD */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Validation Status Panel */}
          <div className="lg:col-span-5 glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden">
            {/* Background cyber pattern */}
            <div className="absolute right-0 top-0 opacity-5 -z-10 translate-x-1/4 -translate-y-1/4">
              <FiShield className="w-64 h-64 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg border ${
                  isChainCurrentlyValid 
                    ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-950/50 border-red-500/30 text-red-400'
                }`}>
                  <FiShield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Integrity Dashboard</h3>
                  <p className="text-[11px] text-gray-400">Verifying blocks hashes & predecessor linking</p>
                </div>
              </div>

              {/* Status Visual Ring */}
              <div className="my-6 flex flex-col items-center justify-center text-center gap-3">
                <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 ${
                  isChainCurrentlyValid 
                    ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] bg-emerald-950/15' 
                    : 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)] bg-red-950/15'
                }`}>
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${
                    isChainCurrentlyValid ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    CHAIN STATUS
                  </span>
                  <span className={`text-sm font-extrabold uppercase mt-1 ${
                    isChainCurrentlyValid ? 'text-emerald-300' : 'text-red-300 animate-pulse'
                  }`}>
                    {isChainCurrentlyValid ? 'INTEGRAL' : 'BROKEN'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  <div className={`text-md font-bold ${isChainCurrentlyValid ? 'text-emerald-400 text-glow-green' : 'text-red-400 text-glow-red'}`}>
                    {isChainCurrentlyValid ? 'Blockchain Valid' : 'Security Warning: Invalid Chain'}
                  </div>
                  <p className="text-xs text-gray-400 max-w-xs leading-normal">
                    {isChainCurrentlyValid 
                      ? 'Every block data matches its hash, and all cryptographic linking pins are securely locked.' 
                      : 'Data tampering detected! The link signature between modified nodes has collapsed.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={triggerManualScan}
              disabled={isLoading || isRefreshing}
              className={`w-full py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isChainCurrentlyValid
                  ? 'bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-900/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 hover:bg-red-900/40 text-red-300'
              }`}
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
              Run Full Verification Scan
            </button>
          </div>

          {/* Add Block Form Card */}
          <div className="lg:col-span-7 glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400">
                  <FiPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Seal New Block</h3>
                  <p className="text-[11px] text-gray-400">Add transaction records and generate a link hash</p>
                </div>
              </div>

              {/* Transaction Input Form */}
              <form onSubmit={handleAddBlock} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase">BLOCK DATA CONTENT</label>
                  <input
                    type="text"
                    value={addData}
                    onChange={(e) => setAddData(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                    placeholder="Enter transactional ledger data..."
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>

                {/* Preset Templates */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">OR CLICK A DATA TEMPLATE:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TRANSACTIONS.map((tx, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAddData(tx)}
                        className="px-2.5 py-1 text-[10px] rounded bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-white/10 text-gray-300 font-mono transition-all text-left truncate max-w-full"
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
                  className="w-full mt-4 bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-600 text-white font-bold text-xs py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:pointer-events-none"
                >
                  <FiPlus className="w-4 h-4" />
                  {isLoading ? 'Sealing and Hashing Block...' : 'Assemble & Append Block'}
                </button>
              </form>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-gray-500 border-t border-white/5 pt-3">
              <FiTerminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Block creates index, records timestamp, grabs previous hash, hashes current string.</span>
            </div>
          </div>

        </section>

        {/* SHA-256 HASH VISUALIZER SANDBOX */}
        <section className="w-full mt-2">
          <div className="flex items-center gap-1.5 mb-4">
            <FiCpu className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white">SHA-256 Hashing Sandbox</h3>
          </div>
          <HashVisualizer />
        </section>

        {/* DYNAMIC EDUCATIONAL HUB */}
        <section className="w-full mt-2 bg-black/20 rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-1.5 mb-4">
            <FiBookOpen className="text-violet-400" />
            <h3 className="text-lg font-bold text-white">ChainLearn Interactive Learning Hub</h3>
          </div>
          <EducationalGuide 
            activeCardIndex={activeCardIndex}
            setActiveCardIndex={setActiveCardIndex}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-gray-950/60 py-6 mt-12 text-center select-none font-sans">
        <div className="max-w-7xl mx-auto px-4 text-[11px] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <FiShield className="text-violet-500 w-3.5 h-3.5" />
            <span>ChainLearn Educational Prototype. Made with React, Three.js & FastAPI.</span>
          </div>
          <div className="text-gray-600">
            No cryptocurrency, NFTs, mining, or wallets. Dedicated strictly to fundamental ledger security concepts.
          </div>
        </div>
      </footer>
    </div>
  );
}
