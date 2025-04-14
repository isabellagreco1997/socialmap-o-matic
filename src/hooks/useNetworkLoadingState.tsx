import { useRef, useCallback } from 'react';
import { useNetworkMap } from '@/context/NetworkMapContext';

export function useNetworkLoadingState() {
  const {
    isLoading,
    setIsLoading
  } = useNetworkMap();
  
  // Use refs to track processing status to prevent concurrent operations
  const processingRef = useRef<boolean>(false);
  
  // Start loading
  const startLoading = useCallback(() => {
    console.log('Setting loading state to TRUE');
    setIsLoading(true);
  }, [setIsLoading]);
  
  // Stop loading
  const stopLoading = useCallback(() => {
    console.log('Setting loading state to FALSE');
    setIsLoading(false);
  }, [setIsLoading]);
  
  // Start processing
  const startProcessing = useCallback(() => {
    processingRef.current = true;
  }, []);
  
  // Stop processing
  const stopProcessing = useCallback(() => {
    processingRef.current = false;
  }, []);
  
  // Check if already processing
  const isProcessing = useCallback(() => {
    return processingRef.current;
  }, []);
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    startProcessing,
    stopProcessing,
    isProcessing
  };
} 