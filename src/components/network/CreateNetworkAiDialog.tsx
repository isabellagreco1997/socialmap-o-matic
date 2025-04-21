import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Loader2,
  Wand2,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CreateNetworkAiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAiNetwork: (networkName: string, prompt: string, industry: string) => void;
  isGenerating: boolean;
  canUseAI: boolean;
  isSubscribed: boolean;
  userNetworkCount: number;
  FREE_NETWORK_LIMIT: number;
  onUpgradeClick: () => void;
}

const TEMPLATE_PROMPTS = [
  {
    title: "Tech Startup Ecosystem",
    location: "Silicon Valley",
    prompt: "Create a network of tech startups in Silicon Valley, including founders, investors, and key partnerships. Focus on AI and blockchain companies founded in the last 5 years."
  },
  {
    title: "Healthcare Network",
    location: "New York City",
    prompt: "Generate a network of healthcare professionals, hospitals, and medical research institutions in NYC. Include specialists, general practitioners, and pharmaceutical companies."
  },
  {
    title: "Investment Portfolio",
    location: "Global",
    prompt: "Build a network of investment firms, venture capitalists, and angel investors. Include their portfolio companies, investment focus areas, and key decision makers."
  },
  {
    title: "Academic Research",
    location: "Boston",
    prompt: "Create a network of universities, research institutions, and professors in Boston. Focus on collaborations, joint research projects, and academic partnerships."
  },
  {
    title: "Entertainment Industry",
    location: "Los Angeles",
    prompt: "Generate a network of entertainment companies, studios, and talent agencies in LA. Include actors, directors, producers, and key industry players."
  },
  {
    title: "Financial Services",
    location: "London",
    prompt: "Build a network of financial institutions, banks, and fintech companies in London. Include key executives, regulatory bodies, and industry associations."
  },
  {
    title: "Manufacturing Hub",
    location: "Detroit",
    prompt: "Create a network of manufacturing companies, suppliers, and logistics providers in Detroit. Focus on automotive and industrial manufacturing sectors."
  },
  {
    title: "Tech Innovation",
    location: "Austin",
    prompt: "Generate a network of tech companies, startups, and innovation hubs in Austin. Include software development, hardware manufacturing, and tech events."
  },
  {
    title: "Biotech Research",
    location: "San Diego",
    prompt: "Build a network of biotech companies, research labs, and pharmaceutical firms in San Diego. Focus on medical research and development."
  },
  {
    title: "Creative Industries",
    location: "Berlin",
    prompt: "Create a network of creative agencies, design studios, and cultural institutions in Berlin. Include artists, designers, and creative professionals."
  }
];

export const CreateNetworkAiDialog = ({
  open,
  onOpenChange,
  onCreateAiNetwork,
  isGenerating,
  canUseAI,
  isSubscribed,
  userNetworkCount,
  FREE_NETWORK_LIMIT,
  onUpgradeClick,
}: CreateNetworkAiDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [networkName, setNetworkName] = useState("");
  const { toast } = useToast();

  // Calculate prompt strength based on length
  const getPromptStrength = () => {
    const length = prompt.trim().length;
    if (length < 50) return { value: 33, label: "Weak Prompt", color: "bg-red-500" };
    if (length < 150) return { value: 66, label: "Average Prompt", color: "bg-yellow-500" };
    return { value: 100, label: "Great Prompt", color: "bg-green-500" };
  };

  const promptStrength = getPromptStrength();

  // Generate network name based on prompt
  useEffect(() => {
    if (prompt.trim().length > 0) {
      const words = prompt.trim().split(' ');
      const relevantWords = words.filter(word => word.length > 3);
      const name = relevantWords.slice(0, 3).join(' ') + ' Network';
      setNetworkName(name);
    } else {
      setNetworkName("");
    }
  }, [prompt]);

  const handleCreateNetwork = () => {
    onCreateAiNetwork(networkName, prompt, "General");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Let AI Generate Your Network
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          {!isSubscribed && canUseAI && (
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 rounded-md p-3 text-xs mb-4">
              <p className="font-medium text-amber-800 dark:text-amber-400">Free Plan Limit</p>
              <p className="text-amber-700 dark:text-amber-500 mt-1">
                You can create {FREE_NETWORK_LIMIT} AI-generated networks for free. You've used {userNetworkCount}/{FREE_NETWORK_LIMIT}.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Describe Your Network</span>
                <Badge variant="outline" className={`${promptStrength.color} text-white`}>
                  {promptStrength.label}
                </Badge>
              </div>
              <Textarea 
                placeholder="Example: Create a network of tech startups in Silicon Valley, including founders, investors, and key partnerships. Focus on AI and blockchain companies founded in the last 5 years."
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px] resize-none border-blue-200 focus:border-blue-400"
                disabled={!canUseAI}
              />
              <Progress value={promptStrength.value} className={`h-1 ${promptStrength.color}`} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wand2 className="w-3 h-3" />
                <span>Network Name:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {networkName || "Enter a prompt to generate name"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span>Template Prompts</span>
              </div>
              <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2">
                {TEMPLATE_PROMPTS.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(template.prompt)}
                    className="w-full text-left p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{template.title}</div>
                      <Badge variant="outline" className="text-xs">
                        {template.location}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{template.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 pb-6">
          {!canUseAI && !isSubscribed ? (
            <Button 
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onUpgradeClick}
            >
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          ) : (
            <Button 
              onClick={handleCreateNetwork} 
              disabled={!prompt.trim() || isGenerating || !canUseAI}
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Network
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 