import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, PlusIcon, Loader2, Search, Copy, Zap, FileUp, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import OpenAI from "openai";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Create OpenAI instance
// Note: In production, it's better to use server-side API calls rather than exposing API keys
const OPENAI_API_KEY = "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";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: For production, implement a backend proxy instead
});

// Fallback example prompts in case API fails
const FALLBACK_PROMPTS = [
  {
    title: "Professional Network Expansion",
    description: "Create a network to expand my professional connections in the tech industry, focusing on potential mentors and collaborators.",
    tags: ["professional", "networking", "career"]
  }
];

interface PromptGeneratorProps {
  onAddNetwork?: (title: string, description: string) => void;
  onCreateBlankNetwork?: () => void;
  onImportCSV?: () => void;
}

interface GeneratedPrompt {
  title: string;
  description: string;
  tags: string[];
}

const PromptGenerator = ({ onAddNetwork, onCreateBlankNetwork, onImportCSV }: PromptGeneratorProps) => {
  const [userGoal, setUserGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingNetwork, setIsCreatingNetwork] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<boolean>(true);

  // Handle goal input change
  const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserGoal(e.target.value);
  };

  // Copy prompt text to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Generate network prompts based on user goal using OpenAI API
  const handleGeneratePrompts = async () => {
    if (!userGoal.trim()) return;

    setIsGenerating(true);
    setHasSubmitted(true);
    setError(null);
    
    try {
      // Base prompt instructions
      let promptInstructions = `
        Generate a detailed network mapping prompt based on the following networking goal: "${userGoal}"
        
        Create a response in the following format:
        1. A clear, concise title for the network (like "New Space Industry & Private Space Exploration Network")
        2. A one-line descriptive subtitle that summarizes the network
        3. A detailed prompt for mapping this network that includes:
           - Specific organizations, people, or roles to include
           - Relationships to map between these entities
           - Important aspects to highlight (like technological relationships, investment flows, etc.)
           - Any regulatory frameworks or industry contexts to note
      `;
      
      // Add enhanced context if switched on
      if (enhancedPrompt) {
        promptInstructions += `
        
        Since enhanced mode is ON, please:
        - Include at least 15-20 specific named entities (companies, people, organizations)
        - Add industry-specific terminology and concepts
        - Mention geographical hubs or centers relevant to this network
        - Include both established players and emerging/disruptive entities
        - Suggest specific relationship types that would be valuable to map
        - Consider global context and international relationships
        - Identify potential subtopics or clusters within this network
        `;
      }
      
      promptInstructions += `
        
        Make the output professional and comprehensive, similar to: "Map the modern commercial space industry, including major launch providers (SpaceX, Blue Origin, Rocket Lab), satellite manufacturers (Planet Labs, Maxar, OneWeb), space tourism companies (Virgin Galactic, Space Perspective), asteroid mining ventures (AstroForge, TransAstra), space stations (Axiom Space), space agencies (NASA Commercial Crew Program, ESA), and spaceports (Cape Canaveral, Vandenberg, Baikonur). Show relationships between technology suppliers, launch contracts, investment flows, and regulatory frameworks. Highlight how the NewSpace ecosystem is democratizing access to orbit and enabling new space applications."
      `;
      
      // Call OpenAI API
      const response = await callOpenAIAPI(promptInstructions);
      
      // Extract the network information from the response
      const networkData = parseOpenAIResponse(response);
      setCurrentPrompt(networkData.description);
      
      setGeneratedPrompts([networkData]);
      setIsGenerating(false);
      
      // Skip step 3 and automatically create network (if callback is provided)
      if (onAddNetwork) {
        setIsCreatingNetwork(true);
        try {
          await onAddNetwork(networkData.title, networkData.description);
        } catch (e) {
          console.error("Error creating network:", e);
          setError("Failed to create network. Please try again.");
        } finally {
          setIsCreatingNetwork(false);
        }
      }
    } catch (err) {
      console.error("Error generating prompts:", err);
      setError("Failed to generate network prompt. Please try again.");
      setGeneratedPrompts(FALLBACK_PROMPTS);
      setIsGenerating(false);
      setIsCreatingNetwork(false);
    }
  };

  // Call OpenAI API
  const callOpenAIAPI = async (prompt: string): Promise<string> => {
    try {
      // Call the OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates network mapping prompts." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: enhancedPrompt ? 800 : 500 // Increase token limit for enhanced prompts
      });
      
      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error("Failed to generate prompt with OpenAI");
    }
  };

  // Parse the OpenAI response into structured data
  const parseOpenAIResponse = (response: string): GeneratedPrompt => {
    try {
      const lines = response.trim().split('\n').filter(line => line.trim() !== '');
      
      const title = lines[0].trim();
      const subtitle = lines[2]?.trim() || '';
      const description = lines.slice(4).join('\n').trim();
      
      // Extract potential tags from the content
      const potentialTags = extractTags(title + ' ' + subtitle + ' ' + description);
      
      return {
        title,
        description,
        tags: potentialTags
      };
    } catch (err) {
      console.error("Error parsing OpenAI response:", err);
      return {
        title: "Network Mapping",
        description: response.trim(),
        tags: ["network", "mapping"]
      };
    }
  };
  
  // Extract potential tags from the content
  const extractTags = (content: string): string[] => {
    const keywords = [
      "space", "tech", "startup", "investment", "industry", "innovation", 
      "network", "business", "ecosystem", "professional", "community"
    ];
    
    const tags: string[] = [];
    keywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword) && !tags.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Limit to 3 tags
    return tags.slice(0, 3);
  };

  // Add a generated prompt to networks
  const handleAddToNetworks = (prompt: GeneratedPrompt) => {
    // If a callback is provided, use it
    if (onAddNetwork) {
      onAddNetwork(prompt.title, prompt.description);
    } else {
      // Fallback to alert for demo purposes
      alert(`Added network: ${prompt.title}`);
    }
  };

  // Handle keyboard submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isGenerating && userGoal.trim()) {
      e.preventDefault();
      handleGeneratePrompts();
    }
  };

  // Handle create blank network
  const handleCreateBlankNetwork = () => {
    if (onCreateBlankNetwork) {
      onCreateBlankNetwork();
    } else {
      // Fallback for demo purposes
      alert("Creating blank network");
    }
  };

  // Handle import CSV
  const handleImportCSV = () => {
    if (onImportCSV) {
      onImportCSV();
    } else {
      // Fallback for demo purposes
      alert("Importing CSV");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {!hasSubmitted ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="max-w-3xl w-full px-4 sm:px-6 md:px-8">
              <h1 className="text-4xl font-semibold text-center mb-8">Who do you want to meet?</h1>
              
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="relative flex items-center rounded-2xl border shadow-sm bg-white overflow-hidden">
                  <Textarea 
                    placeholder="e.g., tech startup founders in San Francisco, entertainment industry executives..."
                    className={cn(
                      "min-h-28 resize-none py-3 px-4 pr-14 text-base",
                      "focus-visible:ring-0 focus-visible:ring-offset-0",
                      "placeholder:text-muted-foreground border-none rounded-2xl"
                    )}
                    value={userGoal}
                    onChange={handleGoalChange}
                    onKeyDown={handleKeyDown}
                    disabled={isGenerating || isCreatingNetwork}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full">
                      <Switch 
                        id="enhanced-mode" 
                        checked={enhancedPrompt} 
                        onCheckedChange={setEnhancedPrompt} 
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <Label htmlFor="enhanced-mode" className="text-xs font-medium flex items-center gap-0.5 cursor-pointer">
                        <Zap className="h-3 w-3" />
                        Enhanced
                      </Label>
                    </div>
                    <Button 
                      className="h-8 w-8 p-0 rounded-full bg-black hover:bg-black/90"
                      size="icon"
                      disabled={isGenerating || isCreatingNetwork || !userGoal.trim()}
                      onClick={handleGeneratePrompts}
                    >
                      {isGenerating || isCreatingNetwork ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Search className="h-4 w-4 text-white" />
                      )}
                      <span className="sr-only">Search</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex justify-center">
                <div className="flex flex-wrap gap-2 items-center justify-center text-sm text-muted-foreground">
                  <span>Try:</span>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setUserGoal("Space industry executives and founders")}>
                    Space industry executives
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setUserGoal("Venture capitalists specializing in AI startups")}>
                    VCs in AI startups
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setUserGoal("Healthcare innovation leaders")}>
                    Healthcare leaders
                  </Button>
                </div>
              </div>
              
              {/* Create Network and Import buttons with "OR" label */}
              <div className="mt-14 relative">
                <div className="absolute left-0 right-0 top-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">OR</span>
                </div>
                <div className="border-t pt-8 mt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    className="group relative flex items-center gap-2 h-11 px-5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl shadow-sm hover:shadow transition-all w-full sm:w-auto"
                    onClick={handleCreateBlankNetwork}
                  >
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                      <PlusCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">Blank Network</span>
                  </Button>
                  <Button 
                    className="group relative flex items-center gap-2 h-11 px-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl shadow-sm hover:shadow transition-all w-full sm:w-auto"
                    onClick={handleImportCSV}
                  >
                    <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                      <FileUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="font-medium">Import CSV</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 mx-auto max-w-4xl">
            {/* User-AI conversations would appear here */}
            <>
              {/* User message */}
              <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  U
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">You</p>
                  <p>{userGoal}</p>
                  {enhancedPrompt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Zap className="h-3 w-3" /> Enhanced prompt enabled
                    </p>
                  )}
                </div>
              </div>

              {/* AI Response */}
              <div className="flex gap-4 p-4 rounded-lg mt-6">
                <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium">Prompt Generator</p>
                  
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-muted-foreground">Generating network prompt...</p>
                    </div>
                  ) : isCreatingNetwork ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-muted-foreground">Creating network from prompt...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                      <p>{error}</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => {
                          setHasSubmitted(false);
                          setError(null);
                        }}
                      >
                        Try again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p>Here's a network mapping prompt based on your goal:</p>
                      
                      <div className="grid gap-3">
                        {generatedPrompts.map((prompt, index) => (
                          <Card key={index} className="bg-background border overflow-hidden">
                            <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium">
                                  <Sparkles className="h-3 w-3" />
                                </div>
                                <span className="text-sm font-medium">{prompt.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0" 
                                  onClick={handleCopy}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  <span className="sr-only">Copy</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex items-center gap-1 whitespace-nowrap h-8"
                                  onClick={() => handleAddToNetworks(prompt)}
                                >
                                  <PlusIcon className="h-3.5 w-3.5" />
                                  <span>Add Network</span>
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">{prompt.description.split('\n\n')[0]}</p>
                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <p className="text-sm"><span className="font-medium">Prompt:</span></p>
                                  <p className="text-sm mt-1">{prompt.description.split('\n\n')[1] || prompt.description}</p>
                                </div>
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {prompt.tags.map((tag, i) => (
                                    <span 
                                      key={i} 
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      <div className="flex justify-center mt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setHasSubmitted(false);
                            setGeneratedPrompts([]);
                          }}
                        >
                          Try a different prompt
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptGenerator; 