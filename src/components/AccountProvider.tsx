import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Define the account data interface to match the profiles table structure
export interface AccountData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  subscription_status: string;
}

// Define the context type
interface AccountContextType {
  user: User | null;
  account: AccountData | null;
  isLoading: boolean;
  error: string | null;
  refreshAccount: () => Promise<void>;
}

// Create the context with default values
const AccountContext = createContext<AccountContextType>({
  user: null,
  account: null,
  isLoading: true,
  error: null,
  refreshAccount: async () => {},
});

// Hook to use the account context
export const useAccount = () => useContext(AccountContext);

// Global reference for account data to avoid unnecessary fetches
let cachedAccount: AccountData | null = null;

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch account data from the profiles table
  const fetchAccountData = async (userId: string) => {
    try {
      console.log('[Account] Fetching account data for', userId);
      setIsLoading(true);
      
      // Check if we have data in global cache
      if (cachedAccount && cachedAccount.id === userId) {
        console.log('[Account] Using cached account data');
        setAccount(cachedAccount);
        setIsLoading(false);
        return;
      }
      
      // Fetch the profile data from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Update our state and cache
        setAccount(data as AccountData);
        cachedAccount = data as AccountData;
      } else {
        // If no profile exists, the user probably just signed up
        console.log('[Account] No profile found, may need to create one');
        setError('No profile found. Please update your profile.');
      }
    } catch (err: any) {
      console.error('[Account] Error fetching account:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to refresh account data
  const refreshAccount = async () => {
    if (user) {
      await fetchAccountData(user.id);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await fetchAccountData(session.user.id);
        } else {
          // No session, clear everything
          setUser(null);
          setAccount(null);
          cachedAccount = null;
        }
      } catch (err: any) {
        console.error('[Account] Session check error:', err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('[Account] Auth state changed:', _event);
        
        if (session) {
          setUser(session.user);
          await fetchAccountData(session.user.id);
        } else {
          // User signed out, clear everything
          setUser(null);
          setAccount(null);
          cachedAccount = null;
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Provide the context to children
  return (
    <AccountContext.Provider
      value={{
        user,
        account,
        isLoading,
        error,
        refreshAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider; 