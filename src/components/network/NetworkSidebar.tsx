import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, MessageSquare,  Menu, FileText, BookOpen, Users, LayoutGrid, LogOut, Zap, Edit, Trash2, Info, Calendar, SendHorizontal, Bot, User, Sparkles, Loader2, BarChart3, CalendarDays, CheckCircle, Activity, Grid2x2, CreditCard } from 'lucide-react';
import { CreateNetworkDialog } from '@/components/CreateNetworkDialog';
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { SubscriptionModal } from "./SubscriptionModal";
import { useSubscription } from "@/hooks/use-subscription";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AccountModal } from "./AccountModal";
import { toast } from "@/components/ui/use-toast";
import { env } from "@/utils/env";
import { redirectToCheckout } from "@/utils/stripe";

interface NetworkSidebarProps {
  networks: Network[];
  currentNetworkId: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNetworkSelect: (id: string) => void;
  onEditNetwork: (network: Network) => void;
  onOpenTemplates: () => void;
  onNetworksReorder: (networks: Network[]) => void;
  onImportCsv?: (file: File) => void;
  onNetworkCreated?: (id: string, isAI: boolean) => void;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  node_id?: string;
  node_name?: string;
  network_id?: string;
  created_at?: string;
}

// Define a message interface for the AI chat
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Define an event interface for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  networkId: string;
  networkName: string;
  nodeId?: string;
  nodeName?: string;
  type: 'task' | 'event' | 'date';
}

// Define statistics interface
interface NetworkStats {
  totalNetworks: number;
  totalNodes: number;
  totalEdges: number;
  totalTasks: number;
  completedTasks: number;
  totalEvents: number;
  nodeTypes: {
    person: number;
    organization: number;
    event: number;
    venue: number;
  };
}

