-- ============================================
-- INGREDIENT LIBRARY SEED DATA (FIXED)
-- Common INCI ingredients for Fragrance & Skincare
-- ============================================
-- This script seeds global ingredients accessible to all organizations
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Allow NULL organization_id for global ingredients
ALTER TABLE public.ingredient_library 
ALTER COLUMN organization_id DROP NOT NULL;

-- Step 2: Create unique constraint on inci_name for global ingredients
-- This allows ON CONFLICT to work properly
CREATE UNIQUE INDEX IF NOT EXISTS idx_ingredient_library_global_inci 
ON public.ingredient_library(inci_name) 
WHERE organization_id IS NULL;

-- Step 3: Drop the existing constraint if it doesn't allow NULL org_id
-- (The constraint is only for org-specific ingredients anyway)

-- ============================================
-- SEED DATA: Using correct column structure
-- Columns: name, inci_name, category, cosmetic_function, origin, is_vegan, is_allergen
-- Origin values: 'natural', 'natural_derived', 'synthetic', 'biotechnology', 'mineral', 'unknown'
-- ============================================

-- ============================================
-- CATEGORY: BASES & SOLVENTS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Water', 'AQUA', 'Base', ARRAY['solvent'], 'mineral', true),
  (NULL, 'Denatured Alcohol', 'ALCOHOL DENAT.', 'Base', ARRAY['solvent', 'antimicrobial'], 'natural_derived', true),
  (NULL, 'Ethyl Alcohol', 'ETHANOL', 'Base', ARRAY['solvent'], 'natural_derived', true),
  (NULL, 'Rubbing Alcohol', 'ISOPROPYL ALCOHOL', 'Base', ARRAY['solvent'], 'synthetic', true),
  (NULL, 'DPG', 'DIPROPYLENE GLYCOL', 'Base', ARRAY['solvent', 'fixative'], 'synthetic', true),
  (NULL, 'Propylene Glycol', 'PROPYLENE GLYCOL', 'Base', ARRAY['humectant', 'solvent'], 'synthetic', true),
  (NULL, 'Glycerine', 'GLYCERIN', 'Base', ARRAY['humectant'], 'natural_derived', true),
  (NULL, 'Butylene Glycol', 'BUTYLENE GLYCOL', 'Base', ARRAY['humectant', 'solvent'], 'synthetic', true),
  (NULL, 'Pentanediol', 'PENTYLENE GLYCOL', 'Base', ARRAY['humectant', 'preservative booster'], 'synthetic', true),
  (NULL, 'Hexanediol', 'HEXYLENE GLYCOL', 'Base', ARRAY['solvent', 'emulsifier'], 'synthetic', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: CARRIER OILS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Sweet Almond Oil', 'PRUNUS AMYGDALUS DULCIS OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Jojoba Oil', 'SIMMONDSIA CHINENSIS SEED OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Coconut Oil', 'COCOS NUCIFERA OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Argan Oil', 'ARGANIA SPINOSA KERNEL OIL', 'Carrier Oil', ARRAY['emollient', 'conditioning'], 'natural', true),
  (NULL, 'Rosehip Oil', 'ROSA CANINA SEED OIL', 'Carrier Oil', ARRAY['emollient', 'antioxidant'], 'natural', true),
  (NULL, 'Sunflower Seed Oil', 'HELIANTHUS ANNUUS SEED OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Olive Oil', 'OLEA EUROPAEA FRUIT OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Avocado Oil', 'PERSEA GRATISSIMA OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Grape Seed Oil', 'VITIS VINIFERA SEED OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Evening Primrose Oil', 'OENOTHERA BIENNIS OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Castor Oil', 'RICINUS COMMUNIS SEED OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Sesame Oil', 'SESAMUM INDICUM SEED OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Abyssinian Oil', 'CRAMBE ABYSSINICA SEED OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Camellia Oil', 'CAMELLIA OLEIFERA SEED OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Marula Oil', 'SCLEROCARYA BIRREA SEED OIL', 'Carrier Oil', ARRAY['emollient'], 'natural', true),
  (NULL, 'Squalane', 'SQUALANE', 'Carrier Oil', ARRAY['emollient'], 'natural_derived', true),
  (NULL, 'MCT Oil', 'CAPRYLIC/CAPRIC TRIGLYCERIDE', 'Carrier Oil', ARRAY['emollient'], 'natural_derived', true),
  (NULL, 'IPM', 'ISOPROPYL MYRISTATE', 'Carrier Oil', ARRAY['emollient', 'solvent'], 'synthetic', true),
  (NULL, 'IPP', 'ISOPROPYL PALMITATE', 'Carrier Oil', ARRAY['emollient'], 'synthetic', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: EU 26 ALLERGENS (FRAGRANCE)
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan, is_allergen, contains_allergens)
VALUES
  (NULL, 'Limonene', 'LIMONENE', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Linalool', 'LINALOOL', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Citronellol', 'CITRONELLOL', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Geraniol', 'GERANIOL', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Citral', 'CITRAL', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Eugenol', 'EUGENOL', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Coumarin', 'COUMARIN', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Cinnamaldehyde', 'CINNAMAL', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Hydroxycitronellal', 'HYDROXYCITRONELLAL', 'Fragrance', ARRAY['fragrance'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Isoeugenol', 'ISOEUGENOL', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Amyl Cinnamal', 'AMYL CINNAMAL', 'Fragrance', ARRAY['fragrance'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Benzyl Alcohol', 'BENZYL ALCOHOL', 'Fragrance', ARRAY['fragrance', 'preservative'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Benzyl Benzoate', 'BENZYL BENZOATE', 'Fragrance', ARRAY['fragrance', 'solvent'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Benzyl Cinnamate', 'BENZYL CINNAMATE', 'Fragrance', ARRAY['fragrance'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Benzyl Salicylate', 'BENZYL SALICYLATE', 'Fragrance', ARRAY['fragrance'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Cinnamyl Alcohol', 'CINNAMYL ALCOHOL', 'Fragrance', ARRAY['fragrance'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Farnesol', 'FARNESOL', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26']),
  (NULL, 'Hexyl Cinnamal', 'HEXYL CINNAMAL', 'Fragrance', ARRAY['fragrance'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Lilial', 'BUTYLPHENYL METHYLPROPIONAL', 'Fragrance', ARRAY['fragrance'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Alpha-Isomethyl Ionone', 'ALPHA-ISOMETHYL IONONE', 'Fragrance', ARRAY['fragrance'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Oakmoss Extract', 'EVERNIA PRUNASTRI EXTRACT', 'Fragrance', ARRAY['fragrance'], 'natural', true, true, ARRAY['EU26']),
  (NULL, 'Treemoss Extract', 'EVERNIA FURFURACEA EXTRACT', 'Fragrance', ARRAY['fragrance'], 'natural', true, true, ARRAY['EU26']),
  (NULL, 'Methyl Heptine Carbonate', 'METHYL 2-OCTYNOATE', 'Fragrance', ARRAY['fragrance'], 'synthetic', true, true, ARRAY['EU26']),
  (NULL, 'Anise Alcohol', 'ANISE ALCOHOL', 'Fragrance', ARRAY['fragrance'], 'natural_derived', true, true, ARRAY['EU26'])
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan,
  is_allergen = EXCLUDED.is_allergen,
  contains_allergens = EXCLUDED.contains_allergens;

-- ============================================
-- CATEGORY: ESSENTIAL OILS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Lavender Essential Oil', 'LAVANDULA ANGUSTIFOLIA OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Sweet Orange Oil', 'CITRUS AURANTIUM DULCIS PEEL OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Lemon Essential Oil', 'CITRUS LIMON PEEL OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Peppermint Oil', 'MENTHA PIPERITA OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Eucalyptus Oil', 'EUCALYPTUS GLOBULUS LEAF OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Tea Tree Oil', 'MELALEUCA ALTERNIFOLIA LEAF OIL', 'Essential Oil', ARRAY['fragrance', 'antimicrobial'], 'natural', true),
  (NULL, 'Rosemary Oil', 'ROSMARINUS OFFICINALIS LEAF OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Thyme Oil', 'THYMUS VULGARIS OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Cedarwood Oil', 'CEDRUS ATLANTICA BARK OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Sandalwood Oil', 'SANTALUM ALBUM OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Vetiver Oil', 'VETIVERIA ZIZANOIDES ROOT OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Geranium Oil', 'PELARGONIUM GRAVEOLENS OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Bergamot Oil', 'CITRUS BERGAMIA PEEL OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Ylang Ylang Oil', 'CANANGA ODORATA FLOWER OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Jasmine Oil', 'JASMINUM OFFICINALE OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Rose Otto', 'ROSA DAMASCENA FLOWER OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Frankincense Oil', 'BOSWELLIA CARTERII OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Myrrh Oil', 'COMMIPHORA MYRRHA OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Patchouli Oil', 'POGOSTEMON CABLIN OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Neroli Oil', 'CITRUS AURANTIUM AMARA FLOWER OIL', 'Essential Oil', ARRAY['fragrance'], 'natural', true),
  (NULL, 'Fragrance', 'PARFUM', 'Fragrance', ARRAY['fragrance'], 'unknown', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: PRESERVATIVES
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Phenoxyethanol', 'PHENOXYETHANOL', 'Preservative', ARRAY['preservative'], 'synthetic', true),
  (NULL, 'Ethylhexylglycerin', 'ETHYLHEXYLGLYCERIN', 'Preservative', ARRAY['preservative booster'], 'synthetic', true),
  (NULL, 'Sodium Benzoate', 'SODIUM BENZOATE', 'Preservative', ARRAY['preservative'], 'synthetic', true),
  (NULL, 'Potassium Sorbate', 'POTASSIUM SORBATE', 'Preservative', ARRAY['preservative'], 'synthetic', true),
  (NULL, 'Sorbic Acid', 'SORBIC ACID', 'Preservative', ARRAY['preservative'], 'synthetic', true),
  (NULL, 'Benzoic Acid', 'BENZOIC ACID', 'Preservative', ARRAY['preservative'], 'synthetic', true),
  (NULL, 'Dehydroacetic Acid', 'DEHYDROACETIC ACID', 'Preservative', ARRAY['preservative'], 'synthetic', true),
  (NULL, 'Caprylyl Glycol', 'CAPRYLYL GLYCOL', 'Preservative', ARRAY['preservative booster'], 'synthetic', true),
  (NULL, 'Vitamin E', 'TOCOPHEROL', 'Preservative', ARRAY['antioxidant'], 'natural_derived', true),
  (NULL, 'Vitamin C', 'ASCORBIC ACID', 'Preservative', ARRAY['antioxidant'], 'synthetic', true),
  (NULL, 'Citric Acid', 'CITRIC ACID', 'Preservative', ARRAY['ph adjuster', 'chelating'], 'natural_derived', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: EMULSIFIERS & THICKENERS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Cetearyl Alcohol', 'CETEARYL ALCOHOL', 'Emulsifier', ARRAY['emulsifier', 'thickener'], 'natural_derived', true),
  (NULL, 'Cetyl Alcohol', 'CETYL ALCOHOL', 'Emulsifier', ARRAY['emulsifier', 'thickener'], 'natural_derived', true),
  (NULL, 'Stearyl Alcohol', 'STEARYL ALCOHOL', 'Emulsifier', ARRAY['emulsifier', 'thickener'], 'natural_derived', true),
  (NULL, 'Glyceryl Stearate', 'GLYCERYL STEARATE', 'Emulsifier', ARRAY['emulsifier'], 'natural_derived', true),
  (NULL, 'Glyceryl Stearate SE', 'GLYCERYL STEARATE SE', 'Emulsifier', ARRAY['emulsifier'], 'natural_derived', true),
  (NULL, 'Tween 20', 'POLYSORBATE 20', 'Emulsifier', ARRAY['solubilizer'], 'synthetic', true),
  (NULL, 'Tween 80', 'POLYSORBATE 80', 'Emulsifier', ARRAY['solubilizer'], 'synthetic', true),
  (NULL, 'Span 80', 'SORBITAN OLEATE', 'Emulsifier', ARRAY['emulsifier'], 'synthetic', true),
  (NULL, 'Lecithin', 'LECITHIN', 'Emulsifier', ARRAY['emulsifier'], 'natural', true),
  (NULL, 'Xanthan Gum', 'XANTHAN GUM', 'Thickener', ARRAY['thickener', 'stabilizer'], 'biotechnology', true),
  (NULL, 'Carbomer', 'CARBOMER', 'Thickener', ARRAY['thickener'], 'synthetic', true),
  (NULL, 'HEC', 'HYDROXYETHYLCELLULOSE', 'Thickener', ARRAY['thickener'], 'natural_derived', true),
  (NULL, 'Sodium Polyacrylate', 'SODIUM POLYACRYLATE', 'Thickener', ARRAY['thickener'], 'synthetic', true),
  (NULL, 'Sclerotium Gum', 'SCLEROTIUM GUM', 'Thickener', ARRAY['thickener'], 'biotechnology', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: ACTIVE INGREDIENTS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Retinol', 'RETINOL', 'Active', ARRAY['anti-aging'], 'synthetic', true),
  (NULL, 'Vitamin A Palmitate', 'RETINYL PALMITATE', 'Active', ARRAY['anti-aging'], 'synthetic', true),
  (NULL, 'Vitamin C Derivative', 'ASCORBYL GLUCOSIDE', 'Active', ARRAY['brightening', 'antioxidant'], 'synthetic', true),
  (NULL, 'SAP', 'SODIUM ASCORBYL PHOSPHATE', 'Active', ARRAY['brightening', 'antioxidant'], 'synthetic', true),
  (NULL, 'Vitamin B3', 'NIACINAMIDE', 'Active', ARRAY['brightening', 'barrier repair'], 'synthetic', true),
  (NULL, 'Pro-Vitamin B5', 'PANTHENOL', 'Active', ARRAY['moisturizing', 'healing'], 'synthetic', true),
  (NULL, 'Vitamin E Acetate', 'TOCOPHERYL ACETATE', 'Active', ARRAY['antioxidant'], 'synthetic', true),
  (NULL, 'Hyaluronic Acid', 'HYALURONIC ACID', 'Active', ARRAY['hydrating'], 'biotechnology', true),
  (NULL, 'Sodium Hyaluronate', 'SODIUM HYALURONATE', 'Active', ARRAY['hydrating'], 'biotechnology', true),
  (NULL, 'Glycolic Acid', 'GLYCOLIC ACID', 'Active', ARRAY['exfoliant'], 'synthetic', true),
  (NULL, 'Lactic Acid', 'LACTIC ACID', 'Active', ARRAY['exfoliant'], 'biotechnology', true),
  (NULL, 'Salicylic Acid', 'SALICYLIC ACID', 'Active', ARRAY['exfoliant'], 'natural_derived', true),
  (NULL, 'Mandelic Acid', 'MANDELIC ACID', 'Active', ARRAY['exfoliant'], 'natural_derived', true),
  (NULL, 'Azelaic Acid', 'AZELAIC ACID', 'Active', ARRAY['brightening', 'anti-acne'], 'synthetic', true),
  (NULL, 'Kojic Acid', 'KOJIC ACID', 'Active', ARRAY['brightening'], 'biotechnology', true),
  (NULL, 'Tranexamic Acid', 'TRANEXAMIC ACID', 'Active', ARRAY['brightening'], 'synthetic', true),
  (NULL, 'Ferulic Acid', 'FERULIC ACID', 'Active', ARRAY['antioxidant'], 'natural_derived', true),
  (NULL, 'Matrixyl 3000 (Part 1)', 'PALMITOYL TRIPEPTIDE-1', 'Active', ARRAY['anti-aging'], 'synthetic', true),
  (NULL, 'Matrixyl 3000 (Part 2)', 'PALMITOYL TETRAPEPTIDE-7', 'Active', ARRAY['anti-aging'], 'synthetic', true),
  (NULL, 'Argireline', 'ACETYL HEXAPEPTIDE-8', 'Active', ARRAY['anti-wrinkle'], 'synthetic', true),
  (NULL, 'GHK-Cu', 'COPPER TRIPEPTIDE-1', 'Active', ARRAY['anti-aging', 'healing'], 'synthetic', true),
  (NULL, 'Ceramide 3', 'CERAMIDE NP', 'Active', ARRAY['barrier repair'], 'synthetic', true),
  (NULL, 'Ceramide 6 II', 'CERAMIDE AP', 'Active', ARRAY['barrier repair'], 'synthetic', true),
  (NULL, 'Bakuchiol', 'BAKUCHIOL', 'Active', ARRAY['anti-aging'], 'natural', true),
  (NULL, 'Adenosine', 'ADENOSINE', 'Active', ARRAY['anti-wrinkle'], 'biotechnology', true),
  (NULL, 'Allantoin', 'ALLANTOIN', 'Active', ARRAY['soothing'], 'synthetic', true),
  (NULL, 'Alpha-Bisabolol', 'BISABOLOL', 'Active', ARRAY['soothing'], 'natural_derived', true),
  (NULL, 'Cica Extract', 'CENTELLA ASIATICA EXTRACT', 'Active', ARRAY['soothing', 'healing'], 'natural', true),
  (NULL, 'Caffeine', 'CAFFEINE', 'Active', ARRAY['circulation', 'de-puffing'], 'natural_derived', true),
  (NULL, 'Zinc Oxide', 'ZINC OXIDE', 'Active', ARRAY['uv protection', 'soothing'], 'mineral', true),
  (NULL, 'Titanium Dioxide', 'TITANIUM DIOXIDE', 'Active', ARRAY['uv protection'], 'mineral', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: BOTANICAL EXTRACTS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Aloe Vera', 'ALOE BARBADENSIS LEAF JUICE', 'Botanical', ARRAY['soothing', 'hydrating'], 'natural', true),
  (NULL, 'Aloe Vera Extract', 'ALOE BARBADENSIS LEAF EXTRACT', 'Botanical', ARRAY['soothing', 'hydrating'], 'natural', true),
  (NULL, 'Green Tea Extract', 'CAMELLIA SINENSIS LEAF EXTRACT', 'Botanical', ARRAY['antioxidant'], 'natural', true),
  (NULL, 'Chamomile Extract', 'CHAMOMILLA RECUTITA FLOWER EXTRACT', 'Botanical', ARRAY['soothing'], 'natural', true),
  (NULL, 'Calendula Extract', 'CALENDULA OFFICINALIS FLOWER EXTRACT', 'Botanical', ARRAY['soothing', 'healing'], 'natural', true),
  (NULL, 'Witch Hazel', 'HAMAMELIS VIRGINIANA EXTRACT', 'Botanical', ARRAY['astringent'], 'natural', true),
  (NULL, 'Licorice Root Extract', 'GLYCYRRHIZA GLABRA ROOT EXTRACT', 'Botanical', ARRAY['brightening', 'soothing'], 'natural', true),
  (NULL, 'Ginkgo Extract', 'GINKGO BILOBA LEAF EXTRACT', 'Botanical', ARRAY['antioxidant'], 'natural', true),
  (NULL, 'Ginseng Extract', 'PANAX GINSENG ROOT EXTRACT', 'Botanical', ARRAY['revitalizing'], 'natural', true),
  (NULL, 'Bearberry Extract', 'ARCTOSTAPHYLOS UVA URSI LEAF EXTRACT', 'Botanical', ARRAY['brightening'], 'natural', true),
  (NULL, 'Mulberry Root Extract', 'MORUS ALBA ROOT EXTRACT', 'Botanical', ARRAY['brightening'], 'natural', true),
  (NULL, 'Turmeric Extract', 'CURCUMA LONGA ROOT EXTRACT', 'Botanical', ARRAY['antioxidant', 'brightening'], 'natural', true),
  (NULL, 'Hibiscus Extract', 'HIBISCUS SABDARIFFA FLOWER EXTRACT', 'Botanical', ARRAY['antioxidant'], 'natural', true),
  (NULL, 'Rosehip Extract', 'ROSA CANINA FRUIT EXTRACT', 'Botanical', ARRAY['antioxidant'], 'natural', true),
  (NULL, 'Pomegranate Extract', 'PUNICA GRANATUM EXTRACT', 'Botanical', ARRAY['antioxidant'], 'natural', true),
  (NULL, 'Coffee Extract', 'COFFEA ARABICA SEED EXTRACT', 'Botanical', ARRAY['antioxidant', 'stimulating'], 'natural', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: SURFACTANTS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'SLS', 'SODIUM LAURYL SULFATE', 'Surfactant', ARRAY['cleansing'], 'synthetic', true),
  (NULL, 'SLES', 'SODIUM LAURETH SULFATE', 'Surfactant', ARRAY['cleansing'], 'synthetic', true),
  (NULL, 'CAPB', 'COCAMIDOPROPYL BETAINE', 'Surfactant', ARRAY['cleansing'], 'natural_derived', true),
  (NULL, 'SCI', 'SODIUM COCOYL ISETHIONATE', 'Surfactant', ARRAY['cleansing'], 'natural_derived', true),
  (NULL, 'Decyl Glucoside', 'DECYL GLUCOSIDE', 'Surfactant', ARRAY['cleansing'], 'natural_derived', true),
  (NULL, 'Coco Glucoside', 'COCO-GLUCOSIDE', 'Surfactant', ARRAY['cleansing'], 'natural_derived', true),
  (NULL, 'Lauryl Glucoside', 'LAURYL GLUCOSIDE', 'Surfactant', ARRAY['cleansing'], 'natural_derived', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: BUTTERS & WAXES
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Shea Butter', 'BUTYROSPERMUM PARKII BUTTER', 'Butter', ARRAY['emollient'], 'natural', true),
  (NULL, 'Cocoa Butter', 'THEOBROMA CACAO SEED BUTTER', 'Butter', ARRAY['emollient'], 'natural', true),
  (NULL, 'Mango Butter', 'MANGIFERA INDICA SEED BUTTER', 'Butter', ARRAY['emollient'], 'natural', true),
  (NULL, 'Cupuacu Butter', 'CUPUACU BUTTER', 'Butter', ARRAY['emollient'], 'natural', true),
  (NULL, 'Kokum Butter', 'GARCINIA INDICA SEED BUTTER', 'Butter', ARRAY['emollient'], 'natural', true),
  (NULL, 'Beeswax', 'CERA ALBA', 'Wax', ARRAY['thickener', 'emollient'], 'natural', false),
  (NULL, 'Candelilla Wax', 'CANDELILLA CERA', 'Wax', ARRAY['thickener'], 'natural', true),
  (NULL, 'Carnauba Wax', 'COPERNICIA CERIFERA CERA', 'Wax', ARRAY['thickener'], 'natural', true),
  (NULL, 'Rice Bran Wax', 'ORYZA SATIVA BRAN WAX', 'Wax', ARRAY['thickener'], 'natural', true),
  (NULL, 'Jojoba Wax', 'SIMMONDSIA CHINENSIS SEED WAX', 'Wax', ARRAY['thickener'], 'natural', true),
  (NULL, 'Lanolin', 'LANOLIN', 'Wax', ARRAY['emollient'], 'natural', false)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: SILICONES
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Dimethicone', 'DIMETHICONE', 'Silicone', ARRAY['emollient', 'conditioning'], 'synthetic', true),
  (NULL, 'Cyclomethicone', 'CYCLOMETHICONE', 'Silicone', ARRAY['emollient'], 'synthetic', true),
  (NULL, 'D5', 'CYCLOPENTASILOXANE', 'Silicone', ARRAY['emollient'], 'synthetic', true),
  (NULL, 'Phenyl Trimethicone', 'PHENYL TRIMETHICONE', 'Silicone', ARRAY['emollient', 'shine'], 'synthetic', true),
  (NULL, 'Dimethiconol', 'DIMETHICONOL', 'Silicone', ARRAY['conditioning'], 'synthetic', true),
  (NULL, 'Amodimethicone', 'AMODIMETHICONE', 'Silicone', ARRAY['conditioning'], 'synthetic', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: COLORANTS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Titanium Dioxide White', 'CI 77891', 'Colorant', ARRAY['pigment'], 'mineral', true),
  (NULL, 'Iron Oxide Red', 'CI 77491', 'Colorant', ARRAY['pigment'], 'mineral', true),
  (NULL, 'Iron Oxide Yellow', 'CI 77492', 'Colorant', ARRAY['pigment'], 'mineral', true),
  (NULL, 'Iron Oxide Black', 'CI 77499', 'Colorant', ARRAY['pigment'], 'mineral', true),
  (NULL, 'Ultramarines', 'CI 77007', 'Colorant', ARRAY['pigment'], 'mineral', true),
  (NULL, 'Manganese Violet', 'CI 77742', 'Colorant', ARRAY['pigment'], 'mineral', true),
  (NULL, 'Chromium Oxide Green', 'CI 77288', 'Colorant', ARRAY['pigment'], 'mineral', true),
  (NULL, 'Carmine', 'CI 75470', 'Colorant', ARRAY['pigment'], 'natural', false),
  (NULL, 'Mica', 'MICA', 'Colorant', ARRAY['pearlescent'], 'mineral', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: AROMA CHEMICALS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Iso E Super', 'ISO E SUPER', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Hedione', 'HEDIONE', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Ambroxan', 'AMBROXAN', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Galaxolide', 'GALAXOLIDE', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Muscone', 'MUSCONE', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Cashmeran', 'CASHMERAN', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Javanol', 'JAVANOL', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Vanillin', 'VANILLIN', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Ethyl Vanillin', 'ETHYL VANILLIN', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Ionone', 'IONONE', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true),
  (NULL, 'Damascone', 'DAMASCONE', 'Aroma Chemical', ARRAY['fragrance'], 'synthetic', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- CATEGORY: MISCELLANEOUS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, name, inci_name, category, cosmetic_function, origin, is_vegan)
VALUES
  (NULL, 'Salt', 'SODIUM CHLORIDE', 'Miscellaneous', ARRAY['thickener'], 'mineral', true),
  (NULL, 'Epsom Salt', 'MAGNESIUM SULFATE', 'Miscellaneous', ARRAY['exfoliant'], 'mineral', true),
  (NULL, 'Kaolin Clay', 'KAOLIN', 'Miscellaneous', ARRAY['absorbent', 'cleansing'], 'mineral', true),
  (NULL, 'Bentonite Clay', 'BENTONITE', 'Miscellaneous', ARRAY['absorbent', 'cleansing'], 'mineral', true),
  (NULL, 'Activated Charcoal', 'CHARCOAL POWDER', 'Miscellaneous', ARRAY['absorbent', 'detoxifying'], 'natural_derived', true),
  (NULL, 'Silica', 'SILICA', 'Miscellaneous', ARRAY['absorbent', 'texture'], 'mineral', true),
  (NULL, 'Tapioca Starch', 'TAPIOCA STARCH', 'Miscellaneous', ARRAY['absorbent', 'texture'], 'natural', true),
  (NULL, 'Corn Starch', 'ZEA MAYS STARCH', 'Miscellaneous', ARRAY['absorbent', 'texture'], 'natural', true),
  (NULL, 'Sodium Hydroxide', 'SODIUM HYDROXIDE', 'pH Adjuster', ARRAY['ph adjuster'], 'synthetic', true),
  (NULL, 'Potassium Hydroxide', 'POTASSIUM HYDROXIDE', 'pH Adjuster', ARRAY['ph adjuster'], 'synthetic', true),
  (NULL, 'TEA', 'TRIETHANOLAMINE', 'pH Adjuster', ARRAY['ph adjuster'], 'synthetic', true),
  (NULL, 'EDTA', 'DISODIUM EDTA', 'Chelator', ARRAY['chelating'], 'synthetic', true)
ON CONFLICT (inci_name) WHERE organization_id IS NULL DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  cosmetic_function = EXCLUDED.cosmetic_function,
  origin = EXCLUDED.origin,
  is_vegan = EXCLUDED.is_vegan;

-- ============================================
-- VERIFY: Count seeded ingredients
-- ============================================
SELECT 
  category,
  COUNT(*) as count
FROM public.ingredient_library
WHERE organization_id IS NULL
GROUP BY category
ORDER BY count DESC;

-- Total global ingredients
SELECT COUNT(*) as total_global_ingredients 
FROM public.ingredient_library 
WHERE organization_id IS NULL;
