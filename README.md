<div align="center">
<h1>SIGEH - Sistema de Gestión Hotelera</h1>
<p>Aplicación web moderna para la administración hotelera: control de habitaciones, check-in/check-out, reservas, caja y reportes.</p>
</div>

## Tecnologías

- **React 19** + **TypeScript**
- **Vite 6**
- **Tailwind CSS**
- **Firebase Firestore** (base de datos en la nube)

## Desarrollo Local

**Prerrequisitos:** Node.js

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Build para Producción

```bash
npm run build
```

El build se genera en la carpeta `dist/`.

## Despliegue en GitHub Pages

1. Buildear el proyecto: `npm run build`
2. Subir la carpeta `dist/` a la rama `gh-pages` del repositorio
3. Configurar GitHub Pages para que use la rama `gh-pages`

O usando GitHub Actions (recomendado): el workflow `.github/workflows/deploy.yml` automatiza el despliegue.

## Despliegue con Firebase

1. Instalar Firebase CLI: `npm install -g firebase-tools`
2. Configurar Firebase Hosting: `firebase init hosting`
3. Desplegar: `firebase deploy --only hosting`
