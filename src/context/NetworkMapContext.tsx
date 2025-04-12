import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import type { Network, NodeData, EdgeData } from '@/types/network';

interface NetworkMapContextProps {
  networks: Network[];
  setNetworks: React.Dispatch<React.SetStateAction<Network[]>>;
  currentNetworkId: string | null;
  setCurrentNetworkId: React.Dispatch<React.SetStateAction<string | null>>;
  nodes: Node<NodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
  edges: Edge<EdgeData>[];
  setEdges: React.Dispatch<React.SetStateAction<Edge<EdgeData>[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCsvDialogOpen: boolean;
  setIsCsvDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  csvHeaders: string[];
  setCsvHeaders: React.Dispatch<React.SetStateAction<string[]>>;
  csvRows: string[][];
  setCsvRows: React.Dispatch<React.SetStateAction<string[][]>>;
  isEdgeLabelDialogOpen: boolean;
  setIsEdgeLabelDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEdge: Edge<EdgeData> | null;
  setSelectedEdge: React.Dispatch<React.SetStateAction<Edge<EdgeData> | null>>;
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
  isGeneratingNetwork: boolean;
  setIsGeneratingNetwork: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isTemplatesDialogOpen: boolean;
  setIsTemplatesDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingNetwork: Network | null;
  setEditingNetwork: React.Dispatch<React.SetStateAction<Network | null>>;
  networkName: string;
  setNetworkName: React.Dispatch<React.SetStateAction<string>>;
  networkDescription: string;
  setNetworkDescription: React.Dispatch<React.SetStateAction<string>>;
  refreshCounter: number;
  setRefreshCounter: React.Dispatch<React.SetStateAction<number>>;
  showCreateDialog: boolean;
  setShowCreateDialog: React.Dispatch<React.SetStateAction<boolean>>;
  filteredNetworks: Network[];
}

export const NetworkMapContext = createContext<NetworkMapContextProps | undefined>(undefined);

export const NetworkMapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for networks and metadata
  const [networks, setNetworks] = useState<Network[]>([]);
  const [currentNetworkId, setCurrentNetworkId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [isEdgeLabelDialogOpen, setIsEdgeLabelDialogOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isGeneratingNetwork, setIsGeneratingNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Initialize nodes and edges using the react-flow hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { toast } = useToast();

  // Compute filtered networks
  const filteredNetworks = networks.filter(network => 
    network.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Fetch networks effect
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const {
          data: networksData,
          error
        } = await supabase.from('networks').select('*').order('order', {
          ascending: true
        });
        if (error) throw error;
        setNetworks(networksData);
        if (networksData.length > 0 && !currentNetworkId) {
          setCurrentNetworkId(networksData[0].id);
        } else if (networksData.length === 0) {
          // Clear the current network ID when there are no networks
          setCurrentNetworkId(null);
        }
      } catch (error) {
        console.error('Error fetching networks:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load networks"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetworks();
  }, [currentNetworkId, toast]);

  return (
    <NetworkMapContext.Provider value={{
      networks,
      setNetworks,
      currentNetworkId,
      setCurrentNetworkId,
      nodes,
      setNodes,
      edges,
      setEdges,
      onNodesChange,
      onEdgesChange,
      searchQuery,
      setSearchQuery,
      isDialogOpen,
      setIsDialogOpen,
      isCsvDialogOpen,
      setIsCsvDialogOpen,
      csvHeaders,
      setCsvHeaders,
      csvRows,
      setCsvRows,
      isEdgeLabelDialogOpen,
      setIsEdgeLabelDialogOpen,
      selectedEdge,
      setSelectedEdge,
      showChat,
      setShowChat,
      isGeneratingNetwork,
      setIsGeneratingNetwork,
      isLoading,
      setIsLoading,
      isTemplatesDialogOpen,
      setIsTemplatesDialogOpen,
      editingNetwork,
      setEditingNetwork,
      networkName,
      setNetworkName,
      networkDescription,
      setNetworkDescription,
      refreshCounter,
      setRefreshCounter,
      showCreateDialog,
      setShowCreateDialog,
      filteredNetworks
    }}>
      {children}
    </NetworkMapContext.Provider>
  );
};

export const useNetworkMap = () => {
  const context = useContext(NetworkMapContext);
  if (context === undefined) {
    throw new Error('useNetworkMap must be used within a NetworkMapProvider');
  }
  return context;
}; 