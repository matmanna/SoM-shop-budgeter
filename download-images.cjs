#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const request = require('request');

const itemsData = JSON.parse(fs.readFileSync('./src/items.json', 'utf8'));


function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    request({ url, encoding: null })
      .on('response', (response) => {
        if (response.statusCode !== 200) {
          console.log(`✗ Failed to download ${url}: ${response.statusCode}`);
          resolve();
        }
      })
      .on('error', (err) => {
        console.log(`✗ Error downloading ${url}: ${err.message}`);
        resolve();
      })
      .pipe(fs.createWriteStream(outputPath))
      .on('finish', () => {
        console.log(`✓ Downloaded: ${outputPath}`);
        resolve();
      });
  });
}

async function main() {
  let downloadedCount = 0;
  const updatedItems = [];

  for (const item of itemsData) {
    if (item.image && item.image.startsWith('https://summer.hackclub.com/')) {
      const filename = item.image.split('/').pop();
      const imagesDir = path.join(__dirname, 'public', 'images');
      if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
      const localPath = path.join(imagesDir, filename);
      if (!fs.existsSync(localPath)) {
        await downloadImage(item.image, localPath);
        downloadedCount++;
      } else {
        console.log(`- Already exists: ${filename}`);
      }
      updatedItems.push({ ...item, image: `/images/${filename}` });
    } else {
      updatedItems.push(item);
    }
  }

  // Write updated items.json
  fs.writeFileSync('./src/items.json', JSON.stringify(updatedItems, null, 2));
  console.log(`\n✓ Downloaded ${downloadedCount} images`);
  console.log('✓ Updated items.json with local image paths');
}

main().catch(console.error);
