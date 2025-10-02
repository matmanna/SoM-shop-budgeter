// download-images2.js
// This script updates the image URLs in items.json based on the product images in shop.html.
// It ignores the shell image and only updates actual product images mapped by product name.

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const itemsPath = path.join(__dirname, 'src', 'items.json');
const shopHtmlPath = path.join(__dirname, 'src', 'shop.html');

// Read and parse items.json
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

// Read and parse shop.html
const html = fs.readFileSync(shopHtmlPath, 'utf8');
const $ = cheerio.load(html);


// Build a mapping of product names to image URLs (ignore shell image)
const nameToImage = {};
$('.rounded-md').each((i, el) => {
  //console.log('el', el);
  const name = $(el).find('h3').first().text().trim();
  console.log(name)
  // get second img if exists
  const img = $(el).find('img.rounded-lg').first()
  const imgUrl = img.attr('src');
  // Ignore shell image (usually og-image.png or similar)
  if (!imgUrl) return;
  if (name) {
    nameToImage[name] = imgUrl;
  }
});

// Update items.json image fields
let updated = 0;
for (const item of items) {
  if (item.name && nameToImage[item.name]) {
    if (item.image !== nameToImage[item.name]) {
      item.image = nameToImage[item.name];
      updated++;
    }
  }
}

// Write back to items.json
fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2));
console.log(`Updated ${updated} item images in items.json.`);
