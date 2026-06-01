# Spot

React + TypeScript + Vite playground UI.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Images

Drop image files into either folder:

| Folder | Use in code |
|--------|-------------|
| `public/assets/images/` | `<img src="/assets/images/photo.jpg" alt="" />` |
| `src/assets/images/` | `import photo from "./assets/images/photo.jpg"` then `<img src={photo} />` |

`public/` is easiest for drag-and-drop (no import needed). `src/assets/` is processed by Vite (hashing, optimization).

## Env

Previous keys are in `.env.backup` when you add a backend again.
