export type ThemeMode = "light" | "dark" | "system";
export type AppLanguage = "zh-CN" | "en";
export type OutputLanguage = "zh" | "en";
export type WritingMode =
  | "discussion"
  | "introduction"
  | "abstract"
  | "conclusion"
  | "free";

export type ReferenceSource = "search" | "ai-generated";
export type ReferenceConfidence = "high" | "medium" | "low";

export interface UserPreferences {
  defaultModel: string;
  editorModel: string;
  theme: ThemeMode;
  language: AppLanguage;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface EditorScores {
  terminology: number;
  academicStyle: number;
  fluency: number;
  faithfulness: number;
  overall: number;
}

export interface EditorModelReview {
  model: string;
  scores: EditorScores;
  comment: string;
}

export interface EditorReview {
  modelReviews: EditorModelReview[];
  recommendation: string;
}

export interface PolishResult {
  model: string;
  translatedText: string;
  polishedText: string;
  review?: {
    scores: EditorScores;
    comment: string;
  };
  status: "idle" | "generating" | "done" | "error";
  error?: string;
}

export interface PolishRecord {
  id: string;
  sourceText: string;
  selectedModels: string[];
  results: PolishResult[];
  editorModel: string;
  recommendation: string;
  createdAt: number;
}

export interface WritingRecord {
  id: string;
  mode: WritingMode;
  targetSections?: string[];
  inputSummary: string;
  existingDraft?: string;
  references: string;
  requirements: string;
  outputLanguage: OutputLanguage;
  generatedText: string;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface Reference {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi: string;
  abstract: string;
  source: ReferenceSource;
  verified: boolean;
  confidence?: ReferenceConfidence;
  relevance: string;
  createdAt: number;
}

export interface ReferenceSearchRecord {
  id: string;
  keywords: string[];
  mode: "search" | "recommend";
  inputText: string;
  results: Reference[];
  model: string;
  createdAt: number;
}
