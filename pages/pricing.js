import NavBar from '../components/NavBar'; // Add this line

export default function Pricing() {
  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
      <NavBar />
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-4">Coming Soon...</p>
    </div>
  );
}
