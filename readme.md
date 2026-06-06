# Project Setup

## Install dependencies

```bash
pnpm install
```

## Configure environment variables

```bash
cp .env.copy .env
```

Editar el archivo `.env` y configurar el ID de Carrera/Institución correspondiente.

## Development mode

```bash
pnpm dev
```

La aplicación estará disponible en:

```txt
http://localhost:3000
```

## Lint

```bash
pnpm lint
```

## Production build

```bash
pnpm build
```

## Run production server

```bash
pnpm start
```

## Security Audit

```bash
pnpm audit
```

Verificar que el resultado sea:

```txt
No known vulnerabilities found
```