const fs = require('fs');
const path = require('path');
const ignore = require('ignore');
const glob = require('glob');
const { isText } = require('istextorbinary');
const { loadPromptTemplate } = require('./template');

const projectRoot = process.cwd();

function ensurePromptmeIgnoreExists() {
  const ignorePath = path.join(projectRoot, '.promptmeignore');
  if (!fs.existsSync(ignorePath)) {
    const defaultIgnore = `
# 📦 Dependencias y binarios
node_modules/
bower_components/
vendor/
.pnp/
.pnp.js
.pnp.cjs

# 🔧 Bun
bun.lockb
.bunlock
.bunlockb
.bunfig
.bunfig.toml
bunfig.toml

# 🛠️ Build / dist / cache
dist/
build/
out/
public/
.esbuild/
.vite/
.rollup.cache/
.storybook/static/
.nitro/
.next/
.netlify/
.vercel/
astro/
remix/

# 🔄 Caché de herramientas
.tmp/
.cache/
.rpt2_cache/
.nyc_output/
coverage/
.jest/
jest/
.vitest/
.cypress/
playwright-report/
test-results/
tsbuildinfo/
tsconfig.tsbuildinfo

# 🧪 Archivos de pruebas
*.snap
*.spec.*
*.test.*
coverage-final.json

# 🔐 Configuración sensible o local
.env
.env.*
.env.local
.env.development
.env.test
.env.production
.npmrc
.yarnrc
.babelrc
.browserslistrc
*.local
*.secret
*.credentials

# 📄 Lockfiles
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lockb
.bunlock
.bunlockb

# 📝 Archivos generados por promptme
project_prompt*.txt
project_summary.txt
.promptmeignore
.promptmetemplate

# 📁 Control de versiones
.git/
.gitignore
.gitattributes
.gitmodules

# 🧰 Configuración de IDEs y herramientas
.DS_Store
Thumbs.db
.idea/
.vscode/
*.sublime-project
*.sublime-workspace
*.code-workspace

# Tokens / configuración de acceso
.npmrc
.yarnrc
.pypirc
.git-credentials
.gitconfig
.gnupg/
.ssh/
.docker/
.aws/
.azure/
.gcloud/
.nodemon.json
.babelrc
.babel.config.js

# Archivos de entorno
.env
.env.*
.env.local
.env.development
.env.test
.env.production

# Claves
*.pem
*.key
*.crt
*.cert
*.enc
*.asc

# Credenciales o tokens por nombre común
*credentials*
*token*
*secret*
*.secrets.*
*.vault.*
*.auth.*
*.apikey.*

# Archivos ocultos de usuarios
*.DS_Store
*.AppleDouble
*.LSOverride
*.swp
*.swo
# 🗑️ Archivos temporales y de respaldo
*.lockb
*.so
*.bin
*.exe
*.dll
*.zip
*.tar
*.gz
*.png
*.jpg
*.pdf
*.log
*.tmp
*.bak
*.swp
*.old
*.orig
*.rej
*.~
*.save

# 📦 Monorepo tools
apps/**/node_modules/
packages/**/node_modules/
apps/**/dist/
packages/**/dist/
turbo/
nx-out/
`;
    fs.writeFileSync(ignorePath, defaultIgnore.trim() + '\n', 'utf8');
    console.log('📄 Archivo .promptmeignore creado por defecto');
  }
}

function readIgnoreRules() {
  const ignorePath = path.join(projectRoot, '.promptmeignore');
  const ig = ignore();
  if (fs.existsSync(ignorePath)) {
    ig.add(fs.readFileSync(ignorePath, 'utf8'));
  }
  return ig;
}

function* walk(dir, ig, includeFolders) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = path.relative(projectRoot, fullPath);
    if (ig.ignores(relPath)) continue;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (includeFolders.length > 0 && !includeFolders.some(f => relPath.startsWith(f))) {
        continue;
      }
      yield* walk(fullPath, ig, includeFolders);
    } else if (stat.isFile()) {
      let buffer;
      try {
        buffer = fs.readFileSync(fullPath);
      } catch (err) {
        console.warn(`❌ Error leyendo archivo ${relPath}: ${err.message}`);
        continue;
      }

      const isTextFile = isText(undefined, buffer);
      if (!isTextFile) {
        console.log(`⏭️  Ignorado (no texto): ${relPath}`);
        continue;
      }

      if (includeFolders.length === 0 || includeFolders.some(f => relPath.startsWith(f))) {
        yield { relPath, buffer };
      }
    }
  }
}

function cleanOldPromptFiles(outputBase) {
  const oldFiles = glob.sync(`${outputBase}*.{txt,md,json}`, { cwd: projectRoot });
  oldFiles.forEach(file => fs.unlinkSync(path.join(projectRoot, file)));
}

function formatEntry(filePath, content, format) {
  switch (format) {
    case 'md':
      return `## ${filePath}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
    case 'json':
      return { [filePath]: content };
    case 'txt':
    default:
      return `//${filePath}\n${content}\n\n`;
  }
}

function generatePromptFiles({ maxLength, outputBase, format, includeFolders, templatePath }) {
  ensurePromptmeIgnoreExists();
  const ig = readIgnoreRules();
  cleanOldPromptFiles(outputBase);

  const template = loadPromptTemplate(templatePath);
  let buffer = format === 'json' ? {} : template;
  let fileIndex = 1;

  for (const { relPath, buffer: fileBuffer } of walk(projectRoot, ig, includeFolders)) {
    const content = fileBuffer.toString('utf8');

    if (!content.trim()) {
      console.log(`⏭️  Ignorado (vacío): ${relPath}`);
      continue;
    }

    const entry = formatEntry(relPath, content, format);
    const entrySize = Buffer.byteLength(entry, 'utf8');

    if (entrySize > maxLength) {
      console.warn(`⚠️ Archivo demasiado grande para incluir (${relPath}, ${entrySize} bytes). Saltado.`);
      continue;
    }

    const estimatedSize = format === 'json'
      ? Buffer.byteLength(JSON.stringify({ ...buffer, ...entry }), 'utf8')
      : Buffer.byteLength(buffer + entry, 'utf8');

    const hasContent =
      format === 'json' ? Object.keys(buffer).length > 0 : buffer.trim().length > 0;

    if (estimatedSize > maxLength && hasContent) {
      const outputPath = path.join(projectRoot, `${outputBase}${fileIndex}.${format}`);
      const outputContent = format === 'json' ? JSON.stringify(buffer, null, 2) : buffer;
      fs.writeFileSync(outputPath, outputContent, 'utf8');
      fileIndex++;
      buffer = format === 'json' ? {} : '';
    }

    if (format === 'json') {
      buffer = { ...buffer, ...entry };
    } else {
      buffer += entry;
    }
  }

  const hasRemainingContent =
    format === 'json' ? Object.keys(buffer).length > 0 : buffer.trim().length > 0;

  if (hasRemainingContent) {
    const outputPath = path.join(projectRoot, `${outputBase}${fileIndex}.${format}`);
    const outputContent = format === 'json' ? JSON.stringify(buffer, null, 2) : buffer;
    fs.writeFileSync(outputPath, outputContent, 'utf8');
  }

  console.log(`✅ Archivos generados en formato ${format}`);
}

module.exports = { generatePromptFiles };
