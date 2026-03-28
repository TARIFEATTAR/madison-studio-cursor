/**
 * Google Drive Output Module
 *
 * Uploads generated images to Google Drive with organized folder structure.
 * Uses Google Drive API v3 via googleapis npm package.
 *
 * SETUP:
 * 1. Create a Google Cloud project at https://console.cloud.google.com
 * 2. Enable the Google Drive API
 * 3. Create OAuth 2.0 credentials (Desktop app type)
 * 4. Download the credentials JSON and save as credentials.json in project root
 * 5. Run `npx ts-node src/googleDrive.ts --auth` to authorize (one-time)
 *
 * FOLDER STRUCTURE:
 *   Madison Pipeline/
 *     └── {Client Name}/
 *         └── {YYYY-MM-DD}/
 *             ├── hero/
 *             │   ├── {client}_{usecase}_{squad}_{aspect}_{001}.png
 *             │   └── {client}_{usecase}_{squad}_{aspect}_{002}.png
 *             └── product/
 *                 └── {client}_{usecase}_{squad}_{aspect}_{001}.png
 */

import { google, type drive_v3 } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// ============================================
// AUTH
// ============================================

async function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Missing ${CREDENTIALS_PATH}. Download OAuth credentials from Google Cloud Console.`
    );
  }
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  const { installed, web } = JSON.parse(content);
  const creds = installed || web;
  return new google.auth.OAuth2(creds.client_id, creds.client_secret, creds.redirect_uris[0]);
}

async function authorize(): Promise<ReturnType<typeof google.auth.OAuth2.prototype.setCredentials> & any> {
  const oAuth2Client = await loadCredentials();

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Interactive authorization
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise<string>((resolve) => {
    rl.question('Enter the authorization code: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Token saved to', TOKEN_PATH);
  return oAuth2Client;
}

// ============================================
// FOLDER MANAGEMENT
// ============================================

async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<string> {
  // Search for existing folder
  let q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) q += ` and '${parentId}' in parents`;

  const res = await drive.files.list({ q, fields: 'files(id, name)', spaces: 'drive' });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  // Create folder
  const fileMetadata: drive_v3.Schema$File = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) fileMetadata.parents = [parentId];

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });
  return folder.data.id!;
}

// ============================================
// NAMING CONVENTION
// ============================================

export interface ImageMetadata {
  clientName: string;
  useCase: string;    // "hero", "product", "social", "editorial"
  squad: string;      // "minimalist", "storyteller", "disruptor"
  aspectRatio: string; // "1x1", "16x9", etc.
  index?: number;     // Sequential number
}

function sanitize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function buildFileName(meta: ImageMetadata, ext = 'png'): string {
  const idx = String(meta.index || 1).padStart(3, '0');
  const ar = meta.aspectRatio.replace(':', 'x');
  return `${sanitize(meta.clientName)}_${sanitize(meta.useCase)}_${sanitize(meta.squad)}_${ar}_${idx}.${ext}`;
}

export function buildFolderPath(meta: ImageMetadata): string[] {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return ['Madison Pipeline', meta.clientName, date, meta.useCase];
}

// ============================================
// UPLOAD
// ============================================

export interface UploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  folderPath: string;
}

/**
 * Upload an image buffer to Google Drive with organized folder structure
 */
export async function uploadToGoogleDrive(
  imageBuffer: Buffer,
  meta: ImageMetadata,
  mimeType = 'image/png'
): Promise<UploadResult> {
  const auth = await authorize();
  const drive = google.drive({ version: 'v3', auth });

  // Create folder hierarchy
  const folderSegments = buildFolderPath(meta);
  let parentId: string | undefined;
  for (const segment of folderSegments) {
    parentId = await findOrCreateFolder(drive, segment, parentId);
  }

  // Upload file
  const fileName = buildFileName(meta);
  const { Readable } = await import('stream');
  const stream = new Readable();
  stream.push(imageBuffer);
  stream.push(null);

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: parentId ? [parentId] : undefined,
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink',
  });

  return {
    fileId: file.data.id!,
    fileName,
    webViewLink: file.data.webViewLink || '',
    folderPath: folderSegments.join('/'),
  };
}

/**
 * Upload a file from a local path
 */
export async function uploadFileToGoogleDrive(
  filePath: string,
  meta: ImageMetadata
): Promise<UploadResult> {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  return uploadToGoogleDrive(buffer, { ...meta }, mimeType);
}

/**
 * Download an image from URL and upload to Google Drive
 */
export async function uploadUrlToGoogleDrive(
  imageUrl: string,
  meta: ImageMetadata
): Promise<UploadResult> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/png';
  return uploadToGoogleDrive(buffer, meta, contentType);
}

// ============================================
// CLI AUTH HELPER
// ============================================

// CLI auth helper — run directly with: npx tsx src/googleDrive.ts --auth
const isMainModule = process.argv[1]?.includes('googleDrive');
if (isMainModule) {
  if (process.argv.includes('--auth')) {
    authorize().then(() => {
      console.log('Google Drive authorization complete.');
    }).catch(console.error);
  } else {
    console.log('Usage: npx tsx src/googleDrive.ts --auth');
    console.log('This will authorize the app with Google Drive (one-time setup).');
  }
}
