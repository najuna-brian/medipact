# MediPact - Tech Stack

## Blockchain & Consensus
- **Hedera Hashgraph** - Public distributed ledger
- **Hedera Consensus Service (HCS)** - Immutable message log for proof storage
- **Hedera EVM** - Smart contract execution environment
- **HBAR** - Native cryptocurrency for micropayments

## Smart Contracts
- **Solidity 0.8.20** - Smart contract programming language
- **Hardhat** - Ethereum development environment for Hedera EVM
- **ConsentManager Contract** - On-chain consent registry
- **RevenueSplitter Contract** - Automated revenue distribution (60/25/15 split)

## Backend & Runtime
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **@hashgraph/sdk** (v2.76.0) - Official Hedera JavaScript SDK
- **FHIR R4** - Fast Healthcare Interoperability Resources standard
- **SHA-256** - Cryptographic hashing algorithm
- **SQLite** - Development database
- **PostgreSQL** - Production database (planned)
- **Swagger UI** - Interactive API documentation
- **swagger-jsdoc** - OpenAPI documentation from JSDoc comments
- **Query Engine** - Multi-dimensional filtering with consent validation
- **Dataset Management** - Metadata, browsing, purchase, export

## Data Formats
- **CSV** - Legacy hospital data format (supported)
- **FHIR Bundle** - Modern healthcare data standard in JSON format
- **JSON** - Configuration and structured data

## Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and state management
- **shadcn/ui** - Reusable UI component library
- **Lucide React** - Icon library
- **React Hook Form** - Form management

## Development Tools
- **Git** - Version control
- **npm** - Package management
- **Vitest** - Testing framework
- **dotenv** - Environment variable management
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Infrastructure & Services
- **GitHub** - Code repository hosting
- **HashScan** - Hedera blockchain explorer for transaction verification
- **Hedera Testnet** - Development and testing network

## Key Libraries & Dependencies
- `@hashgraph/sdk` - Hedera network integration
- `dotenv` - Environment configuration
- `vitest` - Unit and integration testing
- `uuid` - Unique identifier generation (for FHIR)

## Standards & Protocols
- **FHIR R4** - Healthcare data interoperability standard
- **RESTful API** - Future FHIR API integration (prepared)
- **OAuth 2.0** - Future authentication for FHIR APIs (prepared)

## Security & Privacy
- **ECDSA** - Elliptic Curve Digital Signature Algorithm for Hedera keys
- **SHA-256** - Secure hashing for data proofs
- **PII Removal** - Automatic anonymization process
- **Consent Validation** - Database-level filtering in all queries
- **Access Control** - Smart contract owner-only functions, role-based API auth

---

## Summary (For Submission)

**Primary Technologies:**
- Hedera Hashgraph (HCS, EVM, HBAR)
- Solidity (Smart Contracts)
- Node.js (Backend)
- FHIR R4 (Healthcare Data Standard)

**Key Integrations:**
- Hedera Consensus Service for immutable proof storage
- Hedera EVM for smart contract execution
- HashScan for transaction verification

