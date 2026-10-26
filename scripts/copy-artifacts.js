const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const nextDir = path.join(rootDir, '.next');
const standaloneDir = path.join(nextDir, 'standalone');
const staticDir = path.join(nextDir, 'static');
const publicDir = path.join(rootDir, 'public');

try {
  // Ensure standalone includes static assets for deployment
  if (fs.existsSync(standaloneDir)) {
    if (fs.existsSync(staticDir)) {
      const standaloneStatic = path.join(standaloneDir, '.next', 'static');
      fs.mkdirSync(standaloneStatic, { recursive: true });
      fs.cpSync(staticDir, standaloneStatic, { recursive: true });
    }
    if (fs.existsSync(publicDir)) {
      const standalonePublic = path.join(standaloneDir, 'public');
      fs.mkdirSync(standalonePublic, { recursive: true });
      fs.cpSync(publicDir, standalonePublic, { recursive: true });
    }

    // Mirror to dist, build, out for different deployment orchestrator expectations
    ['dist', 'build', 'out'].forEach((d) => {
      const dest = path.join(rootDir, d);
      fs.mkdirSync(dest, { recursive: true });
      fs.cpSync(standaloneDir, dest, { recursive: true });
    });
  }

  // Ensure dist has _next/static as well
  if (fs.existsSync(staticDir)) {
    const distStatic = path.join(rootDir, 'dist', '_next', 'static');
    fs.mkdirSync(distStatic, { recursive: true });
    fs.cpSync(staticDir, distStatic, { recursive: true });
  }

  console.log('[INFO] Build artifacts synchronized successfully.');
} catch (err) {
  console.warn('[WARN] Error during artifact copying:', err.message);
}
