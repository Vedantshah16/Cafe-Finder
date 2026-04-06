export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Coffee cup animation */}
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center animate-pulse-glow">
            <span className="text-2xl">☕</span>
          </div>
          <div className="absolute inset-0 rounded-xl bg-accent blur-xl opacity-30 animate-pulse" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent"
              style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
