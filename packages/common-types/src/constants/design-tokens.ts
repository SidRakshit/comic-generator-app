// Design tokens - Single Source of Truth for all styling
// These tokens ensure consistent design across all components

/**
 * Semantic color mappings for consistent usage across the application
 * Use these instead of hardcoded Tailwind classes
 */
export const SEMANTIC_COLORS = {
	// Text colors - hierarchical importance
	TEXT: {
		PRIMARY: 'text-gray-900',      // Main headings, important text
		SECONDARY: 'text-gray-700',    // Secondary headings, labels
		TERTIARY: 'text-gray-600',     // Body text, descriptions  
		MUTED: 'text-gray-500',        // Helper text, captions
		DISABLED: 'text-gray-400',     // Disabled states
	},
	
	// Background colors - surface hierarchy
	BACKGROUND: {
		PRIMARY: 'bg-white',           // Main content areas
		SECONDARY: 'bg-gray-50',       // Page backgrounds, sections
		TERTIARY: 'bg-gray-100',       // Cards, elevated surfaces
		MUTED: 'bg-gray-200',          // Subtle backgrounds
	},
	
	// Border colors - visual separation
	BORDER: {
		DEFAULT: 'border-gray-200',    // Default borders
		STRONG: 'border-gray-300',     // Emphasized borders
		PRIMARY: 'border-blue-500',    // Active/selected states
		SUCCESS: 'border-green-400',   // Success states
		ERROR: 'border-red-400',       // Error states
	},
	
	// Brand colors
	BRAND: {
		PRIMARY: 'text-blue-600',      // Main brand color
		PRIMARY_BG: 'bg-blue-600',
		PRIMARY_HOVER: 'hover:bg-blue-700',
		PRIMARY_LIGHT: 'bg-blue-50 text-blue-700',
		PRIMARY_BORDER: 'border-blue-500',
	},
	
	// State colors
	SUCCESS: {
		TEXT: 'text-green-500',
		BACKGROUND: 'bg-green-50',
		BORDER: 'border-green-400',
	},
	
	ERROR: {
		TEXT: 'text-red-500', 
		BACKGROUND: 'bg-red-50',
		BORDER: 'border-red-400',
	},
	
	LOADING: {
		TEXT: 'text-blue-500',
		BACKGROUND: 'bg-blue-50', 
		BORDER: 'border-blue-400',
	},
} as const;

/**
 * Interactive element styles - buttons, links, form controls
 */
export const INTERACTIVE_STYLES = {
	// Button variants
	BUTTON: {
		PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white',
		SECONDARY: 'bg-white hover:bg-gray-100 text-blue-600 border border-blue-600',
		GHOST: 'hover:bg-gray-100 text-gray-700',
		LOADING: 'bg-blue-600 text-white opacity-75 cursor-wait',
		OUTLINE: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
	},
	
	// Link styles
	LINK: {
		PRIMARY: 'text-blue-600 hover:text-blue-800',
		SECONDARY: 'text-gray-700 hover:text-gray-900',
	},
} as const;

/**
 * Spacing scale for consistent layout
 */
export const SPACING = {
	// Component internal spacing
	COMPONENT: {
		PADDING_XS: 'p-1',
		PADDING_SM: 'p-2', 
		PADDING_MD: 'p-4',
		PADDING_LG: 'p-6',
		PADDING_XL: 'p-8',
		
		MARGIN_XS: 'm-1',
		MARGIN_SM: 'm-2',
		MARGIN_MD: 'm-4', 
		MARGIN_LG: 'm-6',
		MARGIN_XL: 'm-8',
	},
	
	// Layout spacing
	LAYOUT: {
		SECTION_PADDING: 'py-16',           // Standard section spacing
		CONTAINER: 'container mx-auto px-4', // Main container
		GRID_GAP_SM: 'gap-4',
		GRID_GAP_MD: 'gap-8',
		GRID_GAP_LG: 'gap-12',
	},
	
	// Form spacing
	FORM: {
		FIELD_GAP: 'space-y-4',
		LABEL_MARGIN: 'mb-2',
		INPUT_PADDING: 'px-3 py-2',
	},
} as const;

