# Investment Analyzer - React Frontend

A modern, professional React frontend for the Investment Analyzer application, styled to match Axis Bank's branding and design philosophy.

## Features

- **Multi-step Form**: Collect financial profile and investment preferences
- **Axis Bank Theme**: Professional blue-themed UI with modern design patterns
- **Real-time Analysis**: Connect to backend API for personalized recommendations
- **Risk Assessment**: Display risk profile with probability breakdown
- **Product Recommendations**: Show all 4 investment products with scores and reasoning
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Professional Layout**: Clean interface with progress indicators and visual feedback

## Project Structure

```
frontend/
├── public/
│   └── index.html           # Main HTML entry point
├── src/
│   ├── components/
│   │   ├── Forms.tsx        # ProfileForm component (financial dashboard inputs)
│   │   ├── Questionnaire.tsx # Investment preference questionnaire
│   │   └── Results.tsx      # Results display component
│   ├── api.ts               # API client for backend communication
│   ├── types.ts             # TypeScript interfaces and types
│   ├── styles.css.ts        # Global Axis Bank theme styling
│   ├── App.tsx              # Main application component
│   └── index.tsx            # React entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:3000`
- ML service running on `http://localhost:8000`

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Development Mode

```bash
npm start
```

The application will open at `http://localhost:3000` (or next available port).

### Building for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` directory.

## Application Flow

The app opens directly on the financial dashboard — there is no name/email sign-up step. A guest session is created silently in the background on load so analyses can still be saved and retrieved by id.

### Step 1: Financial Profile (Dashboard)
- Age, income, expenses, savings
- Existing investments and EMI obligations
- Shows calculated monthly surplus and emergency fund months

### Step 2: Investment Preferences (Questionnaire)
- Investment horizon and experience level
- Risk tolerance (reaction to market losses)
- Investment frequency and liquidity preference
- Primary investment goal

### Step 3: Results
- **Risk Profile**: LOW, MEDIUM, or HIGH with probabilities
- **Product Recommendations**: 
  - Mutual Funds (MUTUAL_FUND)
  - Public Provident Fund (PPF)
  - National Pension System (NPS)
  - Fixed Deposits (FD)
- Each product shows score (0-100) and personalized reasoning

## API Integration

The frontend communicates with the backend via REST API:

- `POST /api/v1/users` - Silently create a guest user on app load (no UI form)
- `POST /api/v1/analysis?userId=<id>` - Run analysis
- `GET /api/v1/analysis/<analysisId>` - Retrieve analysis
- `GET /api/v1/analysis?userId=<id>` - List user analyses

See [docs/API_SPEC.md](../docs/API_SPEC.md) for detailed API specifications.

## Styling & Theme

### Axis Bank Color Palette

- **Primary Blue**: `#0066b3` - Main brand color
- **Dark Blue**: `#003d80` - Headers and emphasis
- **Light Blue**: `#e8f1fa` - Backgrounds and highlights
- **Accent Blue**: `#0052a3` - Interactive elements
- **Success**: `#28a745` - Positive indicators
- **Warning**: `#ffc107` - Caution indicators
- **Danger**: `#dc3545` - Error indicators

### Design Principles

- Clean, professional aesthetic matching Axis Bank's "open to your learning" philosophy
- Accessibility-first with semantic HTML and clear visual hierarchy
- Responsive grid layout adapting to screen sizes
- Smooth transitions and hover effects
- Clear error handling with helpful messages
- Progress indicators for multi-step forms

## TypeScript Configuration

The project uses strict TypeScript for type safety:

```bash
npm run build  # Validates type correctness
```

## Troubleshooting

### Backend Connection Error

If you see "Failed to run analysis. Please check the backend is running":

1. Verify backend is running: `npm start` from `/backend` directory
2. Check it's on `http://localhost:3000`: `curl http://localhost:3000/health`
3. Verify ML service is running on `http://localhost:8000`: `curl http://localhost:8000/health`

### Port Already in Use

If port 3000 is already in use, the app will use the next available port (3001, 3002, etc.).

### CORS Issues

Ensure backend has proper CORS configuration for `http://localhost:*`

## Development Tips

- Edit components in `src/components/` for form/results changes
- Update API client in `src/api.ts` if backend endpoints change
- Modify theme colors in `src/styles.css.ts`
- Use React DevTools browser extension for debugging

## Future Enhancements

- [ ] Historical analysis tracking
- [ ] Export recommendations as PDF
- [ ] Comparison tool for multiple scenarios
- [ ] Integration with real financial data APIs
- [ ] Investment portfolio tracking
- [ ] Risk adjustment over time
- [ ] Mobile app version

## License

Part of the Investment Analyzer project.
