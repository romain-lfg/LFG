import fetch from 'node-fetch';

// Configuration
const API_URL = process.env.API_URL || 'https://lfg-backend-api-staging-q5lvsmk7v-lfg-5fd382da.vercel.app';

async function testDiagnostic() {
  console.log('🔍 Testing diagnostic endpoint...');
  console.log(`🔗 Testing API at: ${API_URL}`);
  console.log('-------------------------------------------');

  try {
    const response = await fetch(`${API_URL}/api/diagnostic`);
    
    if (!response.ok) {
      console.error(`❌ Error: HTTP status ${response.status}`);
      const text = await response.text();
      console.error('Response text:', text);
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ Diagnostic endpoint response:');
    
    // Environment variables check
    console.log('\n📋 Environment Variables:');
    for (const [key, value] of Object.entries(data.environment)) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Module resolution check
    console.log('\n📦 Module Resolution:');
    console.log(`  Privy SDK: ${data.moduleResolution.privy?.status}`);
    if (data.moduleResolution.privy?.status === 'error') {
      console.log(`  Error: ${data.moduleResolution.privy.message}`);
    } else if (data.moduleResolution.privy?.version) {
      console.log(`  Version: ${data.moduleResolution.privy.version}`);
    }
    
    // File system check
    console.log('\n📁 File System:');
    console.log(`  Current Directory: ${data.fileSystemCheck.currentDirectory}`);
    if (data.fileSystemCheck.files) {
      console.log('  Files:');
      data.fileSystemCheck.files.forEach(file => console.log(`    - ${file}`));
    }
    
    // Runtime info
    console.log('\n⚙️ Runtime Info:');
    console.log(`  Node Version: ${data.runtimeInfo.nodeVersion}`);
    console.log(`  Platform: ${data.runtimeInfo.platform}`);
    console.log(`  Architecture: ${data.runtimeInfo.arch}`);
    
    // Memory usage
    const memoryUsage = data.runtimeInfo.memoryUsage;
    console.log('\n🧠 Memory Usage:');
    for (const [key, value] of Object.entries(memoryUsage)) {
      console.log(`  ${key}: ${Math.round(value / 1024 / 1024 * 100) / 100} MB`);
    }
    
  } catch (error) {
    console.error('❌ Error testing diagnostic endpoint:', error);
  }
  
  console.log('-------------------------------------------');
  console.log('🏁 Diagnostic test completed');
}

// Run the test
testDiagnostic();
