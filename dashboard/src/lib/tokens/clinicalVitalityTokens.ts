/**
 * Clinical Vitality Design Tokens - Pharos University Hemodialysis Digitization Project
 * Derived from Stitch Project 503366360860058565 (Clinical Vitality Design System)
 * Clinical Light Mode Palette & Swiss Minimalist Tokens
 */

export interface ColorToken {
  hex: string;
  rgb: string;
  cssVar: string;
  description: string;
}

export interface DesignTokens {
  colors: {
    bgCanvas: ColorToken;
    bgMuted: ColorToken;
    bgDark: ColorToken;
    borderGrid: ColorToken;
    borderDark: ColorToken;
    borderActive: ColorToken;
    textPrimary: ColorToken;
    textMuted: ColorToken;
    textLight: ColorToken;
    accentBlue: ColorToken;
    accentContainer: ColorToken;
    accentTeal: ColorToken;
    accentEmerald: ColorToken;
    accentCritical: ColorToken;
  };
  typography: {
    fontSans: string;
    fontMono: string;
    giantHeadlineClamp: string;
    sectionTitleClamp: string;
    bodyClamp: string;
  };
  cards: {
    minHeight: string;
    width: string;
    borderWidth: string;
    borderColorLight: string;
    borderColorActive: string;
  };
  personas: {
    clinician: {
      label: string;
      accentColor: string;
      eyebrowText: string;
      headlineText: string;
      bodyText: string;
    };
    nurse: {
      label: string;
      accentColor: string;
      eyebrowText: string;
      headlineText: string;
      bodyText: string;
    };
    patient: {
      label: string;
      accentColor: string;
      eyebrowText: string;
      headlineText: string;
      bodyText: string;
    };
  };
}

export const clinicalVitalityTokens: DesignTokens = {
  colors: {
    bgCanvas: {
      hex: '#FFFFFF',
      rgb: '255, 255, 255',
      cssVar: '--bg-canvas',
      description: 'Medical white surface background',
    },
    bgMuted: {
      hex: '#F8FAFC',
      rgb: '248, 250, 252',
      cssVar: '--bg-muted',
      description: 'Clean medical slate-blue tint background',
    },
    bgDark: {
      hex: '#060D1A',
      rgb: '6, 13, 26',
      cssVar: '--bg-dark',
      description: 'Deep navy background for high contrast cards',
    },
    borderGrid: {
      hex: '#E2E8F0',
      rgb: '226, 232, 240',
      cssVar: '--border-grid',
      description: 'Razor-thin 1px grid divider line',
    },
    borderDark: {
      hex: '#1E293B',
      rgb: '30, 41, 59',
      cssVar: '--border-dark',
      description: 'Dark card razor line border',
    },
    borderActive: {
      hex: '#004AC6',
      rgb: '0, 74, 198',
      cssVar: '--border-active',
      description: 'Clinical blue active state border',
    },
    textPrimary: {
      hex: '#0B1C30',
      rgb: '11, 28, 48',
      cssVar: '--text-primary',
      description: 'Deep slate typography for maximum readability',
    },
    textMuted: {
      hex: '#64748B',
      rgb: '100, 116, 139',
      cssVar: '--text-muted',
      description: 'Slate secondary body text',
    },
    textLight: {
      hex: '#94A3B8',
      rgb: '148, 163, 184',
      cssVar: '--text-light',
      description: 'Light slate metadata text',
    },
    accentBlue: {
      hex: '#004AC6',
      rgb: '0, 74, 198',
      cssVar: '--accent-blue',
      description: 'Primary clinical blue accent',
    },
    accentContainer: {
      hex: '#2563EB',
      rgb: '37, 99, 235',
      cssVar: '--accent-container',
      description: 'Interactive container blue',
    },
    accentTeal: {
      hex: '#006B5F',
      rgb: '0, 107, 95',
      cssVar: '--accent-teal',
      description: 'Clinical dialysate teal accent',
    },
    accentEmerald: {
      hex: '#10B981',
      rgb: '16, 185, 129',
      cssVar: '--accent-emerald',
      description: 'Medical success indicator',
    },
    accentCritical: {
      hex: '#EF4444',
      rgb: '239, 68, 68',
      cssVar: '--accent-critical',
      description: 'Critical clinical alert indicator',
    },
  },
  typography: {
    fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', Consolas, Monaco, 'Courier New', monospace",
    giantHeadlineClamp: 'clamp(2.8rem, 5vw, 5.5rem)',
    sectionTitleClamp: 'clamp(2.0rem, 3.5vw, 3.8rem)',
    bodyClamp: 'clamp(1.0rem, 1.2vw, 1.35rem)',
  },
  cards: {
    minHeight: '100vh',
    width: '100vw',
    borderWidth: '1px',
    borderColorLight: '#E2E8F0',
    borderColorActive: '#004AC6',
  },
  personas: {
    clinician: {
      label: 'Clinician / Nephrologist',
      accentColor: '#004AC6',
      eyebrowText: 'CLINICAL DECISION SUPPORT // MEDGEMMA CPOE',
      headlineText: 'Zero-Latency MedGemma Interceptor & Outbreak Sentinel',
      bodyText: 'AI-guided eGFR dose guardrails, real-time intradialytic hypotension risk prediction, and continuous dialysate water quality surveillance.',
    },
    nurse: {
      label: 'Bedside Dialysis Nurse',
      accentColor: '#006B5F',
      eyebrowText: 'BEDSIDE WORKFLOW // BIOMETRIC QUEUE',
      headlineText: 'Automated 4-Hour Shift Queue & Telemetry Monitor',
      bodyText: 'Rapid QR patient check-in, real-time ultrafiltration progress tracking, and instant automated audio-visual clinical alarms.',
    },
    patient: {
      label: 'Hemodialysis Patient',
      accentColor: '#10B981',
      eyebrowText: 'PATIENT CARE HUB // TRANSPARENT HEALING',
      headlineText: 'Empowered Intradialytic Care & Real-Time Telemetry',
      bodyText: 'Transparent access to treatment progress, personalized fluid removal metrics, and direct bedside clinician communication.',
    },
  },
};

/**
 * Returns CSS custom properties as a plain JS object for inline styles or SSR injection.
 */
export function getCssVariableObject(): Record<string, string> {
  const vars: Record<string, string> = {};
  Object.values(clinicalVitalityTokens.colors).forEach((token) => {
    vars[token.cssVar] = token.hex;
    vars[`${token.cssVar}-rgb`] = token.rgb;
  });
  vars['--font-sans'] = clinicalVitalityTokens.typography.fontSans;
  vars['--font-mono'] = clinicalVitalityTokens.typography.fontMono;
  return vars;
}

/**
 * Returns CSS string defining :root variables for Clinical Light Mode.
 */
export function getCssRootVariablesString(): string {
  const entries = Object.entries(getCssVariableObject()).map(
    ([key, value]) => `  ${key}: ${value};`
  );
  return `:root {\n${entries.join('\n')}\n}`;
}
