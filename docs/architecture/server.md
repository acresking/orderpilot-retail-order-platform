# Server Architecture

The server is currently consolidated in `src/server/index.js` to avoid breaking the stable v45 behavior.

Recommended next splits:

```text
src/server/config/        environment and constants
src/server/http/          static hosting and request helpers
src/server/auth/          sessions, passwords and permissions
src/server/data/          JSON data store repositories
src/server/orders/        order rules and workflow
src/server/catalog/       products, categories, kosher and stock
src/server/notifications/ push/local notification queue
```

This version starts the architecture migration safely without changing API behavior.
