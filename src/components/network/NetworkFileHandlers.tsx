import { useCallback } from 'react';
import { useNetworkMap } from '@/context/NetworkMapContext';

export default function NetworkFileHandlers() {
  const {
    setCsvHeaders,
    setCsvRows,
    setIsCsvDialogOpen
  } = useNetworkMap();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [setCsvHeaders, setCsvRows, setIsCsvDialogOpen]);

  const handleImportCsvFromDialog = useCallback((file: File) => {
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
  }, [setCsvHeaders, setCsvRows, setIsCsvDialogOpen]);

  return (
    <input 
      id="csv-input" 
      type="file" 
      accept=".csv" 
      className="hidden" 
      onChange={handleFileUpload} 
    />
  );
} 