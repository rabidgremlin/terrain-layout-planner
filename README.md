# terrain-layout-planner
Planning tool for testing out wargame board terrain layouts.


```
npm install
npm run dev
```

Site: https://rabidgremlin.github.io/terrain-layout-planner/

## Checks

```sh
npm run typecheck
npm run lint
npm run build
npx playwright install --with-deps chromium
npm test
```

The browser tests start the Vite development server and use isolated browser
storage. Layouts autosave in the current browser; no account or server is needed.
