const BrowserStackLocal = require('browserstack-local');

// Create a BrowserStackLocal instance
const bsLocal = new BrowserStackLocal.Local();

// BrowserStackLocal options
const bsLocalArgs = {
  'key': process.env.BROWSERSTACK_ACCESS_KEY || 'qRbyY1vhLqJDjNwJqN7E',
  'localIdentifier': 'gutcheck-mvp-test',
  'force': 'true',
  'forceLocal': 'true',
  'verbose': 'true',
  'logfile': './browserstack-local.log'
};

console.log('🚀 Starting BrowserStack Local...');
console.log('🔑 Using access key:', bsLocalArgs.key.substring(0, 8) + '...');

// Start BrowserStackLocal
bsLocal.start(bsLocalArgs, function(error) {
  if (error) {
    console.error('❌ Error starting BrowserStack Local:', error);
    process.exit(1);
  }
  
  console.log('✅ BrowserStack Local is running');
  console.log('🔗 Local Identifier: gutcheck-mvp-test');
  console.log('📝 Log file: ./browserstack-local.log');
  
  // Keep the process running
  process.on('SIGINT', function() {
    console.log('\n🛑 Stopping BrowserStack Local...');
    bsLocal.stop(function() {
      console.log('✅ BrowserStack Local stopped');
      process.exit(0);
    });
  });
}); 