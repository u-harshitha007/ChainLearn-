import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { FiEdit2, FiAlertTriangle, FiCheckCircle, FiCopy, FiInfo, FiTrash2, FiRefreshCw } from 'react-icons/fi';

// A single block connection link (cylinder)
function ChainLink({ startX, endX, isValid }) {
  const linkRef = useRef();
  
  // Subtle glow animation
  useFrame((state) => {
    if (linkRef.current) {
      const time = state.clock.getElapsedTime();
      const intensity = 0.5 + Math.sin(time * 3) * 0.2;
      linkRef.current.material.emissiveIntensity = intensity;
    }
  });

  const midX = (startX + endX) / 2;
  const length = Math.abs(endX - startX) - 3.8; // subtract block widths

  return (
    <mesh position={[midX, 0, -0.2]} rotation={[0, 0, Math.PI / 2]} ref={linkRef}>
      <cylinderGeometry args={[0.08, 0.08, length, 16]} />
      <meshStandardMaterial
        color={isValid ? "#10b981" : "#ef4444"}
        emissive={isValid ? "#10b981" : "#ef4444"}
        emissiveIntensity={0.6}
        roughness={0.2}
      />
    </mesh>
  );
}

// 3D Glass Block component
function BlockNode({ 
  block, 
  isGenesis, 
  isTampered, 
  isChainBroken,
  onDataChange, 
  onTamperBackend,
  activeCardIndex,
  setActiveCardIndex
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(time + block.index * 1.5) * 0.15;
    }
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1500);
  };

  // Determine border and glow colors
  let cardClass = "border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]";
  let statusBadge = (
    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
      <FiCheckCircle className="w-3.5 h-3.5" /> Secure
    </span>
  );

  if (isTampered) {
    cardClass = "border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse";
    statusBadge = (
      <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 animate-pulse text-glow-red">
        <FiAlertTriangle className="w-3.5 h-3.5" /> Hash Changed
      </span>
    );
  } else if (isChainBroken) {
    cardClass = "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
    statusBadge = (
      <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
        <FiAlertTriangle className="w-3.5 h-3.5" /> Chain Broken
      </span>
    );
  }

  // Highlight block if selected in educational mode
  const isHighlighted = activeCardIndex !== null && (
    (activeCardIndex === 0 && isGenesis) || // What is a block?
    (activeCardIndex === 1 && hovered) || // Hashing
    (activeCardIndex === 2 && block.index > 0) || // Previous Hash
    (activeCardIndex === 3) // Validation
  );

  if (isHighlighted) {
    cardClass += " ring-2 ring-violet-500 ring-offset-4 ring-offset-gray-950 scale-105 transition-all duration-300";
  }

  return (
    <group position={[block.index * 5.8, 0, 0]}>
      {/* 3D Glass block geometry */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[4.2, 3.2, 0.8]} />
        <meshPhysicalMaterial
          color={isTampered ? "#ef4444" : isChainBroken ? "#f59e0b" : hovered ? "#a78bfa" : "#06b6d4"}
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={hovered ? 0.35 : 0.25}
          transmission={0.6}
          thickness={1.2}
          clearcoat={0.8}
        />
        
        {/* HTML Billboard styled interface inside 3D space */}
        <Html
          position={[0, 0, 0.42]}
          center
          distanceFactor={10}
          style={{
            width: '320px',
            transform: 'translate3d(-50%, -50%, 0)',
            pointerEvents: 'auto',
          }}
        >
          <div className={`glass rounded-xl p-4 text-left font-sans select-none flex flex-col gap-2 transition-all duration-300 ${cardClass}`}>
            {/* Block Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
                  {isGenesis ? "Genesis Block" : `Block #${block.index}`}
                </span>
              </div>
              {statusBadge}
            </div>

            {/* Block Data Input Field (Tamper Mode) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 flex justify-between items-center">
                <span>DATA (EDIT TO TAMPER)</span>
                <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                  <FiEdit2 className="w-2.5 h-2.5" /> interactive
                </span>
              </label>
              <input
                type="text"
                value={block.data}
                onChange={(e) => onDataChange(block.index, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="Enter block transactions..."
              />
            </div>

            {/* Previous Hash Display */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 uppercase">PREVIOUS HASH</span>
              <div className="flex items-center justify-between gap-1 bg-black/30 border border-white/5 rounded px-2 py-1 font-mono text-[10px]">
                <span className={isChainBroken ? "text-red-400 font-bold" : "text-gray-300"}>
                  {isGenesis ? "0000 (First Block Link)" : block.previous_hash.slice(0, 18) + "..."}
                </span>
                {!isGenesis && (
                  <button 
                    onClick={() => handleCopy(block.previous_hash)}
                    className="text-gray-500 hover:text-cyan-400 transition-colors"
                    title="Copy Full Hash"
                  >
                    <FiCopy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Current Hash Display */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 uppercase">BLOCK HASH</span>
              <div className="flex items-center justify-between gap-1 bg-black/30 border border-white/5 rounded px-2 py-1 font-mono text-[10px]">
                <span className={isTampered ? "text-red-400 font-bold" : "text-emerald-400"}>
                  {block.hash.slice(0, 18) + "..."}
                </span>
                <button 
                  onClick={() => handleCopy(block.hash)}
                  className="text-gray-500 hover:text-cyan-400 transition-colors"
                  title="Copy Full Hash"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Syc to Server button if data is modified locally */}
            {isTampered && onTamperBackend && (
              <button
                onClick={() => onTamperBackend(block.index, block.data)}
                className="w-full mt-1 py-1 rounded bg-red-950/70 border border-red-500/50 hover:bg-red-900/60 text-[10px] text-red-300 font-medium flex items-center justify-center gap-1 transition-all duration-200"
              >
                <FiRefreshCw className="w-3 h-3 animate-spin-slow" /> Tamper Server Database
              </button>
            )}

            {/* Copy Notification Toast inside card */}
            {copiedHash && (
              <div className="absolute inset-0 bg-gray-950/90 rounded-xl flex items-center justify-center text-xs text-cyan-400 font-medium transition-all duration-300">
                Copied hash to clipboard!
              </div>
            )}
          </div>
        </Html>
      </mesh>
    </group>
  );
}

export default function BlockchainVisualizer({ 
  chain, 
  tamperedIndices, 
  brokenIndices,
  onDataChange, 
  onTamperBackend,
  activeCardIndex,
  setActiveCardIndex
}) {
  const controlsRef = useRef();

  return (
    <div className="w-full h-[450px] relative glass-dark rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* 3D Instructions */}
      <div className="absolute top-4 left-4 z-10 flex gap-4 pointer-events-none select-none">
        <div className="glass px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-gray-400 flex items-center gap-1.5">
          <FiInfo className="text-cyan-400 w-3.5 h-3.5" />
          <span>Drag to Rotate • Right-click + Drag to Pan • Scroll to Zoom</span>
        </div>
      </div>

      <Canvas
        camera={{ position: [2.5, 0.5, 8.5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={1} />

        <group position={[-(chain.length - 1) * 2.9, 0, 0]}>
          {chain.map((block, index) => {
            const isGenesis = index === 0;
            const isTampered = tamperedIndices.includes(index);
            const isChainBroken = brokenIndices.includes(index);

            return (
              <React.Fragment key={block.index}>
                {/* Visual Block Representation */}
                <BlockNode 
                  block={block}
                  isGenesis={isGenesis}
                  isTampered={isTampered}
                  isChainBroken={isChainBroken}
                  onDataChange={onDataChange}
                  onTamperBackend={onTamperBackend}
                  activeCardIndex={activeCardIndex}
                  setActiveCardIndex={setActiveCardIndex}
                />

                {/* Connection Cylinder between block i-1 and block i */}
                {index > 0 && (
                  <ChainLink 
                    startX={(index - 1) * 5.8} 
                    endX={index * 5.8} 
                    isValid={!isChainBroken && !tamperedIndices.includes(index - 1)}
                  />
                )}
              </React.Fragment>
            );
          })}
        </group>

        <OrbitControls 
          ref={controlsRef}
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
          minDistance={3}
          maxDistance={25}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
}
