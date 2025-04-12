import { RefObject } from 'react';
import { LayoutGrid, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateNetworkDialog } from '@/components/CreateNetworkDialog';
import { useNetworkMap } from '@/context/NetworkMapContext';

interface NetworkEmptyStateProps {
  createDialogTriggerRef: RefObject<HTMLButtonElement>;
  onNetworkCreated: (id: string, isAI?: boolean) => void;
  onImportCsv: (file: File) => void;
}

export default function NetworkEmptyState({
  createDialogTriggerRef,
  onNetworkCreated,
  onImportCsv
}: NetworkEmptyStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <LayoutGrid className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Networks Found</h2>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first network to map out your connections.
        </p>
        <CreateNetworkDialog 
          trigger={
            <Button 
              className="w-full"
              ref={createDialogTriggerRef}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Your First Network
            </Button>
          }
          onNetworkCreated={onNetworkCreated}
          onImportCsv={onImportCsv}
        />
      </div>
    </div>
  );
} 