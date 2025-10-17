'use client';

import { useEffect, useState } from 'react';

export function DbInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        // Initialize database on component mount
        const res = await fetch('/api/setup/db');
        const data = await res.json();
        
        if (data.success) {
          console.log('Database initialized successfully:', data);
          setInitialized(true);
        } else {
          console.error('Database initialization failed:', data);
          setError(data.message || 'Failed to initialize database');
        }
      } catch (err) {
        console.error('Error initializing database:', err);
        setError('Failed to connect to the database');
      }
    };
    
    initDb();
  }, []);

  // This component doesn't render anything visible, it just initializes the DB on mount
  return null;
}