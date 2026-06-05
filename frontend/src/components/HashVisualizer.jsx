import React, { useState, useEffect } from 'react';
import { calculateSHA256 } from '../utils/crypto';
import { FiCpu, FiChevronsDown, FiLock, FiInfo } from 'react-icons/fi';

export default function HashVisualizer() {
  const [inputData, setInputData] = useState('Blockchain Fundamentals');
  const [hash, setHash] = useState('');
  
  // Avalanche Demo States
  const [inputA, setInputA] = useState('Bitcoin');
  const [inputB, setInputB] = useState('Bitcoim'); // 1 letter difference
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');
  
  useEffect(() => {
    const computeHash = async () => {
      const h = await calculateSHA256(inputData);
      setHash(h);
    };
    computeHash();
  }, [inputData]);

  useEffect(() => {
    const computeAvalancheHashes = async () => {
      const hA = await calculateSHA256(inputA);
      const hB = await calculateSHA256(inputB);
      setHashA(hA);
      setHashB(hB);
    };
    computeAvalancheHashes();
  }, [inputA, inputB]);

  // Function to highlight differences in hashes for avalanche demonstration
  const renderComparedHashes = () => {
    if (!hashA || !hashB) return null;
    
    // Group characters to fit nicely on screen
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="bg-black/40 border border-white/5 rounded-xl p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">INPUT A</span>
            <input 
              type="text" 
              value={inputA} 
              onChange={(e) => setInputA(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono w-28 text-right"
            />
          </div>
          <div className="font-mono text-xs break-all bg-black/30 p-2 rounded text-cyan-200 select-all border border-cyan-950">
            {hashA}
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider font-mono">INPUT B (1 letter diff)</span>
            <input 
              type="text" 
              value={inputB} 
              onChange={(e) => setInputB(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono w-28 text-right"
            />
          </div>
          <div className="font-mono text-xs break-all bg-black/30 p-2 rounded text-pink-200 select-all border border-pink-950">
            {hashB}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Live Hashing Sandbox */}
      <div className="lg:col-span-7 glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <FiCpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Live SHA-256 Hashing Sandbox</h3>
              <p className="text-xs text-gray-400">See how raw text inputs transform into a secure digital fingerprint</p>
            </div>
          </div>

          {/* User Input */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs text-gray-400 font-semibold">INPUT DATA</label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              rows="3"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono resize-none transition-colors"
              placeholder="Type anything here to see the SHA-256 hashing in action..."
            />
            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span>LENGTH: {inputData.length} CHARS</span>
              <span>TYPE: UTF-8 STRING</span>
            </div>
          </div>

          {/* Flow Animation Arrow */}
          <div className="flex justify-center items-center py-2 flex-col text-gray-600">
            <FiChevronsDown className="w-6 h-6 animate-bounce text-cyan-500/50" />
            <span className="text-[10px] text-cyan-500/60 font-bold font-mono tracking-widest mt-0.5">SHA-256 ALGORITHM</span>
          </div>

          {/* SHA-256 Output */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs text-cyan-400 font-bold tracking-wider font-mono flex items-center gap-1">
              <FiLock className="w-3.5 h-3.5" /> SECURED SHA-256 HASH
            </label>
            <div className="w-full bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-4 font-mono text-sm break-all text-emerald-400 text-glow-green select-all relative overflow-hidden">
              {/* Subtle back glowing badge */}
              <div className="absolute right-2 bottom-1 text-[8px] text-cyan-500/20 font-bold uppercase tracking-widest pointer-events-none">
                256-BIT SIGNATURE
              </div>
              {hash}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Concept - The Avalanche Effect */}
      <div className="lg:col-span-5 glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-pink-950 border border-pink-500/30 text-pink-400">
              <FiLock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">The Avalanche Effect</h3>
              <p className="text-xs text-gray-400">A fundamental cryptographic rule of block validation</p>
            </div>
          </div>

          <div className="text-xs text-gray-300 leading-relaxed mb-4 flex flex-col gap-2">
            <p>
              In secure hashing, a tiny change of just **one character** in the source data results in a **completely, unpredictably different hash output**.
            </p>
            <p>
              This is called the **Avalanche Effect**. It makes the blockchain tamper-proof because editing even a single character breaks all hashes downstream!
            </p>
          </div>

          {/* Render the live Avalanche comparison */}
          {renderComparedHashes()}

          <div className="mt-4 flex items-start gap-2 bg-white/5 border border-white/5 rounded-xl p-3">
            <FiInfo className="text-violet-400 w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-gray-400 leading-normal">
              Compare the two hashes above. Notice how changing a single character <code className="bg-black/30 text-white rounded px-1">n</code> to <code className="bg-black/30 text-white rounded px-1">m</code> completely alters the 64-char fingerprint. This prevents attackers from guessing changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
