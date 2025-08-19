const fs = require('fs');
const path = require('path');

// Mailchimp API configuration
const MAILCHIMP_CONFIG = {
  apiKey: 'bacf67220b058842d6ffcd2fb02b3ac8-us7',
  serverPrefix: 'us7',
  audienceId: '5f69687516'
};

// Template configurations
const TEMPLATES = [
  {
    name: 'Gutcheck Results Email',
    filename: 'results-email.html',
    description: 'Assessment results email with personalized score and AI recommendations',
    category: 'Transactional'
  },
  {
    name: 'Gutcheck Follow-up 1 - Game Plan',
    filename: 'followup-1.html',
    description: 'First follow-up email with action plan and progress tracking',
    category: 'Engagement'
  },
  {
    name: 'Gutcheck Follow-up 2 - Insights',
    filename: 'followup-2.html',
    description: 'Second follow-up with insights from top performers',
    category: 'Engagement'
  },
  {
    name: 'Gutcheck Follow-up 3 - Level Up',
    filename: 'followup-3.html',
    description: 'Third follow-up featuring top performer lessons',
    category: 'Engagement'
  }
];

/**
 * Read HTML template file
 */
function readTemplateFile(filename) {
  const filePath = path.join(__dirname, filename);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading template file ${filename}:`, error.message);
    return null;
  }
}

/**
 * Create Mailchimp template via API
 */
async function createMailchimpTemplate(templateConfig, htmlContent) {
  const url = `https://${MAILCHIMP_CONFIG.serverPrefix}.api.mailchimp.com/3.0/templates`;
  
  const templateData = {
    name: templateConfig.name,
    html: htmlContent,
    category: templateConfig.category
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_CONFIG.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error creating template ${templateConfig.name}:`, error.message);
    return null;
  }
}

/**
 * Main function to upload all templates
 */
async function uploadTemplates() {
  console.log('🚀 Starting template upload to Mailchimp...\n');

  for (const template of TEMPLATES) {
    console.log(`📧 Processing: ${template.name}`);
    
    // Read template file
    const htmlContent = readTemplateFile(template.filename);
    if (!htmlContent) {
      console.log(`❌ Failed to read ${template.filename}\n`);
      continue;
    }

    // Create template in Mailchimp
    const result = await createMailchimpTemplate(template, htmlContent);
    
    if (result) {
      console.log(`✅ Successfully created template: ${result.name} (ID: ${result.id})`);
      console.log(`   Description: ${template.description}`);
      console.log(`   Category: ${template.category}\n`);
    } else {
      console.log(`❌ Failed to create template: ${template.name}\n`);
    }
  }

  console.log('🎉 Template upload process completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Log into Mailchimp and verify templates were created');
  console.log('2. Test each template with sample data');
  console.log('3. Update Firebase Functions with template IDs');
  console.log('4. Configure merge fields in your audience settings');
}

/**
 * Manual upload instructions
 */
function showManualInstructions() {
  console.log('📋 Manual Upload Instructions:\n');
  
  for (const template of TEMPLATES) {
    console.log(`📧 ${template.name}`);
    console.log(`   File: ${template.filename}`);
    console.log(`   Description: ${template.description}`);
    console.log(`   Steps:`);
    console.log(`   1. Open ${template.filename}`);
    console.log(`   2. Copy all HTML content`);
    console.log(`   3. In Mailchimp: Templates → Create Template → Code your own → Paste in code`);
    console.log(`   4. Paste the HTML content`);
    console.log(`   5. Save as "${template.name}"`);
    console.log(`   6. Note the template ID for Firebase Functions\n`);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('⚠️  Fetch not available in this Node.js version');
  console.log('📋 Showing manual upload instructions instead:\n');
  showManualInstructions();
} else {
  // Run the upload
  uploadTemplates().catch(console.error);
}

module.exports = {
  uploadTemplates,
  showManualInstructions,
  TEMPLATES,
  MAILCHIMP_CONFIG
};
