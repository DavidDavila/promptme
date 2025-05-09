const fs = require('fs');
const path = require('path');
const ignore = require('ignore');
const glob = require('glob');
const { loadPromptTemplate } = require('./template');

const projectRoot = process.cwd();

function ensurePromptmeIgnoreExists() {
  const ignorePath = path.join(projectRoot, '.promptmeignore');
  if (!fs.existsSync(ignorePath)) {
    const defaultIgnore = `
# Archivos comunes a ignorar
node_modules
dist
build
.git
.gitignore
.promptmeignore
project_prompt*.txt
project_summary.txt
package-lock.json
yarn.lock
pnpm-lock.yaml
.env
*.log
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
      // Si se especifican carpetas a incluir, solo seguimos si es una de ellas
      if (includeFolders.length > 0 && !includeFolders.some(f => relPath.startsWith(f))) {
        continue;
      }
      yield* walk(fullPath, ig, includeFolders);
    } else if (stat.isFile()) {
      if (includeFolders.length === 0 || includeFolders.some(f => relPath.startsWith(f))) {
        yield relPath;
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

  for (const filePath of walk(projectRoot, ig, includeFolders)) {
    const absPath = path.join(projectRoot, filePath);
    const content = fs.readFileSync(absPath, 'utf8');
    const entry = formatEntry(filePath, content, format);

    let estimatedSize;
    if (format === 'json') {
      estimatedSize = Buffer.byteLength(JSON.stringify({ ...buffer, ...entry }), 'utf8');
    } else {
      estimatedSize = Buffer.byteLength(buffer + entry, 'utf8');
    }

    if (estimatedSize > maxLength) {
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

  if ((format === 'json' && Object.keys(buffer).length > 0) || (typeof buffer === 'string' && buffer.trim())) {
    const outputPath = path.join(projectRoot, `${outputBase}${fileIndex}.${format}`);
    const outputContent = format === 'json' ? JSON.stringify(buffer, null, 2) : buffer;
    fs.writeFileSync(outputPath, outputContent, 'utf8');
  }

  console.log(`✅ Archivos generados en formato ${format}`);
}

module.exports = { generatePromptFiles };
