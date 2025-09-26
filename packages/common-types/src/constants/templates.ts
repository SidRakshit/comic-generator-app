// Shared template definitions - Single Source of Truth
// These templates are used across frontend and backend for consistent comic layouts

import type { TemplateDefinition } from '../domain/comic';

/**
 * Comic Template Definitions
 * 
 * Each template defines a specific panel layout for comic creation.
 * Templates are referenced by their ID across the application.
 */
export const COMIC_TEMPLATES: Record<string, TemplateDefinition> = {
	"template-1": {
		id: "template-1",
		name: "2x2 Grid",
		panelCount: 4,
	},
	"template-2": {
		id: "template-2",
		name: "3x2 Grid",
		panelCount: 6,
	},
	"template-3": {
		id: "template-3",
		name: "Single Panel",
		panelCount: 1,
	},
	"template-4": {
		id: "template-4",
		name: "3x3 Grid",
		panelCount: 9,
	},
	"template-5": {
		id: "template-5",
		name: "Manga Style",
		panelCount: 5,
	},
} as const;

/**
 * Template IDs as a union type for type safety
 */
export type TemplateId = keyof typeof COMIC_TEMPLATES;

/**
 * Array of all available templates for iteration
 */
export const TEMPLATE_LIST = Object.values(COMIC_TEMPLATES);

/**
 * Get template by ID with type safety
 */
export function getTemplate(id: string): TemplateDefinition | undefined {
	return COMIC_TEMPLATES[id];
}

/**
 * Check if a template ID is valid
 */
export function isValidTemplateId(id: string): id is TemplateId {
	return id in COMIC_TEMPLATES;
}
