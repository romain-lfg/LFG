# LFG Frontend

Frontend for the Looking For Group (LFG) platform - ETHGlobal Hackathon Project

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
git clone https://github.com/romain-lfg/LFG.git
cd LFG/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration if needed.

### Development

Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

1. Build the application:
```bash
pnpm build
```

### Deployment

#### Vercel Deployment

1. Fork the repository on GitHub

2. Create a new project on Vercel:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
   - Select the frontend directory as the root directory

3. Configure environment variables:
   - Go to Project Settings > Environment Variables
   - Add the following variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-api-url.com
     NEXT_PUBLIC_NETWORK=sepolia
     NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
     ```

4. Deploy settings:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Output Directory: `.next`

5. Click "Deploy"

#### Production Considerations

- Set up proper CORS configuration when connecting to your API
- Enable automatic deployments for your main branch
- Configure custom domains if needed
- Set up monitoring and analytics (optional)
- Enable Vercel's Edge Functions for better performance

2. Test the production build locally:
```bash
npm run start
# or
yarn start
```

### Project Structure
```
frontend/
├── app/              # Next.js app directory
├── src/
│   ├── types/       # TypeScript type definitions
│   ├── services/    # API services
│   └── mocks/       # Mock data for development
├── public/          # Static assets
└── README.md        # This file
```

## Features
- 🎨 Modern UI with TailwindCSS
- 🔄 API integration layer
- 📱 Responsive design
- 🔒 Type-safe development with TypeScript

## Contributing
1. Create a new branch for your feature
2. Make your changes
3. Submit a PR with a clear description

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
