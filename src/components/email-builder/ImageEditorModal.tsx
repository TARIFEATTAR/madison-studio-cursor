import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Crop, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

interface ImageEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

export function ImageEditorModal({ open, onOpenChange, imageUrl, onSave }: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any | null>(null);
  const [fabricImage, setFabricImage] = useState<any | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<any | null>(null);
  const fabricRef = useRef<any>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;

    let isCancelled = false;
    let canvas: any;

    (async () => {
      try {
        const mod: any = await import('fabric');
        const fabricLib: any = mod.fabric || mod.default || mod;
        if (!fabricLib || isCancelled) return;
        fabricRef.current = fabricLib;

        canvas = new fabricLib.Canvas(canvasRef.current as HTMLCanvasElement, {
          width: 800,
          height: 600,
          backgroundColor: '#f0f0f0',
        });

        fabricLib.Image.fromURL(
          imageUrl,
          (img: any) => {
            if (!img || isCancelled) return;
            const maxWidth = 700;
            const maxHeight = 500;
            const imgScale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1));
            img.scale(imgScale);
            img.set({
              left: ((canvas.width || 800) - (img.getScaledWidth() || 0)) / 2,
              top: ((canvas.height || 600) - (img.getScaledHeight() || 0)) / 2,
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            setFabricImage(img);
            canvas.renderAll();
          },
          { crossOrigin: 'anonymous' }
        );

        setFabricCanvas(canvas);
      } catch (e) {
        console.error("Failed to load fabric:", e);
        if (!isCancelled) {
          toast.error("Failed to load image editor. Please try again.");
        }
      }
    })();

    return () => {
      isCancelled = true;
      if (canvas) canvas.dispose();
    };
  }, [open, imageUrl]);

  const handleZoom = (newScale: number) => {
    if (!fabricImage) return;
    const scaleFactor = newScale / scale;
    fabricImage.scale((fabricImage.scaleX || 1) * scaleFactor);
    setScale(newScale);
    fabricCanvas?.renderAll();
  };

  const handleRotate = () => {
    if (!fabricImage) return;
    const newRotation = (rotation + 90) % 360;
    fabricImage.rotate(newRotation);
    setRotation(newRotation);
    fabricCanvas?.renderAll();
  };

  const handleCrop = () => {
    if (!fabricCanvas || !fabricImage) return;

    if (!cropMode) {
      // Enable crop mode
      const rect = new (fabricRef.current as any).Rect({
        left: fabricImage.left,
        top: fabricImage.top,
        width: (fabricImage.getScaledWidth() || 200) * 0.8,
        height: (fabricImage.getScaledHeight() || 200) * 0.8,
        fill: 'rgba(0,0,0,0.3)',
        stroke: '#fff',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: true,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
      setCropRect(rect);
      setCropMode(true);
      fabricCanvas.renderAll();
      toast.info("Adjust the crop area and click Crop again");
    } else {
      // Apply crop
      if (cropRect) {
        const cropped = fabricCanvas.toDataURL({
          left: cropRect.left,
          top: cropRect.top,
          width: (cropRect.width || 100) * (cropRect.scaleX || 1),
          height: (cropRect.height || 100) * (cropRect.scaleY || 1),
          format: 'png',
          multiplier: 1,
        });
        
        fabricCanvas.remove(cropRect);
        setCropRect(null);
        setCropMode(false);

        // Load cropped image
        (fabricRef.current as any).Image.fromURL(cropped, (img: any) => {
          fabricCanvas.clear();
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          setFabricImage(img);
          fabricCanvas.renderAll();
          toast.success("Image cropped");
        }, { crossOrigin: 'anonymous' });
      }
    }
  };

  const handleSave = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 0.9,
      multiplier: 1,
    });

    onSave(dataURL);
    toast.success("Image edited successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={cropMode ? "default" : "outline"}
              size="sm"
              onClick={handleCrop}
              className="gap-2"
            >
              <Crop className="w-4 h-4" />
              {cropMode ? "Apply Crop" : "Crop"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Rotate
            </Button>
          </div>

          {/* Canvas */}
          <div className="border border-border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>

          {/* Zoom Control */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ZoomOut className="w-4 h-4" />
              Zoom
              <ZoomIn className="w-4 h-4" />
            </Label>
            <Slider
              value={[scale]}
              onValueChange={([value]) => handleZoom(value)}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-center">
              {Math.round(scale * 100)}%
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
