const puppeteer = require('puppeteer');
const fs = require('fs');

// Device configurations to simulate different mobile devices
const devices = [
  {
    name: 'iPhone 12 (Safari)',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 }
  },
  {
    name: 'Samsung Galaxy S21 (Chrome)',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    viewport: { width: 360, height: 800 }
  },
  {
    name: 'iPad Pro (Safari)',
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
  console.log('🚀 Quick device testing - taking screenshots...\n');
  
  // Use your deployed Firebase hosting URL
  const appUrl = 'https://gutcheck-score-mvp.web.app';
  
  const browser = await puppeteer.launch({ 
    headless: true, // Run in background
    defaultViewport: null 
  });

  const results = [];

  for (const device of devices) {
    console.log(`📱 Testing ${device.name}...`);
    
    const page = await browser.newPage();
    
    // Set device configuration
    await page.setUserAgent(device.userAgent);
    await page.setViewport(device.viewport);
    
    try {
      // Navigate to your deployed app
      await page.goto(appUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take screenshot
      const screenshotPath = `screenshots/${device.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`✅ Screenshot saved: ${screenshotPath}`);
      
      results.push({
        device: device.name,
        status: 'success',
        screenshot: screenshotPath
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
  console.log('🎯 Open the screenshots to see how your app looks on different devices!');
  console.log('🔍 Compare Safari vs Chrome rendering to identify any issues!');
  
  // Show the files that were created
  console.log('\n📸 Screenshots created:');
  results.forEach(result => {
    if (result.status === 'success') {
      console.log(`   📱 ${result.screenshot}`);
    }
  });
}

// Create screenshots directory
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the test
testWebApp().catch(console.error); 