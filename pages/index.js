use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../components/NavBar";

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center">
      <NavBar />
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Suspense fallback={null}>
          <Stars />
          <Text fontSize={1} color="white" position={[0, 1, 0]}>
            MailMind
          </Text>
          <OrbitControls />
        </Suspense>
      </Canvas>
      <button
        onClick={() => router.push("/about")}
        className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-700 transition"
      >
        Learn More
      </button>
    </div>
  );
}
