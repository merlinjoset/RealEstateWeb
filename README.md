# Jose For Land — Real Estate Web

React + TypeScript + Vite frontend for the **Jose For Land** real estate platform serving Kanyakumari district, Tamil Nadu.

## Stack

- **React 19** + **TypeScript**
- **Vite 5** (build & dev server)
- **Tailwind CSS v4** (CSS-based config via `@tailwindcss/vite`)
- **React Router v7** (client routing)
- **TanStack Query** (data fetching)
- **Axios** (HTTP client with JWT interceptor)
- **Leaflet + react-leaflet** (interactive map view)
- **Lucide React** (icon system)

## Features

- 🏠 Land property listings with search, filters, and grid/list views
- 🗺️ **Interactive map view** with custom price-pin markers and property type filtering
- 🏡 Property detail pages with image gallery, documents (EC/Patta/Chitta), and inquiry forms
- 🎬 **Video testimonials** carousel from real clients
- 👨‍💼 **Admin panel** with full CRUD:
  - Property management (add/edit with live preview, validation, multi-image upload)
  - Pending approvals workflow (approve/reject client submissions)
  - User & inquiry management
  - Testimonials editor
  - Settings (company info, branding, notifications)
- 🔐 JWT authentication with refresh tokens
- 📞 WhatsApp + Call CTAs throughout
- 🎨 Brand-consistent design system (coral / olive / cream palette)
- 📱 Fully responsive

## Brand & Domain

Tailored specifically for the Indian land market:

- Pricing in **Lakhs (₹X.XX L)** and **Crores (₹X.XX Cr)**
- Land area in **cents** (Tamil Nadu unit, 1 cent ≈ 435.6 sq ft)
- Locations: Nagercoil, Marthandam, Thuckalay, Kanyakumari, Colachel, Padmanabhapuram
- Legal documents: EC, Patta, Chitta, Layout, FMB sketches

## Project Structure

```
RealEstateWeb/
├── public/                # Static assets (logo, favicon)
├── src/
│   ├── components/
│   │   ├── home/          # Hero, Stats, Featured, Locations, WhyChooseUs, etc.
│   │   ├── layout/        # Navbar, Footer, PageHeader
│   │   └── properties/    # Card, Filters, Gallery, Documents
│   ├── context/           # AuthContext (login, JWT mgmt)
│   ├── hooks/             # useProperties, useProperty, useFeatured
│   ├── pages/
│   │   ├── HomePage / PropertiesPage / PropertyDetailPage
│   │   ├── MapViewPage    # Leaflet-powered map
│   │   ├── AboutPage / ContactPage
│   │   ├── LoginPage / RegisterPage
│   │   └── admin/         # AdminLayout, Dashboard, Properties,
│   │                       # AddProperty, PendingApprovals,
│   │                       # Testimonials, Users, Inquiries, Settings
│   ├── services/api.ts    # Axios instance + endpoint definitions
│   ├── types/index.ts     # Shared TypeScript interfaces
│   ├── App.tsx            # Routes + providers
│   └── index.css          # Tailwind + brand theme variables
├── index.html
├── vite.config.ts
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js 20+** (or 22.13+, 24+)
- **npm** 10+

### Setup

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server starts on **http://localhost:3000** with HMR enabled. API requests to `/api/*` are proxied to `http://localhost:5000` (the .NET backend) — change in `vite.config.ts` if your API runs elsewhere.

### Backend

The companion .NET 8 API lives at [merlinjoset/RealEstateApi](https://github.com/merlinjoset/RealEstateApi).

Start it on port 5000 (`dotnet run`) before running the frontend dev server, or the proxied API calls will 502.

### Default Admin

Use the admin seeded in the API:

```
Email:    admin@joseforland.com
Password: Admin@123
```

> Change immediately in any non-development environment.

## Brand Colors

Defined as CSS variables in `src/index.css`:

| Token              | Hex       | Usage                                  |
| ------------------ | --------- | -------------------------------------- |
| `--color-brand-coral`     | `#FF5A5F` | Primary CTAs, prices, highlights |
| `--color-brand-olive`     | `#6A9739` | Secondary CTAs, verified badges  |
| `--color-brand-olive-light` | `#8BC34A` | Soft accents                  |
| `--color-brand-cream`     | `#F8F6F3` | Hero / page header backgrounds   |
| `--color-brand-slate`     | `#293237` | Dark sections, top bar           |
| `--color-brand-dark`      | `#111111` | Footer, headlines                |
| `--color-brand-wa`        | `#25D366` | WhatsApp button                  |

## License

Proprietary — Jose For Land. All rights reserved.
