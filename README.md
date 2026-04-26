# Team Skill-Map Hackathon

> A comprehensive skill-building platform built with modern web technologies to help teams upskill and collaborate effectively.

## 🌐 Live Demo

- Visit the application: [https://team-skill-up-hackathon.vercel.app](https://team-skill-up-hackathon.vercel.app)
- Front end repo: [Team-SkillMap-Frontend](https://github.com/codelordess/team-skill-up-hackathon.git)
- Back-end repo: [Team -SkillMap-Backend](https://github.com/emmanuelfred/skillmap)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Language Composition](#language-composition)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Key Integrations](#key-integrations)
- [Contributing](#contributing)
- [Support & Resources](#support--resources)

---

## 🎯 Overview

**Team Skill-Up Hackathon** is a modern web application designed to facilitate team skill development and knowledge sharing. The platform leverages cutting-edge technologies to provide an intuitive, accessible, and feature-rich experience for users looking to upskill and collaborate with their peers.

Built with **TypeScript**, **React**, **Vite**, and **Supabase**, this project demonstrates best practices in modern web development, including component-driven architecture, real-time data synchronization, and responsive design patterns.

---

## 🛠️ Tech Stack

### Frontend Framework
- **React** (v18.3.1) - JavaScript library for building user interfaces
- **TypeScript** (v5.8.3) - Typed superset of JavaScript
- **Vite** (v5.4.19) - Next-generation frontend build tool

### Styling & UI
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful icon library
- **Tailwind Merge** - Merge Tailwind CSS classes intelligently

> 📌 **Note:** The backend for this project is located at [skillmap-backend](https://github.com/emmanuelfred/skillmap.git). Refer to that repository for backend setup, deployment, and API documentation.

---

## 📊 Language Composition

| Language | Percentage | Purpose |
|----------|-----------|---------|
| **TypeScript** | 97% | Main application code |
| **PLpgSQL** | 1.7% | Database functions and stored procedures |
| **Other** | 1.3% | Configuration and miscellaneous files |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v8 or higher) or **yarn** (v1.22 or higher)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation

```bash
node --version
npm --version
git --version
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/codelordess/team-skill-up-hackathon.git
cd team-skill-up-hackathon
```

### 2. Install Dependencies

Using **npm**:
```bash
npm install
```

Or using **yarn**:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can obtain these values from your [Supabase Dashboard](https://app.supabase.com/).

### 4. Verify Installation

```bash
npm run lint
```

---

## 💻 Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (Vite default port).

### Hot Module Replacement (HMR)

Vite provides fast HMR, so changes you make are reflected instantly in the browser without full page reloads.

### Code Quality Checks

Run ESLint to check for code quality issues:

```bash
npm run lint
```

---

## 🏗️ Building for Production

### Build Optimized Bundle

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Development Build

To create a development build (with source maps and debugging info):

```bash
npm run build:dev
```

### Preview Production Build

```bash
npm run preview
```

This starts a local server to preview the production build before deploying.

---

## 🧪 Testing

### Run Tests Once

```bash
npm run test
```

### Watch Mode (Continuous Testing)

```bash
npm run test:watch
```

Tests use **Vitest** and **React Testing Library**. Tests automatically re-run as you modify code in watch mode.

### Writing Tests

Create test files with `.test.ts` or `.test.tsx` extensions and place them alongside your components.

---

## 📁 Project Structure

```
team-skill-up-hackathon/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Page components (routes)
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   ├── lib/               # Library integrations (Supabase, etc.)
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── dist/                  # Production build output
├── .eslintrc.json         # ESLint configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── package.json           # Project dependencies
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

---

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start dev server with HMR |
| Build | `npm run build` | Create optimized production build |
| Build Dev | `npm run build:dev` | Create development build with source maps |
| Lint | `npm run lint` | Run ESLint to check code quality |
| Preview | `npm run preview` | Preview production build locally |
| Test | `npm run test` | Run tests once |
| Test Watch | `npm run test:watch` | Run tests in watch mode |

---

## 🔌 Key Integrations

### Supabase
The project integrates with **Supabase** for:
- User authentication
- Real-time database
- Storage
- Edge functions

Database includes **PLpgSQL** stored procedures for complex queries and operations.

### Vercel Deployment
The application is deployed on **Vercel** and accessible at:
[https://team-skill-up-hackathon.vercel.app](https://team-skill-up-hackathon.vercel.app)

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/team-skill-up-hackathon.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit with clear messages
   ```bash
   git commit -m "feat: Add your feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** against the main repository

### Code Style
- Follow the existing code style and conventions
- Use TypeScript for type safety
- Write meaningful commit messages
- Ensure all tests pass before submitting PR

---

## 📖 Support & Resources

### Documentation
- **Vite Documentation** - [vitejs.dev](https://vitejs.dev/)
- **React Documentation** - [react.dev](https://react.dev/)
- **TypeScript Documentation** - [typescriptlang.org](https://www.typescriptlang.org/)
- **Tailwind CSS** - [tailwindcss.com](https://tailwindcss.com/)
- **shadcn/ui** - [ui.shadcn.com](https://ui.shadcn.com/)
- **Supabase** - [supabase.com/docs](https://supabase.com/docs)

### GitHub
- **Repository** - [github.com/codelordess/team-skill-up-hackathon](https://github.com/codelordess/team-skill-up-hackathon)
- **Backend Repository** - [github.com/emmanuelfred/skillmap-backend](https://github.com/emmanuelfred/skillmap-backend)
- **Issues** - [Report bugs or request features](https://github.com/codelordess/team-skill-up-hackathon/issues)
- **Discussions** - [Community discussions](https://github.com/codelordess/team-skill-up-hackathon/discussions)

### Live Application
- **Deployment** - [team-skill-up-hackathon.vercel.app](https://team-skill-up-hackathon.vercel.app)

---

## 📝 License

This project is part of a hackathon initiative and is open source.

---

## 👨‍💻 Author

Created by [@codelordess](https://github.com/codelordess)

---

## ⭐ Support

If you find this project helpful, please consider:
- Starring the repository
- Sharing it with others
- Contributing improvements
- Providing feedback and suggestions

**Happy coding! 🚀**
