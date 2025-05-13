const fs = require('fs');
const path = require('path');

function loadPromptTemplate(templatePath = null, rootPath = process.cwd()) {
  const userTemplatePath = path.join(rootPath, '.promptmetemplate');
  const fallbackTemplatePath = path.join(__dirname, '../templates/default.promptmetemplate');

  const finalPath =
    templatePath && fs.existsSync(templatePath)
      ? templatePath
      : fs.existsSync(userTemplatePath)
        ? userTemplatePath
        : fallbackTemplatePath;

  if (!fs.existsSync(finalPath)) {
    console.warn('⚠️ No se encontró ninguna plantilla válida. Se usará un encabezado vacío.');
    return '';
  }

  let template = fs.readFileSync(finalPath, 'utf8');
  const projectName = path.basename(rootPath);

  return template.replace(/{projectName}/g, projectName) + '\n\n';
}

module.exports = { loadPromptTemplate };
