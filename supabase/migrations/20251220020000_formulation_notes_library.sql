-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON STUDIO - FORMULATION NOTES LIBRARY
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Week 6: Product Hub - Formulation Section
-- Creates a comprehensive library of scent notes and formulation ingredients
--
-- Tables created:
--   - scent_notes: Library of fragrance notes (top, heart, base)
--   - formulation_ingredients: Skincare/cosmetic ingredients library
--
-- Created: December 20, 2025
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: SCENT NOTES LIBRARY
-- Comprehensive fragrance notes database for autocomplete
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.scent_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Note Identity
  name TEXT NOT NULL UNIQUE,
  name_variants TEXT[] DEFAULT '{}', -- Alternative names/spellings
  
  -- Classification
  note_type TEXT NOT NULL CHECK (note_type IN ('top', 'heart', 'base', 'modifier')),
  scent_family TEXT NOT NULL, -- citrus, floral, woody, oriental, fresh, etc.
  subfamly TEXT, -- More specific classification
  
  -- Characteristics
  description TEXT,
  character_tags TEXT[] DEFAULT '{}', -- bright, warm, powdery, green, sweet, etc.
  intensity TEXT CHECK (intensity IN ('light', 'medium', 'strong', 'powerful')),
  
  -- Pairing Suggestions
  pairs_well_with TEXT[] DEFAULT '{}', -- Other note names
  avoid_with TEXT[] DEFAULT '{}', -- Notes that clash
  
  -- Sourcing
  natural_source TEXT, -- e.g., "Rose petals", "Sandalwood tree"
  common_forms TEXT[] DEFAULT '{}', -- absolute, essential oil, synthetic, etc.
  
  -- Usage Stats (for popularity sorting)
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scent_notes_type ON public.scent_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_scent_notes_family ON public.scent_notes(scent_family);
CREATE INDEX IF NOT EXISTS idx_scent_notes_name ON public.scent_notes(name);
CREATE INDEX IF NOT EXISTS idx_scent_notes_search ON public.scent_notes USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: SEED COMMON SCENT NOTES
-- ═══════════════════════════════════════════════════════════════════════════════

-- TOP NOTES (First impression, 15-30 minutes)
INSERT INTO public.scent_notes (name, note_type, scent_family, description, character_tags, intensity, natural_source, pairs_well_with) VALUES
-- Citrus
('Bergamot', 'top', 'citrus', 'Bright, slightly floral citrus with tea-like undertones', ARRAY['bright', 'fresh', 'sparkling', 'tea-like'], 'medium', 'Bergamot orange peel', ARRAY['Neroli', 'Jasmine', 'Lavender', 'Vetiver']),
('Lemon', 'top', 'citrus', 'Clean, sharp citrus with zesty freshness', ARRAY['clean', 'sharp', 'zesty', 'bright'], 'strong', 'Lemon peel', ARRAY['Ginger', 'Basil', 'Rose', 'Verbena']),
('Orange', 'top', 'citrus', 'Sweet, juicy citrus with sunny warmth', ARRAY['sweet', 'juicy', 'sunny', 'cheerful'], 'medium', 'Orange peel', ARRAY['Cinnamon', 'Clove', 'Neroli', 'Vanilla']),
('Grapefruit', 'top', 'citrus', 'Tangy, slightly bitter citrus with pink freshness', ARRAY['tangy', 'bitter', 'pink', 'fresh'], 'strong', 'Grapefruit peel', ARRAY['Blackcurrant', 'Rose', 'Mint', 'Juniper']),
('Lime', 'top', 'citrus', 'Sharp, green citrus with tropical edge', ARRAY['sharp', 'green', 'tropical', 'tart'], 'strong', 'Lime peel', ARRAY['Coconut', 'Basil', 'Ginger', 'Vetiver']),
('Mandarin', 'top', 'citrus', 'Sweet, soft citrus with honeyed warmth', ARRAY['sweet', 'soft', 'honeyed', 'gentle'], 'light', 'Mandarin peel', ARRAY['Neroli', 'Petitgrain', 'Jasmine', 'Amber']),
('Yuzu', 'top', 'citrus', 'Tart, aromatic Japanese citrus with herbal notes', ARRAY['tart', 'aromatic', 'herbal', 'unique'], 'medium', 'Yuzu fruit', ARRAY['Green Tea', 'Hinoki', 'Shiso', 'Ginger']),
('Petitgrain', 'top', 'citrus', 'Green, woody citrus from bitter orange leaves', ARRAY['green', 'woody', 'bitter', 'fresh'], 'medium', 'Bitter orange leaves', ARRAY['Neroli', 'Lavender', 'Rosemary', 'Geranium']),

