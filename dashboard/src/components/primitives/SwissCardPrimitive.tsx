import React from 'react';

export interface SwissCardPrimitiveProps {
  index?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  dark?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const SwissCardPrimitive: React.FC<SwissCardPrimitiveProps> = ({
  index = '00',
  id,
  title,
  subtitle,
  dark = false,
  className = '',
  children,
}) => {
  const bgClass = dark
    ? 'bg-[#060D1A] text-white border-[#1E293B]'
    : 'bg-white text-[#0B1C30] border-[#E2E8F0]';
  const watermarkClass = dark ? 'text-[#1E293B]/60' : 'text-[#E2E8F0]';

  return (
    <section
      id={id}
      className={`screen-wide-card relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 border-b razor-border transition-colors duration-300 ${bgClass} hover:border-[#004AC6] ${className}`}
    >
      {/* Top Bar: Watermark Index & Subtitle */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded border border-current/20 bg-current/5">
            CARD // {index}
          </span>
          {subtitle && (
            <span className="font-mono text-xs opacity-70 uppercase tracking-wider hidden sm:inline-block">
              {subtitle}
            </span>
          )}
        </div>

        {/* Watermark Index in JetBrains Mono */}
        <div className={`font-mono text-5xl md:text-7xl font-bold tracking-tighter select-none ${watermarkClass}`}>
          {index}
        </div>
      </div>

      {/* Center Card Content */}
      <div className="my-auto py-8 z-10 max-w-7xl w-full mx-auto">
        {title && (
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            {title}
          </h2>
        )}
        {children}
      </div>

      {/* Bottom Bar: Swiss Grid Status Footer */}
      <div className="w-full flex items-center justify-between text-xs font-mono opacity-75 pt-4 border-t border-current/10 z-10">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#004AC6] animate-pulse"></span>
          <span>PHAROS CLINICAL DECISION SUPPORT V5.0</span>
        </div>
        <div className="hidden md:block tracking-widest uppercase">
          AY 2026/2027 // DEAN OFFICE GRADUATION PROJECT
        </div>
      </div>
    </section>
  );
};

export default SwissCardPrimitive;
