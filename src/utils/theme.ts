/**
 * Shared theme constants for consistent styling across the application
 */

import { DEFAULT_APPEARANCE } from "./constants";

export type AppearanceMode = "light" | "dark" | "system";

/**
 * Get the effective appearance mode based on user preference and system settings
 */
export function getEffectiveAppearance(appearance: AppearanceMode | string): "light" | "dark" {
  if (appearance === "system") {
    // Check system preference
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light"; // Default fallback
  }
  return appearance === "dark" ? "dark" : "light";
}

/**
 * Apply appearance mode to document
 */
export function applyAppearance(appearance: AppearanceMode | string): void {
  const effectiveMode = getEffectiveAppearance(appearance);
  document.documentElement.setAttribute("data-appearance", effectiveMode);
  document.body.setAttribute("data-appearance", effectiveMode);
}

/**
 * Initialize appearance from storage and set up system preference listener
 */
export async function initializeAppearance(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get("GASAppearance", (result) => {
      const appearance = result.GASAppearance || DEFAULT_APPEARANCE;
      applyAppearance(appearance);

      // Listen for system preference changes if using "system" mode
      if (appearance === "system" && typeof window !== "undefined" && window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
          applyAppearance("system");
        });
      }

      resolve(appearance);
    });
  });
}

// Primary gradient (purple) - used for MR actions, headers, buttons
export const THEME_GRADIENTS = {
  primary: "linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)",
  issue: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  warning: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  dark: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
} as const;

// Primary colors
export const THEME_COLORS = {
  // Primary purple palette
  primary: "rgb(102, 126, 234)",
  primaryDark: "rgb(118, 75, 162)",
  primaryLight: "#8b9cf4",

  // Issue/success green palette
  issue: "#11998e",
  issueLight: "#38ef7d",

  // Text colors
  textPrimary: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",

  // Background colors
  bgPrimary: "#ffffff",
  bgSecondary: "#f8fafc",
  bgTertiary: "#f1f5f9",

  // Border colors
  border: "#e2e8f0",
  borderLight: "#f1f3f4",

  // State colors
  success: "#28a745",
  warning: "#fd7e14",
  error: "#dc3545",
  info: "#0366d6",
} as const;

// Box shadows
export const THEME_SHADOWS = {
  sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
  md: "0 4px 15px rgba(102, 126, 234, 0.3)",
  lg: "0 8px 32px rgba(102, 126, 234, 0.2)",
  primaryHover: "0 6px 20px rgba(102, 126, 234, 0.5)",
  issueHover: "0 6px 20px rgba(17, 153, 142, 0.4)",
} as const;

// Border radius values
export const THEME_RADIUS = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "50%",
} as const;

// Common component styles
export const COMPONENT_STYLES = {
  // Card styles
  card: {
    background: THEME_COLORS.bgPrimary,
    borderRadius: THEME_RADIUS.lg,
    boxShadow: THEME_SHADOWS.sm,
    border: `1px solid ${THEME_COLORS.border}`,
  },

  // Header gradient card
  headerCard: {
    background: THEME_GRADIENTS.primary,
    borderRadius: THEME_RADIUS.lg,
    padding: "16px 20px",
    boxShadow: THEME_SHADOWS.md,
  },

  // Primary button
  primaryButton: {
    background: THEME_GRADIENTS.primary,
    color: "white",
    border: "none",
    borderRadius: THEME_RADIUS.md,
    padding: "12px 28px",
    fontWeight: "600",
    fontSize: "0.9rem",
    boxShadow: THEME_SHADOWS.md,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // Page title
  pageTitle: {
    background: THEME_GRADIENTS.primary,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: "bold",
  },
} as const;

// Dark mode colors
export const THEME_COLORS_DARK = {
  // Text colors
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",

  // Background colors
  bgPrimary: "#1e1e2e",
  bgSecondary: "#181825",
  bgTertiary: "#11111b",

  // Border colors
  border: "#313244",
  borderLight: "#45475a",
} as const;

// CSS variable definitions for use in stylesheets
export const CSS_VARIABLES = `
  :root, [data-appearance="light"] {
    --theme-primary: ${THEME_COLORS.primary};
    --theme-primary-dark: ${THEME_COLORS.primaryDark};
    --theme-primary-light: ${THEME_COLORS.primaryLight};
    --theme-gradient-primary: ${THEME_GRADIENTS.primary};
    --theme-gradient-issue: ${THEME_GRADIENTS.issue};
    --theme-text-primary: ${THEME_COLORS.textPrimary};
    --theme-text-secondary: ${THEME_COLORS.textSecondary};
    --theme-bg-primary: ${THEME_COLORS.bgPrimary};
    --theme-bg-secondary: ${THEME_COLORS.bgSecondary};
    --theme-border: ${THEME_COLORS.border};
    --theme-shadow-sm: ${THEME_SHADOWS.sm};
    --theme-shadow-md: ${THEME_SHADOWS.md};
    --theme-radius-md: ${THEME_RADIUS.md};
    --theme-radius-lg: ${THEME_RADIUS.lg};
  }

  [data-appearance="dark"] {
    --theme-text-primary: ${THEME_COLORS_DARK.textPrimary};
    --theme-text-secondary: ${THEME_COLORS_DARK.textSecondary};
    --theme-bg-primary: ${THEME_COLORS_DARK.bgPrimary};
    --theme-bg-secondary: ${THEME_COLORS_DARK.bgSecondary};
    --theme-border: ${THEME_COLORS_DARK.border};
    --theme-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
    --theme-shadow-md: 0 4px 15px rgba(0, 0, 0, 0.4);
  }
`;

export default {
  THEME_GRADIENTS,
  THEME_COLORS,
  THEME_COLORS_DARK,
  THEME_SHADOWS,
  THEME_RADIUS,
  COMPONENT_STYLES,
  CSS_VARIABLES,
  getEffectiveAppearance,
  applyAppearance,
  initializeAppearance,
};

