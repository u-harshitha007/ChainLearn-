import React, { useState, useEffect } from 'react';
import { calculateSHA256 } from '../utils/crypto';
import { FiCpu, FiChevronsDown, FiLock, FiInfo } from 'react-icons/fi';

export default function HashVisualizer() {
  const [inputData, setInputData] = useState('Blockchain Fundamentals');
  const [hash, setHash] = useState('');
  
  const [inputA, setInputA] = useState('Bitcoin');
  const [inputB, setInputB] = useState('Bitcoim');
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

  const renderComparedHashes = () => {
    if (!hashA || !hashB) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {/* Input A */}
        <div className="rounded-sm p-3" style={{ background: '#0e0808', border: '1px solid rgba(42,21,21,0.8)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] text-[#A52A2A] font-mono font-bold uppercase tracking-[0.25em]">
              INPUT A
            </span>
            <input 
              type="text" 
              value={inputA} 
              onChange={(e) => setInputA(e.target.value)}
              className="bg-[#080606] border border-[#2a1515] rounded-sm px-2 py-0.5 text-xs text-[#d0b0b0] focus:outline-none focus:border-[#A52A2A]/60 font-mono w-28 text-right"
            />
          </div>
          <div className="font-mono text-[10px] break-all p-2 rounded-sm select-all text-[#D97706]"
               style={{ background: '#080606', border: '1px solid rgba(217,119,6,0.15)', wordBreak: 'break-all' }}>
            {hashA}
          </div>
        </div>

        {/* Input B */}
        <div className="rounded-sm p-3" style={{ background: '#0e0808', border: '1px solid rgba(42,21,21,0.8)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] text-[#DC2626] font-mono font-bold uppercase tracking-[0.25em]">
              INPUT B — 1 char diff
            </span>
            <input 
              type="text" 
              value={inputB} 
              onChange={(e) => setInputB(e.target.value)}
              className="bg-[#080606] border border-[#2a1515] rounded-sm px-2 py-0.5 text-xs text-[#d0b0b0] focus:outline-none focus:border-[#DC2626]/60 font-mono w-28 text-right"
            />
          </div>
          <div className="font-mono text-[10px] break-all p-2 rounded-sm select-all text-[#DC2626]"
               style={{ background: '#080606', border: '1px solid rgba(220,38,38,0.15)', wordBreak: 'break-all' }}>
            {hashB}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* ── Live Hashing Sandbox ── */}
      <div className="lg:col-span-7 glass rounded-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono tracking-[0.3em] text-[#5a3a3a] uppercase">
              Cryptographic Workstation
            </span>
          </div>
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-sm bg-[#1a0e08] border border-[#D97706]/25 text-[#D97706]">
              <FiCpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#d0b0b0] font-mono tracking-wider uppercase">
                SHA-256 Live Sandbox
              </h3>
              <p className="text-[10px] text-[#5a3a3a] font-mono">
                Raw text → cryptographic fingerprint
              </p>
            </div>
          </div>

          {/* INPUT section */}
          <div className="flex flex-col gap-1.5 mb-3">
            <label className="text-[9px] text-[#5a3a3a] font-mono tracking-[0.25em] uppercase">
              ① INPUT
            </label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              rows="3"
              className="w-full bg-[#0e0808] border border-[#2a1515] rounded-sm px-3 py-2.5 text-sm text-[#d0b0b0] focus:outline-none focus:border-[#A52A2A]/60 font-mono resize-none transition-colors placeholder:text-[#3a2020]"
              placeholder="Enter any string to fingerprint..."
            />
            <div className="flex justify-between items-center text-[9px] text-[#3a2020] font-mono tracking-wider">
              <span>LENGTH: {inputData.length} CHARS</span>
              <span>ENCODING: UTF-8</span>
            </div>
          </div>

          {/* Flow indicator */}
          <div className="flex justify-center items-center py-3 flex-col text-[#3a2020]">
            <FiChevronsDown className="w-5 h-5 animate-bounce text-[#7A1F1F]" />
            <span className="text-[9px] text-[#5a2a2a] font-mono font-bold tracking-[0.35em] mt-1 uppercase">
              ② SHA-256 Transform
            </span>
          </div>

          {/* OUTPUT section */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-[9px] text-[#D97706] font-mono tracking-[0.25em] uppercase flex items-center gap-1">
              <FiLock className="w-3 h-3" /> ③ OUTPUT — 256-bit fingerprint
            </label>
            <div className="w-full rounded-sm p-4 font-mono text-sm break-all text-[#10B981] text-glow-green select-all relative overflow-hidden"
                 style={{ background: '#080f08', border: '1px solid rgba(16,185,129,0.2)', wordBreak: 'break-all' }}>
              <div className="absolute right-2 bottom-1 text-[8px] text-[#10B981]/15 font-mono uppercase tracking-widest pointer-events-none">
                256-BIT
              </div>
              {hash}
            </div>
          </div>
        </div>
      </div>

      {/* ── Avalanche Effect ── */}
      <div className="lg:col-span-5 glass rounded-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono tracking-[0.3em] text-[#5a3a3a] uppercase">
              Cryptographic Property
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-sm bg-[#1a0808] border border-[#DC2626]/25 text-[#DC2626]">
              <FiLock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#d0b0b0] font-mono tracking-wider uppercase">
                The Avalanche Effect
              </h3>
              <p className="text-[10px] text-[#5a3a3a] font-mono">
                A core rule of hash validation
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#7a5a5a] leading-relaxed mb-4 flex flex-col gap-2 font-mono">
            <p>
              A single character change produces a completely unpredictable output hash — no similarity preserved.
            </p>
            <p>
              This property makes blockchain tamper-proof: editing one character cascades through every downstream hash.
            </p>
          </div>

          {renderComparedHashes()}

          <div className="mt-4 flex items-start gap-2 rounded-sm p-3"
               style={{ background: '#0e0808', border: '1px solid rgba(42,21,21,0.6)' }}>
            <FiInfo className="text-[#D97706] w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-[#5a3a3a] leading-normal font-mono">
              Changing <code className="bg-[#080606] text-[#d0b0b0] rounded-sm px-1">n</code> to <code className="bg-[#080606] text-[#d0b0b0] rounded-sm px-1">m</code> yields a wholly different 64-char fingerprint. Attackers cannot predict or reverse-engineer changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
