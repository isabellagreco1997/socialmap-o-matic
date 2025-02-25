import { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Edge, Node, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback } from 'react';
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import NetworkSidebar from '@/components/network/NetworkSidebar';
import NetworkSearchHeader from '@/components/network/NetworkSearchHeader';
import NetworkFlow from '@/components/network/NetworkFlow';
import NetworkEditDialog from '@/components/network/NetworkEditDialog';
import AddNodeDialog from '@/components/AddNodeDialog';
import { CsvPreviewDialog } from '@/components/CsvPreviewDialog';
import { TemplatesDialog } from '@/components/TemplatesDialog';
import type { Network, NodeData } from '@/types/network';
import type { Database } from "@/integrations/supabase/types";

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

  const filteredNetworks = networks.filter(network => 
    network.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNode = async (nodeData: NodeData) => {
    try {
      const id = `node-${Date.now()}`;
      const newNode = {
        id,
        type: 'social',
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data: nodeData
      };
      setNodes(nodes => [...nodes, newNode]);
      setIsDialogOpen(false);
      toast({
        title: "Node added",
        description: `Added ${nodeData.name} to the network`,
      });
    } catch (error) {
      console.error('Error adding node:', error);
      toast({
        title: "Error",
        description: "Failed to add node",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const { data: networksData, error } = await supabase
          .from('networks')
          .select('*')
          .order('order', { ascending: true });
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
            x: node.x_position,
            y: node.y_position
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
    setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds));
  }, [setEdges]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const headers = lines[0].split('\t').map(header => header.trim());
      const dataRows = lines.slice(1)
        .map(row => row.split('\t').map(cell => cell.trim()))
        .filter(row => row.length === headers.length);
      
      setCsvHeaders(headers);
      setCsvRows(dataRows);
      setIsCsvDialogOpen(true);
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async (columnMapping: {
    name?: string;
    type?: string;
    profile?: string;
    image?: string;
    date?: string;
    address?: string;
  }) => {
    if (!currentNetworkId) return;

    try {
      console.log('Starting CSV import with mapping:', columnMapping);
      console.log('CSV Headers:', csvHeaders);
      console.log('CSV Rows:', csvRows);

      if (!columnMapping.name) {
        toast({
          variant: "destructive",
          title: "Import Error",
          description: "Please map the Name column"
        });
        return;
      }

      const nodesToAdd = csvRows.map((row, index) => {
        const nameIdx = csvHeaders.indexOf(columnMapping.name!);
        const typeIdx = columnMapping.type ? csvHeaders.indexOf(columnMapping.type) : -1;
        const profileIdx = columnMapping.profile ? csvHeaders.indexOf(columnMapping.profile) : -1;
        const imageIdx = columnMapping.image ? csvHeaders.indexOf(columnMapping.image) : -1;
        const dateIdx = columnMapping.date ? csvHeaders.indexOf(columnMapping.date) : -1;
        const addressIdx = columnMapping.address ? csvHeaders.indexOf(columnMapping.address) : -1;

        const gridCols = Math.ceil(Math.sqrt(csvRows.length));
        const xPos = (index % gridCols) * 200 + 100;
        const yPos = Math.floor(index / gridCols) * 200 + 100;

        return {
          network_id: currentNetworkId,
          name: row[nameIdx],
          type: typeIdx >= 0 ? row[typeIdx].toLowerCase() : 'person',
          profile_url: profileIdx >= 0 ? row[profileIdx] : null,
          image_url: imageIdx >= 0 ? row[imageIdx] : null,
          date: dateIdx >= 0 ? row[dateIdx] : null,
          address: addressIdx >= 0 ? row[addressIdx] : null,
          x_position: xPos,
          y_position: yPos
        };
      });

      console.log('Preparing to insert nodes:', nodesToAdd);

      const { data: newNodes, error } = await supabase
        .from('nodes')
        .insert(nodesToAdd)
        .select();

      if (error) {
        throw error;
      }

      if (newNodes) {
        const formattedNodes = newNodes.map(node => ({
          id: node.id,
          type: 'social',
          position: {
            x: node.x_position,
            y: node.y_position
          },
          data: {
            type: node.type,
            name: node.name,
            profileUrl: node.profile_url,
            imageUrl: node.image_url,
            date: node.date,
            address: node.address,
            todos: []
          }
        }));

        setNodes(prev => [...prev, ...formattedNodes]);
      }

      toast({
        title: "CSV Import Successful",
        description: `Imported ${nodesToAdd.length} nodes`
      });
      setIsCsvDialogOpen(false);
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Failed to import CSV data"
      });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, network: Database['public']['Tables']['networks']['Row']) => {
    e.dataTransfer.setData('networkId', network.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetNetwork: Database['public']['Tables']['networks']['Row']) => {
    e.preventDefault();
    const draggedNetworkId = e.dataTransfer.getData('networkId');
    const targetNetworkId = targetNetwork.id;
    
    if (draggedNetworkId === targetNetworkId) return;

    const draggedIndex = networks.findIndex(n => n.id === draggedNetworkId);
    const targetIndex = networks.findIndex(n => n.id === targetNetworkId);
    
    const newNetworks = [...networks];
    const [draggedNetwork] = newNetworks.splice(draggedIndex, 1);
    newNetworks.splice(targetIndex, 0, draggedNetwork);

    try {
      setNetworks(newNetworks);

      const updates = newNetworks.map((network, index) => ({
        id: network.id,
        name: network.name,
        user_id: network.user_id,
        order: index
      }));

      const { error } = await supabase
        .from('networks')
        .upsert(updates);

      if (error) throw error;

      toast({
        title: "Network Reordered",
        description: "Network order updated successfully"
      });
    } catch (error) {
      console.error('Error updating network order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update network order"
      });
      setNetworks(networks);
    }
  };

  const handleEditNetwork = async () => {
    if (!editingNetwork) return;
    try {
      const { error } = await supabase
        .from('networks')
        .update({ name: networkName })
        .eq('id', editingNetwork.id);
      
      if (error) throw error;

      setNetworks(networks.map(network => 
        network.id === editingNetwork.id 
          ? { ...network, name: networkName }
          : network
      ));
      
      setEditingNetwork(null);
      toast({
        title: "Network updated",
        description: `Updated ${networkName}`
      });
    } catch (error) {
      console.error('Error updating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update network"
      });
    }
  };

  const handleDuplicateNetwork = async () => {
    if (!editingNetwork) return;
    try {
      const { data: network, error } = await supabase
        .from('networks')
        .insert([{ 
          name: `${editingNetwork.name} (Copy)`,
          user_id: editingNetwork.user_id 
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setNetworks(prev => [...prev, network]);
      setEditingNetwork(null);
      toast({
        title: "Network duplicated",
        description: `Created ${network.name}`
      });
    } catch (error) {
      console.error('Error duplicating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate network"
      });
    }
  };

  const handleTemplateSelect = async (template: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
  
      const { data: network, error: networkError } = await supabase
        .from('networks')
        .insert([{
          name: template.name,
          user_id: user.id
        }])
        .select()
        .single();
  
      if (networkError) throw networkError;
  
      const nodesPromises = template.nodes.map((node: any, index: number) => 
        supabase.from('nodes').insert({
          network_id: network.id,
          name: node.name,
          type: node.type,
          x_position: node.x_position,
          y_position: node.y_position
        }).select()
      );
  
      const nodesResults = await Promise.all(nodesPromises);
      const createdNodes = nodesResults.map(result => result.data?.[0]);
  
      const edgesPromises = template.edges.map((edge: any) => 
        supabase.from('edges').insert({
          network_id: network.id,
          source_id: createdNodes[edge.source].id,
          target_id: createdNodes[edge.target].id,
          label: edge.label
        })
      );
  
      await Promise.all(edgesPromises);
  
      setNetworks(prev => [...prev, network]);
      setCurrentNetworkId(network.id);
      setIsTemplatesDialogOpen(false);
  
      toast({
        title: "Template Applied",
        description: `Created new network from ${template.name} template`
      });
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply template"
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="h-screen w-full bg-background flex">
        <Sidebar>
          <SidebarContent className="w-[260px] border-r bg-white flex flex-col h-screen overflow-hidden">
            <NetworkSearchHeader 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <NetworkSidebar
              networks={filteredNetworks}
              currentNetworkId={currentNetworkId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNetworkSelect={setCurrentNetworkId}
              onEditNetwork={setEditingNetwork}
            />
          </SidebarContent>
        </Sidebar>

        <div className="flex-1">
          <ReactFlowProvider>
            <NetworkFlow
              nodes={nodes}
              edges={edges}
              networks={networks}
              currentNetworkId={currentNetworkId}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onAddNode={() => setIsDialogOpen(true)}
              onImportCsv={() => document.getElementById('csv-input')?.click()}
            />
          </ReactFlowProvider>

          <AddNodeDialog 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            onSave={handleAddNode} 
          />
          
          <CsvPreviewDialog 
            open={isCsvDialogOpen}
            onOpenChange={setIsCsvDialogOpen}
            headers={csvHeaders}
            rows={csvRows}
            onConfirm={handleCsvImport}
          />
          
          <TemplatesDialog
            open={isTemplatesDialogOpen}
            onOpenChange={setIsTemplatesDialogOpen}
            onTemplateSelect={handleTemplateSelect}
          />
          
          <NetworkEditDialog
            network={editingNetwork}
            networkName={networkName}
            networkDescription={networkDescription}
            onNameChange={setNetworkName}
            onDescriptionChange={setNetworkDescription}
            onClose={() => setEditingNetwork(null)}
            onSave={handleEditNetwork}
          />
          
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Flow;
