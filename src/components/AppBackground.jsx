// Ambient violet / fuchsia glow behind every page. Declared once, outside
// any render function, so it never remounts.
export default function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" style={{ animation: "pulseGlow 8s ease-in-out infinite" }} />
      <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[120px]" style={{ animation: "pulseGlow 10s ease-in-out infinite", animationDelay: "2s" }} />
      <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-purple-600/5 blur-[100px]" />
    </div>
  );
}