/**
 * Typography scale for consistent text sizing
 */
export const TYPOGRAPHY = {
	// Headings - semantic hierarchy
	HEADING: {
		H1: 'text-3xl font-bold',       // Page titles
		H2: 'text-2xl font-bold',       // Section titles  
		H3: 'text-xl font-semibold',    // Subsection titles
		H4: 'text-lg font-semibold',    // Component titles
	},
	
	// Body text
	BODY: {
		LARGE: 'text-lg',               // Emphasized body text
		DEFAULT: 'text-base',           // Standard body text
		SMALL: 'text-sm',               // Helper text, captions
		TINY: 'text-xs',                // Fine print, labels
	},
	
	// Special text styles
	SPECIAL: {
		LEAD: 'text-xl text-gray-600',  // Lead paragraphs
		MUTED: 'text-sm text-gray-500', // Muted helper text
		CODE: 'font-mono text-sm',      // Code snippets
	},
} as const;

/**
 * Component-specific style patterns
 */
export const COMPONENT_STYLES = {
	// Form elements
	FORM: {
		INPUT: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
		LABEL: 'block text-sm font-medium text-gray-700',
		ERROR: 'text-sm text-red-500',
		HELP_TEXT: 'text-xs text-gray-600 mt-1',
	},
	
	// Cards and containers
	CARD: {
		DEFAULT: 'bg-white border rounded-lg shadow-sm',
		HOVER: 'hover:shadow-md hover:border-blue-500 transition-all',
		PADDING: 'p-4',
		ELEVATED: 'bg-white border rounded-lg shadow-md',
	},
	
	// Navigation states (extracted from navbar)
	NAV: {
		MOBILE_ACTIVE: 'flex items-center pl-3 pr-4 py-2 border-l-4 border-blue-500 bg-blue-50 text-base font-medium text-blue-700',
		MOBILE_INACTIVE: 'flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
		MOBILE_LOADING: 'flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-400 cursor-not-allowed',
		
		DESKTOP_ACTIVE: 'inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600',
		DESKTOP_INACTIVE: 'inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300',
		DESKTOP_LOADING: 'inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-400 cursor-not-allowed',
	},
	
	// Panel states (from comic canvas)
	PANEL: {
		LOADING: 'border-blue-400 bg-blue-50',
		ERROR: 'border-red-400 bg-red-50',
		COMPLETE: 'border-green-400',
		EMPTY: 'border-gray-200 bg-gray-50 hover:border-blue-200',
	},
	
	// Status indicators
	STATUS: {
		SUCCESS: 'bg-green-100 text-green-800 border border-green-200',
		ERROR: 'bg-red-100 text-red-800 border border-red-200',
		WARNING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
		INFO: 'bg-blue-100 text-blue-800 border border-blue-200',
	},
} as const;

/**
 * Animation and transition classes
 */
export const ANIMATIONS = {
	TRANSITION: {
		DEFAULT: 'transition-all duration-200',
		FAST: 'transition-all duration-150',
		SLOW: 'transition-all duration-300',
	},
	
	LOADING: {
		SPIN: 'animate-spin',
		PULSE: 'animate-pulse',
	},
} as const;

/**
 * Responsive breakpoint utilities
 */
export const RESPONSIVE = {
	GRID: {
		MOBILE_1: 'grid-cols-1',
		TABLET_2: 'md:grid-cols-2', 
		DESKTOP_3: 'lg:grid-cols-3',
		DESKTOP_4: 'lg:grid-cols-4',
		FULL_RESPONSIVE: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
	},
	
	TEXT: {
		RESPONSIVE_HEADING: 'text-2xl md:text-3xl lg:text-4xl',
		RESPONSIVE_BODY: 'text-sm md:text-base',
	},
} as const;
