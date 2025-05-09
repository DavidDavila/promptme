#!/usr/bin/env node

const { program } = require('commander');
const { generatePromptFiles } = require('../lib/generate');
const { resetAll } = require('../lib/reset');

program
  .name('promptme')
  .description('CLI para generar contexto de código para IA')
  .option('-m, --maxlength <bytes>', 'Tamaño máximo por archivo', '40000')
  .option('-o, --output <base>', 'Nombre base de archivo', 'project_prompt')
  .option('-f, --format <format>', 'Formato: txt, md, json', 'txt')
  .option('-i, --include <folders>', 'Carpetas a incluir (ej: src,test)', val => val.split(','), [])
  .option('--template <file>', 'Usar plantilla personalizada')
  .option('--summary', 'Generar resumen del proyecto')
  .action((opts) => {
    generatePromptFiles({
      maxLength: parseInt(opts.maxlength),
      outputBase: opts.output,
      format: opts.format,
      includeFolders: opts.include,
      templatePath: opts.template
    });
  });

program
  .command('reset')
  .description('Restablece la plantilla y el archivo de ignore por defecto')
  .action(resetAll);

program.parse();
