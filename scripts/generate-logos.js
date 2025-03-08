#!/usr/bin/env node

import sharp from 'sharp';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = join(__dirname, '..', 'public');

const SIZES = {
  logo: [64, 128, 256, 512],
  'logo-horizontal': [128, 256, 512, 1024],
};

const VARIANTS = ['', '-light'];

async function generatePNGs() {
  try {
    // Generate standard logo sizes
    for (const [baseFilename, sizes] of Object.entries(SIZES)) {
      for (const variant of VARIANTS) {
        const filename = `${baseFilename}${variant}`;
        const svgPath = join(PUBLIC_DIR, `${filename}.svg`);
        
        // Skip if SVG doesn't exist
        if (!existsSync(svgPath)) {
          console.log(`Skipping ${filename}.svg (file not found)`);
          continue;
        }

        const svgContent = await readFile(svgPath);

        for (const size of sizes) {
          const width = size;
          const height = baseFilename.includes('horizontal') ? size / 4 : size;

          await sharp(svgContent)
            .resize(width, height)
            .png()
            .toFile(join(PUBLIC_DIR, `${filename}-${size}.png`));

          console.log(`Generated ${filename}-${size}.png`);
        }
      }
    }

    // Generate favicon sizes
    const faviconSizes = [16, 32, 48];
    const faviconSvg = await readFile(join(PUBLIC_DIR, 'logo.svg'));
    
    for (const size of faviconSizes) {
      await sharp(faviconSvg)
        .resize(size, size)
        .png()
        .toFile(join(PUBLIC_DIR, `favicon-${size}x${size}.png`));
      console.log(`Generated favicon-${size}x${size}.png`);
    }

    // Generate special sizes for mobile devices
    await sharp(faviconSvg)
      .resize(180, 180)
      .png()
      .toFile(join(PUBLIC_DIR, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png');

    await sharp(faviconSvg)
      .resize(192, 192)
      .png()
      .toFile(join(PUBLIC_DIR, 'android-chrome-192x192.png'));
    console.log('Generated android-chrome-192x192.png');

    await sharp(faviconSvg)
      .resize(512, 512)
      .png()
      .toFile(join(PUBLIC_DIR, 'android-chrome-512x512.png'));
    console.log('Generated android-chrome-512x512.png');

  } catch (error) {
    console.error('Error generating PNGs:', error);
    process.exit(1);
  }
}

generatePNGs(); 