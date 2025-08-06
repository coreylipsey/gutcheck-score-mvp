const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Device configurations to simulate different mobile devices
const devices = [
  {
    name: 'iPhone 12',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 }
  },
  {
    name: 'Samsung Galaxy S21',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    viewport: { width: 360, height: 800 }
  },
  {
    name: 'iPad Pro',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
    viewport: { width: 1024, height: 1366 }
  },
  {
    name: 'Desktop Chrome',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  }
];

async function testWebApp() {
  console.log('🚀 Starting web app testing on multiple devices...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    defaultViewport: null 
  });

  const results = [];

  for (const device of devices) {
    console.log(`📱 Testing on ${device.name}...`);
    
    const page = await browser.newPage();
    
    // Set device configuration
    await page.setUserAgent(device.userAgent);
    await page.setViewport(device.viewport);
    
    try {
      // Navigate to your local development server
      await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait a bit for any animations to complete
      await page.waitForTimeout(2000);
      
      // Take screenshot
      const screenshotPath = `screenshots/${device.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`✅ Screenshot saved: ${screenshotPath}`);
      
      // Test assessment flow
      console.log(`  🔍 Testing assessment flow...`);
      
      // Click on assessment link if it exists
      const assessmentLink = await page.$('a[href*="assessment"]');
      if (assessmentLink) {
        await assessmentLink.click();
        await page.waitForTimeout(2000);
        
        const assessmentScreenshotPath = `screenshots/${device.name.replace(/\s+/g, '-').toLowerCase()}-assessment.png`;
        await page.screenshot({ 
          path: assessmentScreenshotPath,
          fullPage: true 
        });
        console.log(`✅ Assessment screenshot saved: ${assessmentScreenshotPath}`);
      }
      
      results.push({
        device: device.name,
        status: 'success',
        screenshots: [screenshotPath]
      });
      
    } catch (error) {
      console.error(`❌ Error testing ${device.name}:`, error.message);
      results.push({
        device: device.name,
        status: 'error',
        error: error.message
      });
    }
    
    await page.close();
  }
  
  await browser.close();
  
  // Generate report
  console.log('\n📊 Test Results:');
  console.log('================');
  
  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✅ ${result.device}: Success`);
    } else {
      console.log(`❌ ${result.device}: ${result.error}`);
    }
  });
  
  console.log('\n📁 Screenshots saved in the "screenshots" folder');
  console.log('🎯 Check the screenshots to see how your app looks on different devices!');
}

// Create screenshots directory
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the test
testWebApp().catch(console.error); 