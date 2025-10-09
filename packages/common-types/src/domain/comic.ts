// Domain types for Comic-related entities

export type PanelStatus = "empty" | "loading" | "complete" | "error";

export interface DialogueBubble {
  id: string;
  type: 'speech' | 'thought' | 'caption';
  x: number; // percentage of panel width
  y: number; // percentage of panel height
  width: number; // percentage of panel width
  height: number; // percentage of panel height
  text: string;
  characterId?: string;
  characterName?: string;
}

export interface Panel {
  id: string;
  status: PanelStatus;
  prompt?: string;
  dialogue?: string; // Generated dialogue text for the panel
  imageUrl?: string; // Holds S3 URL (loaded) or Data URL (newly generated)
  imageBase64?: string; // Holds the raw base64 from generation, used for saving
  error?: string;
  panelNumber?: number;
  layoutPosition?: {
    bubbles?: DialogueBubble[];
    [key: string]: unknown;
  };
  // Computed property for easy access to bubbles
  bubbles?: DialogueBubble[];
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
  // Original properties
  comic: Comic;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  setTemplate: (_templateId: string | null) => void;
  updatePanelContent: (
    _panelIndex: number,
    _updates: Partial<Panel> & { imageData?: string; dialogue?: string }
  ) => void;
  updateComicMetadata: (
    _updates: Partial<Omit<Comic, "panels" | "characters">>
  ) => void;
  addCharacter: () => void;
  removeCharacter: (_idToRemove: string) => void;
  updateCharacter: (
    _idToUpdate: string,
    _field: keyof Omit<ComicCharacter, "id">,
    _value: string
  ) => void;
  saveComic: () => Promise<Comic | undefined>;
  
  // Enhanced Phase 1 features
  hasChanges: boolean;
  isAutoSaving: boolean;
  lastAutoSave: Date | null;
  autoSaveFailureCount: number;
  hasDraft: boolean;
  loadDraft: () => Comic | null;
  clearDraft: () => void;
  markAsSaved: () => void;
  triggerAutoSave: () => Promise<void>;
  isRetrying: boolean;
  retryCount: number;
  canRetry: boolean;
  lastError: Error | null;
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