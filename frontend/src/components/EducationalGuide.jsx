import React from 'react';
import { FiBox, FiCpu, FiLink, FiShield, FiArrowRight } from 'react-icons/fi';

const CONCEPT_CARDS = [
  {
    icon: <FiBox className="w-5 h-5" />,
    title: "1. What is a Block?",
    accentColor: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20",
    summary: "The fundamental ledger entry container.",
    details: "A block is like a single page in a ledger book. It stores transaction records (Data), a unique identifier index, its own timestamp, and cryptographic linkage signatures. In our visualizer, you can see all of these variables laid out inside each 3D card.",
    actionLabel: "Highlight Block Structure"
  },
  {
    icon: <FiCpu className="w-5 h-5" />,
    title: "2. What is SHA-256?",
    accentColor: "text-violet-400 border-violet-500/20 bg-violet-950/20",
    summary: "The cryptographic digital fingerprint.",
    details: "SHA-256 takes any input (from a letter to an entire library) and spits out a unique 64-character hexadecimal fingerprint. Because it is a one-way street, you can compute the hash easily, but you can never decrypt the original data from the hash.",
    actionLabel: "Test Hashing Avalanche Effect"
  },
  {
    icon: <FiLink className="w-5 h-5" />,
    title: "3. What is Previous Hash?",
    accentColor: "text-amber-400 border-amber-500/20 bg-amber-950/20",
    summary: "The link that binds the chain.",
    details: "Each block references the hash of the block before it via the 'Previous Hash' field. This forms a chronological chain. If an attacker edits historical block #1, its hash changes. Since block #2 still points to the old hash, the link breaks immediately!",
    actionLabel: "Highlight Chain Links"
  },
  {
    icon: <FiShield className="w-5 h-5" />,
    title: "4. What is Chain Validation?",
    accentColor: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20",
    summary: "The automated integrity algorithm.",
    details: "Blockchains stay secure by continuously verifying two mathematical rules: (1) Does every block's current data hash match its sealed signature? (2) Does every block's previous hash link point to the preceding block's actual hash? If either fails, the chain is invalid.",
    actionLabel: "Scan Validation Status"
  }
];

export default function EducationalGuide({ activeCardIndex, setActiveCardIndex }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col mb-1">
        <h3 className="text-lg font-bold text-white leading-tight">Blockchain Foundations Guide</h3>
        <p className="text-xs text-gray-400">Select a concept card below to highlight and inspect its properties on the 3D visualizer</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONCEPT_CARDS.map((card, index) => {
          const isActive = activeCardIndex === index;
          
          return (
            <button
              key={index}
              onClick={() => setActiveCardIndex(isActive ? null : index)}
              className={`text-left glass rounded-xl p-4 border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:bg-white/5 ${
                isActive 
                  ? 'border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] bg-violet-950/10' 
                  : 'border-white/10'
              }`}
            >
              <div>
                <div className={`p-2 w-fit rounded-lg mb-3 flex items-center justify-center border ${card.accentColor}`}>
                  {card.icon}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{card.title}</h4>
                <p className="text-[11px] text-gray-400 mb-3 leading-normal">{card.summary}</p>
              </div>
              
              {isActive && (
                <div className="text-[11px] text-gray-300 border-t border-white/10 pt-2.5 mt-2 leading-relaxed animate-fade-in">
                  {card.details}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-cyan-400 mt-3 border-t border-white/5 pt-2 w-full justify-between">
                <span>{isActive ? "Hide Details" : card.actionLabel}</span>
                <FiArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? 'rotate-90 text-violet-400' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
