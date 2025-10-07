-- Remove products with "Warm / Fresh / Floral / Woody" scent family from Cadence collection
DELETE FROM brand_products 
WHERE collection = 'Cadence' 
  AND scent_family = 'Warm / Fresh / Floral / Woody';