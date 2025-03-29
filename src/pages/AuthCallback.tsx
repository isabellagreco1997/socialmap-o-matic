import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('Checking authentication...');

  useEffect(() => {
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
            
            // If subscribed, go to dashboard; otherwise, go to pricing
            if (data.isSubscribed) {
              navigate('/network?fromLogin=true');
            } else {
              // Redirect to pricing with fromLogin parameter and return path to network
              navigate('/pricing', { 
                state: { from: { pathname: '/network' } }
              });
            }
          } catch (subscriptionError) {
            console.error('Error checking subscription:', subscriptionError);
            // On error, default to network but without fromLogin=true parameter
            navigate('/pricing', { 
              state: { from: { pathname: '/network' } }
            });
          }
        } else {
          // No session found, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export default AuthCallback; 