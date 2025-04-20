import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

// Global circuit breaker for subscription check
let isCheckingSubscription = false;

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('Verifying your authentication...');
  const [error, setError] = useState<string | null>(null);
  const [checkProgress, setCheckProgress] = useState(0);

  useEffect(() => {
    // Safety timeout to avoid hanging in case of errors
    const safetyTimeout = setTimeout(() => {
      setError('The authentication process took too long. Please try logging in again.');
      setTimeout(() => navigate('/login'), 3000);
    }, 15000);
    
    // Progress indicator simulation
    const progressInterval = setInterval(() => {
      setCheckProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          setMessage('Authentication successful, checking subscription status...');
          
          // Prevent concurrent subscription checks
          if (isCheckingSubscription) {
            console.log('Subscription check already in progress, redirecting to dashboard');
            clearTimeout(safetyTimeout);
            clearInterval(progressInterval);
            navigate('/network?fromLogin=true');
            return;
          }
          
          // Check subscription status
          try {
            isCheckingSubscription = true;
            setCheckProgress(60);
            
            // Try to get subscription status from localStorage first
            const cachedSubscription = localStorage.getItem('subscription-status');
            if (cachedSubscription) {
              try {
                const cache = JSON.parse(cachedSubscription);
                const now = Date.now();
                const cacheAge = now - cache.timestamp;
                
                // Use cache if it's less than 5 minutes old
                if (cacheAge < 5 * 60 * 1000) {
                  console.log('Using cached subscription status');
                  setCheckProgress(95);
                  
                  // Continue with cached data
                  if (cache.data.isSubscribed) {
                    setMessage('Welcome back! Redirecting to dashboard...');
                    clearTimeout(safetyTimeout);
                    clearInterval(progressInterval);
                    setTimeout(() => navigate('/network?fromLogin=true'), 500);
                  } else {
                    setMessage('Please subscribe to continue...');
                    clearTimeout(safetyTimeout);
                    clearInterval(progressInterval);
                    setTimeout(() => navigate('/pricing', { 
                      state: { from: { pathname: '/network' } }
                    }), 500);
                  }
                  return;
                }
              } catch (e) {
                console.error('Error parsing cached subscription:', e);
              }
            }
            
            // Make the API call if no valid cache
            const response = await fetch('/.netlify/functions/check-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                email: session.user.email,
              }),
            });
            
            setCheckProgress(80);
            
            if (!response.ok) {
              console.error(`Request failed with status ${response.status}`);
              throw new Error(`Request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            setCheckProgress(95);
            
            // Cache the result
            localStorage.setItem('subscription-status', JSON.stringify({
              data,
              timestamp: Date.now()
            }));
            
            // Clear the safety timeout
            clearTimeout(safetyTimeout);
            clearInterval(progressInterval);
            
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
            setMessage('Authentication successful but could not verify subscription. Redirecting...');
            clearTimeout(safetyTimeout);
            clearInterval(progressInterval);
            setTimeout(() => {
              navigate('/network?fromLogin=true');
            }, 1000);
          } finally {
            isCheckingSubscription = false;
          }
        } else {
          // No session found, redirect to login
          clearTimeout(safetyTimeout);
          clearInterval(progressInterval);
          setError('No authenticated session found. Please try logging in again.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        clearTimeout(safetyTimeout);
        clearInterval(progressInterval);
        setError('An error occurred during authentication. Please try logging in again.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
    
    return () => {
      clearTimeout(safetyTimeout);
      clearInterval(progressInterval);
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
          <p className="text-muted-foreground mb-4">{message}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${checkProgress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthCallback; 