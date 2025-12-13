import { spawn } from 'child_process';
import { createServer } from 'net';

const PORT = 2029;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is available
    });
    
    server.listen(port);
  });
}

async function main() {
  const portInUse = await checkPort(PORT);
  
  if (portInUse) {
    console.error(`\n❌ Dev server is already running on port ${PORT}`);
    console.error(`   Please stop the existing instance before starting a new one.\n`);
    process.exit(1);
  }
  
  // Port is available, start the dev server
  console.log(`✓ Port ${PORT} is available, starting dev server...\n`);
  
  const child = spawn('nuxt', ['dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Forward signals to the child process
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

