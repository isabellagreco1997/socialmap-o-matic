import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Network, NodeData } from "@/types/network";
import { Node } from "@xyflow/react";

export const useNetworkHandlers = (
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setNetworks: React.Dispatch<React.SetStateAction<Network[]>>,
  setEditingNetwork: React.Dispatch<React.SetStateAction<Network | null>>,
  networks: Network[]
) => {
  const handleAddNode = ({ data }: { data: NodeData }) => {
    try {
      const id = `node-${Date.now()}`;
      const newNode = {
        id,
        type: 'social',
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data
      };
      setNodes(nodes => [...nodes, newNode]);
      setIsDialogOpen(false);
      toast({
        title: "Node added",
        description: `Added ${data.name} to the network`,
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

  const handleEditNetwork = async (networkName: string) => {
    try {
      const { error } = await supabase
        .from('networks')
        .update({ name: networkName })
        .eq('id', networks[0].id);
      
      if (error) throw error;

      setNetworks(networks.map(network => 
        network.id === networks[0].id 
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

  const handleDuplicateNetwork = async (editingNetwork: Network) => {
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
  
      const spacing = 200;
      const gridSize = Math.ceil(Math.sqrt(template.nodes.length));
      
      const centerX = (gridSize * spacing) / 2;
      const centerY = (gridSize * spacing) / 2;

      const nodesPromises = template.nodes.map((node: any, index: number) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        
        const randomOffset = () => (Math.random() - 0.5) * 50;
        
        const x_position = (col * spacing) - centerX + randomOffset();
        const y_position = (row * spacing) - centerY + randomOffset();
        
        return supabase.from('nodes').insert({
          network_id: network.id,
          name: node.name,
          type: node.type,
          x_position,
          y_position,
          notes: node.notes,
          address: node.address,
          date: node.date,
          image_url: node.image_url
        }).select();
      });
  
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

  const handleCsvImport = async (columnMapping: {
    name?: string;
    type?: string;
    profile?: string;
    image?: string;
    date?: string;
    address?: string;
  }, currentNetworkId: string | null, csvHeaders: string[], csvRows: string[][]) => {
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
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Failed to import CSV data"
      });
    }
  };

  const handleDeleteNetwork = async (networkId: string) => {
    try {
      const { error } = await supabase
        .from('networks')
        .delete()
        .eq('id', networkId);
      
      if (error) throw error;

      setNetworks(networks.filter(network => network.id !== networkId));
      setEditingNetwork(null);
      toast({
        title: "Network deleted",
        description: "Network has been successfully deleted"
      });
    } catch (error) {
      console.error('Error deleting network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete network"
      });
    }
  };

  const handleNetworksReorder = async (reorderedNetworks: Network[]) => {
    try {
      setNetworks(reorderedNetworks);

      const updatePromises = reorderedNetworks.map((network) =>
        supabase
          .from('networks')
          .update({ order: network.order })
          .eq('id', network.id)
      );

      await Promise.all(updatePromises);

      toast({
        title: "Networks reordered",
        description: "Network order has been updated"
      });
    } catch (error) {
      console.error('Error updating network order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update network order"
      });
    }
  };

  return {
    handleAddNode,
    handleEditNetwork,
    handleDuplicateNetwork,
    handleTemplateSelect,
    handleCsvImport,
    handleDeleteNetwork,
    handleNetworksReorder,
  };
};
