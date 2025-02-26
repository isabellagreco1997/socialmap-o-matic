import { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback } from 'react';
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import NetworkSidebar from '@/components/network/NetworkSidebar';
import NetworkSearchHeader from '@/components/network/NetworkSearchHeader';
import { useNetworkHandlers } from '@/components/network/handlers';
import { NetworkContent } from '@/components/network/NetworkContent';
import { NetworkDialogs } from '@/components/network/NetworkDialogs';
import type { Network } from '@/types/network';

export const Flow = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [currentNetworkId, setCurrentNetworkId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  const {
    handleAddNode,
    handleEditNetwork,
    handleDuplicateNetwork,
    handleTemplateSelect,
    handleCsvImport,
    handleDeleteNetwork,
    handleNetworksReorder
  } = useNetworkHandlers(setNodes, setIsDialogOpen, setNetworks, setEditingNetwork, networks);

  const handleNodesChange = useCallback(async (changes: any) => {
    onNodesChange(changes);

    const positionChanges = changes.filter((change: any) => change.type === 'position' && change.dragging === false);
    if (positionChanges.length > 0 && currentNetworkId) {
      try {
        await Promise.all(positionChanges.map((change: any) => supabase.from('nodes').update({
          x_position: change.position.x,
          y_position: change.position.y
        }).eq('id', change.id).eq('network_id', currentNetworkId)));
      } catch (error) {
        console.error('Error updating node positions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save node positions"
        });
      }
    }
  }, [currentNetworkId, onNodesChange, toast]);

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

  useEffect(() => {
    const fetchNetworkData = async () => {
      if (!currentNetworkId) return;
      try {
        const [nodesResponse, edgesResponse] = await Promise.all([supabase.from('nodes').select('*').eq('network_id', currentNetworkId), supabase.from('edges').select('*').eq('network_id', currentNetworkId)]);
        if (nodesResponse.error) throw nodesResponse.error;
        if (edgesResponse.error) throw edgesResponse.error;
        const nodesTodosResponse = await Promise.all(nodesResponse.data.map(node => supabase.from('todos').select('*').eq('node_id', node.id)));
        const nodesWithTodos = nodesResponse.data.map((node, index) => ({
          id: node.id,
          type: 'social',
          position: {
            x: node.x_position || Math.random() * 500,
            y: node.y_position || Math.random() * 500
          },
          data: {
            type: node.type,
            name: node.name,
            profileUrl: node.profile_url,
            imageUrl: node.image_url,
            date: node.date,
            address: node.address,
            todos: nodesTodosResponse[index].data || []
          }
        }));
        const formattedEdges = edgesResponse.data.map(edge => ({
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          type: 'custom',
          data: {
            label: edge.label,
            notes: edge.notes,
            labelPosition: edge.label_position
          }
        }));
        setNodes(nodesWithTodos);
        setEdges(formattedEdges);
      } catch (error) {
        console.error('Error fetching network data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load network data"
        });
      }
    };
    fetchNetworkData();
  }, [currentNetworkId, setNodes, setEdges, toast]);

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({
      ...params,
      type: 'custom'
    }, eds));
  }, [setEdges]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const headers = lines[0].split('\t').map(header => header.trim());
      const dataRows = lines.slice(1).map(row => row.split('\t').map(cell => cell.trim())).filter(row => row.length === headers.length);
      setCsvHeaders(headers);
      setCsvRows(dataRows);
      setIsCsvDialogOpen(true);
    };
    reader.readAsText(file);
  };

  const handleOverviewClick = () => {
    setIsOverviewOpen(!isOverviewOpen);
  };

  const filteredNetworks = networks.filter(network => 
    network.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <SidebarProvider defaultOpen>
      <div className="h-screen w-full bg-background flex">
        <Sidebar>
          <SidebarContent className="w-[300px] border-r bg-white flex flex-col h-screen overflow-hidden">
            <NetworkSearchHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <NetworkSidebar 
              networks={filteredNetworks} 
              currentNetworkId={currentNetworkId} 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
              onNetworkSelect={setCurrentNetworkId} 
              onEditNetwork={setEditingNetwork} 
              onOpenTemplates={() => setIsTemplatesDialogOpen(true)} 
              onNetworksReorder={handleNetworksReorder}
              onOverviewClick={handleOverviewClick}
              isOverviewOpen={isOverviewOpen}
            />
          </SidebarContent>
        </Sidebar>

        <NetworkContent 
          nodes={nodes}
          edges={edges}
          networks={networks}
          currentNetworkId={currentNetworkId}
          isOverviewOpen={isOverviewOpen}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onAddNode={() => setIsDialogOpen(true)}
          onImportCsv={() => document.getElementById('csv-input')?.click()}
        />

        <NetworkDialogs 
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          isCsvDialogOpen={isCsvDialogOpen}
          setIsCsvDialogOpen={setIsCsvDialogOpen}
          isTemplatesDialogOpen={isTemplatesDialogOpen}
          setIsTemplatesDialogOpen={setIsTemplatesDialogOpen}
          csvHeaders={csvHeaders}
          csvRows={csvRows}
          editingNetwork={editingNetwork}
          networkName={networkName}
          networkDescription={networkDescription}
          onNameChange={setNetworkName}
          onDescriptionChange={setNetworkDescription}
          onAddNode={handleAddNode}
          onCsvImport={handleCsvImport}
          onTemplateSelect={handleTemplateSelect}
          onEditNetwork={handleEditNetwork}
          onDeleteNetwork={handleDeleteNetwork}
          currentNetworkId={currentNetworkId}
          setEditingNetwork={setEditingNetwork}
        />
        
        <input 
          id="csv-input" 
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
      </div>
    </SidebarProvider>
  );
};

export default Flow;
