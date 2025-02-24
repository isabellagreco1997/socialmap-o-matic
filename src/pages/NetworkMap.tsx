
import {
  AlertCircle,
  Network,
  Plus,
  Plus as PlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SidebarProvider, Sidebar, SidebarContent } from "@/components/ui/sidebar";

interface Network {
  id: string;
  name: string;
}

export default function NetworkMap() {
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [isEdgeDialogOpen, setIsEdgeDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Network[]>([]);

  const createNewNetwork = async () => {
    const newNetwork: Network = {
      id: Math.random().toString(),
      name: "New Network"
    };
    setData([...data, newNetwork]);
  };

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedNetwork(data[0]);
    }
  }, [data]);

  return <SidebarProvider>
      <div className="h-screen w-full bg-background flex">
        <Sidebar>
          <SidebarContent className="w-[350px] border-r bg-white flex flex-col">
            <div className="p-6 flex items-center justify-between border-b">
              <h2 className="font-bold text-base">Your Networks</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 p-4 space-y-3 py-0">
              <Button variant="outline" className="w-full justify-start gap-3 h-8 text-sm font-medium rounded-lg" onClick={createNewNetwork}>
                <PlusIcon className="h-4 w-4" />
                Create Network
              </Button>

              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : null}

              {error ? (
                <EmptyState
                  icon={AlertCircle}
                  title="Error loading networks"
                  description="An error occurred while loading your networks."
                  action={
                    <Button variant="outline" onClick={() => setError(null)}>
                      Try again
                    </Button>
                  }
                />
              ) : null}

              {!isLoading && !error && data?.length === 0 ? (
                <EmptyState
                  icon={Network}
                  title="No networks"
                  description="You haven't created any networks yet."
                  action={
                    <Button variant="outline" onClick={createNewNetwork}>
                      Create network
                    </Button>
                  }
                />
              ) : null}

              {data?.map((network) => (
                <Button
                  key={network.id}
                  variant={selectedNetwork?.id === network.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-8 text-sm font-medium rounded-lg"
                  onClick={() => setSelectedNetwork(network)}
                >
                  <Network className="h-4 w-4" />
                  {network.name}
                </Button>
              ))}
            </div>

            {selectedNetwork && (
              <>
                <div className="p-6 flex items-center justify-between border-y">
                  <h2 className="font-bold text-base">Network Details</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsEdgeDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label>Network Name</Label>
                    <Input
                      value={selectedNetwork.name}
                      onChange={(e) =>
                        setSelectedNetwork({
                          ...selectedNetwork,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 p-4">
          {selectedNetwork ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">
                {selectedNetwork.name}
              </h1>
              <p>Network ID: {selectedNetwork.id}</p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No network selected.</p>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
}
