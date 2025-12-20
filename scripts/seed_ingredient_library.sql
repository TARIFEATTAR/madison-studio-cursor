-- ============================================
-- INGREDIENT LIBRARY SEED DATA
-- Common INCI ingredients for Fragrance & Skincare
-- ============================================
-- Source: Industry standard INCI nomenclature
-- Categories: Base/Carrier, Active, Preservative, Emulsifier,
--             Surfactant, Fragrance, Colorant, Texture, Botanical
-- ============================================

-- First, ensure the ingredient_library table exists
CREATE TABLE IF NOT EXISTS public.ingredient_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  inci_name TEXT NOT NULL,
  common_name TEXT,
  category TEXT,
  function TEXT,
  is_allergen BOOLEAN DEFAULT false,
  allergen_type TEXT,
  cas_number TEXT,
  origin TEXT,
  vegan BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ingredient_library_inci ON public.ingredient_library(inci_name);
CREATE INDEX IF NOT EXISTS idx_ingredient_library_org ON public.ingredient_library(organization_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_library_category ON public.ingredient_library(category);

-- ============================================
-- GLOBAL INGREDIENTS (organization_id = NULL)
-- Available to all organizations
-- ============================================

-- ============================================
-- CATEGORY: CARRIER OILS & BASES
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'AQUA', 'Water', 'Base', 'Solvent', 'Synthetic', true),
  (NULL, 'ALCOHOL DENAT.', 'Denatured Alcohol', 'Base', 'Solvent, Antimicrobial', 'Plant-derived', true),
  (NULL, 'ETHANOL', 'Ethyl Alcohol', 'Base', 'Solvent', 'Plant-derived', true),
  (NULL, 'ISOPROPYL ALCOHOL', 'Rubbing Alcohol', 'Base', 'Solvent', 'Synthetic', true),
  (NULL, 'DIPROPYLENE GLYCOL', 'DPG', 'Base', 'Solvent, Fixative', 'Synthetic', true),
  (NULL, 'PROPYLENE GLYCOL', 'PG', 'Base', 'Humectant, Solvent', 'Synthetic', true),
  (NULL, 'GLYCERIN', 'Glycerine', 'Base', 'Humectant', 'Plant-derived', true),
  (NULL, 'BUTYLENE GLYCOL', 'BG', 'Base', 'Humectant, Solvent', 'Synthetic', true),
  (NULL, 'PENTYLENE GLYCOL', 'Pentanediol', 'Base', 'Humectant, Preservative booster', 'Synthetic', true),
  (NULL, 'HEXYLENE GLYCOL', 'Hexanediol', 'Base', 'Solvent, Emulsifier', 'Synthetic', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: CARRIER OILS (Plant-Based)
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'PRUNUS AMYGDALUS DULCIS OIL', 'Sweet Almond Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'SIMMONDSIA CHINENSIS SEED OIL', 'Jojoba Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'COCOS NUCIFERA OIL', 'Coconut Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'ARGANIA SPINOSA KERNEL OIL', 'Argan Oil', 'Carrier Oil', 'Emollient, Conditioning', 'Plant-derived', true),
  (NULL, 'ROSA CANINA SEED OIL', 'Rosehip Oil', 'Carrier Oil', 'Emollient, Antioxidant', 'Plant-derived', true),
  (NULL, 'HELIANTHUS ANNUUS SEED OIL', 'Sunflower Seed Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'OLEA EUROPAEA FRUIT OIL', 'Olive Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'PERSEA GRATISSIMA OIL', 'Avocado Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'VITIS VINIFERA SEED OIL', 'Grape Seed Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'OENOTHERA BIENNIS OIL', 'Evening Primrose Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'RICINUS COMMUNIS SEED OIL', 'Castor Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'SESAMUM INDICUM SEED OIL', 'Sesame Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'CRAMBE ABYSSINICA SEED OIL', 'Abyssinian Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'CAMELLIA OLEIFERA SEED OIL', 'Camellia Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'MARULA OIL', 'Marula Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'SQUALANE', 'Squalane', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'CAPRYLIC/CAPRIC TRIGLYCERIDE', 'MCT Oil', 'Carrier Oil', 'Emollient', 'Plant-derived', true),
  (NULL, 'ISOPROPYL MYRISTATE', 'IPM', 'Carrier Oil', 'Emollient, Solvent', 'Synthetic', true),
  (NULL, 'ISOPROPYL PALMITATE', 'IPP', 'Carrier Oil', 'Emollient', 'Synthetic', true),
  (NULL, 'CETEARYL ETHYLHEXANOATE', 'Crodamol CAP', 'Carrier Oil', 'Emollient', 'Synthetic', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: ESSENTIAL OILS & FRAGRANCE (ALLERGENS MARKED)
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan, is_allergen, allergen_type)
VALUES
  -- EU 26 Allergens
  (NULL, 'LIMONENE', 'Limonene', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'LINALOOL', 'Linalool', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'CITRONELLOL', 'Citronellol', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'GERANIOL', 'Geraniol', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'CITRAL', 'Citral', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'EUGENOL', 'Eugenol', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'COUMARIN', 'Coumarin', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'CINNAMAL', 'Cinnamaldehyde', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'HYDROXYCITRONELLAL', 'Hydroxycitronellal', 'Fragrance', 'Fragrance', 'Synthetic', true, true, 'EU26'),
  (NULL, 'ISOEUGENOL', 'Isoeugenol', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'AMYL CINNAMAL', 'Amyl Cinnamal', 'Fragrance', 'Fragrance', 'Synthetic', true, true, 'EU26'),
  (NULL, 'BENZYL ALCOHOL', 'Benzyl Alcohol', 'Fragrance', 'Fragrance, Preservative', 'Synthetic', true, true, 'EU26'),
  (NULL, 'BENZYL BENZOATE', 'Benzyl Benzoate', 'Fragrance', 'Fragrance, Solvent', 'Synthetic', true, true, 'EU26'),
  (NULL, 'BENZYL CINNAMATE', 'Benzyl Cinnamate', 'Fragrance', 'Fragrance', 'Synthetic', true, true, 'EU26'),
  (NULL, 'BENZYL SALICYLATE', 'Benzyl Salicylate', 'Fragrance', 'Fragrance', 'Synthetic', true, true, 'EU26'),
  (NULL, 'CINNAMYL ALCOHOL', 'Cinnamyl Alcohol', 'Fragrance', 'Fragrance', 'Synthetic', true, true, 'EU26'),
  (NULL, 'FARNESOL', 'Farnesol', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'HEXYL CINNAMAL', 'Hexyl Cinnamal', 'Fragrance', 'Fragrance', 'Synthetic', true, true, 'EU26'),
  (NULL, 'BUTYLPHENYL METHYLPROPIONAL', 'Lilial', 'Fragrance', 'Fragrance', 'Synthetic', true, true, 'EU26'),
  (NULL, 'ALPHA-ISOMETHYL IONONE', 'Alpha-Isomethyl Ionone', 'Fragrance', 'Fragrance', 'Synthetic', true, true, 'EU26'),
  (NULL, 'EVERNIA PRUNASTRI EXTRACT', 'Oakmoss Extract', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'EVERNIA FURFURACEA EXTRACT', 'Treemoss Extract', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  (NULL, 'METHYL 2-OCTYNOATE', 'Methyl Heptine Carbonate', 'Fragrance', 'Fragrance', 'Synthetic', true, true, 'EU26'),
  (NULL, 'ANISE ALCOHOL', 'Anise Alcohol', 'Fragrance', 'Fragrance', 'Plant-derived', true, true, 'EU26'),
  
  -- Common Essential Oils
  (NULL, 'LAVANDULA ANGUSTIFOLIA OIL', 'Lavender Essential Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'CITRUS AURANTIUM DULCIS PEEL OIL', 'Sweet Orange Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'CITRUS LIMON PEEL OIL', 'Lemon Essential Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'MENTHA PIPERITA OIL', 'Peppermint Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'EUCALYPTUS GLOBULUS LEAF OIL', 'Eucalyptus Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'MELALEUCA ALTERNIFOLIA LEAF OIL', 'Tea Tree Oil', 'Essential Oil', 'Fragrance, Antimicrobial', 'Plant-derived', true, false, NULL),
  (NULL, 'ROSMARINUS OFFICINALIS LEAF OIL', 'Rosemary Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'THYMUS VULGARIS OIL', 'Thyme Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'CEDRUS ATLANTICA BARK OIL', 'Cedarwood Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'SANTALUM ALBUM OIL', 'Sandalwood Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'VETIVERIA ZIZANOIDES ROOT OIL', 'Vetiver Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'PELARGONIUM GRAVEOLENS OIL', 'Geranium Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'CITRUS BERGAMIA PEEL OIL', 'Bergamot Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'YLANG YLANG OIL', 'Ylang Ylang Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'JASMINUM OFFICINALE OIL', 'Jasmine Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'ROSA DAMASCENA FLOWER OIL', 'Rose Otto', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'BOSWELLIA CARTERII OIL', 'Frankincense Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'COMMIPHORA MYRRHA OIL', 'Myrrh Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'POGOSTEMON CABLIN OIL', 'Patchouli Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  (NULL, 'CITRUS AURANTIUM AMARA FLOWER OIL', 'Neroli Oil', 'Essential Oil', 'Fragrance', 'Plant-derived', true, false, NULL),
  
  -- Fragrance Compound
  (NULL, 'PARFUM', 'Fragrance', 'Fragrance', 'Fragrance', 'Mixed', true, false, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: PRESERVATIVES
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'PHENOXYETHANOL', 'Phenoxyethanol', 'Preservative', 'Preservative', 'Synthetic', true),
  (NULL, 'ETHYLHEXYLGLYCERIN', 'Ethylhexylglycerin', 'Preservative', 'Preservative booster', 'Synthetic', true),
  (NULL, 'SODIUM BENZOATE', 'Sodium Benzoate', 'Preservative', 'Preservative', 'Synthetic', true),
  (NULL, 'POTASSIUM SORBATE', 'Potassium Sorbate', 'Preservative', 'Preservative', 'Synthetic', true),
  (NULL, 'SORBIC ACID', 'Sorbic Acid', 'Preservative', 'Preservative', 'Synthetic', true),
  (NULL, 'BENZOIC ACID', 'Benzoic Acid', 'Preservative', 'Preservative', 'Synthetic', true),
  (NULL, 'DEHYDROACETIC ACID', 'DHA', 'Preservative', 'Preservative', 'Synthetic', true),
  (NULL, 'BENZISOTHIAZOLINONE', 'BIT', 'Preservative', 'Preservative', 'Synthetic', true),
  (NULL, 'METHYLISOTHIAZOLINONE', 'MIT', 'Preservative', 'Preservative', 'Synthetic', true),
  (NULL, 'CAPRYLYL GLYCOL', 'Caprylyl Glycol', 'Preservative', 'Preservative booster', 'Synthetic', true),
  (NULL, 'TOCOPHEROL', 'Vitamin E', 'Preservative', 'Antioxidant', 'Plant-derived', true),
  (NULL, 'ASCORBIC ACID', 'Vitamin C', 'Preservative', 'Antioxidant', 'Synthetic', true),
  (NULL, 'CITRIC ACID', 'Citric Acid', 'Preservative', 'pH adjuster, Chelating', 'Plant-derived', true),
  (NULL, 'SODIUM HYDROXYMETHYLGLYCINATE', 'Suttocide A', 'Preservative', 'Preservative', 'Synthetic', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: EMULSIFIERS & THICKENERS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'CETEARYL ALCOHOL', 'Cetearyl Alcohol', 'Emulsifier', 'Emulsifier, Thickener', 'Plant-derived', true),
  (NULL, 'CETYL ALCOHOL', 'Cetyl Alcohol', 'Emulsifier', 'Emulsifier, Thickener', 'Plant-derived', true),
  (NULL, 'STEARYL ALCOHOL', 'Stearyl Alcohol', 'Emulsifier', 'Emulsifier, Thickener', 'Plant-derived', true),
  (NULL, 'GLYCERYL STEARATE', 'Glyceryl Stearate', 'Emulsifier', 'Emulsifier', 'Plant-derived', true),
  (NULL, 'GLYCERYL STEARATE SE', 'Glyceryl Stearate SE', 'Emulsifier', 'Emulsifier', 'Plant-derived', true),
  (NULL, 'PEG-100 STEARATE', 'PEG-100 Stearate', 'Emulsifier', 'Emulsifier', 'Synthetic', true),
  (NULL, 'POLYSORBATE 20', 'Tween 20', 'Emulsifier', 'Solubilizer', 'Synthetic', true),
  (NULL, 'POLYSORBATE 80', 'Tween 80', 'Emulsifier', 'Solubilizer', 'Synthetic', true),
  (NULL, 'SORBITAN OLEATE', 'Span 80', 'Emulsifier', 'Emulsifier', 'Synthetic', true),
  (NULL, 'CETEARETH-20', 'Ceteareth-20', 'Emulsifier', 'Emulsifier', 'Synthetic', true),
  (NULL, 'STEARETH-21', 'Steareth-21', 'Emulsifier', 'Emulsifier', 'Synthetic', true),
  (NULL, 'LECITHIN', 'Lecithin', 'Emulsifier', 'Emulsifier', 'Plant-derived', true),
  (NULL, 'XANTHAN GUM', 'Xanthan Gum', 'Thickener', 'Thickener, Stabilizer', 'Fermentation', true),
  (NULL, 'CARBOMER', 'Carbomer', 'Thickener', 'Thickener', 'Synthetic', true),
  (NULL, 'HYDROXYETHYLCELLULOSE', 'HEC', 'Thickener', 'Thickener', 'Plant-derived', true),
  (NULL, 'SODIUM POLYACRYLATE', 'Sodium Polyacrylate', 'Thickener', 'Thickener', 'Synthetic', true),
  (NULL, 'ACRYLATES/C10-30 ALKYL ACRYLATE CROSSPOLYMER', 'Pemulen', 'Thickener', 'Thickener, Emulsifier', 'Synthetic', true),
  (NULL, 'HYDROXYPROPYL METHYLCELLULOSE', 'HPMC', 'Thickener', 'Thickener', 'Plant-derived', true),
  (NULL, 'CELLULOSE GUM', 'Carboxymethyl Cellulose', 'Thickener', 'Thickener', 'Plant-derived', true),
  (NULL, 'SCLEROTIUM GUM', 'Sclerotium Gum', 'Thickener', 'Thickener', 'Fermentation', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: ACTIVE INGREDIENTS (SKINCARE)
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  -- Vitamins
  (NULL, 'RETINOL', 'Vitamin A', 'Active', 'Anti-aging', 'Synthetic', true),
  (NULL, 'RETINYL PALMITATE', 'Vitamin A Palmitate', 'Active', 'Anti-aging', 'Synthetic', true),
  (NULL, 'ASCORBYL GLUCOSIDE', 'Vitamin C Derivative', 'Active', 'Brightening, Antioxidant', 'Synthetic', true),
  (NULL, 'SODIUM ASCORBYL PHOSPHATE', 'SAP', 'Active', 'Brightening, Antioxidant', 'Synthetic', true),
  (NULL, 'ASCORBYL TETRAISOPALMITATE', 'VC-IP', 'Active', 'Brightening, Antioxidant', 'Synthetic', true),
  (NULL, 'NIACINAMIDE', 'Vitamin B3', 'Active', 'Brightening, Barrier repair', 'Synthetic', true),
  (NULL, 'PANTHENOL', 'Pro-Vitamin B5', 'Active', 'Moisturizing, Healing', 'Synthetic', true),
  (NULL, 'TOCOPHERYL ACETATE', 'Vitamin E Acetate', 'Active', 'Antioxidant', 'Synthetic', true),
  
  -- Acids
  (NULL, 'HYALURONIC ACID', 'Hyaluronic Acid', 'Active', 'Hydrating', 'Fermentation', true),
  (NULL, 'SODIUM HYALURONATE', 'Sodium Hyaluronate', 'Active', 'Hydrating', 'Fermentation', true),
  (NULL, 'GLYCOLIC ACID', 'Glycolic Acid', 'Active', 'Exfoliant (AHA)', 'Synthetic', true),
  (NULL, 'LACTIC ACID', 'Lactic Acid', 'Active', 'Exfoliant (AHA)', 'Fermentation', true),
  (NULL, 'SALICYLIC ACID', 'Salicylic Acid', 'Active', 'Exfoliant (BHA)', 'Plant-derived', true),
  (NULL, 'MANDELIC ACID', 'Mandelic Acid', 'Active', 'Exfoliant (AHA)', 'Plant-derived', true),
  (NULL, 'AZELAIC ACID', 'Azelaic Acid', 'Active', 'Brightening, Anti-acne', 'Synthetic', true),
  (NULL, 'KOJIC ACID', 'Kojic Acid', 'Active', 'Brightening', 'Fermentation', true),
  (NULL, 'TRANEXAMIC ACID', 'Tranexamic Acid', 'Active', 'Brightening', 'Synthetic', true),
  (NULL, 'FERULIC ACID', 'Ferulic Acid', 'Active', 'Antioxidant', 'Plant-derived', true),
  
  -- Peptides
  (NULL, 'PALMITOYL TRIPEPTIDE-1', 'Matrixyl 3000 component', 'Active', 'Anti-aging', 'Synthetic', true),
  (NULL, 'PALMITOYL TETRAPEPTIDE-7', 'Matrixyl 3000 component', 'Active', 'Anti-aging', 'Synthetic', true),
  (NULL, 'ACETYL HEXAPEPTIDE-8', 'Argireline', 'Active', 'Anti-wrinkle', 'Synthetic', true),
  (NULL, 'COPPER TRIPEPTIDE-1', 'GHK-Cu', 'Active', 'Anti-aging, Healing', 'Synthetic', true),
  (NULL, 'PALMITOYL PENTAPEPTIDE-4', 'Matrixyl', 'Active', 'Anti-aging', 'Synthetic', true),
  
  -- Other Actives
  (NULL, 'CERAMIDE NP', 'Ceramide 3', 'Active', 'Barrier repair', 'Synthetic', true),
  (NULL, 'CERAMIDE AP', 'Ceramide 6 II', 'Active', 'Barrier repair', 'Synthetic', true),
  (NULL, 'CERAMIDE EOP', 'Ceramide 1', 'Active', 'Barrier repair', 'Synthetic', true),
  (NULL, 'BAKUCHIOL', 'Bakuchiol', 'Active', 'Retinol alternative', 'Plant-derived', true),
  (NULL, 'ADENOSINE', 'Adenosine', 'Active', 'Anti-wrinkle', 'Fermentation', true),
  (NULL, 'ALLANTOIN', 'Allantoin', 'Active', 'Soothing', 'Synthetic', true),
  (NULL, 'BISABOLOL', 'Alpha-Bisabolol', 'Active', 'Soothing', 'Plant-derived', true),
  (NULL, 'CENTELLA ASIATICA EXTRACT', 'Cica Extract', 'Active', 'Soothing, Healing', 'Plant-derived', true),
  (NULL, 'CAFFEINE', 'Caffeine', 'Active', 'Circulation, De-puffing', 'Plant-derived', true),
  (NULL, 'COLLAGEN', 'Collagen', 'Active', 'Moisturizing', 'Animal-derived', false),
  (NULL, 'ZINC OXIDE', 'Zinc Oxide', 'Active', 'UV protection, Soothing', 'Mineral', true),
  (NULL, 'TITANIUM DIOXIDE', 'Titanium Dioxide', 'Active', 'UV protection', 'Mineral', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: BOTANICAL EXTRACTS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'ALOE BARBADENSIS LEAF JUICE', 'Aloe Vera', 'Botanical', 'Soothing, Hydrating', 'Plant-derived', true),
  (NULL, 'ALOE BARBADENSIS LEAF EXTRACT', 'Aloe Vera Extract', 'Botanical', 'Soothing, Hydrating', 'Plant-derived', true),
  (NULL, 'CAMELLIA SINENSIS LEAF EXTRACT', 'Green Tea Extract', 'Botanical', 'Antioxidant', 'Plant-derived', true),
  (NULL, 'CHAMOMILLA RECUTITA FLOWER EXTRACT', 'Chamomile Extract', 'Botanical', 'Soothing', 'Plant-derived', true),
  (NULL, 'CALENDULA OFFICINALIS FLOWER EXTRACT', 'Calendula Extract', 'Botanical', 'Soothing, Healing', 'Plant-derived', true),
  (NULL, 'HAMAMELIS VIRGINIANA EXTRACT', 'Witch Hazel', 'Botanical', 'Astringent', 'Plant-derived', true),
  (NULL, 'GLYCYRRHIZA GLABRA ROOT EXTRACT', 'Licorice Root Extract', 'Botanical', 'Brightening, Soothing', 'Plant-derived', true),
  (NULL, 'SYMPHYTUM OFFICINALE EXTRACT', 'Comfrey Extract', 'Botanical', 'Soothing', 'Plant-derived', true),
  (NULL, 'ECHINACEA PURPUREA EXTRACT', 'Echinacea Extract', 'Botanical', 'Immune support', 'Plant-derived', true),
  (NULL, 'GINKGO BILOBA LEAF EXTRACT', 'Ginkgo Extract', 'Botanical', 'Antioxidant', 'Plant-derived', true),
  (NULL, 'PANAX GINSENG ROOT EXTRACT', 'Ginseng Extract', 'Botanical', 'Revitalizing', 'Plant-derived', true),
  (NULL, 'ARCTOSTAPHYLOS UVA URSI LEAF EXTRACT', 'Bearberry Extract', 'Botanical', 'Brightening', 'Plant-derived', true),
  (NULL, 'MORUS ALBA ROOT EXTRACT', 'Mulberry Root Extract', 'Botanical', 'Brightening', 'Plant-derived', true),
  (NULL, 'CURCUMA LONGA ROOT EXTRACT', 'Turmeric Extract', 'Botanical', 'Antioxidant, Brightening', 'Plant-derived', true),
  (NULL, 'HIBISCUS SABDARIFFA FLOWER EXTRACT', 'Hibiscus Extract', 'Botanical', 'Antioxidant', 'Plant-derived', true),
  (NULL, 'ROSA CANINA FRUIT EXTRACT', 'Rosehip Extract', 'Botanical', 'Antioxidant', 'Plant-derived', true),
  (NULL, 'PUNICA GRANATUM EXTRACT', 'Pomegranate Extract', 'Botanical', 'Antioxidant', 'Plant-derived', true),
  (NULL, 'VACCINIUM MYRTILLUS FRUIT EXTRACT', 'Bilberry Extract', 'Botanical', 'Antioxidant', 'Plant-derived', true),
  (NULL, 'VITIS VINIFERA FRUIT EXTRACT', 'Grape Extract', 'Botanical', 'Antioxidant', 'Plant-derived', true),
  (NULL, 'COFFEE ARABICA SEED EXTRACT', 'Coffee Extract', 'Botanical', 'Antioxidant, Stimulating', 'Plant-derived', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: SURFACTANTS (CLEANSERS)
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'SODIUM LAURYL SULFATE', 'SLS', 'Surfactant', 'Cleansing', 'Synthetic', true),
  (NULL, 'SODIUM LAURETH SULFATE', 'SLES', 'Surfactant', 'Cleansing', 'Synthetic', true),
  (NULL, 'COCAMIDOPROPYL BETAINE', 'CAPB', 'Surfactant', 'Cleansing (gentle)', 'Plant-derived', true),
  (NULL, 'SODIUM COCOYL ISETHIONATE', 'SCI', 'Surfactant', 'Cleansing (gentle)', 'Plant-derived', true),
  (NULL, 'DECYL GLUCOSIDE', 'Decyl Glucoside', 'Surfactant', 'Cleansing (gentle)', 'Plant-derived', true),
  (NULL, 'COCO-GLUCOSIDE', 'Coco Glucoside', 'Surfactant', 'Cleansing (gentle)', 'Plant-derived', true),
  (NULL, 'LAURYL GLUCOSIDE', 'Lauryl Glucoside', 'Surfactant', 'Cleansing (gentle)', 'Plant-derived', true),
  (NULL, 'SODIUM LAUROYL SARCOSINATE', 'SLS (mild)', 'Surfactant', 'Cleansing (mild)', 'Synthetic', true),
  (NULL, 'SODIUM COCOYL GLUTAMATE', 'SCG', 'Surfactant', 'Cleansing (amino acid)', 'Plant-derived', true),
  (NULL, 'DISODIUM LAURETH SULFOSUCCINATE', 'DLS', 'Surfactant', 'Cleansing (mild)', 'Synthetic', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: BUTTERS & WAXES
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'BUTYROSPERMUM PARKII BUTTER', 'Shea Butter', 'Butter', 'Emollient', 'Plant-derived', true),
  (NULL, 'THEOBROMA CACAO SEED BUTTER', 'Cocoa Butter', 'Butter', 'Emollient', 'Plant-derived', true),
  (NULL, 'MANGIFERA INDICA SEED BUTTER', 'Mango Butter', 'Butter', 'Emollient', 'Plant-derived', true),
  (NULL, 'CUPUACU BUTTER', 'Cupuacu Butter', 'Butter', 'Emollient', 'Plant-derived', true),
  (NULL, 'GARCINIA INDICA SEED BUTTER', 'Kokum Butter', 'Butter', 'Emollient', 'Plant-derived', true),
  (NULL, 'SHOREA STENOPTERA SEED BUTTER', 'Illipe Butter', 'Butter', 'Emollient', 'Plant-derived', true),
  (NULL, 'CERA ALBA', 'Beeswax', 'Wax', 'Thickener, Emollient', 'Animal-derived', false),
  (NULL, 'CANDELILLA CERA', 'Candelilla Wax', 'Wax', 'Thickener', 'Plant-derived', true),
  (NULL, 'COPERNICIA CERIFERA CERA', 'Carnauba Wax', 'Wax', 'Thickener', 'Plant-derived', true),
  (NULL, 'ORYZA SATIVA BRAN WAX', 'Rice Bran Wax', 'Wax', 'Thickener', 'Plant-derived', true),
  (NULL, 'SIMMONDSIA CHINENSIS SEED WAX', 'Jojoba Wax', 'Wax', 'Thickener', 'Plant-derived', true),
  (NULL, 'MICROCRYSTALLINE WAX', 'Microcrystalline Wax', 'Wax', 'Thickener', 'Mineral', true),
  (NULL, 'PARAFFIN', 'Paraffin Wax', 'Wax', 'Thickener', 'Mineral', true),
  (NULL, 'PETROLATUM', 'Petroleum Jelly', 'Wax', 'Occlusive', 'Mineral', true),
  (NULL, 'LANOLIN', 'Lanolin', 'Wax', 'Emollient', 'Animal-derived', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: SILICONES
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'DIMETHICONE', 'Dimethicone', 'Silicone', 'Emollient, Conditioning', 'Synthetic', true),
  (NULL, 'CYCLOMETHICONE', 'Cyclomethicone', 'Silicone', 'Emollient, Volatile', 'Synthetic', true),
  (NULL, 'CYCLOPENTASILOXANE', 'D5', 'Silicone', 'Emollient, Volatile', 'Synthetic', true),
  (NULL, 'CYCLOHEXASILOXANE', 'D6', 'Silicone', 'Emollient, Volatile', 'Synthetic', true),
  (NULL, 'PHENYL TRIMETHICONE', 'Phenyl Trimethicone', 'Silicone', 'Emollient, Shine', 'Synthetic', true),
  (NULL, 'DIMETHICONOL', 'Dimethiconol', 'Silicone', 'Conditioning', 'Synthetic', true),
  (NULL, 'AMODIMETHICONE', 'Amodimethicone', 'Silicone', 'Conditioning (hair)', 'Synthetic', true),
  (NULL, 'CETYL DIMETHICONE', 'Cetyl Dimethicone', 'Silicone', 'Emollient', 'Synthetic', true),
  (NULL, 'CAPRYLYL METHICONE', 'Caprylyl Methicone', 'Silicone', 'Emollient, Light', 'Synthetic', true),
  (NULL, 'PEG-10 DIMETHICONE', 'PEG-10 Dimethicone', 'Silicone', 'Emulsifier', 'Synthetic', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: COLORANTS (CI Numbers)
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'CI 77891', 'Titanium Dioxide (white)', 'Colorant', 'Pigment', 'Mineral', true),
  (NULL, 'CI 77491', 'Iron Oxide Red', 'Colorant', 'Pigment', 'Mineral', true),
  (NULL, 'CI 77492', 'Iron Oxide Yellow', 'Colorant', 'Pigment', 'Mineral', true),
  (NULL, 'CI 77499', 'Iron Oxide Black', 'Colorant', 'Pigment', 'Mineral', true),
  (NULL, 'CI 77007', 'Ultramarines', 'Colorant', 'Pigment', 'Mineral', true),
  (NULL, 'CI 77742', 'Manganese Violet', 'Colorant', 'Pigment', 'Mineral', true),
  (NULL, 'CI 77288', 'Chromium Oxide Green', 'Colorant', 'Pigment', 'Mineral', true),
  (NULL, 'CI 77289', 'Chromium Hydroxide Green', 'Colorant', 'Pigment', 'Mineral', true),
  (NULL, 'CI 75470', 'Carmine', 'Colorant', 'Pigment', 'Animal-derived', false),
  (NULL, 'CI 19140', 'Tartrazine (Yellow 5)', 'Colorant', 'Dye', 'Synthetic', true),
  (NULL, 'CI 16035', 'Allura Red', 'Colorant', 'Dye', 'Synthetic', true),
  (NULL, 'CI 42090', 'Brilliant Blue', 'Colorant', 'Dye', 'Synthetic', true),
  (NULL, 'MICA', 'Mica', 'Colorant', 'Pearlescent', 'Mineral', true),
  (NULL, 'BISMUTH OXYCHLORIDE', 'Bismuth Oxychloride', 'Colorant', 'Pearlescent', 'Mineral', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: pH ADJUSTERS & CHELATORS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'SODIUM HYDROXIDE', 'Lye', 'pH Adjuster', 'pH adjuster (alkaline)', 'Synthetic', true),
  (NULL, 'POTASSIUM HYDROXIDE', 'Potash', 'pH Adjuster', 'pH adjuster (alkaline)', 'Synthetic', true),
  (NULL, 'TRIETHANOLAMINE', 'TEA', 'pH Adjuster', 'pH adjuster, Neutralizer', 'Synthetic', true),
  (NULL, 'AMINOMETHYL PROPANOL', 'AMP', 'pH Adjuster', 'pH adjuster, Neutralizer', 'Synthetic', true),
  (NULL, 'LACTIC ACID', 'Lactic Acid', 'pH Adjuster', 'pH adjuster (acidic)', 'Fermentation', true),
  (NULL, 'PHOSPHORIC ACID', 'Phosphoric Acid', 'pH Adjuster', 'pH adjuster (acidic)', 'Synthetic', true),
  (NULL, 'DISODIUM EDTA', 'EDTA', 'Chelator', 'Chelating agent', 'Synthetic', true),
  (NULL, 'TETRASODIUM EDTA', 'Tetrasodium EDTA', 'Chelator', 'Chelating agent', 'Synthetic', true),
  (NULL, 'PHYTIC ACID', 'Phytic Acid', 'Chelator', 'Chelating agent (natural)', 'Plant-derived', true),
  (NULL, 'SODIUM PHYTATE', 'Sodium Phytate', 'Chelator', 'Chelating agent (natural)', 'Plant-derived', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: FRAGRANCE AROMA CHEMICALS (Non-allergen)
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'ISO E SUPER', 'Iso E Super', 'Aroma Chemical', 'Fragrance (woody)', 'Synthetic', true),
  (NULL, 'HEDIONE', 'Hedione', 'Aroma Chemical', 'Fragrance (jasmine)', 'Synthetic', true),
  (NULL, 'AMBROXAN', 'Ambroxan', 'Aroma Chemical', 'Fragrance (amber)', 'Synthetic', true),
  (NULL, 'GALAXOLIDE', 'Galaxolide', 'Aroma Chemical', 'Fragrance (musk)', 'Synthetic', true),
  (NULL, 'ETHYLENE BRASSYLATE', 'Ethylene Brassylate', 'Aroma Chemical', 'Fragrance (musk)', 'Synthetic', true),
  (NULL, 'MUSCONE', 'Muscone', 'Aroma Chemical', 'Fragrance (musk)', 'Synthetic', true),
  (NULL, 'CASHMERAN', 'Cashmeran', 'Aroma Chemical', 'Fragrance (woody-musky)', 'Synthetic', true),
  (NULL, 'JAVANOL', 'Javanol', 'Aroma Chemical', 'Fragrance (sandalwood)', 'Synthetic', true),
  (NULL, 'DIHYDROMYRCENOL', 'Dihydromyrcenol', 'Aroma Chemical', 'Fragrance (citrus-woody)', 'Synthetic', true),
  (NULL, 'CALONE', 'Calone', 'Aroma Chemical', 'Fragrance (marine)', 'Synthetic', true),
  (NULL, 'METHYL DIHYDROJASMONATE', 'Hedione HC', 'Aroma Chemical', 'Fragrance (jasmine)', 'Synthetic', true),
  (NULL, 'VANILLIN', 'Vanillin', 'Aroma Chemical', 'Fragrance (vanilla)', 'Synthetic', true),
  (NULL, 'ETHYL VANILLIN', 'Ethyl Vanillin', 'Aroma Chemical', 'Fragrance (vanilla)', 'Synthetic', true),
  (NULL, 'HELIOTROPIN', 'Heliotropin', 'Aroma Chemical', 'Fragrance (almond-vanilla)', 'Synthetic', true),
  (NULL, 'IONONE', 'Ionone', 'Aroma Chemical', 'Fragrance (violet)', 'Synthetic', true),
  (NULL, 'METHYL IONONE', 'Methyl Ionone', 'Aroma Chemical', 'Fragrance (orris)', 'Synthetic', true),
  (NULL, 'DAMASCONE', 'Damascone', 'Aroma Chemical', 'Fragrance (rose-fruity)', 'Synthetic', true),
  (NULL, 'DAMASCENONE', 'Damascenone', 'Aroma Chemical', 'Fragrance (rose)', 'Synthetic', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORY: MISCELLANEOUS
-- ============================================
INSERT INTO public.ingredient_library (organization_id, inci_name, common_name, category, function, origin, vegan)
VALUES
  (NULL, 'SODIUM CHLORIDE', 'Salt', 'Miscellaneous', 'Thickener, Viscosity control', 'Mineral', true),
  (NULL, 'MAGNESIUM SULFATE', 'Epsom Salt', 'Miscellaneous', 'Exfoliant, Muscle relaxant', 'Mineral', true),
  (NULL, 'KAOLIN', 'Kaolin Clay', 'Miscellaneous', 'Absorbent, Cleansing', 'Mineral', true),
  (NULL, 'BENTONITE', 'Bentonite Clay', 'Miscellaneous', 'Absorbent, Cleansing', 'Mineral', true),
  (NULL, 'MONTMORILLONITE', 'Montmorillonite Clay', 'Miscellaneous', 'Absorbent', 'Mineral', true),
  (NULL, 'CHARCOAL POWDER', 'Activated Charcoal', 'Miscellaneous', 'Absorbent, Detoxifying', 'Plant-derived', true),
  (NULL, 'TALC', 'Talc', 'Miscellaneous', 'Absorbent, Texture', 'Mineral', true),
  (NULL, 'SILICA', 'Silica', 'Miscellaneous', 'Absorbent, Texture', 'Mineral', true),
  (NULL, 'ALUMINUM STARCH OCTENYLSUCCINATE', 'Modified Starch', 'Miscellaneous', 'Absorbent, Texture', 'Plant-derived', true),
  (NULL, 'TAPIOCA STARCH', 'Tapioca Starch', 'Miscellaneous', 'Absorbent, Texture', 'Plant-derived', true),
  (NULL, 'ZEA MAYS STARCH', 'Corn Starch', 'Miscellaneous', 'Absorbent, Texture', 'Plant-derived', true),
  (NULL, 'HONEY', 'Honey', 'Miscellaneous', 'Humectant, Antimicrobial', 'Animal-derived', false),
  (NULL, 'MEL', 'Honey (INCI)', 'Miscellaneous', 'Humectant, Antimicrobial', 'Animal-derived', false),
  (NULL, 'ROYAL JELLY', 'Royal Jelly', 'Miscellaneous', 'Nourishing', 'Animal-derived', false),
  (NULL, 'PROPOLIS', 'Propolis', 'Miscellaneous', 'Antimicrobial', 'Animal-derived', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify counts
-- ============================================
SELECT 
  category,
  COUNT(*) as ingredient_count
FROM public.ingredient_library
WHERE organization_id IS NULL
GROUP BY category
ORDER BY ingredient_count DESC;

-- ============================================
-- Total count
-- ============================================
SELECT COUNT(*) as total_global_ingredients 
FROM public.ingredient_library 
WHERE organization_id IS NULL;
