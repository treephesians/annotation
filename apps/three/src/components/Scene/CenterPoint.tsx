export function CenterPoint() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
    </mesh>
  );
}
