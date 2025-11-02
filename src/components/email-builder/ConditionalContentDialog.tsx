import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { toast } from "sonner";

interface ConditionalRule {
  field: 'segment' | 'location' | 'purchaseHistory' | 'custom';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: string;
}

interface ConditionalContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rules: ConditionalRule[]) => void;
}

export function ConditionalContentDialog({ open, onOpenChange, onSave }: ConditionalContentDialogProps) {
  const [rules, setRules] = useState<ConditionalRule[]>([
    { field: 'segment', operator: 'equals', value: '' }
  ]);

  const handleAddRule = () => {
    setRules([...rules, { field: 'segment', operator: 'equals', value: '' }]);
  };

  const handleUpdateRule = (index: number, updates: Partial<ConditionalRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const invalidRules = rules.filter(rule => !rule.value);
    if (invalidRules.length > 0) {
      toast.error("Please fill in all rule values");
      return;
    }

    onSave(rules);
    toast.success("Conditional rules saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Conditional Content Rules
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Show this content only when specific conditions are met. Perfect for personalization and segmentation.
          </p>

          {rules.map((rule, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Rule {index + 1}</Badge>
                {rules.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRule(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Field</Label>
                  <Select
                    value={rule.field}
                    onValueChange={(value: ConditionalRule['field']) =>
                      handleUpdateRule(index, { field: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="segment">Segment</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="purchaseHistory">Purchase History</SelectItem>
                      <SelectItem value="custom">Custom Field</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select
                    value={rule.operator}
                    onValueChange={(value: ConditionalRule['operator']) =>
                      handleUpdateRule(index, { operator: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greaterThan">Greater Than</SelectItem>
                      <SelectItem value="lessThan">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={rule.value}
                    onChange={(e) => handleUpdateRule(index, { value: e.target.value })}
                    placeholder="Enter value"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRule}
            className="w-full"
          >
            Add Another Rule
          </Button>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              ⚠️ <strong>Note:</strong> Conditional content requires ESP integration and proper field mapping. Test thoroughly before sending.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Rules
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
