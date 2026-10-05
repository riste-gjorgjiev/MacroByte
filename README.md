# MacroByte - Nutrition Tracker

A modern, responsive web application for tracking daily nutrition intake, built with Next.js and Supabase.

![MacroByte](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

### Core Features
- **User Authentication** - Secure sign up, login, and logout with Supabase Auth
- **Food Database** - 90+ seeded foods with complete nutritional information
- **Food Search** - Real-time search with category filtering
- **Food Logging** - Log foods with customizable serving sizes and meal types
- **Daily Dashboard** - Track calories, macros, and micros with progress bars
- **Water Tracking** - Visual cup-based water intake tracker
- **User Profiles** - Personalized nutrition targets based on age, sex, weight, height, and activity level
- **Onboarding Flow** - Guided setup for new users

### UI/UX Features
- **Dark Mode** - Toggle between light, dark, and system themes
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Toast Notifications** - Real-time feedback for user actions
- **Skeleton Loaders** - Smooth loading states throughout the app
- **Progress Indicators** - Visual progress bars for nutrient targets

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **State Management**: TanStack Query (React Query)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Project Structure

```
macrobyte/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── foods/             # Food search and detail pages
│   ├── onboarding/        # User onboarding flow
│   └── profile/           # User profile page
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components (header)
│   ├── log-form/          # Food logging form
│   ├── onboarding/        # Onboarding step components
│   ├── providers/         # Context providers
│   ├── ui/                # shadcn/ui components
│   └── water/             # Water tracking components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configs
│   ├── supabase/          # Supabase client configs
│   └── utils/             # Helper functions
├── seed/                  # Database seed data
├── supabase/              # Database migrations
├── types/                 # TypeScript type definitions
└── scripts/               # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd macrobyte
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

   Get these values from your Supabase Dashboard → Settings → API

4. **Set up Supabase**
   
   a. Create a new Supabase project at [supabase.com](https://supabase.com)
   
   b. Run the database migrations:
      - Go to Supabase Dashboard → SQL Editor
      - Copy and run the contents of `supabase/migrations/001_initial_schema.sql`
      - Copy and run the contents of `supabase/migrations/002_add_onboarding_fields.sql`
      - Copy and run the contents of `supabase/migrations/003_add_water_intake.sql`
   
   c. Configure Authentication:
      - Go to Authentication → URL Configuration
      - Set Site URL to: `http://localhost:3000`
      - Add redirect URL: `http://localhost:3000/auth/callback`
      - (Optional) Disable email confirmation for easier testing

5. **Seed the database**
   ```bash
   npm run seed
   ```
   
   This will populate your database with 90+ foods and their nutritional data.

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with food data
- `npm run cleanup` - Remove duplicate foods from database

## Database Schema

The application uses the following main tables:

- **profiles** - User profile information
- **nutrients** - Master list of nutrients
- **foods** - Food items
- **serving_sizes** - Serving size options for each food
- **food_nutrients** - Nutrient values per 100g of food
- **log_entries** - Daily food log entries
- **daily_summaries** - Pre-aggregated daily nutrient totals
- **user_targets** - User-specific nutrient targets
- **water_intake** - Water intake tracking

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Features in Detail

### Onboarding Flow
New users go through a 7-step onboarding process:
1. Welcome screen
2. Account creation (email/password)
3. Profile setup (sex, age, height, weight)
4. Activity level selection
5. Weight goal setting
6. Goal rate adjustment
7. Overview with calculated calorie target

### Dashboard
- **Logged Foods** - View foods organized by meal (Breakfast, Lunch, Dinner, Snack)
- **Water Intake** - Visual cup-based tracker with quick-add buttons
- **Nutrient Display** - Calories, macros, and micros with progress bars
- **Date Navigation** - Navigate between different days

### Food Search
- Real-time search with 300ms debounce
- Category filtering (Fruits, Vegetables, Proteins, Grains, etc.)
- Detailed food view with serving sizes and nutrient breakdown
- Quick add functionality

### Profile & Targets
- Update personal information
- Set activity level and weight goals
- Generate personalized nutrient targets
- Custom water intake goal

## Deployment

### Deploy to Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only needed for seeding)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by [Cronometer](https://cronometer.com) for the onboarding flow and water tracking UI
- Built with [Next.js](https://nextjs.org) and [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
