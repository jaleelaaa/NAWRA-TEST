#!/usr/bin/env node

/**
 * Icon Generator for NAWRA PWA
 *
 * This script generates placeholder icons for the PWA until proper icons are designed.
 *
 * Usage: node scripts/generate-icons.js
 *
 * Requirements: Node.js with fs module (built-in)
 *
 * For production, replace these with professionally designed icons.
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

// Icons directory
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

/**
 * Generate SVG icon with NAWRA branding
 */
function generateSVGIcon(size) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.1}"/>

  <!-- Book Icon -->
  <g transform="translate(${size * 0.25}, ${size * 0.25})">
    <rect x="0" y="0" width="${size * 0.5}" height="${size * 0.55}" fill="white" rx="${size * 0.03}"/>
    <rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.4}" height="${size * 0.45}" fill="#e0e7ff" rx="${size * 0.02}"/>
    <line x1="${size * 0.1}" y1="${size * 0.15}" x2="${size * 0.4}" y2="${size * 0.15}" stroke="#2563eb" stroke-width="${size * 0.015}" stroke-linecap="round"/>
    <line x1="${size * 0.1}" y1="${size * 0.22}" x2="${size * 0.35}" y2="${size * 0.22}" stroke="#2563eb" stroke-width="${size * 0.015}" stroke-linecap="round"/>
    <line x1="${size * 0.1}" y1="${size * 0.29}" x2="${size * 0.4}" y2="${size * 0.29}" stroke="#2563eb" stroke-width="${size * 0.015}" stroke-linecap="round"/>
  </g>
</svg>
  `.trim();

  return svg;
}

/**
 * Convert SVG to PNG (placeholder - returns SVG for now)
 * In production, use a library like 'sharp' or 'canvas' to convert to PNG
 */
function saveSVGIcon(size) {
  const svg = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(ICONS_DIR, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Generated ${filename}`);

  // Also save as PNG placeholder (copy SVG with .png extension)
  // In production, convert to actual PNG
  const pngFilename = `icon-${size}x${size}.png`;
  const pngFilepath = path.join(ICONS_DIR, pngFilename);
  fs.writeFileSync(pngFilepath, svg);
  console.log(`✓ Generated ${pngFilename} (SVG placeholder)`);
}

/**
 * Generate all icons
 */
function generateAllIcons() {
  console.log('🎨 Generating NAWRA PWA Icons...\n');

  ICON_SIZES.forEach(size => {
    saveSVGIcon(size);
  });

  // Generate shortcut icons
  console.log('\n🔗 Generating shortcut icons...');
  saveSVGIcon(96); // For shortcuts

  // Generate badge icon
  console.log('\n🏷️  Generating badge icon...');
  const badgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
  <circle cx="36" cy="36" r="36" fill="#2563eb"/>
  <text x="36" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">N</text>
</svg>
  `.trim();

  fs.writeFileSync(path.join(ICONS_DIR, 'badge-72x72.png'), badgeSvg);
  console.log('✓ Generated badge-72x72.png');

  console.log('\n✨ Icon generation complete!');
  console.log('\n📝 Note: These are placeholder SVG icons.');
  console.log('   For production, replace with professionally designed PNG icons.');
  console.log('   Recommended tools: Figma, Sketch, or Adobe Illustrator\n');
}

// Run the script
generateAllIcons();
