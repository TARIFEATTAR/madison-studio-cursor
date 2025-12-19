import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { SafeHTML } from '@/components/ui/SafeHTML';

interface MobilePreviewFrameProps {
  html: string;
  device?: 'iphone' | 'android';
}

export function MobilePreviewFrame({ html, device = 'iphone' }: MobilePreviewFrameProps) {
  const frameStyles = device === 'iphone' 
    ? 'rounded-[3rem] border-[14px] border-gray-800'
    : 'rounded-[2rem] border-[12px] border-gray-700';

  return (
    <div className="flex justify-center items-center py-4 sm:py-8">
      <div className={`${frameStyles} bg-white shadow-2xl relative`} style={{ width: '100%', maxWidth: '375px', height: '667px' }}>
        {/* Device Notch (iPhone) */}
        {device === 'iphone' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-800 rounded-b-3xl z-10" />
        )}
        
        {/* Screen */}
        <ScrollArea className="h-full w-full">
          <SafeHTML className="p-4" html={html} />
        </ScrollArea>

        {/* Home Indicator (iPhone) */}
        {device === 'iphone' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full" />
        )}
      </div>
    </div>
  );
}
