import { CommunityNetworksPage } from "@/components/network/CommunityNetworksPage";

export function NetworkMap() {
  const [contentMode, setContentMode] = useState<'network' | 'community'>('network');
  
  const handleShowCommunityNetworks = useCallback(() => {
    setContentMode('community');
  }, []);
  
  const handleCommunityNetworkAdded = useCallback((id: string) => {
    handleSelectNetwork(id);
    setContentMode('network');
  }, [handleSelectNetwork]);
  
  return (
    <NetworkMapProvider currentNetworkId={currentNetworkId}>
      <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-950">
        <NetworkSidebar
          networks={networks}
          currentNetworkId={currentNetworkId}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          onNetworkSelect={handleSelectNetwork}
          onEditNetwork={handleEditNetwork}
          onOpenTemplates={() => {}}
          onNetworksReorder={handleReorderNetworks}
          onImportCsv={handleImportCsv}
          onNetworkCreated={handleNetworkCreated}
          onShowCommunityNetworks={handleShowCommunityNetworks}
        />
        
        {contentMode === 'network' ? (
          <NetworkMapContent
            currentNetworkId={currentNetworkId}
            onUpdateNetworkName={handleUpdateNetworkName} 
          />
        ) : (
          <CommunityNetworksPage onNetworkAdded={handleCommunityNetworkAdded} />
        )}
        
        {/* ... existing modals ... */}
      </div>
    </NetworkMapProvider>
  );
} 