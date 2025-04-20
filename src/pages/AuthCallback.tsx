import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('Checking authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Safety timeout to avoid hanging in case of errors
    const safetyTimeout = setTimeout(() => {
      setError('The authentication process took too long. Please try logging in again.');
      setTimeout(() => navigate('/login'), 3000);
    }, 15000);
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          setMessage('Authentication successful, checking subscription status...');
          
          // Check subscription status
          try {
            const response = await fetch('/.netlify/functions/check-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                email: session.user.email,
              }),
            });
            
            if (!response.ok) {
              throw new Error(`Request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            // Clear the safety timeout
            clearTimeout(safetyTimeout);
            
            // If subscribed, go to dashboard; otherwise, go to pricing
            if (data.isSubscribed) {
              setMessage('Subscription active! Redirecting to dashboard...');
              navigate('/network?fromLogin=true');
            } else {
              setMessage('Please subscribe to continue...');
              // Redirect to pricing with fromLogin parameter and return path to network
              navigate('/pricing', { 
                state: { from: { pathname: '/network' } }
              });
            }
          } catch (subscriptionError) {
            console.error('Error checking subscription:', subscriptionError);
            // On error, show message briefly then continue to network
            setMessage('Could not verify subscription. Redirecting to dashboard...');
            setTimeout(() => {
              clearTimeout(safetyTimeout);
              navigate('/network?fromLogin=true');
            }, 2000);
          }
        } else {
          // No session found, redirect to login
          setError('No authenticated session found. Please try logging in again.');
          setTimeout(() => {
            clearTimeout(safetyTimeout);
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        setError('An error occurred during authentication. Please try logging in again.');
        setTimeout(() => {
          clearTimeout(safetyTimeout);
          navigate('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
    
    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      {error ? (
        <div className="text-center max-w-md p-6 rounded-lg shadow-sm border">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm">Redirecting you to login page...</p>
        </div>
      ) : (
        <div className="text-center max-w-md p-6 rounded-lg shadow-sm border">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Login Processing</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback; 