#!/usr/bin/env node

/**
 * Airtable Setup Script
 * 
 * This script helps you set up the Airtable base for Gutcheck.AI Pilot Program Management.
 * Run this after creating your Airtable base to initialize the structure.
 */

const Airtable = require('airtable');

// Configuration - update these values
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: AIRTABLE_API_KEY and AIRTABLE_BASE_ID environment variables are required');
  console.log('\n📋 Setup Instructions:');
  console.log('1. Go to https://airtable.com and create a new base');
  console.log('2. Get your API key from https://airtable.com/account');
  console.log('3. Get your base ID from the API documentation');
  console.log('4. Set environment variables:');
  console.log('   export AIRTABLE_API_KEY="your_api_key_here"');
  console.log('   export AIRTABLE_BASE_ID="your_base_id_here"');
  console.log('5. Run this script again');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function setupAirtable() {
  console.log('🚀 Setting up Airtable base for Gutcheck.AI Pilot Program Management...\n');

  try {
    // Test connection
    console.log('✅ Testing Airtable connection...');
    await base('Partners').select({ maxRecords: 1 }).firstPage();
    console.log('✅ Connection successful!\n');

    console.log('📊 Base structure:');
    console.log('├── Partners (Partner organizations)');
    console.log('├── Cohorts (Cohort tracking and metrics)');
    console.log('├── Assessment Sessions (Individual assessment data)');
    console.log('├── Outcome Tracking (Partner outcome tagging)');
    console.log('└── Admin Dashboard (Executive summary and alerts)\n');

    console.log('🎯 Next Steps:');
    console.log('1. Create the 5 tables in your Airtable base');
    console.log('2. Add the fields as specified in AIRTABLE_SETUP_GUIDE.md');
    console.log('3. Set up partner-specific views');
    console.log('4. Configure sharing permissions');
    console.log('5. Deploy the Firebase functions with Airtable integration\n');

    console.log('🔗 Integration Status:');
    console.log('✅ Airtable connection working');
    console.log('✅ Environment variables configured');
    console.log('⏳ Ready for table setup and field configuration\n');

    console.log('📖 For detailed setup instructions, see: AIRTABLE_SETUP_GUIDE.md');

  } catch (error) {
    console.error('❌ Error connecting to Airtable:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your API key is correct');
    console.log('2. Verify your base ID is correct');
    console.log('3. Ensure you have access to the base');
    console.log('4. Check your internet connection');
  }
}

// Run setup
setupAirtable().catch(console.error);
