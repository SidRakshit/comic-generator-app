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

// Backend-specific comic types
export interface BackendComicData {
  comic_id: string;
  user_id: string;
  title: string;
  description?: string;
  characters?: ComicCharacter[];
  setting?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BackendPageData {
  page_id: string;
  comic_id: string;
  page_number: number;
  created_at: string;
  updated_at: string;
  panels: BackendPanelData[];
}

export interface BackendPanelData {
  panel_id: string;
  page_id: string;
  panel_number: number;
  image_url?: string;
  prompt?: string;
  dialogue?: string;
  layout_position?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

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