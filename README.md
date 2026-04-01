# ObjectAtlas

A mobile-first web app for documenting physical objects through digital profiles and QR codes. ObjectAtlas connects each item to a public page with structured details, story, provenance, and media, making collections easier to explore, preserve, and share from any phone browser.

ObjectAtlas is designed for the web, but with a phone-first mindset. The experience should feel fast, focused, and easy to use on mobile for both visitors scanning QR codes and curators managing records on the go.

This project is being built with AI-assisted code generation under human guidance. The goal is to use AI to accelerate the base implementation while keeping product direction, technical decisions, and review visible and intentional.

---

## ✨ Features

- 📦 Object Profiles — Create a digital identity for each physical item
- 🔗 QR Code Access — Generate QR codes that open item pages instantly
- 📖 Storytelling — Add narrative context, descriptions, and historical meaning
- 🧾 Provenance Timeline — Record ownership, transfers, and key milestones
- 🖼️ Media Attachments — Add photos, scans, and supporting documents
- 🌐 Public Pages — Share readable mobile-friendly pages for each object
- 🗂️ Collections & Categories — Group related items into themes, sets, or exhibits
- 🔍 Search & Filters — Find items by title, tag, category, or metadata

---

## 🎯 Product Focus

ObjectAtlas is intentionally simple. It focuses on documenting objects well, presenting them clearly on mobile, and making QR-based access feel natural.

It is not intended to be a complex verification platform or an overloaded enterprise archive. The priority is a strong core experience:

- fast mobile access
- clear object records
- rich storytelling
- lightweight collection management
- easy public sharing

---

## 📱 Mobile-First Experience

The product is designed for mobile web first, then scaled up to larger screens.

- Visitors can scan a QR code and immediately open an object page
- Curators can quickly add or edit essential object information from a phone
- Media upload should feel camera-first and touch-friendly
- Timelines, galleries, and metadata should be easy to browse vertically
- Public pages should be clean, readable, and fast on mobile networks

---

## 🏗️ Root Structure

```
/apps
  /web        # frontend application
  /api        # backend application
/packages
  /ui         # shared UI components
  /types      # shared types and contracts
  /config     # shared configuration
/docs         # product and technical documentation
```

---

## ⚙️ Tech Stack

- Platform: Web only
- Experience: Mobile-first responsive design
- Frontend: Next.js + Tailwind CSS
- Backend: NestJS
- Database: PostgreSQL
- Local infrastructure: Docker Compose
- Storage: Filesystem-based at first, with an abstraction layer for future S3-compatible storage
- QR Code: Dynamic generation for public object pages

---

## 🧩 Core Screens

- Home or dashboard
- Object detail page
- Create/edit object flow
- Collections view
- Search results
- Public object page opened from QR scan

---

## 🔑 Core Concept

Each item in ObjectAtlas has:

- A unique identifier
- A digital profile page
- A QR code that resolves to that page

This creates a simple bridge between the physical and digital world, allowing anyone to scan an object and instantly access its story and history.

---

## 📌 Example Flow

1. Create a new item
2. Add metadata, story, and media
3. Generate a QR code
4. Attach the QR code to the physical item
5. Users scan and open the public object page on mobile

---

## 🛣️ Near-Term Roadmap

- Better filters and collection browsing
- Printable QR labels
- Multi-language object pages
- Basic collaborator roles
- Lightweight edit history

---

## 🧪 Current MVP Status

The repository now includes the first end-to-end MVP slice:

- NestJS API scaffold with PostgreSQL connectivity
- Next.js and Tailwind CSS mobile-first web app
- Object creation and editing
- Filesystem-backed media upload
- Public object pages by public identifier
- QR code generation for public object URLs
- Basic object listing and title search

---

## ▶️ Getting Started

1. Copy `.env.example` to `.env`
2. Start PostgreSQL with `docker compose up -d`
3. Install dependencies with `npm install`
4. Run the API with `npm run dev:api`
5. Run the web app with `npm run dev:web`

Default local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:3001/api`

Note:

- the media storage driver is filesystem-based for the MVP
- the web app expects the API to allow requests from `PUBLIC_APP_URL`
- automated tests are present in the repo, but they require dependencies to be installed before running `npm test`

---

## 📄 License

MIT
