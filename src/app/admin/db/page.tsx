'use client';

import DbSetupButton from "@/components/db-setup-button";

export default function DbAdminPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Administration</h1>
        
        <div className="mb-8">
          <p className="mb-4">
            Use this panel to check the database status and initialize collections and indexes.
            This ensures the application works correctly with the right database schema.
          </p>
        </div>
        
        <DbSetupButton />
      </div>
    </div>
  );
}