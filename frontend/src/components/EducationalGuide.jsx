import React from 'react';
import { FiBox, FiCpu, FiLink, FiShield, FiArrowRight } from 'react-icons/fi';

const CONCEPT_CARDS = [
  {
    icon: <FiBox className="w-4 h-4" />,
    title: "01 — Block Structure",
    accentColor: { color: '#A52A2A', bg: 'rgba(122,31,31,0.15)', border: 'rgba(165,42,42,0.25)' },
    summary: "The fundamental ledger entry container.",
    details: "A block is like a single page in a ledger book. It stores transaction records (Data), a unique identifier index, its own timestamp, and cryptographic linkage signatures. In our visualizer, you can see all of these variables laid out inside each 3D card.",
    actionLabel: "Highlight Block Structure"
  },
  {
    icon: <FiCpu className="w-4 h-4" />,
    title: "02 — SHA-256 Hash",
    accentColor: { color: '#D97706', bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.22)' },
    summary: "The cryptographic digital fingerprint.",
    details: "SHA-256 takes any input (from a letter to an entire library) and produces a unique 64-character hexadecimal fingerprint. It is a one-way function: you can compute the hash easily, but you can never recover the original data from the hash alone.",
    actionLabel: "Test Avalanche Effect"
  },
  {
    icon: <FiLink className="w-4 h-4" />,
    title: "03 — Previous Hash",
    accentColor: { color: '#c2884d', bg: 'rgba(194,136,77,0.12)', border: 'rgba(194,136,77,0.22)' },
    summary: "The cryptographic chain link.",
    details: "Each block references the hash of the preceding block via the 'Previous Hash' field. This forms a chronological chain. If an attacker edits historical block #1, its hash changes. Since block #2 still points to the old hash, the link breaks immediately.",
    actionLabel: "Highlight Chain Links"
  },
  {
    icon: <FiShield className="w-4 h-4" />,
    title: "04 — Chain Validation",
    accentColor: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    summary: "The integrity verification algorithm.",
    details: "Blockchains stay secure by verifying two rules continuously: (1) Does every block's current data hash match its sealed signature? (2) Does every block's previous-hash field point to the preceding block's actual hash? Either failure invalidates the chain.",
    actionLabel: "Scan Validation Status"
  }
];

export default function EducationalGuide({ activeCardIndex, setActiveCardIndex }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col mb-1">
        <h3 className="text-sm font-bold text-[#c0a0a0] font-mono tracking-widest uppercase">
          Blockchain Foundations — Reference Archive
        </h3>
        <p className="text-[10px] text-[#5a3a3a] font-mono mt-1">
          Select a concept record to highlight its properties in the 3D explorer above.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONCEPT_CARDS.map((card, index) => {
          const isActive = activeCardIndex === index;
          const { color, bg, border } = card.accentColor;
          
          return (
            <button
              key={index}
              onClick={() => setActiveCardIndex(isActive ? null : index)}
              className="text-left flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: isActive ? bg : '#0e0808',
                border: `1px solid ${isActive ? border : 'rgba(42,21,21,0.8)'}`,
                borderRadius: '2px',
                padding: '14px',
                boxShadow: isActive ? `0 0 18px ${color}22` : 'none',
              }}
            >
              <div>
                {/* Icon */}
                <div className="p-1.5 w-fit rounded-sm mb-3 flex items-center justify-center"
                     style={{ color, background: bg, border: `1px solid ${border}` }}>
                  {card.icon}
                </div>
                <h4 className="text-xs font-bold text-[#d0b0b0] mb-1 font-mono tracking-wider uppercase">
                  {card.title}
                </h4>
                <p className="text-[10px] text-[#5a3a3a] mb-3 leading-normal font-mono">
                  {card.summary}
                </p>
              </div>
              
              {isActive && (
                <div className="text-[10px] text-[#7a5a5a] border-t pt-2.5 mt-1 leading-relaxed font-mono"
                     style={{ borderColor: 'rgba(42,21,21,0.8)' }}>
                  {card.details}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[10px] font-mono mt-3 border-t pt-2 w-full justify-between tracking-wider uppercase"
                   style={{ color, borderColor: 'rgba(42,21,21,0.6)' }}>
                <span>{isActive ? "Close Record" : card.actionLabel}</span>
                <FiArrowRight className={`w-3 h-3 transition-transform duration-300 ${isActive ? 'rotate-90' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
