import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CampaignDetailsSectionProps {
  campaignName: string;
  setCampaignName: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
  previewText: string;
  setPreviewText: (value: string) => void;
  fromEmail: string;
  setFromEmail: (value: string) => void;
  fromName: string;
  setFromName: (value: string) => void;
  replyToEmail: string;
  setReplyToEmail: (value: string) => void;
}

export function CampaignDetailsSection({
  campaignName,
  setCampaignName,
  subject,
  setSubject,
  previewText,
  setPreviewText,
  fromEmail,
  setFromEmail,
  fromName,
  setFromName,
  replyToEmail,
  setReplyToEmail,
}: CampaignDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="campaignName">
          Campaign Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="campaignName"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="e.g., Summer Collection 2024"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">
          Email Subject <span className="text-destructive">*</span>
        </Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., New Collection Just Dropped"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="previewText">Preview Text</Label>
        <Input
          id="previewText"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="Preview text shown in inbox"
          maxLength={150}
        />
        <p className="text-xs text-muted-foreground">
          {previewText.length}/150 characters
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="fromEmail">
          From Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fromEmail"
          type="email"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fromName">
          From Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fromName"
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="replyToEmail">Reply-To Email</Label>
        <Input
          id="replyToEmail"
          type="email"
          value={replyToEmail}
          onChange={(e) => setReplyToEmail(e.target.value)}
          placeholder={fromEmail}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to use From Email
        </p>
      </div>
    </div>
  );
}
