# OrderPilot Architecture

This project is now organized around a clear runtime boundary while staying compatible with the existing v45 codebase.

## Runtime layers

```text
server.js                 Root runtime entrypoint for npm start / Linux / Electron.
src/server/index.js       Server implementation and API routes.
public/                   Runtime web assets served to browser, Android/iOS WebView and desktop shell.
src/client/mobile/        Source of truth for the branch mobile app JavaScript.
src/client/admin/         Source of truth for the company/admin panel JavaScript.
src/client/shared/        Source of truth for shared CSS.
desktop/                  Electron shell for the computer program.
scripts/                  Build, setup, diagnostics and deployment helpers.
docs/architecture/        Architecture notes.
```

## Build flow

The project intentionally does not require a frontend bundler yet. To keep the app stable, runtime files still exist in `public/`, while editable source files live under `src/client/`.

When editing client code:

```bash
npm run build:web
```

This copies:

```text
src/client/mobile/app.js  -> public/app.js
src/client/admin/admin.js -> public/admin.js
src/client/shared/styles.css -> public/styles.css
```

## Data policy

`data/` is runtime state only. It must not be included in code-only updates or Git commits.

## Future refactor path

1. Keep `server.js` as a small entrypoint.
2. Split `src/server/index.js` gradually into `routes`, `services`, `repositories`, and `middleware`.
3. Keep API contracts stable while moving one feature at a time.
4. Add automated tests before replacing the static client with a bundler.
