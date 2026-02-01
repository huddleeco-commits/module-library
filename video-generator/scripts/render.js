#!/usr/bin/env node
/**
 * Blink Video Render Script
 *
 * Renders videos from a metadata JSON file.
 *
 * Usage:
 *   node scripts/render.js <metadata-path> <output-dir>
 *
 * Example:
 *   node scripts/render.js ./input/video-metadata.json ./output
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Blink Video Render Script

Usage:
  node scripts/render.js <metadata-path> <output-dir>

Example:
  node scripts/render.js ../module-assembler-ui/output/prospects/marios-pizza/full-test/videos/video-metadata.json ./out
  `);
  process.exit(1);
}

const [metadataPath, outputDir] = args;

// Load metadata
if (!fs.existsSync(metadataPath)) {
  console.error(`Error: Metadata file not found: ${metadataPath}`);
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
console.log(`\n🎬 Blink Video Renderer`);
console.log(`   Business: ${metadata.businessName}`);
console.log(`   Industry: ${metadata.industry}`);
console.log(`   Template: ${metadata.template}`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
fs.mkdirSync(path.join(outputDir, "social"), { recursive: true });

// Escape JSON for command line
const propsJson = JSON.stringify(metadata).replace(/"/g, '\\"');

// Render main promo (30s, 1080p)
console.log(`\n📹 Rendering main promo video...`);
try {
  execSync(
    `npx remotion render BusinessPromo "${path.join(outputDir, "promo-video.mp4")}" --props="${propsJson}"`,
    { stdio: "inherit", cwd: __dirname + "/.." }
  );
  console.log(`   ✅ Main promo: ${path.join(outputDir, "promo-video.mp4")}`);
} catch (e) {
  console.error(`   ❌ Main promo failed:`, e.message);
}

// Render Instagram square (15s, 1080x1080)
console.log(`\n📹 Rendering Instagram video...`);
try {
  execSync(
    `npx remotion render SocialSquare "${path.join(outputDir, "social", "instagram.mp4")}" --props="${propsJson}"`,
    { stdio: "inherit", cwd: __dirname + "/.." }
  );
  console.log(`   ✅ Instagram: ${path.join(outputDir, "social", "instagram.mp4")}`);
} catch (e) {
  console.error(`   ❌ Instagram failed:`, e.message);
}

// Render TikTok vertical (15s, 1080x1920)
console.log(`\n📹 Rendering TikTok video...`);
try {
  execSync(
    `npx remotion render SocialVertical "${path.join(outputDir, "social", "tiktok.mp4")}" --props="${propsJson}"`,
    { stdio: "inherit", cwd: __dirname + "/.." }
  );
  console.log(`   ✅ TikTok: ${path.join(outputDir, "social", "tiktok.mp4")}`);
} catch (e) {
  console.error(`   ❌ TikTok failed:`, e.message);
}

// Render thumbnail (still from frame 30)
console.log(`\n🖼️ Rendering thumbnail...`);
try {
  execSync(
    `npx remotion still BusinessPromo "${path.join(outputDir, "thumbnail.png")}" --props="${propsJson}" --frame=30`,
    { stdio: "inherit", cwd: __dirname + "/.." }
  );
  console.log(`   ✅ Thumbnail: ${path.join(outputDir, "thumbnail.png")}`);
} catch (e) {
  console.error(`   ❌ Thumbnail failed:`, e.message);
}

console.log(`\n✨ Video rendering complete!`);
console.log(`   Output directory: ${outputDir}`);
