import { useEffect, useState } from 'react';
import { initApi } from '../utils/api';

export function DatabaseInitializer({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('Initializing database with demo data...');
        await initApi.initDemoData(true); // force refresh to v3 Indian data
        console.log('Database initialized successfully');
        setInitialized(true);
      } catch (err: any) {
        console.error('Failed to initialize database:', err);
        setError(err.message);
        // Continue anyway - might already be initialized
        setInitialized(true);
      }
    };

    initDatabase();
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Setting up CrisisConnect...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing database</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
