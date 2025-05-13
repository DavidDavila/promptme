# 🧠 promptme

**`promptme`** es una herramienta CLI para generar archivos de texto con el contenido estructurado de tu proyecto, pensada especialmente para usarse como contexto en modelos de IA como ChatGPT o GPT-4.

Te permite exportar automáticamente tu código fuente ignorando archivos innecesarios, dividirlo en archivos por tamaño, generar un resumen del proyecto, redirigir la salida al terminal, usar plantillas personalizadas, y más.

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

| Opción                   | Descripción                                                               |
| ------------------------ | ------------------------------------------------------------------------- |
| `-m`, `--maxlength`      | Tamaño máximo (en bytes) por archivo generado (por defecto: `40000`)      |
| `-o`, `--output`         | Nombre base de los archivos de salida (por defecto: `project_prompt`)     |
| `-f`, `--format`         | Formato de salida: `txt`, `md`, o `json`                                  |
| `-i`, `--include`        | Carpetas a incluir, separadas por coma (ej: `src,test`)                   |
| `--template <file>`      | Ruta a un archivo `.promptmetemplate` personalizado                       |
| `--ignorefile <file>`    | Ruta a un archivo `.promptmeignore` personalizado                         |
| `--source <path>`        | Ruta del proyecto que se desea analizar (por defecto: directorio actual)  |
| `--stdout`               | Imprime la salida por consola en vez de escribir archivos                 |
| `--no-generate-defaults` | No genera `.promptmetemplate` ni `.promptmeignore` si no existen          |
| `--summary`              | Genera también un archivo `project_summary.txt` con detalles del proyecto |

---

## 🔄 Comando reset

Si has modificado la plantilla o el archivo `.promptmeignore` y deseas restablecerlos a sus valores por defecto, puedes hacerlo con:

```bash
promptme reset
```

Esto sobrescribirá los archivos `.promptmetemplate` y `.promptmeignore` con las versiones estándar proporcionadas por la herramienta.

---

## 📝 Ejemplos de uso

### 1. 📂 Generar prompts con nombre personalizado y formato markdown

```bash
promptme --output=context --format=md
```

### 2. 🧱 Incluir solo ciertas carpetas (ej. `src/` y `test/`)

```bash
promptme --include=src,test
```

### 3. 📚 Usar una plantilla personalizada

```bash
promptme --template=mi_template.promptmetemplate
```

### 4. 🔍 Usar un archivo `.promptmeignore` personalizado

```bash
promptme --ignorefile=custom.ignore
```

### 5. 📁 Analizar un directorio externo

```bash
promptme --source=../proyecto-cliente
```

### 6. 📊 Generar también el resumen del proyecto

```bash
promptme --summary
```

### 7. 🖨️ Mostrar el resultado directamente en consola (sin escribir archivos)

```bash
promptme --stdout
```

### 8. 🙅 No crear automáticamente `.promptmetemplate` ni `.promptmeignore`

```bash
promptme --no-generate-defaults
```

### 9. 💡 Combinar todo: analizar un proyecto externo, usar plantilla personalizada, sin generar archivos

```bash
promptme \
  --source=../app1 \
  --template=plantillas/app1.promptmetemplate \
  --ignorefile=configs/app1.ignore \
  --stdout \
  --no-generate-defaults \
  --include=src,lib \
  --format=md
```

---

## 🧠 Qué contiene el prompt generado

1. Un encabezado introductorio (puedes personalizarlo con una plantilla).
2. El contenido completo de los archivos fuente relevantes.
3. División automática en archivos si el tamaño supera el límite definido (`--maxlength`).
4. Un mensaje final indicando a la IA que el volcado ha terminado.

---

## 📄 Archivos especiales

### `.promptmeignore`

Funciona igual que un `.gitignore`. Aquí defines qué archivos no se deben incluir.
Se genera automáticamente si no existe (a menos que uses `--no-generate-defaults`).

### `.promptmetemplate`

Plantilla opcional para el texto inicial del prompt.
Se genera automáticamente si no existe (a menos que lo impidas con `--no-generate-defaults`).
Puedes modificarla o restablecerla con `promptme reset`.

---

## 📑 Archivo de resumen: `project_summary.txt`

Si usas la opción `--summary`, se generará un archivo que contiene:

- 📄 Lenguajes detectados (según extensión de archivo)
- 📦 Dependencias (`dependencies` y `devDependencies`) listadas en `package.json`

---

## 💡 Casos de uso

- Pasar el contexto de tu código a ChatGPT para refactoring o auditoría
- Compartir snapshots de tu proyecto con un equipo remoto
- Generar documentación estructurada del proyecto
- Hacer onboarding técnico a nuevos colaboradores
- Analizar estructura o calidad antes de migraciones o refactorings

---

## 🛠️ Contribuciones

¿Ideas, sugerencias o mejoras?
¡Las contribuciones están abiertas! Abre un issue o pull request en el repositorio.

---

## 📄 Licencia

MIT © 2025 - David Dávila
