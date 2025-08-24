# Question Bank Admin Dashboard

A Next.js application for managing a question bank system. Administrators can create, update, and delete subjects, modules, sub-modules, and questions with multiple answers.

## Features

- **Subject Management**: Create, view, update, and delete subjects
- **Module Management**: Create, view, update, and delete modules (attached to subjects)
- **Sub-Module Management**: Create, view, update, and delete sub-modules (attached to modules)
- **Question Management**: Create, view, update, and delete questions with multiple answers (attached to sub-modules)
- **Hierarchical Organization**: Questions are organized in a hierarchical structure (Subject > Module > Sub-Module > Question)

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **Database**: SQLite (via Prisma)
- **Form Handling**: React Hook Form with Zod validation
- **Data Display**: TanStack Table

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd demo-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma migrate dev
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Database Schema

The application uses the following data model:

- **Subject**: Top-level category
- **Module**: Belongs to a Subject
- **SubModule**: Belongs to a Module
- **Question**: Belongs to a SubModule, contains multiple Answers
- **Answer**: Belongs to a Question, can be marked as correct or incorrect

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
