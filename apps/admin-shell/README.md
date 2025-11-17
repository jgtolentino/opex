# InsightPulse Admin Shell

A unified admin console for InsightPulse AI stack built with Next.js 14 + Ant Design.

## Overview

The Admin Shell provides a single, branded interface for managing T&E expenses, PH tax compliance, OpEx tasks, contacts, and system integrations - all decoupled from Odoo's web UI.

**Specification**: See `/spec/insightpulse_admin_shell_v1.prd.yaml` and `tasks.md` in the root repository.

## Architecture

```
┌──────────────────────────────────────────────┐
│  Next.js 14 + Ant Design (Admin Shell)      │
│  - Dashboard                                 │
│  - T&E & Tax Console                         │
│  - OpEx Tasks                                │
│  - Contacts                                  │
│  - Integrations Status                       │
│  - Settings                                  │
└─────────────┬────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│  Supabase (Primary Data Layer)              │
│  - Tables: expenses, opex_tasks, contacts   │
│  - RLS policies for auth/access control     │
│  - Edge Functions for Odoo integration      │
└─────────────┬────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│  Odoo CE/OCA (Backend ERP)                   │
│  - Accessed via n8n workflows                │
│  - No direct UI coupling                     │
└──────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
cd apps/admin-shell
npm install
# or
pnpm install
```

### 2. Configure Environment

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the admin shell.

## Project Structure

```
apps/admin-shell/
├── app/                          # Next.js 14 app router pages
│   ├── layout.tsx                # Root layout with Ant Design ConfigProvider
│   ├── page.tsx                  # Dashboard (/)
│   ├── te-tax/page.tsx           # T&E & Tax Console
│   ├── opex-tasks/page.tsx       # OpEx Tasks
│   ├── contacts/page.tsx         # Contacts
│   ├── integrations/page.tsx     # System Integrations Status
│   └── settings/page.tsx         # User Settings
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx         # Main layout (sidebar + header + content)
│   └── navigation/
│       └── MainMenu.tsx          # Sidebar navigation menu
├── lib/
│   └── supabaseClient.ts         # Supabase client initialization
├── styles/
│   └── globals.css               # Global styles
├── .env.example                  # Environment variables template
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Features (v0.1 Scaffold)

### Implemented

- ✅ Next.js 14 with App Router
- ✅ Ant Design UI library with custom theme
- ✅ TypeScript support with path aliases (`@components/*`, `@lib/*`)
- ✅ Supabase client initialization
- ✅ Responsive layout with collapsible sidebar
- ✅ Navigation menu with 6 main routes
- ✅ Stub pages for all core modules

### Coming Soon (see spec/tasks.md)

- [ ] Supabase Auth integration (email/password + SSO)
- [ ] RLS-protected data hooks (useExpenses, useOpexTasks, useContacts)
- [ ] T&E Console with table + filters
- [ ] OpEx Tasks list with period/owner/status filters
- [ ] Contacts search and list
- [ ] Integrations status dashboard
- [ ] Settings page (theme toggle, AI features)
- [ ] AI insights panel/drawer

## Development Workflow

### Adding a New Page

1. Create page file in `app/your-route/page.tsx`
2. Add menu item to `components/navigation/MainMenu.tsx`
3. Update route handling in `MainMenu.tsx` `selectedKeys` logic

### Adding a Data Hook

1. Create hook in `lib/hooks/` (e.g., `useExpenses.ts`)
2. Use Supabase client from `lib/supabaseClient.ts`
3. Implement with React Query or SWR for caching
4. Call from page component

### Connecting to Supabase Tables

```typescript
// Example: lib/hooks/useExpenses.ts
import { supabase } from '@lib/supabaseClient';
import { useEffect, useState } from 'react';

export function useExpenses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');

      if (!error) setData(data);
      setLoading(false);
    }
    fetchExpenses();
  }, []);

  return { data, loading };
}
```

## Scripts

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Design System

### Colors

- **Primary**: `#ff9900` (orange) - configurable in `app/layout.tsx`
- **Border Radius**: 6px
- **Theme**: Light mode default (dark mode coming in settings)

### Icons

Using Ant Design icons:
- `AppstoreOutlined` - Dashboard
- `CalculatorOutlined` - T&E & Tax
- `CalendarOutlined` - OpEx Tasks
- `ContactsOutlined` - Contacts
- `ClusterOutlined` - Integrations
- `SettingOutlined` - Settings

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set root directory to `apps/admin-shell`
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Build

```bash
npm run build
npm run start
```

## Contributing

See root repository for contribution guidelines and development workflow.

## Related Documentation

- **PRD**: `/spec/insightpulse_admin_shell_v1.prd.yaml`
- **Tasks**: `/spec/insightpulse_admin_shell_v1.tasks.md`
- **Data Lab**: `/spec/insightpulse_data_lab.prd.yaml`
- **Supabase Integration**: `/docs/OPEX_RAG_INTEGRATION.md`

## License

MIT
