import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, ClipboardPaste, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (prompts: any[]) => void;
}

export function ImportDialog({ open, onOpenChange, onImport }: ImportDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [pastedData, setPastedData] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [importing, setImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: Implement CSV/Excel parsing
    toast({
      title: "File uploaded",
      description: `Processing ${file.name}...`,
    });

    // Mock import for now
    setTimeout(() => {
      toast({
        title: "Import successful",
        description: "24 prompts imported successfully!",
      });
      onOpenChange(false);
    }, 1500);
  };

  const handlePasteImport = () => {
    if (!pastedData.trim()) {
      toast({
        title: "No data",
        description: "Please paste some data to import",
        variant: "destructive",
      });
      return;
    }

    // TODO: Parse pasted spreadsheet data
    toast({
      title: "Processing...",
      description: "Parsing pasted data...",
    });

    setTimeout(() => {
      toast({
        title: "Import successful",
        description: "Prompts imported successfully!",
      });
      onOpenChange(false);
    }, 1500);
  };

  const handleSheetImport = () => {
    if (!sheetUrl.trim()) {
      toast({
        title: "No URL",
        description: "Please enter a Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement Google Sheets import
    toast({
      title: "Connecting...",
      description: "Fetching data from Google Sheets...",
    });

    setTimeout(() => {
      toast({
        title: "Import successful",
        description: "Prompts imported from Google Sheets!",
      });
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Import Prompts</DialogTitle>
          <DialogDescription>
            Bring your existing prompts from spreadsheets into your library
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="paste" className="gap-2">
              <ClipboardPaste className="w-4 h-4" />
              Paste Data
            </TabsTrigger>
            <TabsTrigger value="sheets" className="gap-2">
              <LinkIcon className="w-4 h-4" />
              Google Sheets
            </TabsTrigger>
          </TabsList>

          {/* Upload File Tab */}
          <TabsContent value="upload" className="space-y-4 mt-6">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Drag & drop your file here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports .csv, .xlsx, and .xls files
              </p>
              <Label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>
                    <Download className="w-4 h-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="bg-[hsl(var(--stone-beige)/0.3)] rounded-lg p-4">
              <h4 className="font-medium mb-2">Expected Format:</h4>
              <p className="text-sm text-muted-foreground">
                Your spreadsheet should have columns for: Title, Prompt, Category, Tags (optional), Description (optional)
              </p>
            </div>
          </TabsContent>

          {/* Paste Data Tab */}
          <TabsContent value="paste" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Paste your spreadsheet data</Label>
              <Textarea
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                placeholder="Copy cells from Excel or Google Sheets and paste here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="bg-[hsl(var(--stone-beige)/0.3)] rounded-lg p-4">
              <h4 className="font-medium mb-2">How to paste data:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Select cells in your spreadsheet (including headers)</li>
                <li>Copy them (Ctrl/Cmd + C)</li>
                <li>Paste into the text area above</li>
                <li>Click "Import Data"</li>
              </ol>
            </div>

            <Button onClick={handlePasteImport} className="w-full">
              Import Data
            </Button>
          </TabsContent>

          {/* Google Sheets Tab */}
          <TabsContent value="sheets" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Google Sheets URL</Label>
              <Input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
              <p className="text-xs text-muted-foreground">
                Make sure the sheet is shared with "Anyone with the link can view"
              </p>
            </div>

            <div className="bg-[hsl(var(--stone-beige)/0.3)] rounded-lg p-4">
              <h4 className="font-medium mb-2">How to share your sheet:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open your Google Sheet</li>
                <li>Click "Share" in the top right</li>
                <li>Change access to "Anyone with the link"</li>
                <li>Copy the URL and paste it above</li>
              </ol>
            </div>

            <Button onClick={handleSheetImport} className="w-full">
              Connect & Import
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