-- Fresh/Aromatic
('Pink Pepper', 'top', 'spice', 'Bright, peppery spice with fruity undertones', ARRAY['bright', 'peppery', 'fruity', 'sparkling'], 'medium', 'Pink peppercorn', ARRAY['Rose', 'Saffron', 'Oud', 'Musk']),
('Cardamom', 'top', 'spice', 'Warm, aromatic spice with eucalyptus hints', ARRAY['warm', 'aromatic', 'spicy', 'fresh'], 'medium', 'Cardamom pods', ARRAY['Coffee', 'Rose', 'Oud', 'Vanilla']),
('Ginger', 'top', 'spice', 'Warm, zesty spice with citrus brightness', ARRAY['warm', 'zesty', 'spicy', 'bright'], 'strong', 'Ginger root', ARRAY['Lemon', 'Orange', 'Vetiver', 'Sandalwood']),
('Saffron', 'top', 'spice', 'Rich, honeyed spice with leathery depth', ARRAY['rich', 'honeyed', 'leathery', 'exotic'], 'strong', 'Saffron threads', ARRAY['Rose', 'Oud', 'Amber', 'Leather']),

-- Green/Herbal
('Basil', 'top', 'aromatic', 'Fresh, herbal green with anise hints', ARRAY['fresh', 'herbal', 'green', 'anise'], 'medium', 'Basil leaves', ARRAY['Lime', 'Bergamot', 'Mint', 'Verbena']),
('Mint', 'top', 'aromatic', 'Cool, refreshing green with menthol clarity', ARRAY['cool', 'refreshing', 'menthol', 'clean'], 'strong', 'Mint leaves', ARRAY['Grapefruit', 'Lavender', 'Rose', 'Vetiver']),
('Green Tea', 'top', 'aromatic', 'Light, clean green with subtle earthiness', ARRAY['light', 'clean', 'green', 'earthy'], 'light', 'Tea leaves', ARRAY['Yuzu', 'Bamboo', 'Jasmine', 'Musk'])

ON CONFLICT (name) DO NOTHING;

-- HEART NOTES (The soul, 30 min - 4 hours)
INSERT INTO public.scent_notes (name, note_type, scent_family, description, character_tags, intensity, natural_source, pairs_well_with) VALUES
-- Floral
('Rose', 'heart', 'floral', 'Classic, romantic floral with honeyed depth', ARRAY['romantic', 'honeyed', 'classic', 'feminine'], 'medium', 'Rose petals', ARRAY['Oud', 'Saffron', 'Patchouli', 'Musk']),
('Jasmine', 'heart', 'floral', 'Intoxicating white floral with indolic richness', ARRAY['intoxicating', 'white', 'indolic', 'sensual'], 'strong', 'Jasmine flowers', ARRAY['Sandalwood', 'Vanilla', 'Bergamot', 'Tuberose']),
('Neroli', 'heart', 'floral', 'Fresh orange blossom with green honeyed facets', ARRAY['fresh', 'honeyed', 'green', 'elegant'], 'medium', 'Orange blossoms', ARRAY['Bergamot', 'Petitgrain', 'Musk', 'Amber']),
('Tuberose', 'heart', 'floral', 'Creamy, narcotic white floral with buttery richness', ARRAY['creamy', 'narcotic', 'buttery', 'opulent'], 'powerful', 'Tuberose flowers', ARRAY['Jasmine', 'Gardenia', 'Coconut', 'Sandalwood']),
('Ylang Ylang', 'heart', 'floral', 'Tropical, sweet floral with banana-like facets', ARRAY['tropical', 'sweet', 'banana', 'exotic'], 'strong', 'Ylang ylang flowers', ARRAY['Jasmine', 'Sandalwood', 'Vetiver', 'Coconut']),
('Iris', 'heart', 'floral', 'Powdery, violet-like floral with carrot-like earthiness', ARRAY['powdery', 'violet', 'earthy', 'elegant'], 'medium', 'Iris root (orris)', ARRAY['Violet', 'Cedar', 'Musk', 'Bergamot']),
('Violet', 'heart', 'floral', 'Sweet, powdery floral with green leaf undertones', ARRAY['sweet', 'powdery', 'green', 'nostalgic'], 'light', 'Violet flowers', ARRAY['Iris', 'Rose', 'Musk', 'Heliotrope']),
('Orange Blossom', 'heart', 'floral', 'Sweet, honeyed floral with waxy green notes', ARRAY['sweet', 'honeyed', 'waxy', 'bridal'], 'medium', 'Orange blossoms', ARRAY['Neroli', 'Jasmine', 'Musk', 'Sandalwood']),
('Gardenia', 'heart', 'floral', 'Creamy, tropical white floral with coconut hints', ARRAY['creamy', 'tropical', 'coconut', 'lush'], 'strong', 'Gardenia flowers', ARRAY['Tuberose', 'Jasmine', 'Coconut', 'Vanilla']),
('Lily of the Valley', 'heart', 'floral', 'Fresh, green floral with dewy innocence', ARRAY['fresh', 'green', 'dewy', 'innocent'], 'light', 'Lily flowers', ARRAY['Rose', 'Jasmine', 'Musk', 'Green notes']),
('Peony', 'heart', 'floral', 'Fresh, rosy floral with watermelon hints', ARRAY['fresh', 'rosy', 'watermelon', 'feminine'], 'light', 'Peony petals', ARRAY['Rose', 'Freesia', 'Musk', 'Amber']),
('Magnolia', 'heart', 'floral', 'Creamy, citrusy floral with champagne brightness', ARRAY['creamy', 'citrusy', 'champagne', 'elegant'], 'medium', 'Magnolia flowers', ARRAY['Bergamot', 'Jasmine', 'Sandalwood', 'Musk']),

