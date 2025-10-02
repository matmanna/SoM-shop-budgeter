#!/usr/bin/env node
import fs from 'fs';
import https from 'https';
import { pipeline } from 'stream/promises';

const itemsData = JSON.parse(fs.readFileSync('./src/items.json', 'utf8'));

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        pipeline(response, fileStream)
          .then(() => {
            console.log(`✓ Downloaded: ${outputPath}`);
            resolve();
          })
          .catch(reject);
      } else {
        console.log(`✗ Failed to download ${url}: ${response.statusCode}`);
        resolve(); // Don't reject, just skip
      }
    }).on('error', (err) => {
      console.log(`✗ Error downloading ${url}: ${err.message}`);
      resolve(); // Don't reject, just skip
    });
  });
}

async function main() {
  let downloadedCount = 0;
  const updatedItems = [];

  for (const item of itemsData) {
    if (item.image && item.image.startsWith('https://summer.hackclub.com/')) {
      const filename = item.image.split('/').pop();
      const localPath = `./public/images/${filename}`;
      
      if (!fs.existsSync(localPath)) {
        try {
          await downloadImage(item.image, localPath);
          downloadedCount++;
        } catch (err) {
          console.error(`Failed to download ${filename}:`, err);
        }
      } else {
        console.log(`- Already exists: ${filename}`);
      }
      
      // Update image path to local
      updatedItems.push({
        ...item,
        image: `/images/${filename}`
      });
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
