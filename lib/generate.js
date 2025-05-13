const fs = require('fs');
const path = require('path');
const ignore = require('ignore');
const glob = require('glob');
const { isText } = require('istextorbinary');
const { loadPromptTemplate } = require('./template');

function readIgnoreRules(ignorePath, root) {
  const ig = ignore();
  const resolvedPath = ignorePath || path.join(root, '.promptmeignore');
  if (fs.existsSync(resolvedPath)) {
    ig.add(fs.readFileSync(resolvedPath, 'utf8'));
  } else {
    // Usar fallback si no existe y no se está generando automáticamente
    const fallback = path.join(__dirname, '../templates/default.promptmeignore');
    if (fs.existsSync(fallback)) {
      ig.add(fs.readFileSync(fallback, 'utf8'));
    }
  }
  return ig;
}

function* walk(dir, ig, includeFolders, root) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = path.relative(root, fullPath);
    if (ig.ignores(relPath)) continue;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (includeFolders.length > 0 && !includeFolders.some(f => relPath.startsWith(f))) {
        continue;
      }
      yield* walk(fullPath, ig, includeFolders, root);
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

function cleanOldPromptFiles(outputBase, root) {
  const oldFiles = glob.sync(`${outputBase}*.{txt,md,json}`, { cwd: root });
  oldFiles.forEach(file => fs.unlinkSync(path.join(root, file)));
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

function generatePromptFiles({
  maxLength,
  outputBase,
  format,
  includeFolders,
  templatePath,
  ignorePath,
  generateDefaults = true,
  stdout = false,
  sourcePath = process.cwd()
}) {
  // ❌ Ya no creamos archivos por defecto nunca (aunque se use --generate-defaults)
  // ✅ Pero usamos los templates por defecto si no hay archivos en disco

  const ig = readIgnoreRules(ignorePath, sourcePath);
  if (!stdout) {
    cleanOldPromptFiles(outputBase, sourcePath);
  }

  const template = loadPromptTemplate(templatePath, sourcePath);
  let buffer = format === 'json' ? {} : template;
  let fileIndex = 1;

  for (const { relPath, buffer: fileBuffer } of walk(sourcePath, ig, includeFolders, sourcePath)) {
    const content = fileBuffer.toString('utf8');
    if (!content.trim()) {
      console.log(`⏭️  Ignorado (vacío): ${relPath}`);
      continue;
    }

    const entry = formatEntry(relPath, content, format);
    const entrySize = Buffer.byteLength(format === 'json' ? JSON.stringify(entry) : entry, 'utf8');

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
      const outputContent = format === 'json' ? JSON.stringify(buffer, null, 2) : buffer;
      if (stdout) {
        console.log(outputContent);
      } else {
        const outputPath = path.join(sourcePath, `${outputBase}${fileIndex}.${format}`);
        fs.writeFileSync(outputPath, outputContent, 'utf8');
      }
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
    if (format === 'json') {
      buffer["__end__"] = "✅ Fin del volcado de archivos. Ya puedes comenzar a responder preguntas sobre el proyecto.";
    } else {
      buffer += '\n---\n\n✅ Fin del volcado de archivos. Ya puedes comenzar a responder preguntas sobre el proyecto.\n';
    }

    const outputContent = format === 'json' ? JSON.stringify(buffer, null, 2) : buffer;

    if (stdout) {
      console.log(outputContent);
    } else {
      const outputPath = path.join(sourcePath, `${outputBase}${fileIndex}.${format}`);
      fs.writeFileSync(outputPath, outputContent, 'utf8');
    }
  }

  if (!stdout) {
    console.log(`✅ Archivos generados en formato ${format}`);
  }
}

module.exports = { generatePromptFiles };
