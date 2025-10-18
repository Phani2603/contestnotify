# Contest Notify

A Next.js application that helps users keep track of coding contests across various platforms.

## Features

- User authentication with NextAuth
- Platform selection for personalized contest tracking
- Contest calendar and scheduling
- Integration with CLIST.by API for real contest data
- Dark/light mode support

## Getting Started

### Environment Setup

1. Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

2. Update the following environment variables:
   - `NEXT_PUBLIC_CLIST_API_USERNAME` - Your CLIST.by API username
   - `NEXT_PUBLIC_CLIST_API_KEY` - Your CLIST.by API key
   - `MONGODB_URI` - MongoDB connection string
   - `NEXTAUTH_SECRET` - Random string for NextAuth encryption
   - `NEXTAUTH_URL` - Your app's URL (http://localhost:3000 for development)

### Troubleshooting CLIST API Integration

The application uses environment variables with the `NEXT_PUBLIC_` prefix to access the CLIST API from both client and server components. If you encounter API connection issues:

1. Verify your credentials in `.env.local`
2. Visit the debug page at `/debug` to check API connectivity
3. Test the server-side API route at `/api/debug/clist`
4. Check browser console for any error messages

Common issues:
- Incorrectly formatted API key
- Missing or incorrect environment variables
- CORS issues when calling API directly from client

You can use the built-in API debugging tools accessible from the developer toolbar (visible in development mode only) to diagnose API issues.

### Debugging Tools

The application includes several debugging tools to help with development:

1. **Developer Toolbar**: Click the gear icon in the bottom right corner of the screen to access debug pages and tools
2. **API Debugger**: Visit `/debug` to check API connectivity for both client and server integrations
3. **Direct API Test**: Visit `/api/debug/clist` to test the CLIST API connection server-side
4. **Environment Variable Checker**: The API Debugger shows which environment variables are correctly configured

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### User Flow

1. **First Login**: Users are redirected to the Platforms page
2. **Platform Selection**: Connect to preferred coding platforms
3. **Dashboard**: View contests from selected platforms
4. **Scheduler**: Manage and plan for upcoming contests

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font family.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
