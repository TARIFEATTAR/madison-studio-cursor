import { Camera, Sun, MapPin, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getCameraOptions, getLightingOptions, getEnvironmentOptions } from "@/utils/promptFormula";

export interface ProModeControls {
  camera?: string;
  lighting?: string;
  environment?: string;
}

interface ProModePanelProps {
  onControlsChange: (controls: ProModeControls) => void;
  initialValues?: ProModeControls;
}

export function ProModePanel({ onControlsChange, initialValues = {} }: ProModePanelProps) {
  const cameraOptions = getCameraOptions();
  const lightingOptions = getLightingOptions();
  const environmentOptions = getEnvironmentOptions();

  const handleCameraChange = (value: string) => {
    const newControls = { ...initialValues, camera: value === "none" ? undefined : value };
    onControlsChange(newControls);
  };

  const handleLightingChange = (value: string) => {
    const newControls = { ...initialValues, lighting: value === "none" ? undefined : value };
    onControlsChange(newControls);
  };

  const handleEnvironmentChange = (value: string) => {
    const newControls = { ...initialValues, environment: value === "none" ? undefined : value };
    onControlsChange(newControls);
  };

  const handleClearAll = () => {
    onControlsChange({});
  };

  const hasSelections = !!(initialValues.camera || initialValues.lighting || initialValues.environment);

  return (
    <div className="space-y-4 p-4 bg-[#252220]/50 rounded-lg border border-[#3D3935]">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#D4CFC8]">Professional Presets</span>
                <span className="text-xs text-[#A8A39E]">(Optional)</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">Access professional photography presets for precise control over camera, lighting, and environment.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {hasSelections && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-7 px-2 text-xs text-[#A8A39E] hover:text-[#D4CFC8] hover:bg-[#3D3935]"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Camera/Lens */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[#A8A39E] flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" />
            Camera & Lens
          </Label>
          <Select value={initialValues.camera || "none"} onValueChange={handleCameraChange}>
            <SelectTrigger className="h-9 bg-[#252220] border-[#3D3935] text-[#FFFCF5] text-sm">
              <SelectValue placeholder="Select camera setup..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {cameraOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lighting */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[#A8A39E] flex items-center gap-1.5">
            <Sun className="h-3.5 w-3.5" />
            Lighting Setup
          </Label>
          <Select value={initialValues.lighting || "none"} onValueChange={handleLightingChange}>
            <SelectTrigger className="h-9 bg-[#252220] border-[#3D3935] text-[#FFFCF5] text-sm">
              <SelectValue placeholder="Select lighting..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {lightingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Environment */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[#A8A39E] flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Environment & Surface
          </Label>
          <Select value={initialValues.environment || "none"} onValueChange={handleEnvironmentChange}>
            <SelectTrigger className="h-9 bg-[#252220] border-[#3D3935] text-[#FFFCF5] text-sm">
              <SelectValue placeholder="Select environment..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {environmentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasSelections && (
        <div className="pt-2 border-t border-[#3D3935]">
          <p className="text-xs text-[#A8A39E] leading-relaxed">
            Your prompt will be enhanced with professional photography specifications.
          </p>
        </div>
      )}
    </div>
  );
}
