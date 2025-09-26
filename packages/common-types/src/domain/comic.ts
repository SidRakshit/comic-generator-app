// Domain types for Comic-related entities

export type PanelStatus = "empty" | "loading" | "complete" | "error";

export interface Panel {
  id: string;
  status: PanelStatus;
  prompt?: string;
  imageUrl?: string; // Holds S3 URL (loaded) or Data URL (newly generated)
  imageBase64?: string; // Holds the raw base64 from generation, used for saving
  error?: string;
  panelNumber?: number;
  layoutPosition?: Record<string, unknown>;
}

export interface ComicCharacter {
  id: string;
  name: string;
  description: string;
}

export interface Comic {
  id?: string;
  title: string;
  description?: string;
  genre?: string;
  characters?: ComicCharacter[];
  template: string | null;
  panels: Panel[];
  createdAt?: string;
  updatedAt?: string;
  published?: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  panelCount: number;
}

// Unified GeneratedImageData type (replaces both frontend and backend versions)
export interface GeneratedImageData {
  imageData: string; // Base64 encoded image data
  promptUsed: string;
}

// Frontend context type
export interface ComicContextType {
  comic: Comic;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  setTemplate: (templateId: string | null) => void;
  updatePanelContent: (
    panelIndex: number,
    updates: Partial<Panel> & { imageData?: string }
  ) => void;
  updateComicMetadata: (
    updates: Partial<Omit<Comic, "panels" | "characters">>
  ) => void;
  addCharacter: () => void;
  removeCharacter: (idToRemove: string) => void;
  updateCharacter: (
    idToUpdate: string,
    field: keyof Omit<ComicCharacter, "id">,
    value: string
  ) => void;
  saveComic: () => Promise<Comic | undefined>;
}

// REMOVED: Duplicate backend types - use API response types instead
// All backend communication should use types from api/responses.ts:
// - ComicResponse instead of BackendComicData/FullComicDataFromBackend
// - Use ComicPageRequest/ComicPanelRequest from api/requests.ts for requests
// - Frontend domain types (Panel, Comic) remain for UI state management

// Service layer types
export interface Dialogue {
  character: string;
  text: string;
}

export interface ScriptPanel {
  panelNumber: string;
  description: string;
  dialogue?: Dialogue[];
}