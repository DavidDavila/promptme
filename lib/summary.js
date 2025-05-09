const fs = require('fs');
const path = require('path');

function detectLanguages(dir) {
  const extensions = new Set();
  function walk(d) {
    const files = fs.readdirSync(d);
    for (const file of files) {
      const full = path.join(d, file);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else {
        const ext = path.extname(full);
        if (ext) extensions.add(ext);
      }
    }
  }
  walk(dir);
  return Array.from(extensions).sort();
}

function extractDependencies() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return {
    dependencies: pkg.dependencies || {},
    devDependencies: pkg.devDependencies || {}
  };
}

function generateSummary() {
  const langs = detectLanguages(process.cwd());
  const deps = extractDependencies();

  let summary = `# Resumen del proyecto\n\n## Lenguajes detectados\n- ${langs.join('\n- ')}\n`;

  if (deps) {
    summary += `\n## Dependencias\n`;
    for (const [dep, version] of Object.entries(deps.dependencies)) {
      summary += `- ${dep}@${version}\n`;
    }
    if (Object.keys(deps.devDependencies).length) {
      summary += `\n## DevDependencias\n`;
      for (const [dep, version] of Object.entries(deps.devDependencies)) {
        summary += `- ${dep}@${version}\n`;
      }
    }
  }

  fs.writeFileSync(path.join(process.cwd(), 'project_summary.txt'), summary, 'utf8');
  console.log('📄 Resumen generado: project_summary.txt');
}

module.exports = { generateSummary };
