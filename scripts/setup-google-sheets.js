#!/usr/bin/env node

/**
 * Google Sheets Setup Helper Script
 * 
 * This script helps you set up the environment variables needed for Google Sheets integration.
 * Run this script after you've created your Google Sheet and service account.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 Google Sheets Integration Setup Helper\n');
  console.log('This script will help you configure the environment variables needed for Google Sheets integration.\n');

  try {
    // Get spreadsheet ID
    const spreadsheetId = await question('📊 Enter your Google Sheets Spreadsheet ID (from the URL): ');
    
    if (!spreadsheetId || spreadsheetId.length < 20) {
      console.log('❌ Invalid spreadsheet ID. Please check your Google Sheets URL.');
      return;
    }

    // Get service account key file path
    const keyFilePath = await question('🔑 Enter the path to your service account JSON key file: ');
    
    if (!fs.existsSync(keyFilePath)) {
      console.log('❌ Service account key file not found. Please check the path.');
      return;
    }

    // Read and parse the service account key
    const serviceAccountKey = fs.readFileSync(keyFilePath, 'utf8');
    let parsedKey;
    
    try {
      parsedKey = JSON.parse(serviceAccountKey);
    } catch (error) {
      console.log('❌ Invalid JSON in service account key file.');
      return;
    }

    // Validate the key structure
    if (!parsedKey.type || !parsedKey.project_id || !parsedKey.private_key_id) {
      console.log('❌ Invalid service account key format.');
      return;
    }

    console.log('\n✅ Configuration validated successfully!\n');

    // Generate environment variable commands
    console.log('📝 Add these environment variables to your Firebase Functions:\n');
    console.log('```bash');
    console.log(`firebase functions:config:set google.sheets.spreadsheet_id="${spreadsheetId}"`);
    console.log(`firebase functions:config:set google.service_account.key='${serviceAccountKey.replace(/'/g, "'\"'\"'")}'`);
    console.log('```\n');

    // Alternative: .env file
    console.log('📄 Or add to your .env file (for local development):\n');
    console.log('```bash');
    console.log(`GOOGLE_SHEETS_SPREADSHEET_ID=${spreadsheetId}`);
    console.log(`GOOGLE_SERVICE_ACCOUNT_KEY='${serviceAccountKey.replace(/'/g, "'\"'\"'")}'`);
    console.log('```\n');

    // Next steps
    console.log('🎯 Next Steps:');
    console.log('1. Set the environment variables using one of the methods above');
    console.log('2. Deploy your functions: firebase deploy --only functions');
    console.log('3. Test the integration by completing an assessment');
    console.log('4. Check your Google Sheet to verify data is being synced\n');

    console.log('📚 For more details, see: GOOGLE_SHEETS_SETUP_GUIDE.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

main();
