# Camera Planner — React + MUI + Cloudflare Starter

This ZIP is an upgraded foundation of your original stadium camera planner, rebuilt as a **React + MUI** app with a **Cloudflare-ready structure**.

## Included now
- React + MUI frontend
- Glassy dark UI theme
- Sport switching: Football / Basketball / Handball
- Drag-and-drop camera placement
- Camera table editing
- PNG / PDF / HTML export from the browser
- Cloudflare Pages Functions API structure
- D1 schema for users, roles, permissions, projects, camera types, purposes, lenses
- R2 upload endpoint for camera images/assets
- Login foundation with role-based permissions
- Project save/load using D1 API endpoints

## Important honesty
This is a **starter foundation**, not the final fully-polished product yet.

Already working in code:
- React planner UI
- save/load API flow
- login flow
- role permission checks
- D1 schema/seed
- R2 upload endpoint

Still recommended next:
- stronger production password hashing
- full admin screens for users/roles/reference tables
- project browser/history/versioning
- upload UI on the frontend
- image-backed pitch templates if you want exact venue backgrounds
- richer export layouts
- finer editing tools and accessibility polish

## Suggested Cloudflare setup
1. Create a GitHub repo and upload this project.
2. Create a Cloudflare Pages project connected to that repo.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Create a D1 database.
6. Create an R2 bucket.
7. Update `wrangler.jsonc` with your real D1 database ID and R2 details.
8. Run the schema and seed files.

## Local dev
```bash
npm install
npm run build
npm run dev
```

## D1 commands
```bash
npx wrangler d1 create camera-planner-db
npx wrangler d1 execute CAMERA_DB --remote --file=./schema.sql
npx wrangler d1 execute CAMERA_DB --remote --file=./seed.sql
```

## Default starter login
- Email: `admin@planner.local`
- Password: `ChangeMe123!`

Change this before production.

## Functions included
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/reference`
- `POST /api/upload`

## Best next step
After you test this structure, the next clean move is to build:
1. Admin panel for users / roles / permissions
2. Project browser with filters and archived states
3. Upload UI wired to R2
4. Editable D1 master tables for camera types / purposes / lenses
5. Better planner interaction tools and review mode
