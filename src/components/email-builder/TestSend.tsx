import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "sonner";

interface TestSendProps {
  html: string;
  subject: string;
}

export function TestSend({ html, subject }: TestSendProps) {
  const handleCopyHTML = () => {
    navigator.clipboard.writeText(html);
    toast.success("HTML copied", {
      description: "Paste into your email client to test"
    });
  };

  return (
    <Button variant="outline" onClick={handleCopyHTML} className="gap-2">
      <Mail className="w-4 h-4" />
      Copy HTML to Test
    </Button>
  );
}
