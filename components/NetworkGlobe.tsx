import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Points, 
  PointMaterial, 
  Line, 
  Text,
  PerspectiveCamera,
  Float,
  Center,
  OrbitControls,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';
import { TopologyType, NetworkDevice } from '../types';

interface NodeMeshProps {
  position: [number, number, number];
  device: NetworkDevice;
}

const NodeMesh: React.FC<NodeMeshProps> = ({ position, device }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const color = device.status === 'online' ? '#0ea5e9' : device.status === 'alert' ? '#f43f5e' : '#334155';
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 5 + Number(device.id)) * 0.1;
    meshRef.current.scale.set(pulse, pulse, pulse);
    glowRef.current.scale.set(pulse * 1.5, pulse * 1.5, pulse * 1.5);
    glowRef.current.rotation.y += 0.01;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={4} 
          metalness={1} 
          roughness={0} 
        />
      </mesh>
      <mesh ref={glowRef}>
        <octahedronGeometry args={[0.35, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} wireframe />
      </mesh>
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.2}
        color="#ffffff"
        font="https://fonts.gstatic.com/s/orbitron/v25/yMJRMIPr_9zSaAd9nToO375aaA.woff"
        anchorX="center"
        outlineWidth={0.03}
        outlineColor="#020617"
      >
        {device.name}
      </Text>
    </group>
  );
};

const DataPulse: React.FC<{ start: [number, number, number], end: [number, number, number], color: string }> = ({ start, end, color }) => {
  const pulseRef = useRef<THREE.Mesh>(null!);
  const curve = useMemo(() => new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end)), [start, end]);
  
  useFrame((state) => {
    const speed = 0.8 + Math.random() * 0.4;
    const t = (state.clock.getElapsedTime() * speed) % 1;
    const pos = curve.getPoint(t);
    pulseRef.current.position.copy(pos);
  });

  return (
    <mesh ref={pulseRef}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const TopologyVisualizer: React.FC<{ type: TopologyType; devices: NetworkDevice[] }> = ({ type, devices }) => {
  const groupRef = useRef<THREE.Group>(null!);

  const nodePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = devices.length;
    const radius = 5;

    switch (type) {
      case 'star':
        positions.push([0, 0, 0]); // Gateway node at center
        for (let i = 1; i < count; i++) {
          const angle = (i / (count - 1)) * Math.PI * 2;
          positions.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
        }
        break;
      case 'ring':
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          positions.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
        }
        break;
      case 'grid':
        const size = Math.ceil(Math.sqrt(count));
        const spacing = 3;
        for (let i = 0; i < count; i++) {
          const x = (i % size) - (size - 1) / 2;
          const y = Math.floor(i / size) - (size - 1) / 2;
          positions.push([x * spacing, y * spacing, 0]);
        }
        break;
      case 'mesh':
        for (let i = 0; i < count; i++) {
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          positions.push([
            radius * Math.cos(theta) * Math.sin(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(phi)
          ]);
        }
        break;
      case 'hybrid':
        // Core Star-Ring hybrid
        positions.push([0, 0, 0]);
        for (let i = 1; i < 4; i++) {
          const angle = (i / 3) * Math.PI * 2;
          positions.push([Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0]);
        }
        for (let i = 4; i < count; i++) {
          const angle = (i / (count - 4)) * Math.PI * 2;
          positions.push([Math.cos(angle) * 6, Math.sin(angle) * 6, Math.sin(i) * 3]);
        }
        break;
    }
    return positions;
  }, [type, devices.length]);

  const connectionElements = useMemo(() => {
    const elements: React.ReactElement[] = [];
    const count = nodePositions.length;

    const addLink = (i: number, j: number) => {
      if (i >= count || j >= count) return;
      const color = (devices[i]?.status === 'alert' || devices[j]?.status === 'alert') ? '#f43f5e' : '#0ea5e9';
      const key = `link-${i}-${j}-${type}`;
      elements.push(
        <group key={key}>
          <Line 
            points={[nodePositions[i], nodePositions[j]]} 
            color={color} 
            lineWidth={3} 
            transparent 
            opacity={0.4} 
          />
          <DataPulse start={nodePositions[i]} end={nodePositions[j]} color={color} />
        </group>
      );
    };

    switch (type) {
      case 'star':
        for (let i = 1; i < count; i++) addLink(0, i);
        break;
      case 'ring':
        for (let i = 0; i < count; i++) addLink(i, (i + 1) % count);
        break;
      case 'grid':
        const size = Math.ceil(Math.sqrt(count));
        for (let i = 0; i < count; i++) {
          if ((i + 1) % size !== 0 && i + 1 < count) addLink(i, i + 1);
          if (i + size < count) addLink(i, i + size);
        }
        break;
      case 'mesh':
        for (let i = 0; i < count; i++) {
          for (let j = i + 1; j < count; j++) {
            if (Math.random() > 0.5) addLink(i, j);
          }
        }
        break;
      case 'hybrid':
        for (let i = 1; i < 4; i++) addLink(0, i);
        for (let i = 4; i < count; i++) {
          addLink(i, (i + 1 >= count) ? 4 : i + 1);
          if (i % 2 === 0) addLink(i, 1 + (i % 3));
        }
        break;
    }
    return elements;
  }, [type, nodePositions, devices]);

  useFrame((state) => {
    groupRef.current.rotation.y += 0.004;
    groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.15;
  });

  return (
    <group ref={groupRef}>
      {nodePositions.map((pos, idx) => (
        <NodeMesh key={`node-${idx}-${type}`} position={pos} device={devices[idx]} />
      ))}
      {connectionElements}
    </group>
  );
};

const Effects: React.FC = () => {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <gridHelper args={[60, 30, '#0ea5e9', '#1e293b']} position={[0, -8, 0]} transparent opacity={0.15} />
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 20, 10]} intensity={2.5} color="#0ea5e9" />
      <spotLight position={[-20, 30, 10]} angle={0.3} penumbra={1} intensity={2} color="#f472b6" />
    </>
  );
};

const NetworkGlobe: React.FC<{ type: TopologyType, devices: NetworkDevice[] }> = ({ type, devices }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas 
        shadows 
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 18], fov: 45 }}
      >
        <Effects />
        <Center>
          <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.6}>
            <TopologyVisualizer type={type} devices={devices} />
          </Float>
        </Center>
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} maxDistance={40} minDistance={10} />
        <fog attach="fog" args={['#020617', 15, 45]} />
      </Canvas>
    </div>
  );
};

export default NetworkGlobe;