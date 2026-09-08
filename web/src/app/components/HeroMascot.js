"use client";

// Astronaut 3D interaktif (web component <model-viewer>, WebGL native — tanpa three.js bundling).
// Drag untuk putar, auto-rotate pas diem.
export default function HeroMascot() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center sm:h-[400px] lg:h-[460px]">
      {/* panggung glow */}
      <div className="pointer-events-none absolute bottom-8 h-48 w-48 rounded-full bg-[#818CF8]/25 blur-3xl dark:bg-indigo-500/20"></div>
      <model-viewer
        src="/mascot/astronaut.glb"
        alt="Maskot astronaut Nandz Store"
        camera-controls
        disable-zoom
        auto-rotate
        rotation-per-second="18deg"
        autoplay
        interaction-prompt="none"
        shadow-intensity="0.6"
        exposure="1.1"
        style={{ width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" }}
      ></model-viewer>
      <span className="pointer-events-none absolute bottom-1 text-[11px] font-medium text-[#64748B] dark:text-slate-500">
        ✋ seret untuk memutar
      </span>
    </div>
  );
}
