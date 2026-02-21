# Color Customization Guide

## Overview
This guide explains how to change the color scheme across your entire application.

## Quick Start - Change Colors in One Place

### Step 1: Open the Color Configuration File
Navigate to: `src/styles/colors.ts`

### Step 2: Update the Color Values
Find these lines and change the hex color values:

```typescript
export const colors = {
    // Primary Colors
    primary: {
        main: '#00598a',        // ← Change this to your desired primary color
        light: '#00598a',       // ← Lighter shade for hover effects
        dark: '#00598a',        // ← Darker shade for pressed states
    },

    // Secondary/Background Colors
    secondary: {
        main: '#F0F0F0',        // ← Change this to your desired secondary color
        light: '#F8F8F8',       // ← Lighter background
        dark: '#E0E0E0',        // ← Darker background for contrast
    },
};
```

### Example: Change to Purple Theme
```typescript
export const colors = {
    primary: {
        main: '#7C3AED',        // Purple
        light: '#A78BFA',       // Light purple
        dark: '#5B21B6',        // Dark purple
    },

    secondary: {
        main: '#F3E8FF',        // Light purple background
        light: '#FAF5FF',       // Very light purple
        dark: '#E9D5FF',        // Medium purple background
    },
};
```

## Files Already Using Centralized Colors ✅

The following files have been updated to use the centralized color system:

1. **`src/styles/ButtonStyle.ts`** - All button styles
2. **`src/components/Categories.tsx`** - Category cards
3. **`src/pages/CategoriesPage.tsx`** - Category page

These files will automatically update when you change colors in `colors.ts`.

## Files Still Using Hardcoded Colors ⚠️

The following files still use hardcoded Tailwind classes like `bg-blue-600` and `text-blue-600`:

### High Priority (Most Visible)
- `src/pages/Home.tsx`
- `src/pages/CategoriesPage.tsx` (some instances)
- `src/pages/WorkerList.tsx`
- `src/pages/MatchedWorkers.tsx`
- `src/pages/AllJobs.tsx`
- `src/pages/Listedjobs.tsx`
- `src/pages/MySkills.tsx`
- `src/pages/MyProfile.tsx`

### Medium Priority
- `src/pages/Help.tsx`
- `src/pages/Refer&earn.tsx`
- `src/pages/Notifications.tsx`
- `src/pages/WorkerDetails.tsx`
- `src/pages/JobDetails.tsx`

### Low Priority (Less Visible)
- `src/pages/BookNow.tsx`
- `src/pages/Chat.tsx`
- `src/pages/LoginPage.tsx`
- `src/modal/DownloadAppModal.tsx`
- `src/components/LocationSelector.tsx`
- `src/components/cards/FilterCard.tsx`

## How to Update Remaining Files

### Option 1: Use Tailwind Configuration (Recommended)
Update your `tailwind.config.js` to use your custom colors:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00598a',  // Change this
          light: '#00598a',
          dark: '#00598a',
        },
        secondary: {
          DEFAULT: '#F0F0F0',  // Change this
          light: '#F8F8F8',
          dark: '#E0E0E0',
        },
      },
    },
  },
};
```

Then replace:
- `bg-blue-600` → `bg-primary`
- `text-blue-600` → `text-primary`
- `hover:bg-blue-700` → `hover:bg-primary-dark`

### Option 2: Find and Replace
Use your IDE's find and replace feature:

1. Find: `bg-blue-600`
   Replace with: `bg-[#YOUR_COLOR]`

2. Find: `text-blue-600`
   Replace with: `text-[#YOUR_COLOR]`

3. Find: `border-blue-600`
   Replace with: `border-[#YOUR_COLOR]`

## Testing Your Changes

After changing colors:

1. **Check the Home Page** - Main landing page
2. **Check Categories** - Category cards and subcategories
3. **Check Buttons** - All button variants
4. **Check Forms** - Input fields and form buttons
5. **Check Cards** - Worker cards, job cards, etc.

## Color Palette Recommendations

### Professional Blue (Current)
- Primary: `#00598a`
- Secondary: `#F0F0F0`

### Modern Purple
- Primary: `#7C3AED`
- Secondary: `#F3E8FF`

### Fresh Green
- Primary: `#10B981`
- Secondary: `#D1FAE5`

### Vibrant Orange
- Primary: `#00598a`
- Secondary: `#FED7AA`

### Corporate Navy
- Primary: `#1E40AF`
- Secondary: `#DBEAFE`

## Need Help?

If you need to change colors across all files automatically, I can:
1. Update the Tailwind configuration
2. Create a script to replace all hardcoded colors
3. Update each file individually

Just let me know which approach you prefer!
