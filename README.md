# Nick Smith Sheriff

A full-stack TypeScript web application using Vite, Tailwind CSS, Express, and Drizzle ORM.

---

## 📁 Project Structure

```
NickSmithSheriff/
├── client/               # Frontend (React + Vite + Tailwind)
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── components/
│       ├── pages/
│       └── ...
├── server/               # Backend (Express + Drizzle)
│   ├── index.ts
│   ├── routes/
│   └── ...
├── shared/               # Shared utilities or types
├── attached_assets/      # Static or media assets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📦 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Node.js, Express, Drizzle ORM
- **Database**: (Configured via Drizzle ORM)
- **Type System**: TypeScript
- **Build Tools**: Vite, esbuild
- **Session & Auth**: Passport.js, Express-session
- **Payments**: Stripe integration

---

## 🚀 Scripts

| Script        | Description                            |
|---------------|----------------------------------------|
| `npm run dev` | Start the server in development mode   |
| `npm run build` | Build frontend + backend              |
| `npm start`   | Run the built app (production)         |
| `npm run check` | Type-check with `tsc`                |
| `npm run db:push` | Push schema changes via Drizzle    |

---

## 🛠 Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

---

## ✨ Notes

- Developed with Replit in mind (see `.replit` config)
- Frontend and backend are bundled separately
- Tailwind CSS + utility libraries (e.g., clsx, cva) for styling
- Stripe and OpenID libraries are included but may require secrets/config

---

## 📝 License

MIT
