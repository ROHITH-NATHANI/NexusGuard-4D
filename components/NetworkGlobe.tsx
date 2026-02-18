import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Line, 
  Html,
  Float,
  OrbitControls,
  PerspectiveCamera,
  PointMaterial,
  Points
} from '@react-three/drei';
import * as THREE from 'three';
import { TopologyType, NetworkDevice } from '../types.ts';

interface NodeProps {
  position: [number, number, number];
  device: NetworkDevice;
}

const NodeEntity: React.FC<NodeProps> = ({ position, device }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const color = device.status === 'online' ? '#00f2ff' : device.status === 'alert' ? '#ff3131' : '#475569';
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const s = 1 + Math.sin(t * 4 + Number(device.id)) * 0.12;
    meshRef.current.scale.set(s, s, s);
    if (glowRef.current) {
        glowRef.current.scale.set(s * 1.4, s * 1.4, s * 1.4);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2} 
          roughness={0.1} 
          metalness={1}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <Html distanceFactor={12} center zIndexRange={[10, 0]}>
        <div className={`three-label ${device.status}`}>
          {device.name}
        </div>
      </Html>
    </group>
  );
};

const DataPulse: React.FC<{ start: THREE.Vector3; end: THREE.Vector3; color: string }> = ({ start, end, color }) => {
  const pulseRef = useRef<THREE.Mesh>(null!);
  const curve = useMemo(() => new THREE.LineCurve3(start, end), [start, end]);
  const speed = useMemo(() => 0.6 + Math.random() * 0.4, []);
  
  useFrame((state) => {
    if (!pulseRef.current) return;
    const t = (state.clock.getElapsedTime() * speed) % 1;
    pulseRef.current.position.copy(curve.getPoint(t));
    const s = Math.sin(t * Math.PI) * 1.4;
    pulseRef.current.scale.setScalar(Math.max(0.01, s));
  });

  return (
    <mesh ref={pulseRef}>
      <sphereGeometry args={[0.07, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
};

const CyberDust = () => {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null!);
  useFrame((state) => {
    if (pointsRef.current) {
        pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#00f2ff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  );
};

const NeuralLattice = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[9, 1]} />
      <meshBasicMaterial color="#00f2ff" wireframe transparent opacity={0.04} />
    </mesh>
  );
};

const TopologyEngine: React.FC<{ type: TopologyType; devices: NetworkDevice[] }> = ({ type, devices }) => {
  const groupRef = useRef<THREE.Group>(null!);

  const nodePositions = useMemo(() => {
    const pos: [number, number, number][] = [];
    const count = devices.length;
    const isMobile = window.innerWidth < 768;
    const radius = isMobile ? 4.8 : 7.2;

    switch (type) {
      case 'star':
        pos.push([0, 0, 0]);
        for (let i = 1; i < count; i++) {
          const a = (i / (count - 1)) * Math.PI * 2;
          pos.push([Math.cos(a) * radius, Math.sin(a) * radius, (Math.random() - 0.5) * 1.5]);
        }
        break;
      case 'ring':
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          pos.push([Math.cos(a) * radius, Math.sin(a) * radius, Math.sin(a * 2) * 0.8]);
        }
        break;
      default: // mesh
        for (let i = 0; i < count; i++) {
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          pos.push([
            radius * Math.cos(theta) * Math.sin(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(phi)
          ]);
        }
    }
    return pos;
  }, [type, devices]);

  const links = useMemo(() => {
    const arr: React.ReactElement[] = [];
    const connect = (i: number, j: number) => {
      if (!nodePositions[i] || !nodePositions[j]) return;
      const s = new THREE.Vector3(...nodePositions[i]);
      const e = new THREE.Vector3(...nodePositions[j]);
      const color = devices[i].status === 'alert' || devices[j].status === 'alert' ? '#ff3131' : '#00f2ff';
      arr.push(
        <group key={`link-${i}-${j}`}>
          <Line points={[s, e]} color={color} lineWidth={1} transparent opacity={0.2} />
          <DataPulse start={s} end={e} color={color} />
        </group>
      );
    };

    if (type === 'star') {
        for (let i = 1; i < nodePositions.length; i++) connect(0, i);
    } else if (type === 'ring') {
        for (let i = 0; i < nodePositions.length; i++) connect(i, (i + 1) % nodePositions.length);
    } else {
      for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i + 1; j < nodePositions.length; j++) {
          const d = new THREE.Vector3(...nodePositions[i]).distanceTo(new THREE.Vector3(...nodePositions[j]));
          if (d < 10) connect(i, j);
        }
      }
    }
    return arr;
  }, [type, nodePositions, devices]);

  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {nodePositions.map((p, i) => (
        <NodeEntity key={i} position={p} device={devices[i]} />
      ))}
      {links}
    </group>
  );
};

const NetworkGlobe: React.FC<{ type: TopologyType; devices: NetworkDevice[] }> = ({ type, devices }) => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas 
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={(state) => {
            state.gl.setClearColor('#020617', 0);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={40} />
        <CyberDust />
        <NeuralLattice />
        
        <ambientLight intensity={0.6} />
        <pointLight position={[20, 20, 20]} intensity={2} color="#00f2ff" />
        <pointLight position={[-20, -20, -20]} intensity={1} color="#ff00ea" />
        
        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
          <TopologyEngine type={type} devices={devices} />
        </Float>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          maxDistance={30} 
          minDistance={8}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
};

export default NetworkGlobe;