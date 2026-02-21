// src/styles/buttonStyles.ts
import { colors } from "./colors";

export const buttonStyles = {
    /* ================= BASE ================= */
    base:
        "rounded font-medium transition inline-flex items-center justify-center cursor-pointer focus:outline-none",

    /* ================= SIZES ================= */
    sizes: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-xl",
    },

    /* ================= VARIANTS ================= */
    variants: {
        /* Primary Brand Button */
        primary:
            "bg-[#00598a] text-white hover:bg-[#00598a] active:bg-[#00598a]",

        /* Secondary / Neutral Button */
        secondary:
            "bg-[#F0F0F0] text-gray-700 hover:bg-[#E0E0E0]",

        /* Success */
        success:
            "bg-[#10B981] text-white hover:brightness-110",

        /* Danger */
        danger:
            "bg-[#EF4444] text-white hover:bg-red-600",

        /* Outline */
        outline:
            "border-2 border-[#00598a] text-[#00598a] hover:bg-[#F0F0F0]",

        /* Gradients */
        "gradient-orange":
            "bg-gradient-to-r from-orange-400 to-pink-500 text-white",

        "gradient-blue":
            "bg-gradient-to-r from-[#00598a] to-[#00598a] text-white",
    },

    /* ================= SEARCH BUTTONS ================= */
    search: {
        voice: {
            default:
                "px-4 py-2 mx-2 rounded-lg bg-[#F0F0F0] text-gray-600 hover:bg-[#E0E0E0] transition-all",
            listening:
                "px-4 py-2 mx-2 rounded-lg bg-[#EF4444] text-white animate-pulse",
        },

        submit:
            "px-8 py-4 bg-[#00598a] text-white font-bold rounded-r-xl hover:bg-[#00598a] disabled:opacity-50 disabled:cursor-not-allowed",

        clear:
            "px-3 text-gray-400 hover:text-gray-600",
    },

    /* ================= STATES ================= */
    states: {
        disabled: "opacity-50 cursor-not-allowed",
        loading: "opacity-75 cursor-wait",
    },

    /* ================= WIDTH ================= */
    width: {
        auto: "",
        full: "w-full",
    },
};

export default buttonStyles;
