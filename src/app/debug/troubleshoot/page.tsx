"use client";

import { useState } from 'react';

export default function TroubleshootingGuide() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Authentication Troubleshooting Guide</h1>
        <button
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          {isPreviewOpen ? 'Close Preview' : 'Preview Markdown'}
        </button>
      </div>
      
      {isPreviewOpen && (
        <iframe
          src="/debug/troubleshooting.md"
          className="w-full border rounded-md"
          style={{ height: 'calc(100vh - 150px)' }}
        />
      )}
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>Common Authentication Issues</h2>
        <p>
          When implementing authentication with NextAuth.js, several common issues can occur.
          Click the &quot;Preview Markdown&quot; button above to view the full troubleshooting guide, or
          return to the <a href="/debug" className="text-blue-500 hover:underline">Debug Dashboard</a> to
          inspect your current authentication state.
        </p>
        
        <h3>Quick Checklist</h3>
        <ul>
          <li>✅ Middleware is correctly skipping API routes</li>
          <li>✅ MongoDB connection is established</li>
          <li>✅ Environment variables are properly configured</li>
          <li>✅ Session tokens are being stored in cookies</li>
          <li>✅ Callbacks are properly set to include custom user data</li>
        </ul>
        
        <div className="mt-8">
          <a
            href="/debug"
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            ← Back to Debug Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}