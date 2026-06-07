import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { FiEdit2, FiAlertTriangle, FiCheckCircle, FiCopy, FiInfo, FiRefreshCw } from 'react-icons/fi';

// Chain link connector — amber metallic glow / red fracture
function ChainLink({ startX, endX, isValid }) {
  const linkRef = useRef();
  
  useFrame((state) => {
    if (linkRef.current) {
      const time = state.clock.getElapsedTime();
      // Amber pulse for valid, crimson strobe for broken
      linkRef.current.material.emissiveIntensity = isValid
        ? 0.4 + Math.sin(time * 2) * 0.2
        : 0.7 + Math.sin(time * 8) * 0.3;
    }
  });

  const midX = (startX + endX) / 2;
  const length = Math.abs(endX - startX) - 3.8;

  return (
    <mesh position={[midX, 0, -0.2]} rotation={[0, 0, Math.PI / 2]} ref={linkRef}>
      <cylinderGeometry args={[0.07, 0.07, length, 12]} />
      <meshStandardMaterial
        color={isValid ? "#c2884d" : "#DC2626"}
        emissive={isValid ? "#D97706" : "#DC2626"}
        emissiveIntensity={isValid ? 0.5 : 0.8}
        roughness={isValid ? 0.3 : 0.6}
        metalness={isValid ? 0.7 : 0.1}
      />
    </mesh>
  );
}

