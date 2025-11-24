# Knowledge Base Integration Guide

This directory contains structured knowledge files that train Madison's AI models on specific domains.

## Files

### `photography-ontology.json`
**Purpose:** High-end commercial & cinematic photography schema  
**Used By:** Image Studio (Director Mode)  
**Content:** Structured JSON schema defining:
- Lighting architecture (Rembrandt, Butterfly, Rim, etc.)
- Material physics (surface types, texture response, refraction)
- Cinematic attributes (mood palettes, atmosphere, lens character)
- Composition frameworks (rule sets, negative space, camera angles)

### `madison-visual-direction.md`
**Purpose:** Virtual Art Director training manual  
**Used By:** Image Studio (all modes)  
**Content:** Markdown guide explaining:
- How to translate user intent into technical photography specs
- Professional terminology and concepts
- The "Madison Filter" prompt engineering approach

## How It Works

### 1. **Essential Mode** (Simple Workflow)
- Single product reference + user prompt
- Basic brand context injection
- Fast, simple generation

### 2. **Director Mode** (Pro Workflow)
- Multiple categorized references (Product, Background, Style)
- Pro Mode controls → Photography Ontology mapping
- Structured prompt with professional specifications
- Campaign-grade output

### Integration Points

1. **`generate-madison-image` Edge Function:**
   - Reads `photography-ontology.json` concepts
   - Maps Pro Mode controls to ontology terms
   - Builds structured prompts using `photographyOntology.ts` utility

2. **Pro Mode Controls → Ontology Mapping:**
   - User selects "Rembrandt Lighting" → Maps to `lighting_architecture.setup_name: "Rembrandt"`
   - User selects "Anamorphic Lens" → Maps to `cinematic_attributes.lens_character: "Anamorphic"`
   - User selects "Teal & Orange" → Maps to `cinematic_attributes.mood_palette: "Teal & Orange"`

## Adding New Knowledge

1. **For JSON Schemas:** Add to `photography-ontology.json` following the existing structure
2. **For Markdown Guides:** Add to `madison-visual-direction.md` or create new `.md` files
3. **Update Integration:** Modify `photographyOntology.ts` to parse and apply new concepts

## Future Enhancements

- Load knowledge files dynamically at runtime
- Allow users to upload custom photography presets
- A/B test different prompt constructions
- Track which ontology concepts produce best results
