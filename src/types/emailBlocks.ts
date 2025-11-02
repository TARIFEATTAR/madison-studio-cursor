export type BlockType = 'headline' | 'image' | 'text' | 'button' | 'divider' | 'spacer';

export interface BaseBlock {
  id: string;
  type: BlockType;
  backgroundColor?: string;
}

export interface HeadlineBlock extends BaseBlock {
  type: 'headline';
  text: string;
  size: 'small' | 'medium' | 'large';
  alignment: 'left' | 'center' | 'right';
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  alt: string;
  alignment: 'left' | 'center' | 'right';
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  alignment: 'left' | 'center' | 'right';
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  text: string;
  url: string;
  style: 'square' | 'rounded' | 'pill';
  alignment: 'left' | 'center' | 'right';
  fullWidth?: boolean;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  color?: string;
  thickness?: number;
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  height: number;
}

export type EmailBlock = HeadlineBlock | ImageBlock | TextBlock | ButtonBlock | DividerBlock | SpacerBlock;

export interface EmailComposition {
  templateId: string;
  globalStyles: {
    fontFamily: string;
    backgroundColor: string;
    brandColor: string;
    padding: number;
  };
  blocks: EmailBlock[];
}
