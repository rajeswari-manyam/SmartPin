/**
 * ============================================================================
 * Color Configuration - Centralized Color Palette
 * ============================================================================
 * 
 * This file contains all the color values used throughout the application.
 * Update these values to change the color scheme across all screens.
 */

export const colors = {
    // Primary Colors
    primary: {
        main: '#00598a',        // Main brand color (buttons, active states, etc.)
        light: '#00598a',       // Lighter shade for hover effects
        dark: '#00598a',        // Darker shade for pressed states
    },


    secondary: {
        main: '#F0F0F0',        // Secondary background color
        light: '#F8F8F8',       // Lighter background
        dark: '#E0E0E0',        // Darker background for contrast
    },

    // Neutral Colors
    neutral: {
        white: '#FFFFFF',
        black: '#000000',
        gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
        },
    },

    // Status Colors
    status: {
        success: '#10B981',     // Green for success states
        error: '#EF4444',       // Red for errors
        warning: '#F59E0B',     // Orange for warnings
        info: '#3B82F6',        // Blue for info
    },

    // Gradient Colors
    gradient: {
        orange: 'linear-gradient(to right, #FB923C, #EC4899)',
        blue: 'linear-gradient(to right, #00598a, #00598a)',
    },

    // Hover States
    hover: {
        background: '#00598a',  // Background color on hover
        primary: '#00598a',     // Primary color on hover
    },

    // Active States
    active: {
        tab: '#00598a',         // Active tab color
        border: '#00598a',      // Active border color
        text: '#00598a',        // Active text color
    },

    // Border Colors
    border: {
        default: '#F0F0F0',     // Default border color
        active: '#00598a',      // Active border color
        light: '#E5E7EB',       // Light border
    },
};

// Export individual color values for backward compatibility
export const PRIMARY_COLOR = colors.primary.main;
export const SECONDARY_COLOR = colors.secondary.main;
export const HOVER_BG = colors.hover.background;
export const ACTIVE_TAB = colors.active.tab;
export const BORDER_COLOR = colors.border.default;
export const ACTIVE_COLOR = colors.active.border;

export default colors;
