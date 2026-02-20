// Typography Configuration for the entire website
// File location: src/styles/typography.ts

export const typography = {
    // Logo
    logo: {
        title: "text-2xl sm:text-3xl font-bold",
        subtitle: "text-base text-gray-500",
        icon: "text-3xl",
    },

    // Navigation
    nav: {
        menuItem: "text-lg font-bold",
        button: "text-base font-medium",
        icon: "text-xl",
    },

    // Headings
    heading: {
        h1: "text-4xl sm:text-5xl lg:text-6xl font-bold",
        h2: "text-3xl sm:text-4xl lg:text-5xl font-bold",
        h3: "text-2xl sm:text-3xl lg:text-4xl font-bold",
        h4: "text-xl sm:text-2xl lg:text-3xl font-bold",
        h5: "text-lg sm:text-xl lg:text-2xl font-bold",
        h6: "text-base sm:text-lg lg:text-xl font-bold",
    },

    // Body Text
    body: {
        large: "text-lg sm:text-xl",
        base: "text-base sm:text-lg",
        small: "text-sm sm:text-base",
        xs: "text-xs sm:text-sm",
    },

    // Font Sizes (Separate)
    fontSize: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
        "3xl": "text-3xl",
        "4xl": "text-4xl",
        "5xl": "text-5xl",
    },

    // Forms & Inputs
    form: {
        label: "text-base sm:text-lg font-medium",
        input: "text-base sm:text-lg",
        helper: "text-sm sm:text-base",
        error: "text-sm sm:text-base text-red-600",
    },

    // Search Components
    search: {
        input: "text-base",
        placeholder: "text-base",
        label: "text-xs font-semibold uppercase tracking-wide",
        locationText: "text-base font-bold",
        hint: "text-sm",
    },

    // Icons
    icon: {
        xs: "text-sm",
        sm: "text-lg",
        base: "text-xl",
        lg: "text-2xl",
        xl: "text-3xl",
    },

    // Cards
    card: {
        title: "text-xl sm:text-2xl font-bold",
        subtitle: "text-base sm:text-lg font-medium",
        description: "text-sm sm:text-base",
    },

    // Miscellaneous
    misc: {
        badge: "text-xs sm:text-sm font-semibold",
        caption: "text-xs sm:text-sm text-gray-600",
        quote: "text-lg sm:text-xl italic",
    },
};

// Helper function to combine typography classes with custom classes
export const combineTypography = (typographyClass: string, customClass?: string): string => {
    return customClass ? `${typographyClass} ${customClass}` : typographyClass;
};

// Export individual typography elements for direct usage
export const fontSize = typography.fontSize;

export const fontWeight = {
    thin: "font-thin",
    extralight: "font-extralight",
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
    black: "font-black",
};

export const responsiveFontSize = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
    "2xl": "text-2xl sm:text-3xl",
    "3xl": "text-3xl sm:text-4xl",
    "4xl": "text-4xl sm:text-5xl",
    "5xl": "text-5xl sm:text-6xl",
};

export default typography;
