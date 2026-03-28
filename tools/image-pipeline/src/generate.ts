#!/usr/bin/env npx ts-node
/**
 * Madison Image Pipeline - CLI Entry Point
 *
 * Standalone image generation tool extracted from Madison Studio.
 * Specializes in hero images and single product images.
 *
 * Usage:
 *   npx tsx src/generate.ts --prompt "..." [options]
 *   npx tsx src/generate.ts --batch batch.json
 *
 * Examples:
 *   # Simple hero image
 *   npx tsx src/generate.ts \
 *     --prompt "Luxury perfume bottle on marble surface, golden hour" \
 *     --type hero_banner_standard \
 *     --aspect "2:1" \
 *     --model seedream-4
 *
 *   # Product shot with visual squad
 *   npx tsx src/generate.ts \
 *     --prompt "Clean product shot on white background" \
 *     --squad THE_MINIMALISTS \
 *     --aspect "1:1" \
 *     --model mystic
 *
 *   # Batch mode with Google Drive output
 *   npx tsx src/generate.ts --batch batch.json --drive
 */

import * as fs from 'fs';
import * as path from 'path';
import { buildPrompt, type GenerationRequest } from './promptBuilder.js';
import { generateImage, setApiKey, type FreepikImageModel } from './freepikProvider.js';
import { type VisualSquad } from './visualMasters.js';
import { uploadUrlToGoogleDrive, type ImageMetadata } from './googleDrive.js';

// ============================================
// CLI ARGUMENT PARSING
// ============================================

