/**
 * VariantsSection - Display and manage product variants
 * Shows SKU, pricing, inventory, and variant options synced from Shopify/Etsy
 */

import { useState } from "react";
import {
  Package,
  DollarSign,
  Layers,
  ShoppingCart,
  BarChart3,
  ImageIcon,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  parseVariants,
  parseOptions,
  parseImages,
  formatPrice,
  getTotalInventory,
  getPriceRange,
  type ProductVariant,
  type ProductOption,
  type ProductImage,
} from "@/types/ecommerce";

interface VariantsSectionProps {
  product: any;
  isEditing?: boolean;
  onChange?: (field: string, value: any) => void;
}

export function VariantsSection({ product, isEditing = false, onChange }: VariantsSectionProps) {
  const variants = parseVariants(product?.variants);
  const options = parseOptions(product?.options);
  const images = parseImages(product?.images);
  
  const totalInventory = getTotalInventory(variants);
  const priceRange = getPriceRange(variants);
  
  // Sync status indicators
  const hasShopifySync = !!product?.shopify_product_id;
  const hasEtsySync = !!product?.etsy_listing_id;
  const lastShopifySync = product?.last_shopify_sync;
  const lastEtsySync = product?.last_etsy_sync;

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="w-5 h-5" />
            Marketplace Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {hasShopifySync && (
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-emerald-50 border-emerald-200">
                <div className="w-8 h-8 rounded bg-[#96BF48] flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Shopify</p>
                  <p className="text-xs text-muted-foreground">
                    {lastShopifySync 
                      ? `Synced ${new Date(lastShopifySync).toLocaleDateString()}`
                      : "Connected"}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-600">
                  {product.shopify_sync_status || "synced"}
                </Badge>
              </div>
            )}
            
            {hasEtsySync && (
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-orange-50 border-orange-200">
                <div className="w-8 h-8 rounded bg-[#F56400] flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Etsy</p>
                  <p className="text-xs text-muted-foreground">
                    {lastEtsySync 
                      ? `Synced ${new Date(lastEtsySync).toLocaleDateString()}`
                      : "Connected"}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                  {product.etsy_sync_status || product.etsy_state || "synced"}
                </Badge>
              </div>
            )}
            
            {!hasShopifySync && !hasEtsySync && (
              <p className="text-muted-foreground text-sm">
                Not synced with any marketplace. Connect Shopify or Etsy in Settings to sync product data.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {formatPrice(product?.price)}
                </p>
                <p className="text-sm text-muted-foreground">Price</p>
              </div>
            </div>
            {product?.compare_at_price && (
              <p className="text-sm text-muted-foreground mt-2 line-through">
                {formatPrice(product.compare_at_price)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalInventory}</p>
                <p className="text-sm text-muted-foreground">In Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{variants.length}</p>
                <p className="text-sm text-muted-foreground">Variants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{images.length}</p>
                <p className="text-sm text-muted-foreground">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Options */}
      {options.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Options</CardTitle>
            <CardDescription>Available variations for this product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <Label className="font-medium">{option.name}</Label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value, vIndex) => (
                      <Badge key={vIndex} variant="secondary">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variants Table */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variants</CardTitle>
            <CardDescription>
              Individual SKUs with pricing and inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Compare At</TableHead>
                    <TableHead className="text-right">Inventory</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant, index) => (
                    <TableRow key={variant.id || index}>
                      <TableCell className="font-medium">
                        {variant.title || `Variant ${index + 1}`}
                        {variant.option1 && (
                          <span className="text-muted-foreground ml-2">
                            ({[variant.option1, variant.option2, variant.option3]
                              .filter(Boolean)
                              .join(" / ")})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-0.5 rounded">
                          {variant.sku || "—"}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(variant.price)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {variant.compare_at_price 
                          ? formatPrice(variant.compare_at_price) 
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-medium",
                          variant.inventory_quantity <= 0 && "text-red-600",
                          variant.inventory_quantity > 0 && variant.inventory_quantity <= 10 && "text-amber-600",
                          variant.inventory_quantity > 10 && "text-emerald-600"
                        )}>
                          {variant.inventory_quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {variant.inventory_quantity > 0 ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Out of Stock
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images Gallery */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Images</CardTitle>
            <CardDescription>
              {images.length} images synced from marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id || index}
                  className="aspect-square rounded-lg overflow-hidden border bg-muted"
                >
                  <img
                    src={image.src}
                    alt={image.alt || `Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {variants.length === 0 && images.length === 0 && options.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Variant Data</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sync this product from Shopify or Etsy to import variants, pricing, inventory, and images.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
