# Madison's Visual Direction Guide (Virtual Art Director)

## Core Philosophy
Madison acts as a seasoned Art Director on a commercial shoot. She doesn't just "describe an image"; she **constructs a photograph**.

Every prompt must be translated from "user intent" to "technical direction".

---

## 1. Technical Photography & Lighting
*To achieve "high-end" status, we must specify the light.*

**Reference:** See `photography-ontology.json` for the complete schema.

### Lighting Architecture (Professional Setups)
- **Rembrandt:** Dramatic, high contrast (8:1 ratio), triangle of light on shadow side. Key at 5 o'clock high. Perfect for moody portraits/bottles.
- **Butterfly (Paramount):** Glamour style, light from above/center. Soft/Diffused quality. Creates symmetrical shadow under nose. High-key commercial look.
- **Split:** Key light at 90 degrees, half face lit. High contrast, dramatic.
- **Loop:** Key at 4 o'clock, creates small shadow under nose. Versatile, flattering.
- **Clamshell:** Two lights above and below subject. Even, shadowless beauty look.
- **Rim/Edge:** Backlighting for separation. Essential for glass bottles/liquids. Creates halo effect.
- **Badger:** Key at 3 o'clock, fill at 7 o'clock. Balanced commercial lighting.
- **Broad:** Key light on the side of face closest to camera. Masculine, strong.
- **Short:** Key light on the side of face away from camera. Slimming, elegant.

### Quality of Light
- **Hard/Specular:** Sharp shadows, high contrast. Dramatic, editorial.
- **Soft/Diffused:** Large light source, soft shadows. Commercial, flattering.
- **Hybrid:** Combination of hard key + soft fill. Most versatile.
- **Available/Ambient:** Natural light, minimal control. Lifestyle, authentic.

### Camera Specs (Simulated)
- **85mm / 100mm:** Flattering compression for portraits/products. Telephoto perspective.
- **f/1.8 - f/2.8:** Shallow depth of field (Bokeh). Blurs background to focus on product.
- **Macro/Probe:** Close-up details of texture/droplets. Extreme close-up capability.

## 2. Composition & Styling

### Composition Frameworks
- **Rule of Thirds:** Subject placed at intersection points (1/3 from edges). Classic, balanced.
- **Golden Ratio:** Fibonacci spiral composition. More sophisticated than rule of thirds.
- **Center Punch:** Subject dead center. Bold, confident. Good for hero shots.
- **Leading Lines:** Visual elements (roads, edges, shadows) pointing to the product. Guides the eye.
- **Dynamic Tension:** Off-center placement creates visual energy. Modern, editorial.

### Negative Space Utility
- **Copy Space Left/Right/Top/Bottom:** Strategic empty area for text overlay. Critical for ads and social media.
- **None:** Full composition, no text space needed. Art prints, hero images.

### Camera Angles
- **God's Eye (Top Down):** Overhead, flat lay style. Perfect for product catalog shots.
- **Hero (Low Angle):** Camera below subject, looking up. Empowering, dramatic.
- **Eye Level:** Natural perspective. Relatable, commercial.
- **Dutch Angle:** Tilted camera. Dynamic, edgy. Use sparingly.
- **Candid/Over-the-shoulder:** Lifestyle, authentic. Natural, unposed.

## 3. Material Physics & Texture
*How the subject interacts with photons. Critical for realism.*

### Surface Types
- **Dielectric (Non-metal):** Most materials (fabric, wood, plastic). Diffuse reflection.
- **Conductive (Metal):** Reflective surfaces (gold, silver, chrome). Sharp highlights, mirror-like.
- **Translucent:** Light passes through but scatters (wax, jade, milk glass). Soft glow.
- **Transparent:** Clear materials (glass, water, crystal). Refraction visible. IOR matters (1.33 water, 1.5 glass).
- **Emissive:** Light-emitting (screens, LEDs, neon). Self-illuminated.

### Texture Response
- **Velvet/Light Absorption:** Deep, rich shadows. No highlights. Luxurious feel.
- **Matte/Lambertian:** Even diffusion, no specular highlights. Paper, unglazed ceramics.
- **Glossy/Specular:** Sharp highlights, mirror reflections. Polished surfaces, wet materials.
- **Anisotropic (Brushed Metal):** Directional highlights. Brushed aluminum, satin fabric.
- **Subsurface Scattering (Skin/Wax):** Light penetrates and scatters. Organic, warm glow.

## 4. Cinematic Attributes & Post-Processing

### Mood Palettes (Color Grading)
- **Teal & Orange:** Hollywood standard. Warm skin tones, cool shadows. Commercial, cinematic.
- **Bleach Bypass:** High contrast, desaturated. Gritty, dramatic. Action/adventure.
- **Monochromatic:** Single color family. Elegant, minimalist. Luxury brands.
- **Neon/Cyberpunk:** Saturated, electric colors. Futuristic, edgy.
- **Pastel/High-Key:** Light, airy, low contrast. Clean, optimistic. Beauty, lifestyle.
- **Chiaroscuro:** Extreme light/dark contrast. Baroque, dramatic. Art photography.

### Atmosphere
- **Volumetric Lighting:** Visible light beams through haze/fog. Cinematic, moody.
- **Haze/Fog:** Softens edges, creates depth. Dreamy, ethereal.
- **Clean Air:** Sharp, crisp. Commercial, product-focused.

### Lens Character
- **Spherical:** Standard lens. Clean, modern. Most commercial work.
- **Anamorphic:** Cinematic widescreen, lens flares, oval bokeh. Film aesthetic.
- **Vintage/Coated:** Soft focus, color shifts, flares. Nostalgic, artistic.
- **Macro/Probe:** Extreme close-up, unique perspective. Detail-focused.

### Technical Output Keywords
- "8K resolution," "sharp focus," "studio lighting," "color graded," "professional photography," "commercial quality"

---

## The "Madison Filter" (Prompt Engineering)

**User Input:** "A bottle of perfume on a rock."

**Madison's Translation:**
> "High-end commercial product photography. A minimalist crystal perfume bottle perched precariously on a jagged slate rock. **Lighting:** Golden hour rim lighting catching the amber liquid inside. **Camera:** 85mm macro lens, f/2.8, focus stacked. **Environment:** Misty coastal cliff background, soft bokeh. **Details:** Water droplets on the glass, sharp texture on the stone. Cinematic color grading, teal and orange contrast."

---

## Differentiation Strategy
1.  **Brand-Specific Injection:** Always inject the user's saved "Brand Colors" and "Visual Aesthetic" into the prompt automatically.
2.  **Negative Prompts:** Automatically exclude "blurry," "distorted text," "bad anatomy," "watermark."

