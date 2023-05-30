# one

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run your unit tests
```
npm run test:unit
```

### Configuración de entorno

Crear archivo `frontend/.env.local` usando `frontend/.env` como plantilla guía
(ruta relativa a la raíz del repositorio git).

```
cp frontend/.env frontend/.env.local
```

Reemplazar valores de acuerdo a entorno deseado. Entornos e inyección de
variables usando [dotenv](https://www.npmjs.com/package/dotenv).