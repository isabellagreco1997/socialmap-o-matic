import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNetworkDataFetcher = (networkId: string) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFetchedNetworkId, setLastFetchedNetworkId] = useState<string | null>(null);
  const [nodesLoaded, setNodesLoaded] = useState(false);

  const fetchNetworkData = async (networkId: string, forceRefresh: boolean = false) => {
    console.log('Starting network data fetch for:', networkId);
    
    // Reset the processing flag if we're forcing a refresh
    if (forceRefresh) {
      setIsProcessing(false);
    }
    
    // If we're already processing and not forcing a refresh, skip
    if (isProcessing && !forceRefresh) {
      console.log('Already processing a data fetch, but forcing refresh');
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    
    try {
      // Clear any existing data for this network
      if (forceRefresh) {
        setNodes([]);
        setEdges([]);
      }

      // Fetch nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('nodes')
        .select('*')
        .eq('network_id', networkId);

      if (nodesError) {
        console.error('Error fetching nodes:', nodesError);
        throw nodesError;
      }

      // Fetch edges
      const { data: edgesData, error: edgesError } = await supabase
        .from('edges')
        .select('*')
        .eq('network_id', networkId);

      if (edgesError) {
        console.error('Error fetching edges:', edgesError);
        throw edgesError;
      }

      console.log(`Network fetch completed. Node count: ${nodesData?.length || 0}, Edge count: ${edgesData?.length || 0}`);
      
      // Update state with new data
      setNodes(nodesData || []);
      setEdges(edgesData || []);
      setLastFetchedNetworkId(networkId);
      setNodesLoaded(true);
      
    } catch (error) {
      console.error('Error in fetchNetworkData:', error);
      setError(error as Error);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  // Effect to fetch data when networkId changes
  useEffect(() => {
    if (networkId && networkId !== lastFetchedNetworkId) {
      fetchNetworkData(networkId, true);
    }
  }, [networkId]);

  return {
    nodes,
    edges,
    loading,
    error,
    nodesLoaded,
    fetchNetworkData
  };
}; 