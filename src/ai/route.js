
// This file is required for Genkit flows to work correctly in a Vercel deployment.
// It creates a Next.js API route that acts as an entry point for all Genkit flows.
export {genkitNextApiHandler as GET, genkitNextApiHandler as POST} from '@genkit-ai/next';