// 3D Vault Block — archive record styling
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

  // Subtle vault float — slower, more deliberate
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(time * 0.8 + block.index * 1.5) * 0.1;
    }
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1500);
  };

  // Card border / shadow
  let cardStyle = {
    border: '1px solid rgba(122,31,31,0.4)',
    boxShadow: '0 0 12px rgba(122,31,31,0.1)',
    background: '#120B0B',
  };
  let statusBadge = (
    <span className="flex items-center gap-1 text-[10px] font-mono text-[#10B981]">
      <FiCheckCircle className="w-3 h-3" /> SEALED
    </span>
  );

  if (isTampered) {
    cardStyle = {
      border: '1px solid rgba(220,38,38,0.7)',
      boxShadow: '0 0 20px rgba(220,38,38,0.25)',
      background: '#1a0505',
      animation: 'border-pulse-crimson 1.5s infinite',
    };
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#DC2626]"
            style={{ textShadow: '0 0 8px rgba(220,38,38,0.6)' }}>
        <FiAlertTriangle className="w-3 h-3" /> TAMPERED
      </span>
    );
  } else if (isChainBroken) {
    cardStyle = {
      border: '1px solid rgba(217,119,6,0.5)',
      boxShadow: '0 0 16px rgba(217,119,6,0.15)',
      background: '#120e05',
    };
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono text-[#D97706]">
        <FiAlertTriangle className="w-3 h-3" /> CHAIN BROKEN
      </span>
    );
  }

  const isHighlighted = activeCardIndex !== null && (
    (activeCardIndex === 0 && isGenesis) ||
    (activeCardIndex === 1 && hovered) ||
    (activeCardIndex === 2 && block.index > 0) ||
    (activeCardIndex === 3)
  );

  // 3D block color — vault copper for normal, crimson for tampered
  const blockColor = isTampered ? "#8B0000" : isChainBroken ? "#7a4a00" : hovered ? "#5a2a2a" : "#2a1515";

  return (
    <group position={[block.index * 5.8, 0, 0]}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[4.2, 3.2, 0.6]} />
        <meshPhysicalMaterial
          color={blockColor}
          roughness={0.5}
          metalness={0.6}
          transparent
          opacity={hovered ? 0.85 : 0.75}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
          emissive={isTampered ? "#DC2626" : isChainBroken ? "#D97706" : "#7A1F1F"}
          emissiveIntensity={isTampered ? 0.15 : isChainBroken ? 0.1 : 0.05}
        />
        
        <Html
          position={[0, 0, 0.35]}
          center
          distanceFactor={10}
          style={{
            width: '290px',
            transform: 'translate3d(-50%, -50%, 0)',
            pointerEvents: 'auto',
            fontFamily: '"IBM Plex Mono", "JetBrains Mono", monospace',
          }}
        >
          <div style={{ ...cardStyle, borderRadius: '2px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backdropFilter: 'blur(4px)', position: 'relative' }}
               className={isHighlighted ? 'ring-2 ring-[#D97706] ring-offset-2 ring-offset-[#080606]' : ''}>
            
            {/* Block header — archive record label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(42,21,21,0.6)', paddingBottom: '6px' }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#A52A2A', fontWeight: 700, textTransform: 'uppercase' }}>
                {isGenesis ? "GENESIS RECORD" : `RECORD #${block.index}`}
              </span>
              {statusBadge}
            </div>

            {/* Data input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '9px', color: '#5a3a3a', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                <span>PAYLOAD</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#3a2020' }}>
                  <FiEdit2 style={{ width: '9px', height: '9px' }} /> edit to tamper
                </span>
              </label>
              <input
                type="text"
                value={block.data}
                onChange={(e) => onDataChange(block.index, e.target.value)}
                style={{
                  width: '100%', background: 'rgba(8,6,6,0.8)', border: '1px solid rgba(42,21,21,0.8)',
                  borderRadius: '2px', padding: '4px 8px', fontSize: '11px', color: '#d0b0b0',
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
                placeholder="Block payload..."
                onFocus={e => e.target.style.borderColor = 'rgba(165,42,42,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(42,21,21,0.8)'}
              />
            </div>

            {/* Prev hash */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '9px', color: '#5a3a3a', letterSpacing: '0.2em', textTransform: 'uppercase' }}>PREV HASH</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,6,6,0.6)', border: '1px solid rgba(42,21,21,0.5)', borderRadius: '2px', padding: '3px 6px', fontFamily: 'inherit' }}>
                <span style={{ fontSize: '9px', color: isChainBroken ? '#DC2626' : '#7a5a5a', fontWeight: isChainBroken ? 700 : 400 }}>
                  {isGenesis ? "0000 (origin)" : block.previous_hash.slice(0, 16) + "…"}
                </span>
                {!isGenesis && (
                  <button onClick={() => handleCopy(block.previous_hash)}
                          style={{ color: '#3a2020', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          onMouseEnter={e => e.target.style.color = '#D97706'}
                          onMouseLeave={e => e.target.style.color = '#3a2020'}>
                    <FiCopy style={{ width: '10px', height: '10px' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Current hash */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '9px', color: '#5a3a3a', letterSpacing: '0.2em', textTransform: 'uppercase' }}>SHA-256 HASH</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,6,6,0.6)', border: '1px solid rgba(42,21,21,0.5)', borderRadius: '2px', padding: '3px 6px', fontFamily: 'inherit' }}>
                <span style={{ fontSize: '9px', color: isTampered ? '#DC2626' : '#10B981', fontWeight: isTampered ? 700 : 400 }}>
                  {block.hash.slice(0, 16) + "…"}
                </span>
                <button onClick={() => handleCopy(block.hash)}
                        style={{ color: '#3a2020', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onMouseEnter={e => e.target.style.color = '#D97706'}
                        onMouseLeave={e => e.target.style.color = '#3a2020'}>
                  <FiCopy style={{ width: '10px', height: '10px' }} />
                </button>
              </div>
            </div>

            {/* Tamper to server */}
            {isTampered && onTamperBackend && (
              <button
                onClick={() => onTamperBackend(block.index, block.data)}
                style={{
                  width: '100%', padding: '5px', borderRadius: '2px',
                  background: 'rgba(139,0,0,0.4)', border: '1px solid rgba(220,38,38,0.5)',
                  color: '#f87171', fontSize: '9px', fontFamily: 'inherit', letterSpacing: '0.15em',
                  textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,0,0,0.5)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,0,0,0.4)'}
              >
                <FiRefreshCw style={{ width: '10px', height: '10px' }} /> Inject Tamper to Server
              </button>
            )}

            {copiedHash && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(8,6,6,0.92)', borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: '#D97706', fontFamily: 'inherit', letterSpacing: '0.2em'
              }}>
                HASH COPIED
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
    <div className="w-full h-[450px] relative rounded-sm border border-[#2a1515] overflow-hidden"
         style={{ background: '#080606', boxShadow: '0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(122,31,31,0.1)' }}>
      {/* Instructions badge */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none select-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#2a1515] bg-[#0e0808]/80 text-[10px] text-[#5a3a3a] font-mono tracking-wider">
          <FiInfo className="text-[#A52A2A] w-3 h-3" />
          <span>Drag · Pan · Scroll to Zoom</span>
        </div>
      </div>

      <Canvas
        camera={{ position: [2.5, 0.5, 8.5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        {/* Warm vault lighting — no cyan/blue */}
        <ambientLight intensity={0.3} color="#c2884d" />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#D97706" />
        <pointLight position={[-10, -5, -10]} intensity={0.4} color="#7A1F1F" />
        <directionalLight position={[0, 5, 5]} intensity={0.8} color="#ffffff" />

        <group position={[-(chain.length - 1) * 2.9, 0, 0]}>
          {chain.map((block, index) => {
            const isGenesis = index === 0;
            const isTampered = tamperedIndices.includes(index);
            const isChainBroken = brokenIndices.includes(index);

            return (
              <React.Fragment key={block.index}>
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
