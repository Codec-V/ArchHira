# Contributing to ArchHira

Thank you for your interest in contributing to ArchHira! We welcome contributions from everyone, whether you are a TCP junior developer, a seasoned campus coder, or a first-time open-source contributor. This guide will help you get started.

## 🎯 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please ensure your interactions remain respectful and collaborative.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm
- Git

### Local Development Setup

1. **Fork the repository**
   Go to `https://github.com/NITRR-Official/ArchHira` and click "Fork" in the top-right corner.

2. **Clone your fork**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/ArchHira.git](https://github.com/YOUR_USERNAME/ArchHira.git)
   cd ArchHira
   
Add upstream remote

Bash
git remote add upstream [https://github.com/NITRR-Official/ArchHira.git](https://github.com/NITRR-Official/ArchHira.git)


4. **Install dependencies**
   ```bash
   npm install
   
Set up Environment Variables
Create a .env.local file in the root directory. You can use the in-memory fallback for quick UI tweaks, but MongoDB is recommended for full functionality:

Code snippet
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=hira-hall
ADMIN_EMAIL=superadmin@nitrr.ac.in
ADMIN_PASSWORD=your_secure_password


6. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
Start the development server

Bash
npm run dev

   The application will run on `http://localhost:3000`.

## 📋 How to Contribute

### 1. Finding Issues to Work On

- Look for issues labeled `good-first-issue` (perfect for first-time contributors).
- Check out issues labeled `help-wanted` for tasks needing core team input.
- Keep an eye out for `feature` labels, like the upcoming Golden Tower integration.

### 2. Before You Start

- **Check existing issues** - Make sure your idea isn't already being worked on.
- **Discuss major changes** - For large features or schema changes, please open an issue first.
- **Follow the development approach**:
  - Update `lib/validations.ts` (Zod schemas) and `lib/booking-logic.ts` first.
  - Implement API routes (`app/api/`).
  - Finally, build the UI components.

### 3. Making Changes

#### Branching Strategy
```bash
# Always branch off the latest main
git checkout main
git pull upstream main
git checkout -b feature/issue-number-description
Commit Messages
Use Conventional Commits:

Bash
# Good examples:
git commit -m "feat: add Golden Tower selection to booking form"
git commit -m "fix: resolve date-fns timezone offset bug in calendar"
git commit -m "refactor: switch WebSocket logic to POST requests"

# Format: type(scope): subject
# Types: feat, fix, docs, test, chore, refactor, perf
Code Quality
Before pushing, ensure your code is clean and builds successfully:

Bash
# Linting
npm run lint

# Production Build Test
npm run build
4. Push and Create Pull Request
Bash
# Push to your fork
git push origin feature/issue-number-description
Go to GitHub and click "Compare & pull request".

In the PR description:

Reference the issue: Closes #123

Explain what changed and why.

Mention if any .env variables or MongoDB schema changes are required.

🔍 Code Review Process
Automated checks: Linting and build steps must pass.

Manual review: Core team members will review your Next.js architecture, UI consistency (Tailwind), and backend logic.

Feedback: We may request changes. Please treat these as collaborative suggestions to make the codebase stronger.

Merge: Once approved, a maintainer will merge your PR.

🏗️ Architecture & Design Patterns
Next.js App Router
Frontend & Backend in One: We use Next.js Route Handlers (app/api/) for backend logic. Stick to our standard asynchronous POST/GET request architecture (no WebSockets).

Styling: Tailwind CSS with a glassmorphism aesthetic for public pages.

Components: Reusable UI lives in /components/ (e.g., booking-calendar.tsx).

State & Validation
Forms: We strictly use react-hook-form paired with @hookform/resolvers/zod.

Validation: All incoming API data and form inputs MUST be validated against schemas in lib/validations.ts.

Database & Logic
Storage: MongoDB handles global storage. The connection logic is cached in lib/mongodb.ts.

Business Logic: Conflict checking and admin date-rules (e.g., the 7-day minimum buffer) are centralized in lib/booking-logic.ts.

📚 Project Structure
Plaintext
archhira/
├── app/                  # Next.js App Router (Pages & API routes)
│   ├── admin/            # Admin dashboard and auth flows
│   ├── api/              # Backend Route Handlers
│   └── book/             # Facility booking flows
├── components/           # Reusable React components (UI, Forms, Calendar)
├── lib/                  # Core business logic, Zod schemas, DB connections
├── types/                # TypeScript interfaces and Enums
├── .env.example          # Template for environment variables
├── README.md             # Project overview
└── CONTRIBUTING.md       # This file
🐛 Reporting Bugs & 💡 Suggesting Features
We use GitHub Issues to track bugs and feature requests.

Be as descriptive as possible.

For bugs, include steps to reproduce, expected vs. actual behavior, and error logs if applicable.

For features, explain the use case and how it benefits the campus ecosystem.

📜 License
By contributing, you agree that your contributions will be licensed under the MIT License.

Happy coding! We're excited to build ArchHira with you. 🚀
