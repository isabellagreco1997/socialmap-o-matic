
import AddNodeDialog from '@/components/AddNodeDialog';
import { CsvPreviewDialog } from '@/components/CsvPreviewDialog';
import { TemplatesDialog } from '@/components/TemplatesDialog';
import NetworkEditDialog from '@/components/network/NetworkEditDialog';
import type { Network } from '@/types/network';

interface NetworkDialogsProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isCsvDialogOpen: boolean;
  setIsCsvDialogOpen: (open: boolean) => void;
  isTemplatesDialogOpen: boolean;
  setIsTemplatesDialogOpen: (open: boolean) => void;
  csvHeaders: string[];
  csvRows: string[][];
  editingNetwork: Network | null;
  networkName: string;
  networkDescription: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
  onAddNode: (data: any) => void;
  onCsvImport: (mapping: any, networkId: string | null, headers: string[], rows: string[][]) => void;
  onTemplateSelect: (template: any) => void;
  onEditNetwork: (name: string) => void;
  onDeleteNetwork: () => void;
  currentNetworkId: string | null;
  setEditingNetwork: (network: Network | null) => void;
}

export const NetworkDialogs = ({
  isDialogOpen,
  setIsDialogOpen,
  isCsvDialogOpen,
  setIsCsvDialogOpen,
  isTemplatesDialogOpen,
  setIsTemplatesDialogOpen,
  csvHeaders,
  csvRows,
  editingNetwork,
  networkName,
  networkDescription,
  onNameChange,
  onDescriptionChange,
  onAddNode,
  onCsvImport,
  onTemplateSelect,
  onEditNetwork,
  onDeleteNetwork,
  currentNetworkId,
  setEditingNetwork
}: NetworkDialogsProps) => {
  return (
    <>
      <AddNodeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={onAddNode} 
      />
      
      <CsvPreviewDialog 
        open={isCsvDialogOpen} 
        onOpenChange={setIsCsvDialogOpen} 
        headers={csvHeaders} 
        rows={csvRows} 
        onConfirm={mapping => onCsvImport(mapping, currentNetworkId, csvHeaders, csvRows)} 
      />
      
      <TemplatesDialog 
        open={isTemplatesDialogOpen} 
        onOpenChange={setIsTemplatesDialogOpen} 
        onTemplateSelect={onTemplateSelect} 
      />
      
      <NetworkEditDialog 
        network={editingNetwork} 
        networkName={networkName} 
        networkDescription={networkDescription} 
        onNameChange={onNameChange} 
        onDescriptionChange={onDescriptionChange} 
        onClose={() => setEditingNetwork(null)} 
        onSave={() => onEditNetwork(networkName)} 
        onDelete={onDeleteNetwork} 
      />
    </>
  );
};