-- Spice/Warm
('Cinnamon', 'heart', 'spice', 'Warm, sweet spice with powdery warmth', ARRAY['warm', 'sweet', 'powdery', 'cozy'], 'strong', 'Cinnamon bark', ARRAY['Orange', 'Vanilla', 'Clove', 'Amber']),
('Clove', 'heart', 'spice', 'Warm, spicy note with eugenol sharpness', ARRAY['warm', 'spicy', 'sharp', 'festive'], 'strong', 'Clove buds', ARRAY['Orange', 'Cinnamon', 'Rose', 'Carnation']),
('Nutmeg', 'heart', 'spice', 'Warm, nutty spice with sweet depth', ARRAY['warm', 'nutty', 'sweet', 'comforting'], 'medium', 'Nutmeg seeds', ARRAY['Cinnamon', 'Orange', 'Vanilla', 'Cedar']),

-- Aromatic
('Lavender', 'heart', 'aromatic', 'Herbal, floral aromatic with calming freshness', ARRAY['herbal', 'calming', 'fresh', 'clean'], 'medium', 'Lavender flowers', ARRAY['Bergamot', 'Vanilla', 'Tonka', 'Musk']),
('Geranium', 'heart', 'aromatic', 'Rosy, green aromatic with minty facets', ARRAY['rosy', 'green', 'minty', 'fresh'], 'medium', 'Geranium leaves', ARRAY['Rose', 'Bergamot', 'Mint', 'Patchouli']),
('Rosemary', 'heart', 'aromatic', 'Herbal, camphoraceous aromatic with pine hints', ARRAY['herbal', 'camphoraceous', 'pine', 'clean'], 'strong', 'Rosemary leaves', ARRAY['Lavender', 'Bergamot', 'Cedar', 'Juniper'])

ON CONFLICT (name) DO NOTHING;

-- BASE NOTES (Foundation, 4+ hours)
INSERT INTO public.scent_notes (name, note_type, scent_family, description, character_tags, intensity, natural_source, pairs_well_with) VALUES
-- Woody
('Sandalwood', 'base', 'woody', 'Creamy, milky wood with soft warmth', ARRAY['creamy', 'milky', 'soft', 'meditative'], 'medium', 'Sandalwood tree', ARRAY['Rose', 'Jasmine', 'Vanilla', 'Oud']),
('Cedar', 'base', 'woody', 'Dry, pencil-like wood with aromatic sharpness', ARRAY['dry', 'pencil', 'aromatic', 'clean'], 'medium', 'Cedar tree', ARRAY['Bergamot', 'Lavender', 'Vetiver', 'Iris']),
('Vetiver', 'base', 'woody', 'Earthy, smoky root with green complexity', ARRAY['earthy', 'smoky', 'green', 'grounding'], 'strong', 'Vetiver grass roots', ARRAY['Bergamot', 'Grapefruit', 'Rose', 'Oud']),
('Patchouli', 'base', 'woody', 'Earthy, sweet wood with chocolate undertones', ARRAY['earthy', 'sweet', 'chocolate', 'hippie'], 'strong', 'Patchouli leaves', ARRAY['Rose', 'Vanilla', 'Bergamot', 'Oud']),
('Oud', 'base', 'woody', 'Complex, animalic wood with medicinal depth', ARRAY['complex', 'animalic', 'medicinal', 'precious'], 'powerful', 'Agarwood tree', ARRAY['Rose', 'Saffron', 'Amber', 'Sandalwood']),
('Guaiac Wood', 'base', 'woody', 'Smoky, tea-like wood with vanilla hints', ARRAY['smoky', 'tea-like', 'vanilla', 'soft'], 'medium', 'Guaiacum tree', ARRAY['Vetiver', 'Iris', 'Rose', 'Violet']),
('Hinoki', 'base', 'woody', 'Clean, citrusy Japanese cypress with spa quality', ARRAY['clean', 'citrusy', 'spa', 'zen'], 'medium', 'Japanese cypress', ARRAY['Yuzu', 'Green Tea', 'Bamboo', 'Musk']),