const NetworkSidebar = ({
  networks,
  currentNetworkId,
  onNetworkSelect,
  onEditNetwork,
  onNetworksReorder,
  onImportCsv,
  onNetworkCreated
}: NetworkSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscription();
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [networkTasks, setNetworkTasks] = useState<TodoItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<Network | null>(null);
  const [isNetworkHealthOpen, setIsNetworkHealthOpen] = useState(false);
  const [allTasks, setAllTasks] = useState<TodoItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateEvents, setDateEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalNetworks: 0,
    totalNodes: 0,
    totalEdges: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalEvents: 0,
    nodeTypes: {
      person: 0,
      organization: 0,
      event: 0,
      venue: 0
    }
  });
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [currentNetworkStats, setCurrentNetworkStats] = useState({
    nodes: 0,
    edges: 0,
    tasks: 0
  });

  // Define an extended network type that includes optional description
  type ExtendedNetwork = Network & {
    description?: string;
  };

  // Update current network when it changes
  useEffect(() => {
    if (currentNetworkId) {
      const network = networks.find(n => n.id === currentNetworkId);
      if (network) {
        setCurrentNetwork(network);
      }
    }
  }, [currentNetworkId, networks]);

  // Sync networkTasks with allTasks when allTasks changes
  useEffect(() => {
    if (allTasks.length > 0 && networkTasks.length > 0 && editingNetwork) {
      // Update networkTasks based on allTasks completion state
      setNetworkTasks(prevTasks => 
        prevTasks.map(task => {
          const globalTask = allTasks.find(t => t.id === task.id);
          if (globalTask) {
            return {
              ...task,
              completed: globalTask.completed
            };
          }
          return task;
        })
      );
    }
  }, [allTasks, editingNetwork]);

  // Listen for todo-completed events from the NodeTodoList component
  useEffect(() => {
    const handleTodoCompleted = (event: CustomEvent) => {
      const { taskId } = event.detail;
      
      // Update allTasks state
      setAllTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Update networkTasks state
      setNetworkTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Update network stats
      setNetworkStats(prevStats => ({
        ...prevStats,
        completedTasks: prevStats.completedTasks + 1
      }));
    };
    
    // Add event listener
    window.addEventListener('todo-completed', handleTodoCompleted as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('todo-completed', handleTodoCompleted as EventListener);
    };
  }, []);

  // Check for fromLogin parameter and directly redirect to Stripe checkout
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromLogin = searchParams.get('fromLogin');
    
    if (fromLogin === 'true') {
      console.log("Detected fromLogin=true parameter", { 
        isSubscriptionLoading, 
        isSubscribed 
      });
      
      // Remove the query parameter from URL without refreshing the page
      navigate(location.pathname, { replace: true });
      
      // Always show the checkout for free users regardless of loading state
      // This ensures free users can subscribe without waiting for subscription check
      const redirectToStripeCheckout = async () => {
        try {
          const isDevelopment = import.meta.env.MODE === 'development';
          
          // Get price ID - use any to bypass typescript checking for now
          const stripeEnv = env as any;
          const priceId = isDevelopment 
            ? stripeEnv.stripe.test.priceMonthly 
            : stripeEnv.stripe.live.priceMonthly;
          
          console.log("Redirecting to checkout with price ID:", priceId);
          await redirectToCheckout(priceId);
        } catch (error) {
          console.error('Error redirecting to checkout:', error);
          
          // If redirect fails, show the subscription modal as fallback
          setIsSubscriptionModalOpen(true);
          
          toast({
            title: "Checkout Error",
            description: "Could not redirect to checkout. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      // Handle different states based on subscription loading/status
      if (isSubscriptionLoading) {
        // While loading, assume user is free and show subscription modal
        console.log("Subscription status is still loading, showing subscription modal as fallback");
        setIsSubscriptionModalOpen(true);
      } else if (isSubscribed) {
        // User is already subscribed, show a welcoming toast
        console.log("User already has an active subscription - not redirecting to checkout");
        toast({
          title: "Welcome back!",
          description: "You're already subscribed to our premium plan. Enjoy all features!",
        });
      } else {
        // User is not subscribed, redirect to checkout
        console.log("User is not subscribed - redirecting to checkout");
        redirectToStripeCheckout();
      }
    }
  }, [location, navigate, isSubscribed, isSubscriptionLoading, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(networks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the order of all networks
    const reorderedNetworks = items.map((network, index) => ({
      ...network,
      order: index
    }));
    
    onNetworksReorder(reorderedNetworks);
  };

  const handleAIChatClick = () => {
    setIsAIChatOpen(true);
    
    // Add welcome message if chat is empty
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Hello! I'm your network assistant. I can help you enhance your ${currentNetwork?.name || 'network'} by suggesting new people, organizations, events, or venues to add. What would you like help with today?`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleMyTasksClick = () => {
    setIsNetworkHealthOpen(true);
    setIsLoadingHealth(true);
    
    // Fetch data for the health dashboard
    Promise.all([
      fetchAllTasks(),
      fetchNetworkStats()
    ]).finally(() => {
      setIsLoadingHealth(false);
    });
  };

  const handleNetworkCreated = (networkId: string, isAI: boolean = false) => {
    console.log('NetworkSidebar: handleNetworkCreated called with', {networkId, isAI});
    
    // Select the network first
    onNetworkSelect(networkId);
    
    // Forward the event to the parent component, preserving the isAI flag
    if (onNetworkCreated) {
      console.log('NetworkSidebar: Forwarding to parent with isAI =', isAI);
      onNetworkCreated(networkId, isAI);
    }
  };

  const fetchNetworkTasks = async (networkId: string) => {
    setIsLoadingTasks(true);
    try {
      // First get all nodes in this network
      const { data: nodes, error: nodesError } = await supabase
        .from('nodes')
        .select('id, name')
        .eq('network_id', networkId);
      
      if (nodesError) throw nodesError;
      
      if (!nodes || nodes.length === 0) {
        setNetworkTasks([]);
        return;
      }
      
      // Get all todos for these nodes
      const nodeIds = nodes.map(node => node.id);
      const { data: todos, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .in('node_id', nodeIds);
      
      if (todosError) throw todosError;
      
      // Combine node names with todos
      const tasksWithNodeNames = (todos || []).map(todo => {
        const node = nodes.find(n => n.id === todo.node_id);
        return {
          ...todo,
          node_name: node?.name || 'Unknown'
        };
      });
      
      // Check if we already have these tasks in allTasks and use their completion state
      // This ensures consistency between different views
      if (allTasks.length > 0) {
        const updatedTasks = tasksWithNodeNames.map(task => {
          const existingTask = allTasks.find(t => t.id === task.id);
          if (existingTask) {
            // Use the completion state from allTasks if it exists
            return {
              ...task,
              completed: existingTask.completed
            };
          }
          return task;
        });
        setNetworkTasks(updatedTasks);
      } else {
        setNetworkTasks(tasksWithNodeNames);
      }
    } catch (error) {
      console.error('Error fetching network tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const openEditPanel = (network: Network) => {
    const extendedNetwork = network as ExtendedNetwork;
    setEditingNetwork(network);
    setNetworkName(network.name);
    setNetworkDescription(extendedNetwork.description || "");
    
    // Fetch network-specific tasks
    fetchNetworkTasks(network.id);
    
    // Fetch network stats
    getNetworkStats(network.id).then(stats => {
      setCurrentNetworkStats(stats);
    });
    
    // If we haven't fetched all tasks yet, fetch them to ensure global state is up-to-date
    if (allTasks.length === 0) {
      fetchAllTasks();
    }
  };

  const closeEditPanel = () => {
    setEditingNetwork(null);
    setNetworkName("");
    setNetworkDescription("");
    setIsDeleteAlertOpen(false);
    setCurrentNetworkStats({
      nodes: 0,
      edges: 0,
      tasks: 0
    });
  };

  const handleSaveNetwork = async () => {
    if (!editingNetwork) return;
    
    try {
      // Create an update object with the fields we want to update
      const updateData: { name: string; description?: string } = {
        name: networkName
      };
      
      // Only include description if it's not empty
      if (networkDescription) {
        updateData.description = networkDescription;
      }
      
      const { error } = await supabase
        .from('networks')
        .update(updateData)
        .eq('id', editingNetwork.id);
      
      if (error) throw error;
      
      // Update local state with type casting
      const updatedNetworks = networks.map(network => {
        if (network.id === editingNetwork.id) {
          const updatedNetwork = { ...network, name: networkName } as ExtendedNetwork;
          updatedNetwork.description = networkDescription;
          return updatedNetwork;
        }
        return network;
      });
      
      onNetworksReorder(updatedNetworks);
      closeEditPanel();
    } catch (error) {
      console.error('Error updating network:', error);
    }
  };

  const handleDeleteNetwork = async () => {
    if (!editingNetwork) return;
    
    try {
      // Check if the network is AI-generated before deleting it
      const { data: networkData, error: fetchError } = await supabase
        .from('networks')
        .select('is_ai')
        .eq('id', editingNetwork.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching network data:', fetchError);
      }
      
      // Store the AI status before deletion
      const isAINetwork = networkData?.is_ai === true;
      
      // Delete all nodes and edges in this network
      await supabase
        .from('nodes')
        .delete()
        .eq('network_id', editingNetwork.id);
      
      await supabase
        .from('edges')
        .delete()
        .eq('network_id', editingNetwork.id);
      
      // Delete the network
      const { error } = await supabase
        .from('networks')
        .delete()
        .eq('id', editingNetwork.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedNetworks = networks.filter(network => network.id !== editingNetwork.id);
      onNetworksReorder(updatedNetworks);
      
      // If the deleted network was selected, select another one or clear selection
      if (currentNetworkId === editingNetwork.id) {
        if (updatedNetworks.length > 0) {
          onNetworkSelect(updatedNetworks[0].id);
        } else {
          // If no networks left, explicitly select null to clear the canvas
          onNetworkSelect(null as any);
        }
      }
      
      closeEditPanel();
      
      // Dispatch an event to notify other components about the network deletion
      // Include whether it was an AI-generated network
      console.log('Dispatching network-deleted event from NetworkSidebar');
      window.dispatchEvent(new CustomEvent('network-deleted', { 
        detail: { 
          networkId: editingNetwork.id,
          isAI: isAINetwork
        }
      }));
    } catch (error) {
      console.error('Error deleting network:', error);
    }
  };

  // Function to get network stats for a specific network
  const getNetworkStats = async (networkId: string) => {
    try {
      // Get nodes for this network
      const { data: nodes, error: nodesError } = await supabase
        .from('nodes')
        .select('id, type')
        .eq('network_id', networkId);
      
      if (nodesError) throw nodesError;
      
      // Get edges for this network
      const { data: edges, error: edgesError } = await supabase
        .from('edges')
        .select('id')
        .eq('network_id', networkId);
      
      if (edgesError) throw edgesError;
      
      // Get tasks for this network's nodes
      const nodeIds = nodes?.map(node => node.id) || [];
      
      let tasks = [];
      if (nodeIds.length > 0) {
        const { data: todoData, error: todosError } = await supabase
          .from('todos')
          .select('id, completed')
          .in('node_id', nodeIds);
        
        if (todosError) throw todosError;
        tasks = todoData || [];
      }
      
      return {
        nodes: nodes?.length || 0,
        edges: edges?.length || 0,
        tasks: tasks.length || 0
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      // Return default values if there's an error
      return {
        nodes: 0,
        edges: 0,
        tasks: 0
      };
    }
  };

  // Function to mark a task as complete
  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: true })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update networkTasks state
      setNetworkTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Update allTasks state
      setAllTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Update network stats to reflect the completed task
      setNetworkStats(prevStats => ({
        ...prevStats,
        completedTasks: prevStats.completedTasks + 1
      }));
      
      // Find the task to get its node_id
      const task = allTasks.find(t => t.id === taskId);
      if (task && task.node_id) {
        // Dispatch a custom event to notify the NetworkMap component
        const event = new CustomEvent('todo-completed', { 
          detail: { 
            taskId, 
            nodeId: task.node_id 
          } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  // Function to delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update networkTasks state
      setNetworkTasks(prevTasks => 
        prevTasks.filter(task => task.id !== taskId)
      );
      
      // Update allTasks state
      setAllTasks(prevTasks => 
        prevTasks.filter(task => task.id !== taskId)
      );
      
      // Update network stats
      setNetworkStats(prevStats => ({
        ...prevStats,
        totalTasks: prevStats.totalTasks - 1
      }));
      
      // Find the task to get its node_id
      const task = allTasks.find(t => t.id === taskId);
      if (task && task.node_id) {
        // Dispatch a custom event to notify the NetworkMap component
        const event = new CustomEvent('todo-deleted', { 
          detail: { 
            taskId, 
            nodeId: task.node_id 
          } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAILoading(true);
    
    try {
      // In a real implementation, this would call your AI service
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiResponse = generateAIResponse(currentMessage, currentNetwork?.name);
        
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
        setIsAILoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsAILoading(false);
      
      // Add error message
      setChatMessages(prev => [
        ...prev, 
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ]);
    }
  };
  
  // Simple function to generate AI responses based on user input
  // In a real implementation, this would be replaced with an actual AI service call
  const generateAIResponse = (userMessage: string, networkName?: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Suggestions for people to add
    if (lowerCaseMessage.includes('people') || lowerCaseMessage.includes('person') || lowerCaseMessage.includes('who')) {
      return `For your ${networkName || 'network'}, you might consider adding these people:\n\n1. **Sarah Johnson** - Marketing Director at TechCorp\n2. **Dr. Michael Chen** - AI Research Lead at University of Technology\n3. **Emma Rodriguez** - Community Organizer with connections to local businesses\n4. **James Wilson** - Venture Capitalist specializing in tech startups\n\nWould you like more specific suggestions based on a particular industry or role?`;
    }
    
    // Suggestions for organizations
    if (lowerCaseMessage.includes('organization') || lowerCaseMessage.includes('company') || lowerCaseMessage.includes('business')) {
      return `Here are some organizations that could enhance your ${networkName || 'network'}:\n\n1. **InnovateTech** - A startup accelerator with extensive industry connections\n2. **Global Research Institute** - Academic organization with research partnerships\n3. **Community Development Alliance** - Non-profit with strong local presence\n4. **Venture Partners LLC** - Investment firm focused on early-stage funding\n\nAre you looking for organizations in any specific sector?`;
    }
    
    // Suggestions for events
    if (lowerCaseMessage.includes('event') || lowerCaseMessage.includes('conference') || lowerCaseMessage.includes('meetup')) {
      return `Consider adding these events to your ${networkName || 'network'}:\n\n1. **Annual Tech Summit** - Major industry conference held every March\n2. **Networking Breakfast** - Monthly event for local professionals\n3. **Innovation Workshop** - Quarterly skill-building session\n4. **Industry Awards Gala** - Recognition event with high-profile attendees\n\nWould you like suggestions for virtual or in-person events?`;
    }
    
    // Suggestions for venues
    if (lowerCaseMessage.includes('venue') || lowerCaseMessage.includes('location') || lowerCaseMessage.includes('place')) {
      return `Here are some venues that might be valuable additions to your ${networkName || 'network'}:\n\n1. **Innovation Hub** - Co-working space with regular community events\n2. **Metropolitan Conference Center** - Hosts major industry gatherings\n3. **University Research Park** - Academic venue with industry partnerships\n4. **The Executive Club** - Exclusive meeting place for business leaders\n\nAre you interested in venues in a specific location?`;
    }
    
    // General enhancement suggestions
    return `To enhance your ${networkName || 'network'}, consider these additions:\n\n**People:**\n- Industry thought leaders\n- Community connectors\n- Subject matter experts\n- Decision makers\n\n**Organizations:**\n- Industry associations\n- Educational institutions\n- Funding sources\n- Partner businesses\n\n**Events:**\n- Regular networking opportunities\n- Knowledge-sharing workshops\n- Industry conferences\n- Community gatherings\n\nWhat specific aspect of your network would you like to develop further?`;
  };

  // Function to fetch all tasks across networks
  const fetchAllTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select(`
          id,
          text,
          completed,
          due_date,
          node_id,
          nodes(id, name, network_id),
          created_at
        `)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to include node and network information
      const transformedTasks = data.map(task => ({
        id: task.id,
        text: task.text,
        completed: task.completed,
        dueDate: task.due_date,
        node_id: task.node_id,
        node_name: task.nodes?.name || 'Unknown',
        network_id: task.nodes?.network_id,
        created_at: task.created_at
      }));
      
      setAllTasks(transformedTasks);
      
      // Add tasks with due dates to calendar events
      const taskEvents = transformedTasks
        .filter(task => task.dueDate)
        .map(task => {
          const network = networks.find(n => n.id === task.network_id);
          return {
            id: task.id,
            title: task.text,
            date: new Date(task.dueDate as string),
            networkId: task.network_id || '',
            networkName: network?.name || 'Unknown',
            nodeId: task.node_id,
            nodeName: task.node_name,
            type: 'task' as const
          };
        });
      
      // Fetch event nodes from all networks
      const eventNodes = await fetchEventNodes();
      
      // Combine tasks and event nodes
      setCalendarEvents([...taskEvents, ...eventNodes]);
      
      // Update date events if a date is selected
      if (selectedDate) {
        updateDateEvents(selectedDate, [...taskEvents, ...eventNodes]);
      }
    } catch (error) {
      console.error('Error fetching all tasks:', error);
    }
  };
  
  // Function to fetch event nodes from all networks
  const fetchEventNodes = async (): Promise<CalendarEvent[]> => {
    try {
      // Get all nodes of type "event" that have a date field
      const { data: events, error } = await supabase
        .from('nodes')
        .select('id, name, network_id, date, notes')
        .eq('type', 'event')
        .not('date', 'is', null);
      
      if (error) throw error;
      
      if (!events || events.length === 0) {
        return [];
      }
      
      // Transform events into CalendarEvent format
      const eventNodes = events.map(event => {
        const network = networks.find(n => n.id === event.network_id);
        return {
          id: event.id,
          title: event.name,
          date: new Date(event.date as string),
          networkId: event.network_id,
          networkName: network?.name || 'Unknown',
          nodeId: event.id,
          nodeName: event.name,
          type: 'event' as const
        };
      });
      
      return eventNodes;
    } catch (error) {
      console.error('Error fetching event nodes:', error);
      return [];
    }
  };
  
  // Function to fetch network statistics
  const fetchNetworkStats = async () => {
    try {
      // Get node counts
      const { data: nodes, error: nodesError } = await supabase
        .from('nodes')
        .select('id, type, network_id');
      
      if (nodesError) throw nodesError;
      
      // Get edge counts
      const { data: edges, error: edgesError } = await supabase
        .from('edges')
        .select('id');
      
      if (edgesError) throw edgesError;
      
      // Get task counts
      const { data: tasks, error: tasksError } = await supabase
        .from('todos')
        .select('id, completed');
      
      if (tasksError) throw tasksError;
      
      // Calculate statistics
      const stats: NetworkStats = {
        totalNetworks: networks.length,
        totalNodes: nodes?.length || 0,
        totalEdges: edges?.length || 0,
        totalTasks: tasks?.length || 0,
        completedTasks: tasks?.filter(t => t.completed)?.length || 0,
        totalEvents: nodes?.filter(n => n.type === 'event')?.length || 0,
        nodeTypes: {
          person: nodes?.filter(n => n.type === 'person')?.length || 0,
          organization: nodes?.filter(n => n.type === 'organization')?.length || 0,
          event: nodes?.filter(n => n.type === 'event')?.length || 0,
          venue: nodes?.filter(n => n.type === 'venue')?.length || 0
        }
      };
      
      setNetworkStats(stats);
    } catch (error) {
      console.error('Error fetching network statistics:', error);
    }
  };
  
  // Update events for a selected date
  const updateDateEvents = (date: Date, events = calendarEvents) => {
    const eventsOnDate = events.filter(event => 
      isSameDay(new Date(event.date), date)
    );
    setDateEvents(eventsOnDate);
    setSelectedDate(date);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top fixed section */}
      <div className="flex-none">
        {/* Fixed Header Section */}
        <div className="p-3 space-y-3">
          <div className="flex flex-col gap-1">
            <CreateNetworkDialog 
              trigger={
                <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg">
                  <PlusIcon className="h-4 w-4" />
                  Create Network
                </Button>
              }
              onNetworkCreated={(id, isAI) => {
                console.log('NetworkSidebar: onNetworkCreated callback with id =', id, 'isAI =', isAI);
                handleNetworkCreated(id, isAI);
              }}
              onImportCsv={onImportCsv}
            />

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
              onClick={handleMyTasksClick}
            >
              <Activity className="h-4 w-4" />
              Network Health
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
              onClick={handleAIChatClick}
            >
              <MessageSquare className="h-4 w-4" />
              AI Chat
            </Button>
          </div>
        </div>

        {/* Networks Section with Title */}
        <div className="px-5 pt-3 border-t">
          <div className="text-xs font-semibold text-muted-foreground/70">
            Networks
          </div>
        </div>
      </div>

      {/* Networks list with fixed height */}
      <ScrollArea className="h-[300px] overflow-y-auto">
        <div className="px-2">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="networks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-1 py-2"
                >
                  {networks.map((network, index) => (
                    <Draggable key={network.id} draggableId={network.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center w-full px-2 py-1"
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="flex-1 flex items-center relative"
                            onClick={() => onNetworkSelect(network.id)}
                          >
                            <Button
                              variant={currentNetworkId === network.id ? "secondary" : "ghost"}
                              className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg pr-9"
                            >
                              <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate max-w-[160px] block overflow-hidden text-ellipsis whitespace-nowrap">
                                {network.name}
                              </span>
                            </Button>
                            
                            {/* Edit button on the right */}
                            <div 
                              className="absolute right-1 top-1/2 -translate-y-1/2"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditPanel(network);
                              }}
                            >
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-blue-50"
                              >
                                <Edit className="h-3.5 w-3.5 text-blue-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </ScrollArea>

      {/* Bottom section with Pricing and Account links */}
      <div className="flex-none p-3 border-t">
        <div className="flex flex-col gap-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
            onClick={() => setIsPricingModalOpen(true)}
          >
            <CreditCard className="h-4 w-4" />
            Pricing
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
            onClick={() => setIsAccountModalOpen(true)}
          >
            <User className="h-4 w-4" />
            Account
          </Button>
          
          {/* Add divider before logout button */}
          <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>
          
          <Button 
            variant="destructive" 
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
            onClick={async () => {
              try {
                await supabase.auth.signOut();
                navigate('/login');
                toast({
                  title: "Logged out",
                  description: "You have been successfully logged out"
                });
              } catch (error) {
                console.error('Error signing out:', error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to sign out"
                });
              }
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Network Edit Side Panel */}
      <Sheet open={!!editingNetwork} onOpenChange={(open) => !open && closeEditPanel()}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Network</SheetTitle>
            <SheetDescription>
              Make changes to your network settings here.
            </SheetDescription>
          </SheetHeader>
          
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={networkName} 
                  onChange={(e) => setNetworkName(e.target.value)} 
                  placeholder="Network name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={networkDescription} 
                  onChange={(e) => setNetworkDescription(e.target.value)} 
                  placeholder="Add a description for your network"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Network
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the network
                        and all its nodes, edges, and associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteNetwork} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button onClick={handleSaveNetwork}>
                  Save Changes
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              {editingNetwork && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{currentNetworkStats.nodes}</span>
                      <span className="text-sm text-muted-foreground">Nodes</span>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{currentNetworkStats.edges}</span>
                      <span className="text-sm text-muted-foreground">Connections</span>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{currentNetworkStats.tasks}</span>
                      <span className="text-sm text-muted-foreground">Tasks</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Network ID</h4>
                      <Badge variant="outline" className="font-mono text-xs">
                        {editingNetwork.id.substring(0, 8)}...
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Created</h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(editingNetwork.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Last Updated</h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(editingNetwork.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" className="w-full" onClick={() => window.open(`/network/${editingNetwork.id}/tasks`, '_blank')}>
                      <Info className="h-4 w-4 mr-2" />
                      View All Tasks
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">All Tasks</h3>
                  <Badge variant="outline" className="font-medium text-xs">
                    {networkTasks.filter(task => !task.completed).length} active
                  </Badge>
                </div>
                
                {isLoadingTasks ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : networkTasks.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No tasks found for this network</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {networkTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={cn(
                            "p-3 border rounded-lg group",
                            task.completed ? "bg-muted/30" : "bg-card"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-1">
                              <Checkbox 
                                checked={task.completed}
                                onCheckedChange={() => !task.completed && handleCompleteTask(task.id)}
                                disabled={task.completed}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium",
                                task.completed && "line-through text-muted-foreground"
                              )}>
                                {task.text}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {task.node_name}
                                </Badge>
                                {task.dueDate && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <SubscriptionModal 
        open={isPricingModalOpen}
        onOpenChange={setIsPricingModalOpen}
      />

      <AccountModal
        open={isAccountModalOpen}
        onOpenChange={setIsAccountModalOpen}
      />

      {/* AI Chat Side Panel */}
      <Sheet open={isAIChatOpen} onOpenChange={setIsAIChatOpen}>
        <SheetContent className="sm:max-w-md flex flex-col h-full">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              AI Network Assistant
            </SheetTitle>
            <SheetDescription>
              Get suggestions to enhance your {currentNetwork?.name || 'network'}
            </SheetDescription>
          </SheetHeader>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-4 px-1">
            <div className="space-y-4">
              {chatMessages.map(message => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex gap-2 max-w-[90%]",
                    message.role === 'user' ? "ml-auto" : "mr-auto"
                  )}
                >
                  <div 
                    className={cn(
                      "rounded-lg p-3",
                      message.role === 'user' 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 text-gray-800"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-xs font-medium">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <div className="whitespace-pre-line text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isAILoading && (
                <div className="flex gap-2 max-w-[90%] mr-auto">
                  <div className="rounded-lg p-3 bg-gray-100 text-gray-800">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Message Input */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask for network suggestions..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!currentMessage.trim() || isAILoading}
                size="icon"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Try asking for people, organizations, events, or venues to add
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Network Health Side Panel */}
      <Sheet open={isNetworkHealthOpen} onOpenChange={setIsNetworkHealthOpen}>
        <SheetContent className="sm:max-w-xl w-[90vw] flex flex-col h-full overflow-hidden">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Network Health Dashboard
            </SheetTitle>
            <SheetDescription>
              Overview of tasks, events, and statistics across all networks
            </SheetDescription>
          </SheetHeader>
          
          <Tabs defaultValue="tasks" className="flex-1 overflow-hidden flex flex-col mt-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              {isLoadingHealth ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm text-muted-foreground">Loading network data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Tasks Tab */}
                  <TabsContent value="tasks" className="h-full overflow-y-auto mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">All Tasks</h3>
                        <Badge variant="outline" className="font-medium text-xs">
                          {allTasks.filter(task => !task.completed).length} pending
                        </Badge>
                      </div>
                      
                      {allTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No tasks found across your networks</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {allTasks.map(task => (
                            <div 
                              key={task.id} 
                              className={cn(
                                "p-3 border rounded-lg group",
                                task.completed ? "bg-muted/30" : "bg-card"
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-1">
                                  <Checkbox 
                                    checked={task.completed}
                                    onCheckedChange={() => !task.completed && handleCompleteTask(task.id)}
                                    disabled={task.completed}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={cn(
                                    "text-sm font-medium",
                                    task.completed && "line-through text-muted-foreground"
                                  )}>
                                    {task.text}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {task.node_name}
                                    </Badge>
                                    {task.network_id && (
                                      <Badge variant="secondary" className="text-xs">
                                        {networks.find(n => n.id === task.network_id)?.name || 'Unknown Network'}
                                      </Badge>
                                    )}
                                    {task.dueDate && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Calendar Tab */}
                  <TabsContent value="calendar" className="h-full overflow-y-auto mt-0">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="border rounded-lg p-3">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && updateDateEvents(date)}
                            className="rounded-md"
                            modifiers={{
                              task: calendarEvents
                                .filter(event => event.type === 'task')
                                .map(event => new Date(event.date)),
                              event: calendarEvents
                                .filter(event => event.type === 'event')
                                .map(event => new Date(event.date))
                            }}
                            modifiersStyles={{
                              task: {
                                fontWeight: 'bold',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '50%'
                              },
                              event: {
                                fontWeight: 'bold',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '50%'
                              }
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 border rounded-lg p-3">
                          <h3 className="text-sm font-medium mb-3">
                            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                          </h3>
                          
                          {dateEvents.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No events on this date</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground">
                                  Showing {dateEvents.length} {dateEvents.length === 1 ? 'item' : 'items'}
                                </span>
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span>Tasks</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>Events</span>
                                  </div>
                                </div>
                              </div>
                              
                              {dateEvents.map(event => (
                                <div key={event.id} className="p-2 border rounded-md">
                                  <div className="flex items-start gap-2">
                                    <div className={cn(
                                      "w-2 h-2 rounded-full mt-1.5",
                                      event.type === 'task' ? "bg-amber-500" : "bg-blue-500"
                                    )} />
                                    <div>
                                      <p className="text-sm font-medium">{event.title}</p>
                                      <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {event.type === 'task' ? 'Task' : 'Event'}
                                        </Badge>
                                        {event.nodeName && event.type === 'task' && (
                                          <Badge variant="outline" className="text-xs">
                                            {event.nodeName}
                                          </Badge>
                                        )}
                                        <Badge variant="secondary" className="text-xs">
                                          {event.networkName}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Statistics Tab */}
                  <TabsContent value="stats" className="h-full overflow-y-auto mt-0">
                    <div className="space-y-6">
                      {/* Overview Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card>
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Networks</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="text-2xl font-bold">{networkStats.totalNetworks}</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Nodes</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="text-2xl font-bold">{networkStats.totalNodes}</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Connections</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="text-2xl font-bold">{networkStats.totalEdges}</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="text-2xl font-bold">{networkStats.totalTasks}</div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Task Completion */}
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Task Completion</CardTitle>
                          <CardDescription>
                            {networkStats.completedTasks} of {networkStats.totalTasks} tasks completed
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Progress 
                            value={networkStats.totalTasks ? (networkStats.completedTasks / networkStats.totalTasks) * 100 : 0} 
                            className="h-2"
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              {Math.round(networkStats.totalTasks ? (networkStats.completedTasks / networkStats.totalTasks) * 100 : 0)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {networkStats.totalTasks - networkStats.completedTasks} remaining
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Node Types */}
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Node Types</CardTitle>
                          <CardDescription>
                            Distribution of different node types
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">People</span>
                                <span className="text-sm font-medium">{networkStats.nodeTypes.person}</span>
                              </div>
                              <Progress value={(networkStats.nodeTypes.person / networkStats.totalNodes) * 100} className="h-2 bg-blue-100" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Organizations</span>
                                <span className="text-sm font-medium">{networkStats.nodeTypes.organization}</span>
                              </div>
                              <Progress value={(networkStats.nodeTypes.organization / networkStats.totalNodes) * 100} className="h-2 bg-green-100" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Events</span>
                                <span className="text-sm font-medium">{networkStats.nodeTypes.event}</span>
                              </div>
                              <Progress value={(networkStats.nodeTypes.event / networkStats.totalNodes) * 100} className="h-2 bg-pink-100" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Venues</span>
                                <span className="text-sm font-medium">{networkStats.nodeTypes.venue}</span>
                              </div>
                              <Progress value={(networkStats.nodeTypes.venue / networkStats.totalNodes) * 100} className="h-2 bg-purple-100" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NetworkSidebar;
