import { useState, useEffect } from "react";
import { Calendar, CheckSquare, BarChart2, Clock, ArrowLeft, ChevronRight, PlusCircle, Trash2, Filter, ArrowDownAZ, ArrowDownZA, CalendarDays, Building, Check, CheckCircle2, Circle, Network as NetworkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network } from "@/types/network";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface NetworkHealthPageProps {
  onReturn: () => void;
  networks: Network[];
}

// Task type definition
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  due_date: string;
  network_id: string | null;
  created_at: string;
  node_id?: string;
  node_name?: string;
}

// Event type definition
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  network_id: string | null;
}

// Analytics data type
interface AnalyticsData {
  networkId: string;
  networkName: string;
  nodeCount: number;
  edgeCount: number;
  completionRate: number;
  lastActivity: string;
}

export function NetworkHealthPage({ onReturn, networks }: NetworkHealthPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [taskSortBy, setTaskSortBy] = useState<'due_date' | 'network'>('due_date');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Generate mock data for everything
  useEffect(() => {
    setIsLoading(true);
    
    // Mock tasks with node information
    const mockTasks: Task[] = [];
    const taskTitles = [
      "Update contact information", 
      "Schedule follow-up meeting", 
      "Add new connections", 
      "Review network gaps",
      "Connect with industry leaders"
    ];
    
    const nodeNames = [
      "John Smith",
      "Sarah Johnson",
      "Tech Innovations Inc.",
      "Marketing Department",
      "HR Team",
      "Finance Group",
      "Product Development",
      "Sales Team"
    ];
    
    networks.forEach((network, networkIndex) => {
      // Create 2-3 tasks per network
      const tasksPerNetwork = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < tasksPerNetwork; i++) {
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + (networkIndex * 2) + i + 1);
        
        const taskId = `task-${network.id}-${i}`;
        const nodeId = `node-${network.id}-${i}`;
        const nodeName = nodeNames[Math.floor(Math.random() * nodeNames.length)];
        
        mockTasks.push({
          id: taskId,
          title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
          description: `Complete this task for your "${network.name}" network`,
          status: Math.random() > 0.7 ? 'completed' : 'pending',
          due_date: dueDate.toISOString(),
          network_id: network.id,
          created_at: new Date().toISOString(),
          node_id: nodeId,
          node_name: nodeName
        });
      }
    });
    
    setTasks(mockTasks);
    
    // Mock calendar events
    const mockEvents: CalendarEvent[] = [];
    const eventTitles = ["Network Review", "Strategy Meeting", "Contacts Update", "Relationship Check-in"];
    
    networks.slice(0, 5).forEach((network, i) => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + i + 1);
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      
      mockEvents.push({
        id: `event-${i}`,
        title: eventTitles[i % eventTitles.length],
        description: `Review and update "${network.name}" network`,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        network_id: network.id
      });
    });
    
    setEvents(mockEvents);
    
    // Mock analytics data
    const mockAnalytics: AnalyticsData[] = networks.slice(0, 5).map((network, i) => {
      const randomNodeCount = Math.floor(Math.random() * 30) + 5;
      const randomEdgeCount = Math.floor(Math.random() * 50) + 10;
      const randomCompletion = Math.floor(Math.random() * 100);
      
      const lastActivityDate = new Date();
      lastActivityDate.setDate(lastActivityDate.getDate() - Math.floor(Math.random() * 14));
      
      return {
        networkId: network.id,
        networkName: network.name,
        nodeCount: randomNodeCount,
        edgeCount: randomEdgeCount,
        completionRate: randomCompletion,
        lastActivity: lastActivityDate.toISOString()
      };
    });
    
    setAnalytics(mockAnalytics);
    setIsLoading(false);
  }, [networks]);

  // Handle toggling a task's completed status
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } : task
    ));
  };
  
  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setDeleteTaskId(null);
  };

  // Helper to get sorted and filtered tasks
  const getSortedAndFilteredTasks = () => {
    // Apply filter
    let filteredTasks = tasks;
    if (taskFilter === 'pending') {
      filteredTasks = tasks.filter(task => task.status === 'pending');
    } else if (taskFilter === 'completed') {
      filteredTasks = tasks.filter(task => task.status === 'completed');
    }
    
    // Apply sort
    return [...filteredTasks].sort((a, b) => {
      if (taskSortBy === 'due_date') {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (taskSortBy === 'network') {
        const networkA = getNetworkName(a.network_id) || '';
        const networkB = getNetworkName(b.network_id) || '';
        return networkA.localeCompare(networkB);
      }
      return 0;
    });
  };

  // Format date for display in a more human-readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Get day with suffix (1st, 2nd, 3rd, etc.)
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric' 
    }).replace(String(day), `${day}${suffix}`);
  };
  
  // Helper to get the correct suffix for a day number
  const getDaySuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Calculate days until an event
  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  // Get network name by ID
  const getNetworkName = (networkId: string | null) => {
    if (!networkId) return "General";
    const network = networks.find(n => n.id === networkId);
    return network ? network.name : "Unknown Network";
  };

  // Calculate total node count across all networks
  const getTotalNodeCount = () => {
    return analytics.reduce((sum, network) => sum + network.nodeCount, 0);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto p-6 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500">Loading dashboard...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title section with back button */}
            <div className="mb-10 text-center relative">
              <div className="absolute left-0 top-0">
                <Button variant="ghost" size="icon" onClick={onReturn} className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Network Health Dashboard</h1>
              <p className="text-muted-foreground text-base mb-8 max-w-2xl mx-auto">
                Track and manage tasks, events, and analytics across all your networks.
              </p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 text-center border-b">
                  <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
                    <CheckSquare className="h-4 w-4 text-blue-500" />
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{tasks.filter(t => t.status === 'pending').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Pending tasks
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 text-center border-b">
                  <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
                    <NetworkIcon className="h-4 w-4 text-blue-500" />
                    Nodes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{getTotalNodeCount()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total nodes
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 text-center border-b">
                  <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
                    <BarChart2 className="h-4 w-4 text-blue-500" />
                    Networks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{networks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total networks
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 text-center border-b">
                  <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{events.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Upcoming events
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-center mb-4">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="tasks" className="flex justify-center items-center gap-1">
                    <CheckSquare className="h-4 w-4" />
                    <span>Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex justify-center items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Calendar</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex justify-center items-center gap-1">
                    <BarChart2 className="h-4 w-4" />
                    <span>Analytics</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Tasks Tab */}
              <TabsContent value="tasks">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Your Tasks</h2>
                    
                    <div className="flex items-center gap-3">
                      {/* Filter by status */}
                      <div className="flex items-center">
                        <Select value={taskFilter} onValueChange={(value) => setTaskFilter(value as any)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <Filter className="h-3 w-3 mr-2" />
                            <SelectValue placeholder="Filter tasks" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="pending">Pending Only</SelectItem>
                            <SelectItem value="completed">Completed Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Sort by due date or network */}
                      <div className="flex items-center">
                        <Select value={taskSortBy} onValueChange={(value) => setTaskSortBy(value as any)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <ArrowDownAZ className="h-3 w-3 mr-2" />
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="due_date">Due Date</SelectItem>
                            <SelectItem value="network">Network</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {getSortedAndFilteredTasks().length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No tasks found. Create a new task to get started.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {getSortedAndFilteredTasks().map(task => (
                        <Card key={task.id} className={task.status === 'completed' ? 'opacity-80' : ''}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <div className="flex items-start gap-2">
                                <div className="mt-1 flex-shrink-0">
                                  <button 
                                    className="focus:outline-none focus:ring-0"
                                    onClick={() => handleToggleTaskStatus(task.id)}
                                  >
                                    {task.status === 'completed' ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-gray-300 hover:text-gray-400" />
                                    )}
                                  </button>
                                </div>
                                <div>
                                  <CardTitle className={`text-base font-medium flex items-center gap-2 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                    {task.title}
                                    {task.status === 'completed' && (
                                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 ml-2">
                                        <Check className="h-3 w-3 mr-1" />
                                        Completed
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="text-xs flex items-center mt-1 gap-4">
                                    <span className="flex items-center gap-1">
                                      <Building className="h-3 w-3 text-gray-400" />
                                      {getNetworkName(task.network_id)}
                                    </span>
                                    {task.node_name && (
                                      <span className="flex items-center gap-1">
                                        <CheckSquare className="h-3 w-3 text-gray-400" />
                                        {task.node_name}
                                      </span>
                                    )}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                                <CalendarDays className="h-3 w-3" />
                                {getDaysUntil(task.due_date)}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2 pl-7">
                            <p className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                              {task.description}
                            </p>
                          </CardContent>
                          <CardFooter className="pt-0 pb-4 flex justify-between pl-7">
                            <span className="text-xs text-gray-500">
                              Due: {formatDate(task.due_date)}
                            </span>
                            <div className="flex gap-2">
                              <AlertDialog open={deleteTaskId === task.id} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setDeleteTaskId(task.id)}>
                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this task? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Calendar Tab */}
              <TabsContent value="calendar">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Upcoming Events</h2>
                  </div>
                  
                  {events.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No events found. Add an event to get started.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {events.map(event => (
                        <Card key={event.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-base font-medium">{event.title}</CardTitle>
                              <div className="text-xs text-purple-500 bg-purple-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {getDaysUntil(event.start_time)}
                              </div>
                            </div>
                            <CardDescription className="text-xs">
                              {getNetworkName(event.network_id)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm">{event.description}</p>
                          </CardContent>
                          <CardFooter className="pt-0 pb-4">
                            <span className="text-xs text-gray-500">
                              {formatDate(event.start_time)} • {new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                              - {new Date(event.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Network Analytics</h2>
                  </div>
                  
                  {analytics.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No analytics data available.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {analytics.map(network => (
                        <Card key={network.networkId}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium">{network.networkName}</CardTitle>
                            <CardDescription className="text-xs">
                              Last updated: {formatDate(network.lastActivity)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Nodes</p>
                                <p className="text-lg font-semibold">{network.nodeCount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Connections</p>
                                <p className="text-lg font-semibold">{network.edgeCount}</p>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <p className="text-xs text-gray-500">Completion</p>
                                <p className="text-xs font-medium">{network.completionRate}%</p>
                              </div>
                              <Progress value={network.completionRate} className="h-2" />
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0 pb-4">
                            <Button size="sm" variant="outline" className="text-xs w-full">
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
} 