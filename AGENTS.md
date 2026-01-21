# AGENTS.md

This document provides guidelines for agentic coding agents operating in this repository.

## Build Commands

```bash
# Development
npm run dev              # Start Next.js development server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint

# Database Setup (Supabase)
npm run setup:tables     # Set up Supabase tables
npm run setup:db         # Set up database tables
npm run setup:guide      # Create tables manually guide
npm run setup:user-tables # Create user-based tables

# Data Management
npm run test:supabase    # Test Supabase connection
npm run import:personnel # Import personnel to Supabase
npm run upload:personnel # Upload personnel to database
npm run fix:rls          # Fix RLS policies
npm run check:deploy     # Check deployment status
```

## Code Style Guidelines

### Language
- **Primary**: JavaScript (React 19, Next.js 16 App Router)
- **No TypeScript**: This project uses plain JavaScript (`.jsx`, `.js` files)
- **Localization**: Chinese comments, UI text, and documentation

### Imports
- Use **absolute imports** with `@` alias:
  ```javascript
  import Button from "@/components/ui/button";
  import { supabase } from "@/lib/supabase";
  import { calculateTotalScore } from "@/data/evaluationCriteria";
  ```
- Import order: React → libraries → components → utilities → data

### Naming Conventions
- **Components**: PascalCase (`EvaluationVote`, `ErrorBoundary`, `AdminDashboard`)
- **Files**: kebab-case for utilities, PascalCase for components
- **Variables/Functions**: camelCase (`handleEvaluationChange`, `userEvaluations`)
- **Constants**: UPPER_SNAKE_CASE for config constants, camelCase for exported data objects

### Component Structure
```javascript
"use client";  // Required for client-side components

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ComponentName({ prop1, prop2 }) {
  // 1. State declarations
  const [state, setState] = useState(initialValue);

  // 2. Effect hooks
  useEffect(() => {
    // initialization logic
  }, [dependencies]);

  // 3. Handler functions
  const handleAction = () => {
    // logic
  };

  // 4. Helper functions (defined after handlers)
  const getValue = () => {
    // logic
  };

  // 5. Render
  return (
    <div className="...">
      {/* component JSX */}
    </div>
  );
}
```

### Error Handling
- Always wrap async operations in `try-catch`:
  ```javascript
  try {
    const result = await fetchData();
    // handle result
  } catch (error) {
    console.error("Operation failed:", error);
    toast.error(error.message || "Operation failed");
  }
  ```
- Never leave empty catch blocks
- Use toast notifications for user-facing errors
- Log errors to console for debugging

### API Routes (Next.js App Router)
```javascript
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get("param");

    const { data, error } = await supabase
      .from("table")
      .select("*")
      .eq("column", param);

    if (error) {
      console.error("Query failed:", error);
      return NextResponse.json(
        { error: "Error message", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
```

### Styling
- **Framework**: Tailwind CSS v4 with CSS variables
- **Components**: shadcn/ui component library (`@/components/ui/*`)
- **Utility**: Use `cn()` helper for conditional classes:
  ```javascript
  import { cn } from "@/lib/utils";
  <div className={cn("base-class", condition && "conditional-class")}>
  ```

### Data Files
- Store constants and configuration in `@/data/*`:
  ```javascript
  // @/data/evaluationCriteria.js
  export const defaultCriteria = {
    responsibility: { name: "责任心", options: [...] },
    // ...
  };

  export const calculateTotalScore = (evaluations) => { ... };
  ```

### Database
- **Provider**: Supabase (PostgreSQL)
- **Client**: `@supabase/supabase-js`
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_KEY`

### File Organization
```
src/
├── app/                    # Next.js pages and routes
│   ├── api/               # API routes
│   ├── vote/              # Feature pages
│   └── admin/             # Admin pages
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── vote/              # Vote feature components
│   └── admin/             # Admin components
├── data/                  # Constants and configuration
├── lib/                   # Utilities and configs
└── ...
```

### Important Notes
- All UI components are client-side: include `"use client"` directive
- Use `next/navigation` hooks (`useRouter`, `usePathname`)
- Use `sonner` for toast notifications
- All comments and UI text are in Chinese
- This is a personnel evaluation system for 国贸集团青云通公司
