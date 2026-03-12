import { useState, useEffect } from 'react';

export default function Logo() {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="relative cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Glow effect on hover */}
      <div
        className={`absolute -inset-4 rounded-2xl bg-gradient-to-r from-sidebar-accent/20 to-primary/20 blur-xl opacity-0 transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Main logo container */}
      <div className="relative">
        {/* Animated background orb */}
        <div
          className={`absolute -inset-2 rounded-2xl bg-gradient-to-br from-sidebar-accent/10 to-transparent transition-all duration-500 ${
            isHovered ? 'opacity-100 scale-105' : 'opacity-50 scale-100'
          }`}
        />

        {/* Logo content */}
        <div className="relative flex items-baseline gap-3">
          {/* Golf flag emoji with animation */}
          <div className="relative">
            <span
              className={`text-5xl inline-block transition-all duration-300 ${
                isHovered ? 'scale-125 rotate-6' : 'scale-100 rotate-0'
              }`}
              style={{
                animation: isHovered ? 'golfFlagWave 0.6s ease-in-out' : 'golfFlagFloat 3s ease-in-out infinite',
              }}
            >
              ⛳
            </span>
          </div>

          {/* Text content */}
          <div className="flex-1">
            <h1
              className={`text-4xl font-bold tracking-tight text-sidebar-foreground transition-all duration-300 ${
                isHovered ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'
              }`}
            >
              TheClubHouse
            </h1>
            <p
              className={`text-xs mt-1 text-sidebar-foreground/60 font-medium tracking-wider uppercase transition-all duration-300 ${
                isHovered ? 'text-sidebar-foreground/80 translate-x-1' : 'text-sidebar-foreground/60'
              }`}
            >
              Premium Golf Booking
            </p>
          </div>
        </div>

        {/* Subtle moving light effect on hover */}
        {isHovered && (
          <div
            className="absolute w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none"
            style={{
              left: `${mousePosition.x - 80}px`,
              top: `${mousePosition.y - 80}px`,
              transition: 'all 0.3s ease-out',
            }}
          />
        )}
      </div>

      {/* Animated accent line */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-sidebar-accent via-sidebar-accent/50 to-transparent transition-all duration-500 ${
          isHovered ? 'w-32' : 'w-16'
        }`}
      />

      <style>{`
        @keyframes golfFlagWave {
          0% {
            transform: rotate(0deg) translateX(0px);
          }
          25% {
            transform: rotate(-8deg) translateX(2px);
          }
          50% {
            transform: rotate(12deg) translateX(4px);
          }
          75% {
            transform: rotate(-6deg) translateX(2px);
          }
          100% {
            transform: rotate(0deg) translateX(0px);
          }
        }

        @keyframes golfFlagFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(2deg);
          }
        }
      `}</style>
    </div>
  );
}
