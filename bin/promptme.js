#!/usr/bin/env node

const { program } = require('commander');
const { generatePromptFiles } = require('../lib/generate');

program
  .option('-m, --maxlength <bytes>', 'Tamaño máximo por archivo', '40000')
  .option('-o, --output <base>', 'Nombre base de archivo', 'project_prompt')
  .option('-f, --format <format>', 'Formato: txt, md, json', 'txt')
  .option('-i, --include <folders>', 'Carpetas a incluir', val => val.split(','), [])
  .option('--template <file>', 'Usar plantilla personalizada')
  .option('--summary', 'Generar resumen del proyecto') // opcional si lo implementaste
  .parse(process.argv);

const opts = program.opts();
generatePromptFiles({
  maxLength: parseInt(opts.maxlength),
  outputBase: opts.output,
  format: opts.format,
  includeFolders: opts.include,
  templatePath: opts.template
});