interface CliArgs {
  prompt?: string;
  type?: string;
  squad?: VisualSquad;
  aspect?: string;
  model?: FreepikImageModel;
  resolution?: '1k' | '2k' | '4k';
  camera?: string;
  lighting?: string;
  environment?: string;
  product?: string;  // JSON string or path to JSON file
  brand?: string;    // JSON string or path to JSON file
  output?: string;   // Output directory (default: ./output)
  batch?: string;    // Path to batch JSON file
  drive?: boolean;   // Upload to Google Drive
  client?: string;   // Client name (for naming/Drive)
  dryRun?: boolean;  // Just print the prompt, don't generate
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    switch (arg) {
      case '--prompt': case '-p': args.prompt = next; i++; break;
      case '--type': case '-t': args.type = next; i++; break;
      case '--squad': case '-s': args.squad = next as VisualSquad; i++; break;
      case '--aspect': case '-a': args.aspect = next; i++; break;
      case '--model': case '-m': args.model = next as FreepikImageModel; i++; break;
      case '--resolution': case '-r': args.resolution = next as any; i++; break;
      case '--camera': args.camera = next; i++; break;
      case '--lighting': args.lighting = next; i++; break;
      case '--environment': args.environment = next; i++; break;
      case '--product': args.product = next; i++; break;
      case '--brand': args.brand = next; i++; break;
      case '--output': case '-o': args.output = next; i++; break;
      case '--batch': case '-b': args.batch = next; i++; break;
      case '--drive': args.drive = true; break;
      case '--client': case '-c': args.client = next; i++; break;
      case '--dry-run': args.dryRun = true; break;
      case '--help': case '-h': printHelp(); process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Madison Image Pipeline - Hero & Product Image Generator

USAGE:
  npx tsx src/generate.ts --prompt "..." [options]
  npx tsx src/generate.ts --batch batch.json [--drive]

OPTIONS:
  --prompt, -p     Image description / creative brief
  --type, -t       Image type (product_hero, hero_banner_standard, instagram_feed, etc.)
  --squad, -s      Visual squad (THE_MINIMALISTS, THE_STORYTELLERS, THE_DISRUPTORS)
  --aspect, -a     Aspect ratio (1:1, 16:9, 9:16, 2:1, 4:5, etc.)
  --model, -m      Freepik model (seedream-4, flux-pro-v1-1, mystic, hyperflux, flux-dev)
  --resolution, -r Resolution (1k, 2k, 4k)
  --camera         Pro mode camera (e.g., PROFESSIONAL.DSLR_SHALLOW)
  --lighting       Pro mode lighting (e.g., NATURAL.GOLDEN_HOUR)
  --environment    Pro mode environment (e.g., SURFACES.MARBLE)
  --product        Product data JSON string or path to .json file
  --brand          Brand context JSON string or path to .json file
  --output, -o     Output directory (default: ./output)
  --batch, -b      Path to batch JSON file
  --drive          Upload results to Google Drive
  --client, -c     Client name (for file naming and Drive folders)
  --dry-run        Print the prompt without generating

VISUAL SQUADS:
  THE_MINIMALISTS   Clean, clinical, product as hero (Avedon style)
  THE_STORYTELLERS   Lifestyle, warm, environmental (Leibovitz style)
  THE_DISRUPTORS     Bold, scroll-stopping, high contrast (Richardson/Anderson style)

IMAGE TYPES:
  product_hero, product_detail, product_lifestyle
  hero_banner_standard, hero_banner_wide, hero_banner_16x9
  instagram_feed, instagram_story, facebook_ad, pinterest_pin
  shopify_product, etsy_listing, amazon_main

EXAMPLES:
  # Hero image for website
  npx tsx src/generate.ts \\
    -p "Luxury fragrance bottle floating in golden mist" \\
    -t hero_banner_standard -a "2:1" -m seedream-4

  # E-commerce product shot
  npx tsx src/generate.ts \\
    -p "Clean product shot, white background" \\
    -s THE_MINIMALISTS -a "1:1" -m mystic

  # Batch with Google Drive
  npx tsx src/generate.ts -b jobs/client-batch.json --drive
`);
}

// ============================================
// HELPERS
// ============================================

function loadJsonArg(value: string | undefined): any {
  if (!value) return undefined;
  if (value.startsWith('{')) return JSON.parse(value);
  if (fs.existsSync(value)) return JSON.parse(fs.readFileSync(value, 'utf-8'));
  return undefined;
}

async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

// ============================================
// SINGLE GENERATION
// ============================================

async function generateSingle(args: CliArgs, index = 1): Promise<void> {
  if (!args.prompt) {
    console.error('Error: --prompt is required');
    process.exit(1);
  }

  // Build the generation request
  const request: GenerationRequest = {
    prompt: args.prompt,
    imageType: args.type,
    visualSquad: args.squad,
    aspectRatio: args.aspect || '1:1',
    proMode: (args.camera || args.lighting || args.environment)
      ? { camera: args.camera, lighting: args.lighting, environment: args.environment }
      : undefined,
    product: loadJsonArg(args.product),
    brand: loadJsonArg(args.brand),
  };

  // Build the prompt
  const built = buildPrompt(request);

  console.log(`\n--- Generation #${index} ---`);
  console.log(`Squad: ${built.visualSquad} / Master: ${built.visualMaster}`);
  console.log(`Aspect: ${args.aspect || '1:1'} | Model: ${args.model || 'mystic'}`);

  if (args.dryRun) {
    console.log('\n=== GENERATED PROMPT ===');
    console.log(built.prompt);
    console.log('\n=== NEGATIVE PROMPT ===');
    console.log(built.negativePrompt);
    return;
  }

  // Generate with Freepik
  console.log('Generating...');
  const result = await generateImage({
    prompt: built.prompt,
    model: args.model || 'mystic',
    resolution: args.resolution || '2k',
    aspectRatio: args.aspect || '1:1',
    negativePrompt: built.negativePrompt,
  });

  console.log(`Done! Model: ${result.model}, Task: ${result.taskId}`);
  console.log(`URL: ${result.imageUrl}`);

  // Save locally
  const outputDir = args.output || './output';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const clientName = args.client || 'default';
  const useCase = args.type || 'product';
  const squadShort = (args.squad || built.visualSquad).replace('THE_', '').toLowerCase();
  const ar = (args.aspect || '1:1').replace(':', 'x');
  const fileName = `${clientName}_${useCase}_${squadShort}_${ar}_${String(index).padStart(3, '0')}.png`;
  const filePath = path.join(outputDir, fileName);

  await downloadImage(result.imageUrl, filePath);
  console.log(`Saved: ${filePath}`);

  // Upload to Google Drive if requested
  if (args.drive) {
    console.log('Uploading to Google Drive...');
    const meta: ImageMetadata = {
      clientName,
      useCase,
      squad: squadShort,
      aspectRatio: args.aspect || '1:1',
      index,
    };
    const driveResult = await uploadUrlToGoogleDrive(result.imageUrl, meta);
    console.log(`Drive: ${driveResult.folderPath}/${driveResult.fileName}`);
    if (driveResult.webViewLink) console.log(`Link: ${driveResult.webViewLink}`);
  }
}

// ============================================
// BATCH GENERATION
// ============================================

interface BatchJob {
  prompt: string;
  type?: string;
  squad?: VisualSquad;
  aspect?: string;
  model?: FreepikImageModel;
  resolution?: '1k' | '2k' | '4k';
  camera?: string;
  lighting?: string;
  environment?: string;
  product?: any;
  brand?: any;
  client?: string;
}

async function generateBatch(batchPath: string, args: CliArgs): Promise<void> {
  if (!fs.existsSync(batchPath)) {
    console.error(`Batch file not found: ${batchPath}`);
    process.exit(1);
  }

  const jobs: BatchJob[] = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));
  console.log(`\nBatch: ${jobs.length} images to generate\n`);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    await generateSingle({
      ...args,
      prompt: job.prompt,
      type: job.type || args.type,
      squad: job.squad || args.squad,
      aspect: job.aspect || args.aspect,
      model: job.model || args.model,
      resolution: job.resolution || args.resolution,
      camera: job.camera || args.camera,
      lighting: job.lighting || args.lighting,
      environment: job.environment || args.environment,
      product: job.product ? JSON.stringify(job.product) : args.product,
      brand: job.brand ? JSON.stringify(job.brand) : args.brand,
      client: job.client || args.client,
    }, i + 1);

    // Small delay between requests to be kind to the API
    if (i < jobs.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\nBatch complete! ${jobs.length} images generated.`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = parseArgs();

  // Load API key
  if (!process.env.FREEPIK_API_KEY) {
    // Try loading from .env file
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const [key, ...valueParts] = line.split('=');
        if (key?.trim() === 'FREEPIK_API_KEY') {
          setApiKey(valueParts.join('=').trim().replace(/^["']|["']$/g, ''));
        }
      }
    }
  }

  if (args.batch) {
    await generateBatch(args.batch, args);
  } else {
    await generateSingle(args);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
