import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Building2,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Package,
  FileText,
  CheckCircle,
  XCircle,
  Globe,
  Factory,
  Truck,
  FlaskConical,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useSuppliers,
  COMPANY_TYPES,
  type Supplier,
  type SupplierCompanyType,
  type CreateSupplierInput,
} from "@/hooks/useSuppliers";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getCompanyTypeIcon(type: SupplierCompanyType | null) {
  switch (type) {
    case "manufacturer":
      return Factory;
    case "contract_manufacturer":
      return Factory;
    case "distributor":
      return Truck;
    case "raw_material":
      return FlaskConical;
    case "packaging":
      return Box;
    default:
      return Building2;
  }
}

function getCompanyTypeLabel(type: SupplierCompanyType | null) {
  const found = COMPANY_TYPES.find((t) => t.value === type);
  return found?.label || "Supplier";
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPPLIER CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function SupplierCard({
  supplier,
  onEdit,
  onDelete,
  onToggleActive,
}: SupplierCardProps) {
  const Icon = getCompanyTypeIcon(supplier.company_type);

  const formatAddress = () => {
    const parts = [
      supplier.city,
      supplier.state,
      supplier.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card
        className={cn(
          "bg-card border-border hover:border-primary/30 hover:shadow-level-1 transition-all",
          !supplier.is_active && "opacity-60"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  {supplier.name}
                  {!supplier.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {getCompanyTypeLabel(supplier.company_type)}
                </CardDescription>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleActive}>
                  {supplier.is_active ? (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            {supplier.contact_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                <span>{supplier.contact_name}</span>
              </div>
            )}
            {supplier.contact_email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5" />
                <a
                  href={`mailto:${supplier.contact_email}`}
                  className="hover:text-primary transition-colors"
                >
                  {supplier.contact_email}
                </a>
              </div>
            )}
            {supplier.contact_phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <a
                  href={`tel:${supplier.contact_phone}`}
                  className="hover:text-primary transition-colors"
                >
                  {supplier.contact_phone}
                </a>
              </div>
            )}
            {formatAddress() && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{formatAddress()}</span>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-2 pt-2">
            {supplier.website && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => window.open(supplier.website!, "_blank")}
                    >
                      <Globe className="w-3.5 h-3.5 mr-1.5" />
                      Website
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{supplier.website}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {supplier.has_sds_portal && supplier.sds_portal_url && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        window.open(supplier.sds_portal_url!, "_blank")
                      }
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      SDS Portal
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Access supplier's SDS documents</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Notes preview */}
          {supplier.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t border-border">
              {supplier.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPPLIER FORM DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  onSave: (data: CreateSupplierInput) => void;
  isLoading?: boolean;
}

function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSave,
  isLoading,
}: SupplierFormDialogProps) {
  const [formData, setFormData] = useState<CreateSupplierInput>({
    name: supplier?.name || "",
    company_type: supplier?.company_type || undefined,
    contact_name: supplier?.contact_name || "",
    contact_email: supplier?.contact_email || "",
    contact_phone: supplier?.contact_phone || "",
    website: supplier?.website || "",
    address_line_1: supplier?.address_line_1 || "",
    address_line_2: supplier?.address_line_2 || "",
    city: supplier?.city || "",
    state: supplier?.state || "",
    country: supplier?.country || "",
    postal_code: supplier?.postal_code || "",
    has_sds_portal: supplier?.has_sds_portal || false,
    sds_portal_url: supplier?.sds_portal_url || "",
    account_number: supplier?.account_number || "",
    notes: supplier?.notes || "",
  });

  // Reset form when supplier changes
  useState(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        company_type: supplier.company_type || undefined,
        contact_name: supplier.contact_name || "",
        contact_email: supplier.contact_email || "",
        contact_phone: supplier.contact_phone || "",
        website: supplier.website || "",
        address_line_1: supplier.address_line_1 || "",
        address_line_2: supplier.address_line_2 || "",
        city: supplier.city || "",
        state: supplier.state || "",
        country: supplier.country || "",
        postal_code: supplier.postal_code || "",
        has_sds_portal: supplier.has_sds_portal || false,
        sds_portal_url: supplier.sds_portal_url || "",
        account_number: supplier.account_number || "",
        notes: supplier.notes || "",
      });
    } else {
      setFormData({
        name: "",
        company_type: undefined,
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        website: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        has_sds_portal: false,
        sds_portal_url: "",
        account_number: "",
        notes: "",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
          <DialogDescription>
            {supplier
              ? "Update supplier information"
              : "Add a new supplier or vendor to your organization"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="name">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., ABC Manufacturing Co."
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="company_type">Company Type</Label>
                <Select
                  value={formData.company_type || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      company_type: value as SupplierCompanyType,
                    })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Contact Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_name: e.target.value })
                  }
                  placeholder="e.g., John Smith"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  placeholder="e.g., contact@supplier.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_phone: e.target.value })
                  }
                  placeholder="e.g., +1 (555) 123-4567"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="e.g., https://supplier.com"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Address</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input
                  id="address_line_1"
                  value={formData.address_line_1}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line_1: e.target.value })
                  }
                  placeholder="Street address"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address_line_2">Address Line 2</Label>
                <Input
                  id="address_line_2"
                  value={formData.address_line_2}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line_2: e.target.value })
                  }
                  placeholder="Suite, unit, etc."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SDS Portal */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              SDS Documentation
            </h4>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div>
                <Label htmlFor="has_sds_portal" className="font-medium">
                  Supplier has an SDS Portal
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Enable if this supplier provides online access to their SDS
                  documents
                </p>
              </div>
              <Switch
                id="has_sds_portal"
                checked={formData.has_sds_portal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, has_sds_portal: checked })
                }
              />
            </div>
            {formData.has_sds_portal && (
              <div>
                <Label htmlFor="sds_portal_url">SDS Portal URL</Label>
                <Input
                  id="sds_portal_url"
                  type="url"
                  value={formData.sds_portal_url}
                  onChange={(e) =>
                    setFormData({ ...formData, sds_portal_url: e.target.value })
                  }
                  placeholder="e.g., https://supplier.com/sds"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Additional Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Additional Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_number">Your Account Number</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  placeholder="Your account # with this supplier"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes about this supplier..."
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || isLoading}>
              {isLoading ? "Saving..." : supplier ? "Save Changes" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SuppliersPage() {
  const {
    suppliers,
    activeSuppliers,
    isLoading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierActive,
  } = useSuppliers();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          supplier.name.toLowerCase().includes(searchLower) ||
          supplier.contact_name?.toLowerCase().includes(searchLower) ||
          supplier.contact_email?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== "all" && supplier.company_type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !supplier.is_active) return false;
      if (statusFilter === "inactive" && supplier.is_active) return false;

      return true;
    });
  }, [suppliers, search, typeFilter, statusFilter]);

  const handleSave = async (data: CreateSupplierInput) => {
    if (editingSupplier) {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, ...data });
    } else {
      await createSupplier.mutateAsync(data);
    }
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteSupplier.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-foreground">
              Suppliers
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your vendors, manufacturers, and suppliers
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingSupplier(null);
              setIsFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {COMPANY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold">{suppliers.length}</div>
              <div className="text-sm text-muted-foreground">
                Total Suppliers
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold">
                {activeSuppliers.length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold">
                {suppliers.filter((s) => s.company_type === "manufacturer" || s.company_type === "contract_manufacturer").length}
              </div>
              <div className="text-sm text-muted-foreground">Manufacturers</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold">
                {suppliers.filter((s) => s.has_sds_portal).length}
              </div>
              <div className="text-sm text-muted-foreground">
                With SDS Portal
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No suppliers found</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                {search || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add your first supplier to start managing your vendors and get their SDS documents"}
              </p>
              {!search && typeFilter === "all" && statusFilter === "all" && (
                <Button
                  onClick={() => {
                    setEditingSupplier(null);
                    setIsFormOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Supplier
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  onEdit={() => handleEdit(supplier)}
                  onDelete={() => setDeleteConfirmId(supplier.id)}
                  onToggleActive={() =>
                    toggleSupplierActive.mutate({
                      id: supplier.id,
                      is_active: !supplier.is_active,
                    })
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Form Dialog */}
        <SupplierFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingSupplier(null);
          }}
          supplier={editingSupplier}
          onSave={handleSave}
          isLoading={createSupplier.isPending || updateSupplier.isPending}
        />

        {/* Delete Confirmation */}
        <Dialog
          open={!!deleteConfirmId}
          onOpenChange={() => setDeleteConfirmId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Supplier</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this supplier? This action
                cannot be undone. Products linked to this supplier will no
                longer show a supplier association.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteSupplier.isPending}
              >
                {deleteSupplier.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
