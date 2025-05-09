#!/usr/bin/env node

const { program } = require('commander');
const { generatePromptFiles } = require('../lib/generate');
const { generateSummary } = require('../lib/summary');

program
  .option('-m, --maxlength <bytes>', 'Tamaño máximo de cada archivo en bytes (por defecto: 80000)', '80000')
  .option('-o, --output <base>', 'Nombre base de los archivos de salida', 'project_prompt')
  .option('-f, --format <type>', 'Formato de salida: txt, md, json', 'txt')
  .option('-i, --include <folders>', 'Carpetas a incluir, separadas por coma', val => val.split(','), [])
  .option('--template <file>', 'Archivo de plantilla para el prompt inicial')
  .option('--summary', 'Genera archivo project_summary.txt con resumen del proyecto')
  .parse(process.argv);

const options = program.opts();

generatePromptFiles({
  maxLength: parseInt(options.maxlength),
  outputBase: options.output,
  format: options.format,
  includeFolders: options.include,
  templatePath: options.template
});

if (options.summary) {
  generateSummary();
}
