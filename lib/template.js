const fs = require('fs');
const path = require('path');

function loadPromptTemplate(templatePath = null) {
  const defaultPath = path.join(__dirname, '../templates/default.promptmetemplate');
  const selectedPath = templatePath || defaultPath;

  if (!fs.existsSync(selectedPath)) {
    console.warn('⚠️ No se encontró la plantilla. Se usará un encabezado vacío.');
    return '';
  }

  let template = fs.readFileSync(selectedPath, 'utf8');
  const projectName = path.basename(process.cwd());

  return template.replace(/{projectName}/g, projectName) + '\n\n';
}

module.exports = { loadPromptTemplate };
