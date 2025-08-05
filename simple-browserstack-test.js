const { chromium } = require('playwright');

async function testBrowserStack() {
  console.log('🚀 Testing BrowserStack connection...');
  
  const browser = await chromium.connect({
    wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
      browserName: 'chrome',
      browserVersion: 'latest',
      os: 'Windows',
      osVersion: '11',
      buildName: 'Simple Test',
      sessionName: 'Connection Test',
      userName: 'coreylipsey_CicmlG',
      accessKey: 'qRbyY1vhLqJDjNwJqN7E',
    }))}`
  });

  try {
    console.log('✅ Connected to BrowserStack!');
    
    const page = await browser.newPage();
    await page.goto('https://example.com');
    
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    await page.screenshot({ path: 'browserstack-test.png' });
    console.log('📸 Screenshot saved as browserstack-test.png');
    
    await browser.close();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBrowserStack(); 