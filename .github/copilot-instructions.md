# Copilot Instructions for Movilidad Mundial

## Big Picture Architecture

- **Monorepo Structure:**
  - `apps/server/`: Node.js + Express.js backend API, Sequelize ORM, supports MySQL/PostgreSQL/SQLite.
  - `apps/web/`: React + Vite frontend, shadcn/ui, RBAC admin UI.
  - `docs/`: Technical documentation, patterns, flows, and integration guides.
  - `.cursor/rules/`: Project-specific development rules and conventions.
- **Major Flows:**
  - Advanced scheduling (agendamiento) for vehicle inspections.
  - Multichannel notifications (Email, SMS, WebSocket, Push, WhatsApp).
  - Contact center management (agents, coordinators, roles).
  - Event-driven architecture with webhooks for external integrations.

## Developer Workflows

- **Backend Setup:**
  - Install dependencies: `npm install` in `apps/server/`
  - Configure environment: Copy `.env.example` to `.env` and edit DB/JWT/port settings.
  - DB setup: `npm run setup:db` (use `FORCE_DB=true` for forced recreation)
  - Seeding: `npm run seed` (basic) or `npm run seed:all` (full data)
  - Start server: `npm start` or `node index.js`
- **Frontend Setup:**
  - Install dependencies: `npm install` in `apps/web/`
  - Start dev server: `npm run dev`
- **Testing & Debugging:**
  - See `docs/debugging-and-troubleshooting.md` for backend/frontend troubleshooting.
  - Key scripts: `apps/server/scripts/` (e.g., `generateHmac.js`, `seedAll.js`)


## Project-Specific Conventions

- **ES Modules:**
  - Use `import`/`export` syntax throughout the codebase (no `require`/`module.exports`).
  - All backend and frontend files should follow ES Modules conventions.
- **Controllers:**
  - Located in `apps/server/controllers/`, follow CRUD + soft delete patterns (see `baseController.js`).
- **Models:**
  - Located in `apps/server/models/`, use Sequelize, soft deletes via `baseModel.js`.
  - Shared models: `peritajeOrder.js` and `peritajeAgendamiento.js` follow the same pattern as other models, registered in `index.js` and related via 1:N (`PeritajeOrder.hasMany(PeritajeAgendamiento)`).
- **RBAC:**
  - Roles/permissions managed via admin UI (`/admin`), permissions are granular and endpoint/method-specific.
- **Notifications:**
  - Templates in `apps/server/mailTemplates/`, logic in `services/notificationService.js`.
- **WebSockets:**
  - Real-time events via `apps/server/websocket/` and documented in `docs/websockets-system.md`.
- **Naming:**
  - Use hierarchical, context-rich names (see `.cursor/rules/naming-conventions.mdc`).
  - Reference files using relative paths, e.g., `apps/web/src/App.jsx`.

## Integration Points

- **Webhooks:**
  - Defined in `apps/server/controllers/webhookController.js`, see `docs/webhook-system.md` and `docs/webhook-inspection-order-started.md`.
- **External APIs:**
  - SMS: Hablame API (Colombia)
  - WhatsApp: WhatsApp Business API
- **Frontend/Backend Communication:**
  - REST endpoints, documented in `docs/api-controllers.md`.
  - WebSocket events, see `docs/websockets-system.md`.

## Key References & Patterns

- Shared models:
  - Main: `apps/server/models/peritajeOrder.js`
  - Agendamientos: `apps/server/models/peritajeAgendamiento.js`
  - Registered and related in: `apps/server/models/index.js`

- Main backend entry: `apps/server/index.js`
- Main frontend entry: `apps/web/src/App.jsx`
- Database config: `apps/server/config/database.js`
- Seeding: `apps/server/scripts/seedAll.js`
- Notification logic: `apps/server/services/notificationService.js`
- WebSocket logic: `apps/server/websocket/index.js`
- RBAC UI: `/admin` in frontend
- All technical rules: `.cursor/rules/` (see `rule-generation-guidelines.mdc` for structure)

## Example File References

- `[peritajeOrder.js](mdc:apps/server/models/peritajeOrder.js)`
- `[peritajeAgendamiento.js](mdc:apps/server/models/peritajeAgendamiento.js)`

- `[App.jsx](mdc:apps/web/src/App.jsx)`
- `[seedAll.js](mdc:apps/server/scripts/seedAll.js)`
- `[package.json](mdc:apps/server/package.json)`

## Troubleshooting & Further Reading

- See `docs/debugging-and-troubleshooting.md` for common issues and solutions.
- For conventions, see `docs/development-patterns.md`, `.cursor/rules/`.
- For business flows, see `docs/inspection-order-flow.md`, `docs/agent-contact-patterns.md`.

---
