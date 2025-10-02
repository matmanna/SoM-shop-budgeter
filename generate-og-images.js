import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';

// Generate OG image for social media
function generateOGImage() {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#fef3c7');
  gradient.addColorStop(0.5, '#dbeafe');
  gradient.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw emojis
  ctx.font = 'bold 120px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💲 🏝️', width / 2, 220);

  // Draw title
  ctx.font = 'bold 80px sans-serif';
  ctx.fillStyle = '#1e40af';
  ctx.fillText('SoM Shop Budgeter', width / 2, 360);

  // Draw subtitle
  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Browse & budget your Summer of Making shells 🐚', width / 2, 450);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  writeFileSync('public/og-image.png', buffer);
  console.log('✅ Generated public/og-image.png (1200x630)');
}

// Generate Twitter card image (slightly different aspect ratio)
function generateTwitterImage() {
  const width = 1200;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#fef3c7');
  gradient.addColorStop(0.5, '#dbeafe');
  gradient.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw emojis
  ctx.font = 'bold 100px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💲 🏝️', width / 2, 200);

  // Draw title
  ctx.font = 'bold 70px sans-serif';
  ctx.fillStyle = '#1e40af';
  ctx.fillText('SoM Shop Budgeter', width / 2, 330);

  // Draw subtitle
  ctx.font = '35px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Browse & budget your Summer of Making shells 🐚', width / 2, 420);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  writeFileSync('public/twitter-card.png', buffer);
  console.log('✅ Generated public/twitter-card.png (1200x600)');
}

// Create public directory if it doesn't exist
try {
  mkdirSync('public', { recursive: true });
} catch (e) {}

// Generate both images
console.log('🎨 Generating OG image...');
generateOGImage();

console.log('🎨 Generating Twitter card...');
generateTwitterImage();

console.log('\n🎉 Social media images generated successfully!');
console.log('📁 Images saved to public/ directory');
