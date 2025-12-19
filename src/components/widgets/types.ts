/**
 * Widget System Types
 * 
 * Core type definitions for the customizable dashboard widget system.
 */

export type WidgetType = 
  | 'quick-links'
  | 'quick-write'
  | 'content-streak'
  | 'ai-suggestions'
  | 'brand-health'
  | 'content-pipeline'
  | 'this-week'
  | 'quick-multiply';

export type WidgetSize = 'small' | 'medium' | 'large' | 'wide';

export interface WidgetPosition {
  x: number;  // Column position (0-11 for 12-column grid)
  y: number;  // Row position
  w: number;  // Width in columns
  h: number;  // Height in rows
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  settings?: Record<string, any>;  // Widget-specific settings
  isVisible?: boolean;
}

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;  // Lucide icon name
  defaultSize: WidgetSize;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  category: 'productivity' | 'analytics' | 'content' | 'links';
}

export interface DashboardLayout {
  version: number;
  widgets: WidgetConfig[];
  lastModified: string;
}

// Size presets in grid units
export const WIDGET_SIZES: Record<WidgetSize, { w: number; h: number }> = {
  small: { w: 3, h: 2 },
  medium: { w: 4, h: 3 },
  large: { w: 6, h: 4 },
  wide: { w: 8, h: 2 },
};

// Widget registry with metadata
export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  'quick-links': {
    type: 'quick-links',
    name: 'Quick Links',
    description: 'Save your favorite links, YouTube videos, and more',
    icon: 'Link2',
    defaultSize: 'medium',
    minWidth: 3,
    minHeight: 2,
    category: 'links',
  },
  'quick-write': {
    type: 'quick-write',
    name: 'Quick Write',
    description: 'Jump straight to the editor and start writing',
    icon: 'PenLine',
    defaultSize: 'small',
    minWidth: 2,
    minHeight: 2,
    category: 'productivity',
  },
  'content-streak': {
    type: 'content-streak',
    name: 'Content Streak',
    description: 'Track your content creation streak',
    icon: 'Flame',
    defaultSize: 'small',
    minWidth: 2,
    minHeight: 2,
    category: 'analytics',
  },
  'ai-suggestions': {
    type: 'ai-suggestions',
    name: 'AI Suggestions',
    description: 'Smart recommendations from Madison',
    icon: 'Sparkles',
    defaultSize: 'medium',
    minWidth: 3,
    minHeight: 2,
    category: 'content',
  },
  'brand-health': {
    type: 'brand-health',
    name: 'Brand Health',
    description: 'Monitor your brand consistency score',
    icon: 'Heart',
    defaultSize: 'small',
    minWidth: 2,
    minHeight: 2,
    category: 'analytics',
  },
  'content-pipeline': {
    type: 'content-pipeline',
    name: 'Content Pipeline',
    description: 'See what content is in progress',
    icon: 'GitBranch',
    defaultSize: 'medium',
    minWidth: 3,
    minHeight: 3,
    category: 'content',
  },
  'this-week': {
    type: 'this-week',
    name: "This Week's Schedule",
    description: 'View upcoming scheduled content',
    icon: 'Calendar',
    defaultSize: 'wide',
    minWidth: 4,
    minHeight: 2,
    category: 'content',
  },
  'quick-multiply': {
    type: 'quick-multiply',
    name: 'Quick Multiply',
    description: 'One-click content repurposing',
    icon: 'Layers',
    defaultSize: 'small',
    minWidth: 2,
    minHeight: 2,
    category: 'productivity',
  },
};

// Default layout for new users
export const DEFAULT_LAYOUT: DashboardLayout = {
  version: 1,
  widgets: [
    { id: 'w1', type: 'quick-write', position: { x: 0, y: 0, w: 3, h: 2 } },
    { id: 'w2', type: 'content-streak', position: { x: 3, y: 0, w: 3, h: 2 } },
    { id: 'w3', type: 'brand-health', position: { x: 6, y: 0, w: 3, h: 2 } },
    { id: 'w4', type: 'quick-multiply', position: { x: 9, y: 0, w: 3, h: 2 } },
    { id: 'w5', type: 'ai-suggestions', position: { x: 0, y: 2, w: 4, h: 3 } },
    { id: 'w6', type: 'content-pipeline', position: { x: 4, y: 2, w: 4, h: 3 } },
    { id: 'w7', type: 'quick-links', position: { x: 8, y: 2, w: 4, h: 3 } },
    { id: 'w8', type: 'this-week', position: { x: 0, y: 5, w: 12, h: 2 } },
  ],
  lastModified: new Date().toISOString(),
};

