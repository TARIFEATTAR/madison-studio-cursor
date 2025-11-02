import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ESPExportProps {
  html: string;
  subject: string;
}

export function ESPExport({ html, subject }: ESPExportProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [esp, setEsp] = useState<"klaviyo" | "mailchimp" | "sendinblue">("klaviyo");
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleExport = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter your Make.com webhook URL");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          esp,
          subject,
          html,
          timestamp: new Date().toISOString(),
        }),
      });

      toast.success("Email sent to ESP", {
        description: "Check your Make.com scenario history to confirm"
      });
      setOpen(false);
    } catch (error) {
      console.error("Error pushing to ESP:", error);
      toast.error("Failed to push to ESP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Send className="w-4 h-4" />
        Push to ESP
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Push to Email Service Provider</DialogTitle>
            <DialogDescription>
              Send your email to your ESP via Make.com
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Service Provider</Label>
              <Select value={esp} onValueChange={(value: any) => setEsp(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="klaviyo">Klaviyo</SelectItem>
                  <SelectItem value="mailchimp">Mailchimp</SelectItem>
                  <SelectItem value="sendinblue">Sendinblue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Make.com Webhook URL</Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hook.us1.make.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Create a Make.com scenario with a Webhook trigger
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                disabled={loading || !webhookUrl}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Push to {esp}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
