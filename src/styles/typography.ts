// Typography Configuration for the entire website
// File location: src/styles/typography.ts

export const typography = {
    // Logo
    logo: {
        title: "text-3xl sm:text-4xl font-bold",
        subtitle: "text-lg text-gray-500",
        icon: "text-4xl",
    },

    // Navigation
    nav: {
        menuItem: "text-xl font-bold",
        button: "text-lg font-medium",
        icon: "text-2xl",
    },

    // Headings
    heading: {
        h1: "text-5xl sm:text-6xl lg:text-7xl font-bold",
        h2: "text-4xl sm:text-5xl lg:text-6xl font-bold",
        h3: "text-3xl sm:text-4xl lg:text-5xl font-bold",
        h4: "text-2xl sm:text-3xl lg:text-4xl font-bold",
        h5: "text-xl sm:text-2xl lg:text-3xl font-bold",
        h6: "text-lg sm:text-xl lg:text-2xl font-bold",
    },

    // Body Text
    body: {
        large: "text-xl sm:text-2xl",
        base: "text-lg sm:text-xl",
        small: "text-base sm:text-lg",
        xs: "text-sm sm:text-base",
    },

    // Font Sizes (Separate)
    fontSize: {
        xs: "text-sm",
        sm: "text-base",
        base: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
        "2xl": "text-3xl",
        "3xl": "text-4xl",
        "4xl": "text-5xl",
        "5xl": "text-6xl",
    },

    // Forms & Inputs
    form: {
        label: "text-lg sm:text-xl font-medium",
        input: "text-lg sm:text-xl",
        helper: "text-base sm:text-lg",
        error: "text-base sm:text-lg text-red-600",
    },

    // Search Components
    search: {
        input: "text-lg",
        placeholder: "text-lg",
        label: "text-sm font-semibold uppercase tracking-wide",
        locationText: "text-lg font-bold",
        hint: "text-base",
    },

    // Icons
    icon: {
        xs: "text-base",
        sm: "text-xl",
        base: "text-2xl",
        lg: "text-3xl",
        xl: "text-4xl",
    },

    // Cards
    card: {
        title: "text-2xl sm:text-3xl font-bold",
        subtitle: "text-lg sm:text-xl font-medium",
        description: "text-base sm:text-lg",
    },

    // Miscellaneous
    misc: {
        badge: "text-sm sm:text-base font-semibold",
        caption: "text-sm sm:text-base text-gray-600",
        quote: "text-xl sm:text-2xl italic",
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
    xs: "text-sm sm:text-base",
    sm: "text-base sm:text-lg",
    base: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
    "2xl": "text-3xl sm:text-4xl",
    "3xl": "text-4xl sm:text-5xl",
    "4xl": "text-5xl sm:text-6xl",
    "5xl": "text-6xl sm:text-7xl",
};

export default typography;