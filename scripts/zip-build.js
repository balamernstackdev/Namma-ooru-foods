const { spawnSync } = require('child_process');
const path = require('path');

const pyScript = path.join(__dirname, 'zip-build.py');

console.log('Running python zip script to package build...');
const result = spawnSync('python', [pyScript], { stdio: 'inherit' });

if (result.error) {
  console.error('Failed to run zip-build.py:', result.error);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`zip-build.py failed with exit code ${result.status}`);
  process.exit(result.status);
}

console.log('Zip packaging completed successfully.');
