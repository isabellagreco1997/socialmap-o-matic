// Script to deploy functions to Netlify
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define environment
const isDevelopment = process.env.NODE_ENV !== 'production';
console.log('Environment mode:', { isDevelopment, NODE_ENV: process.env.NODE_ENV });

console.log('Deploying functions to Netlify...');

// Verify environment variables
const requiredEnvVars = [
  'VITE_STRIPE_SECRET_KEY_TEST',
  'VITE_STRIPE_SECRET_KEY_LIVE',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Error: Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Create a temporary .env.production file for deployment
console.log('Creating temporary .env.production file...');
const envContent = requiredEnvVars
  .map(varName => `${varName}=${process.env[varName]}`)
  .join('\n');

fs.writeFileSync('.env.production', envContent);

try {
  // Deploy functions to Netlify
  console.log('Deploying functions...');
  execSync('netlify deploy --prod --functions netlify/functions', { stdio: 'inherit' });
  
  console.log('Functions deployed successfully!');
} catch (error) {
  console.error('Error deploying functions:', error);
} finally {
  // Clean up temporary file
  console.log('Cleaning up...');
  fs.unlinkSync('.env.production');
}

console.log('Deployment process completed.'); 