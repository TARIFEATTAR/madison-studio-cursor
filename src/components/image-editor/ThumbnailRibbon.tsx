import { Save, Trash2, Edit3 } from "lucide-react";

interface ThumbnailImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio?: string;
  orderIndex?: number;
}

interface ThumbnailRibbonProps {
  images: ThumbnailImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onSave: (img: ThumbnailImage) => void;
  onDelete: (img: ThumbnailImage) => void;
  onRefine?: (img: ThumbnailImage) => void;
  onSaveSession?: () => void;
}

export default function ThumbnailRibbon({
  images,
  activeIndex,
  onSelect,
  onSave,
  onDelete,
  onRefine,
  onSaveSession
}: ThumbnailRibbonProps) {
  return (
    <div className="w-full overflow-x-auto flex items-center gap-3 py-3 px-4 bg-black/40 border-t border-zinc-800/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-max">
        {images.map((img, i) => (
          <div
            key={img.id}
            className={`relative w-[100px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group
            ${i === activeIndex 
              ? 'ring-2 ring-aged-brass shadow-lg shadow-aged-brass/20' 
              : 'ring-1 ring-zinc-700 hover:ring-zinc-600'}`}
            onClick={() => onSelect(i)}
          >
            <img 
              src={img.url} 
              alt={`Generated image ${i + 1}`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            
            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(img);
                }}
                className="p-1.5 rounded-md bg-aged-brass/20 hover:bg-aged-brass/30 text-aged-brass transition-colors"
                title="Save to Library"
              >
                <Save className="w-4 h-4" />
              </button>
              
              {onRefine && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefine(img);
                  }}
                  className="p-1.5 rounded-md bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 transition-colors"
                  title="Refine"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(img);
                }}
                className="p-1.5 rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Active indicator */}
            {i === activeIndex && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-aged-brass shadow-lg shadow-aged-brass/50" />
            )}
          </div>
        ))}

        {/* Save Session button */}
        {images.length > 0 && onSaveSession && (
          <button
            onClick={onSaveSession}
            className="flex items-center gap-2 px-4 py-2 h-[100px] rounded-xl border border-zinc-700 hover:border-aged-brass/50 bg-zinc-900/50 hover:bg-zinc-800/50 transition-all duration-200 text-sm text-zinc-300 hover:text-aged-brass whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Save Session</span>
          </button>
        )}
      </div>

      {/* Counter on the far right */}
      <div className="ml-auto text-xs text-zinc-400 font-medium whitespace-nowrap">
        {images.length} / 10
      </div>
    </div>
  );
}
