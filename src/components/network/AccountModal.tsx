import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SubscriptionModal } from "./SubscriptionModal";
import { useSubscription } from "@/hooks/use-subscription";
import { format } from "date-fns";

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountModal({ open, onOpenChange }: AccountModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const { toast } = useToast();
  const { isSubscribed, subscriptionDetails, customerDetails, isLoading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    const fetchUser = async () => {
      if (!open) return; // Only fetch when modal is open
      
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          setEmail(user.email || "");
          setFullName(user.user_metadata.full_name || "");
          setUsername(user.user_metadata.username || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [open]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          username: username,
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Success",
          description: "Your profile has been updated.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpgradeToPro = () => {
    setSubscriptionModalOpen(true);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Function to get plan name
  const getPlanName = () => {
    if (!isSubscribed) return "Free Plan";
    if (subscriptionDetails?.status === "trialing") return "Pro Plan (Trial)";
    return "Pro Plan";
  };

  // Function to get plan badge color
  const getPlanBadgeClass = () => {
    if (!isSubscribed) return "bg-primary/10 text-primary";
    if (subscriptionDetails?.status === "trialing") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account settings and preferences.
            </DialogDescription>
          </DialogHeader>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center py-8">
              <h3 className="text-lg font-medium mb-2">Not Logged In</h3>
              <p className="text-muted-foreground mb-4">Please log in to access your account settings.</p>
              <Button asChild>
                <a href="/login">Log In</a>
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your email address is verified and cannot be changed.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleUpdateProfile} disabled={updating}>
                      {updating ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="subscription">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Management</CardTitle>
                    <CardDescription>
                      Manage your subscription plan and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subscriptionLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Current Plan</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanBadgeClass()}`}>
                              {getPlanName()}
                            </span>
                          </div>
                          {isSubscribed && subscriptionDetails ? (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                You are currently on the Pro plan with access to all premium features.
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                <div className="text-xs">
                                  <span className="font-medium">Status:</span> {subscriptionDetails.status}
                                </div>
                                <div className="text-xs">
                                  <span className="font-medium">Renewal Date:</span> {formatDate(subscriptionDetails.currentPeriodEnd)}
                                </div>
                                <div className="text-xs">
                                  <span className="font-medium">Auto-Renewal:</span> {subscriptionDetails.cancelAtPeriodEnd ? 'Off' : 'On'}
                                </div>
                                {customerDetails && (
                                  <div className="text-xs">
                                    <span className="font-medium">Customer:</span> {customerDetails.email}
                                  </div>
                                )}
                              </div>
                              <div className="mt-4">
                                <Button variant="outline" size="sm">
                                  Manage Billing
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              You are currently on the Free plan with limited features.
                            </p>
                          )}
                        </div>
                        
                        {!isSubscribed && (
                          <div className="pt-4">
                            <h3 className="font-medium mb-2">Upgrade to Pro</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Get access to all features including unlimited networks, advanced analytics, and more.
                            </p>
                            <Button className="w-full sm:w-auto" onClick={handleUpgradeToPro}>
                              Upgrade to Pro
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      
      <SubscriptionModal 
        open={subscriptionModalOpen} 
        onOpenChange={setSubscriptionModalOpen} 
      />
    </>
  );
} 