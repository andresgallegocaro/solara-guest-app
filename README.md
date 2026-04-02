# SOLARA Guest App

Guest App + Panel de Administración para SOLARA Luxury Hospitality.  
Conectado a Notion. Desplegado en Vercel.

---

## URLs una vez publicado

| URL | Para quién |
|---|---|
| `tuapp.vercel.app/` | Página de inicio |
| `tuapp.vercel.app/guest?id=RES-001` | Huésped (Carlos Méndez) |
| `tuapp.vercel.app/guest?id=RES-002` | Huésped (Sarah Johnson) |
| `tuapp.vercel.app/admin` | Panel de administración (solo tú) |

---

## GUÍA DE DEPLOY — Paso a paso

### PASO 1 — Conseguir tu API Key de Anthropic

1. Ve a https://console.anthropic.com
2. Crea una cuenta (o inicia sesión)
3. Ve a **"API Keys"** → **"Create Key"**
4. Copia la key — empieza por `sk-ant-...`
5. Guárdala, la necesitas en el Paso 4

> 💡 Cuesta centavos por uso. Con $5 USD tienes para miles de conversaciones.

---

### PASO 2 — Subir el código a GitHub

1. Ve a https://github.com
2. Haz clic en **"New repository"** (botón verde)
3. Nombre: `solara-guest-app`
4. Déjalo en **Public** (o Private si prefieres)
5. Haz clic en **"Create repository"**
6. Verás una página con instrucciones. Haz clic en **"uploading an existing file"**
7. **Arrastra TODOS los archivos de esta carpeta** al área de GitHub
   - ⚠️ Importante: arrastra también las subcarpetas (`src/`, `public/`)
   - ⚠️ NO subas el archivo `.env` si lo has creado (tiene tus claves privadas)
8. Escribe un mensaje: `Primera versión SOLARA Guest App`
9. Haz clic en **"Commit changes"**

---

### PASO 3 — Conectar GitHub con Vercel

1. Ve a https://vercel.com
2. Haz clic en **"Add New Project"**
3. Selecciona **"Import Git Repository"**
4. Conecta tu cuenta de GitHub si no lo has hecho
5. Busca `solara-guest-app` y haz clic en **"Import"**
6. Vercel detecta automáticamente que es un proyecto Vite/React
7. **No cambies nada** — deja todo por defecto
8. Haz clic en **"Deploy"**
9. Espera ~2 minutos. Verás una URL como `solara-guest-app.vercel.app` ✅

---

### PASO 4 — Configurar las variables de entorno (las claves privadas)

Esto es lo más importante. Sin este paso la IA no funciona.

1. En Vercel, ve a tu proyecto → **"Settings"** → **"Environment Variables"**
2. Añade estas 3 variables una por una:

| Nombre | Valor |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | Tu key de Anthropic (`sk-ant-...`) |
| `VITE_NOTION_RESERVAS_PAGE` | `336f5763-e9c3-817e-938e-c52e8c7dbac7` |
| `VITE_NOTION_ROOT_PAGE` | `325f5763-e9c3-8194-8aaa-fffd760bd5b4` |

3. Para cada una: escribe el nombre → pega el valor → haz clic en **"Save"**
4. Ve a **"Deployments"** → haz clic en los 3 puntos del último deploy → **"Redeploy"**
5. Espera ~1 minuto

---

### PASO 5 — Probar que funciona

Abre en tu móvil:
- `tuapp.vercel.app/guest?id=RES-001` — deberías ver la Guest App de Carlos Méndez
- `tuapp.vercel.app/admin` — deberías ver el panel de administración
- Prueba el chat del concierge — si responde, todo funciona ✅

---

### PASO 6 (opcional) — Conectar tu dominio propio

Si tienes `solarahomes.com.co`:

1. En Vercel → **"Settings"** → **"Domains"**
2. Escribe `app.solarahomes.com.co` (o el subdominio que quieras)
3. Vercel te da unos registros DNS
4. En tu proveedor de dominio, añade esos registros
5. En ~24h funciona en `app.solarahomes.com.co/guest?id=RES-001`

---

## Flujo operativo diario

1. Recibes reserva en Airbnb / Booking
2. Abres `tuapp.vercel.app/admin`
3. Haces clic en **"+ Nueva"** y rellenas el formulario
4. La app crea automáticamente la página en Notion
5. Copias el enlace del huésped (`tuapp.vercel.app/guest?id=RES-003`)
6. Se lo envías por WhatsApp al huésped antes de su llegada
7. El huésped hace check-in online, ve el código de acceso y chatea con el concierge IA

---

## Añadir nuevas reservas después

Cada vez que crees una reserva en el panel admin, se guarda en Notion automáticamente.  
El enlace para el huésped siempre tiene el formato: `/guest?id=RES-XXX`

---

## Soporte

Si algo falla en el deploy, los pasos más comunes de diagnóstico:

1. **La app no carga** → verifica que todos los archivos se subieron a GitHub incluyendo `index.html`
2. **El chat no funciona** → verifica que la `VITE_ANTHROPIC_API_KEY` está bien en Vercel y que hiciste Redeploy
3. **Error de Notion** → la integración de Notion requiere el MCP activo en Claude.ai; para producción habría que usar la Notion API directamente (próximo paso cuando escales)

---

*SOLARA Luxury Hospitality Asset Management · hola@solarahomes.com.co*
