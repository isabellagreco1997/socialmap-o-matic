import { Network } from "@/types/network";

export interface NetworkSidebarProps {
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

export interface TodoItem {
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
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Define an event interface for the calendar
export interface CalendarEvent {
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
export interface NetworkStats {
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

// Extended network type that includes optional description
export type ExtendedNetwork = Network & {
  description?: string;
};

export interface NetworkNodeStats {
  nodes: number;
  edges: number;
  tasks: number;
} 