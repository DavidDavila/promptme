# 🧠 promptme

**`promptme`** es una herramienta CLI para generar archivos de texto con el contenido estructurado de tu proyecto, pensado especialmente para usarse como contexto en modelos de IA como ChatGPT o GPT-4.

Te permite exportar automáticamente tu código fuente ignorando archivos innecesarios, dividirlo en archivos por tamaño, generar un resumen del proyecto, y más.

## 🚀 Instalación

```bash
npm install -g promptme
```

````

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
| `-m`, `--maxlength` | Tamaño máximo (en bytes) por archivo generado (por defecto: `12000`)      |
| `-o`, `--output`    | Nombre base de los archivos de salida (por defecto: `project_prompt`)     |
| `-f`, `--format`    | Formato de salida: `txt`, `md`, o `json`                                  |
| `-i`, `--include`   | Carpetas a incluir, separadas por coma (`src,test`)                       |
| `--template <file>` | Ruta a un archivo `.promptmetemplate` personalizado                       |
| `--summary`         | Genera también un archivo `project_summary.txt` con detalles del proyecto |

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

1. Un encabezado introductorio (puedes personalizarlo).
2. El contenido completo de los archivos fuente.
3. El proyecto se divide en varios archivos si es muy grande para ChatGPT (limite ajustable con `--maxlength`).

---

## 📄 Archivos especiales

### `.promptmeignore`

Funciona igual que un `.gitignore`. Aquí defines qué archivos no se deben incluir. Ejemplo:

```
node_modules
dist
.git
package-lock.json
.env
```

### `.promptmetemplate`

Plantilla opcional para el texto inicial del prompt. Ejemplo:

```txt
# Análisis del proyecto

Estás viendo el contenido del proyecto `{projectName}`. Usa este contexto para responder futuras preguntas técnicas.
```

---

## 📑 Archivo de resumen: `project_summary.txt`

Si usas `--summary`, se generará un archivo con:

- Lenguajes detectados (por extensión)
- Dependencias (`dependencies` y `devDependencies` de `package.json`)

---

## 💡 Casos de uso

- Pasar el contexto de tu código a ChatGPT para refactoring o auditoría
- Compartir snapshots de tu proyecto
- Documentación automática y análisis semántico

---

## 🛠️ Contribuciones

¿Ideas, sugerencias o mejoras? ¡Las contribuciones están abiertas!

---

## 📄 Licencia

MIT © 2025 - David Davila
````
