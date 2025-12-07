import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadZone } from "./UploadZone";
import { ProSettings } from "./ProSettings";
import type { ProModeSettings } from "./ProSettings";
import { ProductSelector } from "@/components/forge/ProductSelector";
import { Product } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

interface UploadedImage {
  url: string;
  file?: File;
  name?: string;
}

interface LeftRailProps {
  // Product
  selectedProduct: Product | null;
  onProductSelect: (product: Product | null) => void;
  
  // Images
  productImage: UploadedImage | null;
  onProductImageUpload: (image: UploadedImage | null) => void;
  backgroundImage: UploadedImage | null;
  onBackgroundImageUpload: (image: UploadedImage | null) => void;
  styleReference: UploadedImage | null;
  onStyleReferenceUpload: (image: UploadedImage | null) => void;
  
  // Pro Settings
  proSettings: ProModeSettings;
  onProSettingsChange: (settings: ProModeSettings) => void;
  
  // Generate
  isGenerating: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
  
  // Session info
  sessionCount: number;
  maxImages: number;
}

export function LeftRail({
  selectedProduct,
  onProductSelect,
  productImage,
  onProductImageUpload,
  backgroundImage,
  onBackgroundImageUpload,
  styleReference,
  onStyleReferenceUpload,
  proSettings,
  onProSettingsChange,
  isGenerating,
  canGenerate,
  onGenerate,
  sessionCount,
  maxImages,
}: LeftRailProps) {
  const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);
  const [showStyleUpload, setShowStyleUpload] = useState(false);

  const proSettingsCount = Object.values(proSettings).filter(Boolean).length;
  const hasAnyImage = !!productImage || !!backgroundImage || !!styleReference;
  
  // Generate dynamic tip
  const getTip = () => {
    if (!hasAnyImage && !selectedProduct) {
      return "💡 Start by uploading a product image or selecting a product";
    }
    if (productImage && !backgroundImage) {
      return "💡 Try adding a background scene for composition";
    }
    if (backgroundImage && !styleReference) {
      return "💡 Add a style reference for lighting & mood";
    }
    if (proSettingsCount === 0 && hasAnyImage) {
      return "💡 Expand Pro Settings for camera & lighting control";
    }
    return null;
  };

  const tip = getTip();

  return (
    <aside className="left-rail">
      {/* Section: Product Selection */}
      <div className="left-rail__section">
        <h3 className="left-rail__section-title">Product Context</h3>
        
        {selectedProduct ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--darkroom-bg)] border border-[var(--darkroom-border)]"
          >
            <div className="w-10 h-10 rounded-md bg-[var(--darkroom-surface-elevated)] flex items-center justify-center">
              <Package className="w-5 h-5 text-[var(--darkroom-accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--darkroom-text)] truncate">
                {selectedProduct.name}
              </p>
              {selectedProduct.bottle_type && selectedProduct.bottle_type !== 'auto' && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] mt-1",
                    selectedProduct.bottle_type === 'oil' 
                      ? "bg-green-500/20 border-green-500/50 text-green-400" 
                      : "bg-blue-500/20 border-blue-500/50 text-blue-400"
                  )}
                >
                  {selectedProduct.bottle_type === 'oil' ? 'Oil Bottle' : 'Spray Bottle'}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onProductSelect(null)}
              className="h-8 px-2 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)]"
            >
              Change
            </Button>
          </motion.div>
        ) : (
          <div className="product-selector-wrapper">
            <ProductSelector
              value={selectedProduct?.name || ""}
              onSelect={(product) => onProductSelect(product)}
              onProductDataChange={(product) => onProductSelect(product)}
              showLabel={false}
              buttonClassName="w-full justify-between h-12 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:border-[var(--darkroom-accent)]"
            />
          </div>
        )}
      </div>

      {/* Section: Image Inputs */}
      <div className="left-rail__section">
        <h3 className="left-rail__section-title">Reference Images</h3>
        
        {/* Primary: Product Image */}
        <UploadZone
          type="product"
          label="📦 Product Image"
          description="For enhancement & placement"
          image={productImage}
          onUpload={onProductImageUpload}
          onRemove={() => onProductImageUpload(null)}
          disabled={isGenerating}
        />

        {/* Secondary: Background Scene */}
        <AnimatePresence>
          {!showBackgroundUpload && !backgroundImage ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBackgroundUpload(true)}
              className="add-upload-button"
              disabled={isGenerating}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Background Scene
            </motion.button>
          ) : (
            <UploadZone
              type="background"
              label="🌄 Background Scene"
              description="Composites product into scene"
              image={backgroundImage}
              onUpload={onBackgroundImageUpload}
              onRemove={() => {
                onBackgroundImageUpload(null);
                setShowBackgroundUpload(false);
              }}
              disabled={isGenerating}
            />
          )}
        </AnimatePresence>

        {/* Tertiary: Style Reference */}
        <AnimatePresence>
          {!showStyleUpload && !styleReference ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStyleUpload(true)}
              className="add-upload-button"
              disabled={isGenerating}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Style Reference
            </motion.button>
          ) : (
            <UploadZone
              type="style"
              label="🎨 Style Reference"
              description="Matches lighting & mood"
              image={styleReference}
              onUpload={onStyleReferenceUpload}
              onRemove={() => {
                onStyleReferenceUpload(null);
                setShowStyleUpload(false);
              }}
              disabled={isGenerating}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Section: Pro Settings */}
      <div className="left-rail__section">
        <ProSettings
          settings={proSettings}
          onChange={onProSettingsChange}
          disabled={isGenerating}
        />
      </div>

      {/* Generate Button - Sticky Bottom */}
      <div className="generate-button-container">
        <motion.button
          className={cn(
            "generate-button",
            isGenerating && "generate-button--generating"
          )}
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating || sessionCount >= maxImages}
          whileHover={!isGenerating ? { scale: 1.02 } : {}}
          whileTap={!isGenerating ? { scale: 0.98 } : {}}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>
                {productImage ? "Enhance Image" : "Generate"}
                {proSettingsCount > 0 && (
                  <span className="ml-1 text-xs opacity-70">Pro</span>
                )}
              </span>
            </>
          )}
        </motion.button>

        {/* Dynamic Tip */}
        <AnimatePresence>
          {tip && !isGenerating && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="generate-button__tip"
            >
              {tip}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Session Limit Warning */}
        {sessionCount >= maxImages && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-[var(--darkroom-error)] text-center mt-2"
          >
            Session limit reached ({maxImages} images). Save to continue.
          </motion.p>
        )}
      </div>

          </aside>
  );
}
