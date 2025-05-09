const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

function resetPromptmeIgnore() {
  const ignorePath = path.join(projectRoot, '.promptmeignore');
  const defaultPath = path.join(__dirname, '../templates/default.promptmeignore');

  if (!fs.existsSync(defaultPath)) {
    console.error('❌ No se encontró templates/default.promptmeignore');
    return;
  }

  const defaultContent = fs.readFileSync(defaultPath, 'utf8');
  fs.writeFileSync(ignorePath, defaultContent, 'utf8');
  console.log('✅ .promptmeignore restablecido');
}

function resetPromptmeTemplate() {
  const templatePath = path.join(projectRoot, '.promptmetemplate');
  const defaultPath = path.join(__dirname, '../templates/default.promptmetemplate');

  if (!fs.existsSync(defaultPath)) {
    console.error('❌ No se encontró templates/default.promptmetemplate');
    return;
  }

  const defaultContent = fs.readFileSync(defaultPath, 'utf8');
  fs.writeFileSync(templatePath, defaultContent, 'utf8');
  console.log('✅ .promptmetemplate restablecido');
}

function resetAll() {
  console.log('🔁 Restableciendo archivos de configuración...');
  resetPromptmeIgnore();
  resetPromptmeTemplate();
  console.log('🎉 ¡Listo! Archivos de configuración restablecidos.');
}

module.exports = { resetAll };
