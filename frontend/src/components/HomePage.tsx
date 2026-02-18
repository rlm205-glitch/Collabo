export function HomePage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center bg-blue-50 text-white text-3xl font-bold">
      <button onClick={onGetStarted} className="px-6 py-3 rounded-lg bg-white text-blue-700">
        Get Started
      </button>
    </div>
  );
}