-- Amber/Resinous  
('Amber', 'base', 'amber', 'Warm, resinous sweetness with vanillic depth', ARRAY['warm', 'resinous', 'sweet', 'cozy'], 'medium', 'Labdanum and benzoin blend', ARRAY['Vanilla', 'Sandalwood', 'Rose', 'Oud']),
('Benzoin', 'base', 'amber', 'Sweet, balsamic resin with vanilla warmth', ARRAY['sweet', 'balsamic', 'vanilla', 'cozy'], 'medium', 'Styrax tree resin', ARRAY['Vanilla', 'Amber', 'Cinnamon', 'Frankincense']),
('Frankincense', 'base', 'amber', 'Sacred, lemony resin with incense smoke', ARRAY['sacred', 'lemony', 'smoky', 'spiritual'], 'medium', 'Boswellia tree resin', ARRAY['Myrrh', 'Rose', 'Sandalwood', 'Oud']),
('Myrrh', 'base', 'amber', 'Warm, balsamic resin with medicinal depth', ARRAY['warm', 'balsamic', 'medicinal', 'ancient'], 'medium', 'Commiphora tree resin', ARRAY['Frankincense', 'Oud', 'Rose', 'Amber']),
('Labdanum', 'base', 'amber', 'Rich, leathery resin with animalic warmth', ARRAY['rich', 'leathery', 'animalic', 'mysterious'], 'strong', 'Cistus shrub', ARRAY['Amber', 'Oud', 'Rose', 'Vanilla']),

-- Musk/Animalic
('Musk', 'base', 'musk', 'Clean, skin-like warmth with sensual depth', ARRAY['clean', 'skin-like', 'sensual', 'intimate'], 'light', 'Synthetic (originally musk deer)', ARRAY['Rose', 'Jasmine', 'Sandalwood', 'Vanilla']),
('White Musk', 'base', 'musk', 'Clean, powdery musk with laundry freshness', ARRAY['clean', 'powdery', 'fresh', 'soft'], 'light', 'Synthetic', ARRAY['Iris', 'Lily', 'Cotton', 'Aldehydes']),
('Ambrette', 'base', 'musk', 'Musky seed with wine-like, floral facets', ARRAY['musky', 'wine-like', 'floral', 'natural'], 'medium', 'Ambrette seeds', ARRAY['Rose', 'Oud', 'Sandalwood', 'Bergamot']),

-- Gourmand
('Vanilla', 'base', 'gourmand', 'Sweet, creamy warmth with balsamic depth', ARRAY['sweet', 'creamy', 'warm', 'comforting'], 'medium', 'Vanilla beans', ARRAY['Sandalwood', 'Tonka', 'Amber', 'Musk']),
('Tonka Bean', 'base', 'gourmand', 'Sweet, almond-like warmth with hay facets', ARRAY['sweet', 'almond', 'hay', 'cozy'], 'medium', 'Tonka beans', ARRAY['Vanilla', 'Lavender', 'Tobacco', 'Amber']),
('Coffee', 'base', 'gourmand', 'Rich, roasted warmth with bitter edge', ARRAY['rich', 'roasted', 'bitter', 'energizing'], 'strong', 'Coffee beans', ARRAY['Cardamom', 'Vanilla', 'Oud', 'Tobacco']),
('Cocoa', 'base', 'gourmand', 'Rich, bittersweet chocolate warmth', ARRAY['rich', 'bittersweet', 'chocolate', 'indulgent'], 'medium', 'Cocoa beans', ARRAY['Vanilla', 'Orange', 'Patchouli', 'Coffee']),

