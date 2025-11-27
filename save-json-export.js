#!/usr/bin/env node
/**
 * Quick script to save copied JSON from Supabase SQL Editor
 * 
 * Usage:
 * 1. Copy JSON from Supabase SQL Editor
 * 2. Run: node save-json-export.js
 * 3. Paste the JSON when prompted
 * 4. Enter filename when prompted
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📋 Paste your JSON from Supabase SQL Editor:');
console.log('(Press Ctrl+D or Ctrl+Z when done, or type "END" on a new line)\n');

let jsonInput = '';
let lines = [];

rl.on('line', (line) => {
  if (line.trim() === 'END') {
    rl.close();
  } else {
    lines.push(line);
  }
});

rl.on('close', () => {
  jsonInput = lines.join('\n');
  
  // Try to parse and format the JSON
  try {
    // If it's already valid JSON, parse and reformat
    const parsed = JSON.parse(jsonInput);
    const formatted = JSON.stringify(parsed, null, 2);
    
    // Ask for filename
    const filename = process.argv[2] || 'export.json';
    const filepath = path.join(process.cwd(), filename);
    
    fs.writeFileSync(filepath, formatted, 'utf8');
    
    console.log(`\n✅ Saved to: ${filepath}`);
    console.log(`📊 Records: ${Array.isArray(parsed) ? parsed.length : 1}`);
  } catch (error) {
    // If it's not valid JSON, save as-is (might be SQL result format)
    const filename = process.argv[2] || 'export-raw.txt';
    const filepath = path.join(process.cwd(), filename);
    
    fs.writeFileSync(filepath, jsonInput, 'utf8');
    
    console.log(`\n⚠️  Could not parse as JSON. Saved as raw text to: ${filepath}`);
    console.log(`💡 You may need to clean up the format manually.`);
  }
  
  process.exit(0);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n❌ Cancelled');
  process.exit(0);
});

