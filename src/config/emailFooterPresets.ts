export interface FooterPreset {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  preview: string;
}

export const FOOTER_PRESETS: FooterPreset[] = [
  {
    id: 'luxury-light',
    name: 'Luxury Light',
    description: 'Soft, elegant light footer perfect for high-end brands',
    backgroundColor: '#FAFAFA',
    textColor: '#666666',
    linkColor: '#B8956A',
    preview: 'linear-gradient(to bottom, #FAFAFA, #F0F0F0)',
  },
  {
    id: 'sophisticated-dark',
    name: 'Sophisticated Dark',
    description: 'Bold, modern dark footer for tech-luxury brands',
    backgroundColor: '#1A1A1A',
    textColor: '#CCCCCC',
    linkColor: '#C9A961',
    preview: 'linear-gradient(to bottom, #1A1A1A, #2C2C2C)',
  },
  {
    id: 'neutral-warm',
    name: 'Neutral Warm',
    description: 'Versatile warm beige, works with most brand colors',
    backgroundColor: '#F5F5F0',
    textColor: '#666666',
    linkColor: '#8B7355',
    preview: 'linear-gradient(to bottom, #F5F5F0, #E8E8DC)',
  },
  {
    id: 'minimalist-white',
    name: 'Minimalist White',
    description: 'Clean, pure white for maximum elegance',
    backgroundColor: '#FFFFFF',
    textColor: '#888888',
    linkColor: '#000000',
    preview: 'linear-gradient(to bottom, #FFFFFF, #F8F8F8)',
  },
  {
    id: 'editorial-gray',
    name: 'Editorial Gray',
    description: 'Professional gray inspired by print magazines',
    backgroundColor: '#E8E8E8',
    textColor: '#555555',
    linkColor: '#333333',
    preview: 'linear-gradient(to bottom, #E8E8E8, #DDDDDD)',
  },
];
