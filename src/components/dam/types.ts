// DAM Types

export interface DAMFolder {
  id: string;
  organization_id: string;
  parent_id: string | null;
  name: string;
  slug: string | null;
  description: string | null;
  icon: string;
  color: string | null;
  folder_type: 'user' | 'smart' | 'system' | 'inbox';
  smart_filter: SmartFilter | null;
  agent_accessible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Computed
  asset_count?: number;
  children?: DAMFolder[];
}

export interface SmartFilter {
  conditions: FilterCondition[];
  match: 'all' | 'any';
}

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'contains' | 'gte' | 'lte';
  value: unknown;
}

export interface DAMAsset {
  id: string;
  organization_id: string;
  folder_id: string | null;
  name: string;
  file_type: string;
  file_extension: string | null;
  file_size: number | null;
  file_url: string;
  thumbnail_url: string | null;
  preview_url: string | null;
  source_type: 'upload' | 'generated' | 'external_sync' | 'derivative' | 'system';
  source_ref: Record<string, unknown> | null;
  linked_content_ids: string[];
  linked_content_types: string[];
  tags: string[];
  categories: string[];
  campaigns: string[];
  ai_analysis: AIAnalysis | null;
  usage_count: number;
  last_used_at: string | null;
  status: 'processing' | 'active' | 'archived' | 'deleted';
  is_favorite: boolean;
  is_hero: boolean;
  version: number;
  metadata: AssetMetadata;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
}

export interface AIAnalysis {
  description?: string;
  detected_objects?: string[];
  dominant_colors?: string[];
  sentiment?: string;
  suggested_tags?: string[];
  text_content?: string | null;
  image_type?: string;
  quality_score?: number;
  brand_consistency_score?: number;
}

export interface AssetMetadata {
  dimensions?: { width: number; height: number };
  duration?: number;
  pages?: number;
  exif?: Record<string, unknown>;
  original_name?: string;
  storage_path?: string;
  custom?: Record<string, unknown>;
}

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  asset?: DAMAsset;
}

export interface DAMViewMode {
  type: 'grid' | 'list' | 'masonry';
  size: 'small' | 'medium' | 'large';
}

export interface DAMSortOption {
  field: 'created_at' | 'name' | 'file_size' | 'usage_count';
  direction: 'asc' | 'desc';
  label: string;
}

export const SORT_OPTIONS: DAMSortOption[] = [
  { field: 'created_at', direction: 'desc', label: 'Newest first' },
  { field: 'created_at', direction: 'asc', label: 'Oldest first' },
  { field: 'name', direction: 'asc', label: 'Name A-Z' },
  { field: 'name', direction: 'desc', label: 'Name Z-A' },
  { field: 'file_size', direction: 'desc', label: 'Largest first' },
  { field: 'usage_count', direction: 'desc', label: 'Most used' },
];

export const FILE_TYPE_ICONS: Record<string, string> = {
  'image': 'image',
  'video': 'video',
  'application/pdf': 'file-text',
  'document': 'file-text',
  'default': 'file',
};

export const FILE_TYPE_COLORS: Record<string, string> = {
  'image': 'bg-blue-100 text-blue-700',
  'video': 'bg-purple-100 text-purple-700',
  'application/pdf': 'bg-red-100 text-red-700',
  'document': 'bg-amber-100 text-amber-700',
  'default': 'bg-muted text-muted-foreground',
};

export function getFileTypeCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'application/pdf';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
  return 'default';
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