-- Leather/Animalic
('Leather', 'base', 'leather', 'Smoky, animalic warmth with birch tar depth', ARRAY['smoky', 'animalic', 'masculine', 'sophisticated'], 'strong', 'Birch tar and synthetics', ARRAY['Oud', 'Tobacco', 'Iris', 'Saffron']),
('Tobacco', 'base', 'leather', 'Sweet, dried leaf warmth with honey facets', ARRAY['sweet', 'dried', 'honey', 'sophisticated'], 'medium', 'Tobacco leaves', ARRAY['Vanilla', 'Tonka', 'Leather', 'Oud']),
('Castoreum', 'base', 'leather', 'Leathery, animalic warmth with birch hints', ARRAY['leathery', 'animalic', 'birch', 'complex'], 'strong', 'Beaver (now synthetic)', ARRAY['Leather', 'Oud', 'Labdanum', 'Birch'])

ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: ENHANCE PRODUCT_FORMULATIONS TABLE
-- Add fragrance-specific fields
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add fragrance profile fields to product_formulations
ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS scent_profile JSONB DEFAULT '{}'::jsonb;
-- Structure: { "top": ["Bergamot", "Pink Pepper"], "heart": ["Rose", "Jasmine"], "base": ["Sandalwood", "Musk"] }

ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS concentration_type TEXT CHECK (concentration_type IN (
  'parfum',          -- 20-30% concentration
  'eau_de_parfum',   -- 15-20% concentration  
  'eau_de_toilette', -- 5-15% concentration
  'eau_de_cologne',  -- 2-4% concentration
  'eau_fraiche',     -- 1-3% concentration
  'perfume_oil',     -- 15-30% in carrier oil
  'attar',           -- Traditional oil-based
  'solid_perfume',   -- Wax-based
  'body_mist'        -- 1-3% concentration
));

ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS concentration_percent DECIMAL(5, 2);

ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS base_carrier TEXT CHECK (base_carrier IN (
  'alcohol',           -- Perfumer's alcohol
  'fractionated_coconut', -- MCT oil
  'jojoba',            -- Jojoba oil
  'sweet_almond',      -- Sweet almond oil
  'argan',             -- Argan oil
  'squalane',          -- Squalane
  'sandalwood_oil',    -- Traditional attar base
  'dpg',               -- Dipropylene glycol
  'custom'             -- Custom carrier blend
));

-- Performance characteristics
ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS longevity TEXT CHECK (longevity IN (
  'fleeting',    -- < 2 hours
  'moderate',    -- 2-4 hours
  'long_lasting', -- 4-8 hours
  'very_long',   -- 8-12 hours
  'extreme'      -- 12+ hours
));

ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS sillage TEXT CHECK (sillage IN (
  'intimate',    -- Skin scent
  'moderate',    -- Arm's length
  'strong',      -- Room-filling
  'enormous'     -- Announces your presence
));

ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS season_suitability TEXT[] DEFAULT '{}';
-- Values: spring, summer, fall, winter, all_season

ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS occasion_suitability TEXT[] DEFAULT '{}';
-- Values: daily, office, evening, special_occasion, romantic, casual, formal

-- Scent characteristics
ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS scent_family TEXT; -- Oriental, Woody, Floral, Fresh, etc.

ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS scent_style TEXT; -- Classic, Modern, Niche, Natural, etc.

-- Skincare-specific fields
ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS skin_types TEXT[] DEFAULT '{}';
-- Values: normal, dry, oily, combination, sensitive, mature

ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS skin_concerns TEXT[] DEFAULT '{}';
-- Values: acne, aging, dryness, dullness, hyperpigmentation, sensitivity, etc.

ALTER TABLE public.product_formulations 
ADD COLUMN IF NOT EXISTS active_ingredients JSONB DEFAULT '[]'::jsonb;
-- Structure: [{ "name": "Vitamin C", "concentration": "15%", "form": "L-Ascorbic Acid" }]

-- Index for scent profile search
CREATE INDEX IF NOT EXISTS idx_product_formulations_scent ON public.product_formulations USING GIN(scent_profile);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: RLS FOR SCENT NOTES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Scent notes are public/read-only for all authenticated users
ALTER TABLE public.scent_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scent_notes_select_authenticated" ON public.scent_notes
  FOR SELECT TO authenticated USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.scent_notes IS 'Library of fragrance notes for autocomplete and formulation building';
COMMENT ON COLUMN public.product_formulations.scent_profile IS 'JSON object with top, heart, and base note arrays';
COMMENT ON COLUMN public.product_formulations.concentration_type IS 'Type of fragrance concentration (EDP, EDT, etc.)';
