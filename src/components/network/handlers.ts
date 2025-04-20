import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Network, NodeData } from "@/types/network";
import { Node } from "@xyflow/react";

export const useNetworkHandlers = (
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setNetworks: React.Dispatch<React.SetStateAction<Network[]>>,
  setEditingNetwork: React.Dispatch<React.SetStateAction<Network | null>>,
  networks: Network[],
  currentNetworkId: string | null
) => {
  const handleAddNode = async ({ data }: { data: NodeData }) => {
    try {
      if (!currentNetworkId) {
        throw new Error('No active network selected');
      }

      // Validate that name is provided and not empty
      if (!data.name || data.name.trim() === '') {
        console.error('Attempted to add node with empty name:', data);
        toast({
          title: "Error",
          description: "Node name cannot be empty",
          variant: "destructive",
        });
        return;
      }

      // Create database object with snake_case properties
      const dbNode = {
        network_id: currentNetworkId,
        name: data.name.trim(),
        type: data.type, // Ensure type is included
        profile_url: data.profileUrl,
        image_url: data.imageUrl,
        date: data.date,
        address: data.address,
        notes: data.contactDetails?.notes,
        x_position: Math.random() * 500,
        y_position: Math.random() * 500,
        color: data.color
      };
      
      console.log('Inserting node with data:', dbNode);
      
      // Save to database first
      const { data: savedNode, error } = await supabase
        .from('nodes')
        .insert(dbNode)
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting node:', error, 'Node data:', dbNode);
        throw error;
      }
      
      // Then update UI with the saved node
      const newNode = {
        id: savedNode.id,
        type: 'social',
        position: { x: savedNode.x_position, y: savedNode.y_position },
        data: {
          ...data,
          // Ensure any database values are reflected in the UI
          type: savedNode.type
        }
      };
      
      // Update the local state
      setNodes(nodes => {
        const newNodes = [...nodes, newNode];
        
        // Save to localStorage to provide backup persistence
        if (currentNetworkId) {
          try {
            localStorage.setItem(`socialmap-nodes-${currentNetworkId}`, JSON.stringify(newNodes));
          } catch (e) {
            console.error('Error saving nodes to localStorage:', e);
          }
        }
        
        return newNodes;
      });

      setIsDialogOpen(false);
      toast({
        title: "Node added",
        description: `Added ${data.name} to the network`,
      });
      
      // Ensure other components know we've added a node
      window.dispatchEvent(new CustomEvent('node-added', { 
        detail: { 
          networkId: currentNetworkId,
          nodeId: savedNode.id
        }
      }));
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
      console.log('Template selected:', template);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
  
      const { data: network, error: networkError } = await supabase
        .from('networks')
        .insert([{
          name: template.name,
          user_id: user.id,
          is_ai: false
        }])
        .select()
        .single();
  
      if (networkError) throw networkError;
      
      // Log the created network
      console.log('Created template network:', network);
      
      // Add to local state immediately
      setNetworks(prev => [...prev, network]);

      // Increased spacing between nodes
      const spacing = 500; // Increased from 300 to 500 for better visibility
      const gridSize = Math.ceil(Math.sqrt(template.nodes.length));
      
      // Calculate the center position to place nodes around
      const centerX = (gridSize * spacing) / 2;
      const centerY = (gridSize * spacing) / 2;

      // Filter out nodes without a valid name
      const validNodes = template.nodes.filter((node: any) => 
        node.name && typeof node.name === 'string' && node.name.trim() !== ''
      );

      console.log('Valid nodes count:', validNodes.length, 'Original nodes count:', template.nodes.length);
      
      if (validNodes.length === 0) {
        console.error('No valid nodes found in template:', template);
        throw new Error('No valid nodes found in template');
      }

      const nodesPromises = validNodes.map((node: any, index: number) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        
        // Add some random offset to avoid perfect grid alignment
        const randomOffset = () => (Math.random() - 0.5) * 200; // Increased from 100 to 200 for more organic layout
        
        const x_position = (col * spacing) - centerX + randomOffset();
        const y_position = (row * spacing) - centerY + randomOffset();
        
        const nodeData = {
          network_id: network.id,
          name: node.name.trim(),
          type: node.type || 'person',
          x_position,
          y_position,
          notes: node.notes,
          address: node.address,
          date: node.date,
          image_url: node.image_url
        };
        
        console.log('Inserting template node:', nodeData);
        
        return supabase.from('nodes').insert(nodeData).select();
      });
  
      const nodesResults = await Promise.all(nodesPromises);
      const createdNodes = nodesResults.map(result => result.data?.[0]);
      
      // Validate that all nodes were created successfully before creating edges
      if (createdNodes.some(node => !node)) {
        console.error('Some nodes failed to create properly:', createdNodes);
        throw new Error('Failed to create all nodes properly');
      }
  
      const edgesPromises = template.edges.map((edge: any) => {
        // Validate that source and target indices exist in the createdNodes array
        if (!createdNodes[edge.source] || !createdNodes[edge.target]) {
          console.error('Invalid edge reference:', edge, 'Available nodes:', createdNodes.length);
          return Promise.resolve(null); // Skip this edge
        }
        
        return supabase.from('edges').insert({
          network_id: network.id,
          source_id: createdNodes[edge.source].id,
          target_id: createdNodes[edge.target].id,
          label: edge.label
        });
      }).filter(Boolean); // Filter out any null promises
  
      await Promise.all(edgesPromises);
  
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
    if (!currentNetworkId) {
      console.error('No current network ID provided for CSV import');
      return;
    }

    try {
      console.log('Starting CSV import with mapping:', columnMapping);
      console.log('CSV Headers:', csvHeaders);
      console.log('CSV Rows count:', csvRows.length);
      
      // Log a sample of rows for debugging
      if (csvRows.length > 0) {
        console.log('Sample row:', csvRows[0]);
      }

      if (!columnMapping.name) {
        toast({
          variant: "destructive",
          title: "Import Error",
          description: "Please map the Name column"
        });
        return;
      }

      const nameIdx = csvHeaders.indexOf(columnMapping.name!);
      if (nameIdx === -1) {
        console.error('Name column not found in headers:', columnMapping.name, 'Available headers:', csvHeaders);
        toast({
          variant: "destructive",
          title: "Import Error",
          description: "Could not find the selected Name column in the CSV headers"
        });
        return;
      }

      const filteredRows = csvRows.filter(row => {
        // Filter out rows where the name is empty or undefined
        const name = row[nameIdx]?.trim();
        const isValid = name && name.length > 0;
        if (!isValid) {
          console.log('Filtering out row with invalid name:', row);
        }
        return isValid;
      });
      
      console.log('Filtered rows count:', filteredRows.length, 'Original rows count:', csvRows.length);

      const nodesToAdd = filteredRows.map((row, index) => {
        const typeIdx = columnMapping.type ? csvHeaders.indexOf(columnMapping.type) : -1;
        const profileIdx = columnMapping.profile ? csvHeaders.indexOf(columnMapping.profile) : -1;
        const imageIdx = columnMapping.image ? csvHeaders.indexOf(columnMapping.image) : -1;
        const dateIdx = columnMapping.date ? csvHeaders.indexOf(columnMapping.date) : -1;
        const addressIdx = columnMapping.address ? csvHeaders.indexOf(columnMapping.address) : -1;

        const gridCols = Math.ceil(Math.sqrt(csvRows.length));
        const xPos = (index % gridCols) * 200 + 100;
        const yPos = Math.floor(index / gridCols) * 200 + 100;

        const nodeData = {
          network_id: currentNetworkId,
          name: row[nameIdx].trim(),
          type: typeIdx >= 0 && row[typeIdx]?.trim() ? row[typeIdx].toLowerCase().trim() : 'person',
          profile_url: profileIdx >= 0 && row[profileIdx]?.trim() ? row[profileIdx].trim() : null,
          image_url: imageIdx >= 0 && row[imageIdx]?.trim() ? row[imageIdx].trim() : null,
          date: dateIdx >= 0 && row[dateIdx]?.trim() ? row[dateIdx].trim() : null,
          address: addressIdx >= 0 && row[addressIdx]?.trim() ? row[addressIdx].trim() : null,
          x_position: xPos,
          y_position: yPos
        };
        
        return nodeData;
      });

      if (nodesToAdd.length === 0) {
        console.error('No valid nodes found in CSV data');
        toast({
          variant: "destructive",
          title: "Import Error",
          description: "No valid nodes found in the CSV. Make sure the Name column has values."
        });
        return;
      }

      console.log('Preparing to insert nodes:', nodesToAdd.length);
      
      // Log a sample node for debugging
      if (nodesToAdd.length > 0) {
        console.log('Sample node to add:', nodesToAdd[0]);
      }

      const { data: newNodes, error } = await supabase
        .from('nodes')
        .insert(nodesToAdd)
        .select();

      if (error) {
        console.error('Error inserting nodes from CSV:', error);
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
      // Check if the network is AI-generated before deleting it
      const { data: networkData, error: fetchError } = await supabase
        .from('networks')
        .select('is_ai')
        .eq('id', networkId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Store the AI status before deletion
      const isAINetwork = networkData?.is_ai === true;
      
      const { error } = await supabase
        .from('networks')
        .delete()
        .eq('id', networkId);
      
      if (error) throw error;

      // Update local state
      const updatedNetworks = networks.filter(network => network.id !== networkId);
      setNetworks(updatedNetworks);
      setEditingNetwork(null);
      
      toast({
        title: "Network deleted",
        description: "Network has been successfully deleted"
      });
      
      // Dispatch an event to notify other components about the network deletion
      // Include whether it was an AI-generated network
      window.dispatchEvent(new CustomEvent('network-deleted', { 
        detail: { networkId, isAI: isAINetwork }
      }));
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
      console.log('Network reordering requested with', reorderedNetworks.length, 'networks');
      
      // Set a flag to prevent refresh cycles during reordering
      localStorage.setItem('network-reordering-in-progress', 'true');
      
      // First update localStorage immediately for fast UI response
      localStorage.setItem('socialmap-networks', JSON.stringify(reorderedNetworks));
      
      // Update the order field for each network
      const updates = reorderedNetworks.map((network, index) => 
        supabase
          .from('networks')
          .update({ 
            order: index,
            updated_at: new Date().toISOString() // Force update timestamp
          })
          .eq('id', network.id)
      );
      
      // Update local state with new order immediately
      setNetworks(reorderedNetworks);
      
      // Show the toast early for better UX
      toast({
        title: "Networks reordered",
        description: "Network order is being saved..."
      });
      
      // Wait for all updates to complete
      await Promise.all(updates);
      
      // Add a delay before allowing refresh cycles to ensure database updates complete
      setTimeout(() => {
        console.log('Network reordering complete, releasing lock');
        localStorage.removeItem('network-reordering-in-progress');
        
        // Show success confirmation
        toast({
          title: "Networks saved",
          description: "Network order has been saved to database",
          duration: 3000
        });
      }, 2000); // 2 second delay
    } catch (error) {
      console.error('Error reordering networks:', error);
      localStorage.removeItem('network-reordering-in-progress');
      
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
