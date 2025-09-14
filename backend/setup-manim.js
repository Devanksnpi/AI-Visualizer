const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function setupManim() {
  console.log('🚀 Setting up Manim for AI Visualizer...');
  
  try {
    // Check if Python is installed
    console.log('🐍 Checking Python installation...');
    await checkPython();
    
    // Install Python dependencies
    console.log('📦 Installing Python dependencies...');
    await installPythonDependencies();
    
    // Create necessary directories
    console.log('📁 Creating directories...');
    await createDirectories();
    
    console.log('✅ Manim setup completed successfully!');
    console.log('🎬 You can now use Manim for physics and math animations.');
    
  } catch (error) {
    console.error('❌ Manim setup failed:', error.message);
    console.log('\n📋 Manual setup instructions:');
    console.log('1. Install Python 3.8+ from https://python.org');
    console.log('2. Run: pip install manim numpy scipy matplotlib');
    console.log('3. Install FFmpeg for video processing');
    console.log('4. Restart the server');
    process.exit(1);
  }
}

async function checkPython() {
  return new Promise((resolve, reject) => {
    exec('python --version', (error, stdout, stderr) => {
      if (error) {
        exec('python3 --version', (error3, stdout3, stderr3) => {
          if (error3) {
            reject(new Error('Python not found. Please install Python 3.8+'));
          } else {
            console.log('✅ Python found:', stdout3.trim());
            resolve();
          }
        });
      } else {
        console.log('✅ Python found:', stdout.trim());
        resolve();
      }
    });
  });
}

async function installPythonDependencies() {
  return new Promise((resolve, reject) => {
    const requirementsPath = path.join(__dirname, 'requirements.txt');
    exec(`pip install -r ${requirementsPath}`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Failed to install Python dependencies: ${error.message}`));
      } else {
        console.log('✅ Python dependencies installed');
        resolve();
      }
    });
  });
}

async function createDirectories() {
  const directories = [
    path.join(__dirname, 'temp', 'manim'),
    path.join(__dirname, 'public', 'manim')
  ];
  
  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
  }
  
  console.log('✅ Directories created');
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupManim();
}

module.exports = { setupManim };
