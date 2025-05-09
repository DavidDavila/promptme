# 🧠 promptme

**`promptme`** es una herramienta CLI para generar archivos de texto con el contenido estructurado de tu proyecto, pensada especialmente para usarse como contexto en modelos de IA como ChatGPT o GPT-4.

Te permite exportar automáticamente tu código fuente ignorando archivos innecesarios, dividirlo en archivos por tamaño, generar un resumen del proyecto, y más.

---

## 🚀 Instalación

```bash
npm install -g promptme
```

> Esto instalará el comando `promptme` de forma global.

---

## 📦 Uso básico

En la raíz de tu proyecto:

```bash
promptme
```

Esto generará uno o varios archivos `project_prompt1.txt`, `project_prompt2.txt`, etc., con el contenido del proyecto (ignorando carpetas como `node_modules`, `.git`, etc.).

---

## ⚙️ Opciones CLI

```bash
promptme [options]
```

| Opción              | Descripción                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `-m`, `--maxlength` | Tamaño máximo (en bytes) por archivo generado (por defecto: `40000`)      |
| `-o`, `--output`    | Nombre base de los archivos de salida (por defecto: `project_prompt`)     |
| `-f`, `--format`    | Formato de salida: `txt`, `md`, o `json`                                  |
| `-i`, `--include`   | Carpetas a incluir, separadas por coma (ej: `src,test`)                   |
| `--template <file>` | Ruta a un archivo `.promptmetemplate` personalizado                       |
| `--summary`         | Genera también un archivo `project_summary.txt` con detalles del proyecto |

---

## 🔄 Comando reset

Si has modificado la plantilla o el archivo `.promptmeignore` y deseas restablecerlos a sus valores por defecto, puedes hacerlo con:

```bash
promptme reset
```

Esto sobrescribirá los archivos `.promptmetemplate` y `.promptmeignore` con las versiones estándar proporcionadas por la herramienta.

---

## 📝 Ejemplos

### 📂 Generar prompts con nombre personalizado y formato markdown

```bash
promptme --output=context --format=md
```

### 🧱 Limitar a ciertas carpetas

```bash
promptme --include=src,test
```

### 📚 Usar una plantilla personalizada

```bash
promptme --template=mi_template.promptmetemplate
```

### 📊 Generar también el resumen del proyecto

```bash
promptme --summary
```

---

## 🧠 Qué contiene el prompt generado

1. Un encabezado introductorio (puedes personalizarlo con una plantilla).
2. El contenido completo de los archivos fuente.
3. División automática en archivos si el tamaño supera el límite definido (`--maxlength`).
4. Un mensaje final indicando a la IA que el volcado ha terminado.

---

## 📄 Archivos especiales

### `.promptmeignore`

Funciona igual que un `.gitignore`. Aquí defines qué archivos no se deben incluir. Se genera automáticamente si no existe.

### `.promptmetemplate`

Plantilla opcional para el texto inicial del prompt. Se genera automáticamente si no existe. Puedes modificarla o restablecerla con `promptme reset`.

---

## 📑 Archivo de resumen: `project_summary.txt`

Si usas `--summary`, se generará un archivo con:

- Lenguajes detectados (por extensión de archivo)
- Dependencias (`dependencies` y `devDependencies` de `package.json`)

---

## 💡 Casos de uso

- Pasar el contexto de tu código a ChatGPT para refactoring o auditoría
- Compartir snapshots de tu proyecto
- Documentación automática y análisis semántico
- Análisis de estructura para nuevos colaboradores

---

## 🛠️ Contribuciones

¿Ideas, sugerencias o mejoras? ¡Las contribuciones están abiertas! Abre un issue o pull request en el repositorio.

---

## 📄 Licencia

MIT © 2025 - David Dávila

```

```
