# MediPact Frontend

Modern, production-ready frontend for MediPact built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Patient Portal**: Health wallet, earnings dashboard, active studies
- **Hospital Portal**: Data upload, consent management, revenue tracking
- **Researcher Portal**: Data catalog, purchase management, analytics
- **Admin Dashboard**: Platform-wide analytics and management
- **Hedera Integration**: HCS transactions, smart contract interactions, HashScan links
- **Real-time Processing**: Adapter integration with status updates

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **Blockchain**: @hashgraph/sdk, Ethers.js
- **UI Components**: Headless UI, Radix UI, Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Hedera Testnet account credentials
- Access to the MediPact adapter

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Hedera credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

See `.env.local.example` for required environment variables:

- `NEXT_PUBLIC_HEDERA_NETWORK`: testnet, mainnet, or previewnet
- `NEXT_PUBLIC_HEDERA_ACCOUNT_ID`: Your Hedera account ID
- `NEXT_PUBLIC_HEDERA_PRIVATE_KEY`: Your Hedera private key
- `NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS`: ConsentManager contract address
- `NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS`: RevenueSplitter contract address
- `ADAPTER_PATH`: Path to the adapter directory (default: ../adapter)

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin portal pages
│   │   ├── patient/           # Patient portal pages
│   │   ├── hospital/           # Hospital portal pages
│   │   ├── researcher/         # Researcher portal pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   └── ...                # Feature components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and helpers
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles
└── public/                    # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## Key Pages

### Public
- `/` - Homepage
- `/about` - About page
- `/pricing` - Pricing information
- `/marketplace` - Public data catalog

### Patient Portal
- `/patient/dashboard` - Patient dashboard
- `/patient/wallet` - Health wallet
- `/patient/earnings` - Earnings dashboard
- `/patient/studies` - Active studies
- `/patient/marketplace` - Marketplace settings

### Hospital Portal
- `/hospital/dashboard` - Hospital dashboard
- `/hospital/upload` - Data upload
- `/hospital/consent` - Consent management
- `/hospital/enrollment` - Patient enrollment
- `/hospital/revenue` - Revenue tracking

### Researcher Portal
- `/researcher/dashboard` - Researcher dashboard
- `/researcher/catalog` - Data catalog
- `/researcher/projects` - Research projects
- `/researcher/purchases` - Purchase history

### Admin Portal
- `/admin/dashboard` - Admin dashboard
- `/admin/processing` - Adapter processing
- `/admin/transactions` - HCS transactions
- `/admin/revenue` - Platform revenue
- `/admin/diseases` - Disease management

## API Routes

- `/api/adapter/process` - Process EHR data
- `/api/adapter/status` - Get processing status
- `/api/adapter/results` - Get processing results
- `/api/hedera/topics` - Get HCS topic info
- `/api/hedera/transactions` - Get transaction history
- `/api/contracts/consent` - Query ConsentManager
- `/api/contracts/revenue` - Query RevenueSplitter

## Components

### Core Components
- `AdapterDemo` - Main adapter processing UI
- `ConsentForm` - Patient consent form
- `HashScanLink` - HashScan transaction links
- `ProcessingStatus` - Real-time processing status
- `TransactionList` - HCS transaction list
- `RevenueSplit` - Revenue split visualization

### UI Components
- `Button` - Button component
- `Card` - Card container
- `Badge` - Status badges

## Development

### Adding New Pages

1. Create a new file in `src/app/[route]/page.tsx`
2. Export a default React component
3. Use the layout and styling patterns from existing pages

### Adding New Components

1. Create component in `src/components/[ComponentName]/[ComponentName].tsx`
2. Use TypeScript for type safety
3. Follow existing component patterns
4. Use Tailwind CSS for styling

### API Integration

- Use TanStack Query hooks in `src/hooks/`
- API client in `src/lib/api/client.ts`
- API routes in `src/app/api/`

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment

The frontend can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Any Node.js hosting platform

Make sure to set all environment variables in your deployment platform.

## License

Apache 2.0

