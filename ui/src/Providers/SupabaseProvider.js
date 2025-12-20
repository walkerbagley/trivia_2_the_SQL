import { createClient } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const [supabase, setSupabase] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Supabase client
  useEffect(() => {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    setSupabase(client);
    updateSupabaseSession(client);
  }, []);

  // Function to update Supabase session with current tokens
  const updateSupabaseSession = (client) => {
    const supabaseToken = localStorage.getItem('supabase_token');
    const refreshToken = localStorage.getItem('supabase_refresh_token');
    
    if (supabaseToken && refreshToken) {
      client.auth.setSession({
        access_token: supabaseToken,
        refresh_token: refreshToken
      }).then(() => {
        console.log('Supabase session set');
        setIsReady(true);
      }).catch((error) => {
        console.error('Failed to set Supabase session:', error);
        setIsReady(true);
      });
    } else {
      console.log('No Supabase tokens found');
      setIsReady(true);
    }
  };

  // Listen for token updates from AuthProvider
  useEffect(() => {
    const handleTokenUpdate = () => {
      console.log('Supabase tokens updated, refreshing session...');
      if (supabase) {
        updateSupabaseSession(supabase);
      }
    };

    window.addEventListener('supabase-token-updated', handleTokenUpdate);
    
    return () => {
      window.removeEventListener('supabase-token-updated', handleTokenUpdate);
    };
  }, [supabase]);

  const value = {
    supabase,
    isReady
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
};