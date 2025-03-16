import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AudioWaveform, 
  PencilLine, 
  FileUp, 
  Sparkles, 
  FileText, 
  Upload,
  Bot,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateNetworkDialogProps {
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onNetworkCreated?: (networkId: string) => void;
  onImportCsv?: (file: File) => void;
}

export const CreateNetworkDialog = ({
  onOpenChange,
  trigger,
  onNetworkCreated,
  onImportCsv
}: CreateNetworkDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [industry, setIndustry] = useState("Technology");
  const [networkName, setNetworkName] = useState("New Network");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const createNetwork = async (isBlank: boolean = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: network, error } = await supabase
        .from('networks')
        .insert([{
          name: isBlank ? networkName : prompt,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (network) {
        onNetworkCreated?.(network.id);
      }

      if (!isBlank) {
        setIsGenerating(true);
        try {
          // Call the AI network generation function
          await generateNetworkFromPrompt(network.id, prompt, industry);
          
          toast({
            title: "Network generated",
            description: "Created an AI-generated network based on your prompt"
          });
        } catch (genError) {
          console.error('Error generating AI network:', genError);
          toast({
            variant: "destructive",
            title: "Generation Error",
            description: "Failed to generate AI network, but created a basic network"
          });
          
          // Fallback to creating a simple network if AI generation fails
          const nodes = [
            { name: "Central Node", type: "person", x_position: 0, y_position: 0 },
            { name: "Connected Node 1", type: "person", x_position: 200, y_position: 0 },
            { name: "Connected Node 2", type: "person", x_position: -200, y_position: 0 },
          ];

          for (const node of nodes) {
            if (node.name && node.name.trim() !== '') {
              await supabase.from('nodes').insert({
                ...node,
                name: node.name.trim(),
                network_id: network.id
              });
            }
          }
        } finally {
          setIsGenerating(false);
        }
      } else {
        toast({
          title: "Network created",
          description: "Created a blank network"
        });
      }

      onOpenChange?.(false);
    } catch (error) {
      console.error('Error creating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network"
      });
      setIsGenerating(false);
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Create a blank network first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: network, error } = await supabase
        .from('networks')
        .insert([{
          name: file.name.split('.')[0] || "Imported Network",
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (network) {
        onNetworkCreated?.(network.id);
      }

      // Close the dialog
      onOpenChange?.(false);
      
      // Trigger the CSV import dialog from the parent component
      if (onImportCsv) {
        onImportCsv(file);
      }
      
      toast({
        title: "Network created",
        description: "Please configure your CSV import in the next step"
      });
    } catch (error) {
      console.error('Error creating network for import:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network for import"
      });
    }
  };

  const generateNetworkFromPrompt = async (networkId: string, prompt: string, industry: string) => {
    try {
      const networkData = await generateNetworkDataFromAI(prompt, industry);
      console.log("Network data from AI:", networkData);

      // Create the central node (You)
      const { data: centralNode, error: centralNodeError } = await supabase
        .from('nodes')
        .insert({
          name: "You",
          type: "person",
          network_id: networkId,
          x_position: 0,
          y_position: 0,
          notes: "Your central position in the network"
        })
        .select()
        .single();

      if (centralNodeError) throw centralNodeError;

      // Divide nodes into two levels with more nodes in first level
      // First level: directly connected to "You"
      // Second level: connected to first level nodes
      const firstLevelCount = Math.min(12, Math.ceil(networkData.nodes.length * 0.4)); // About 40% of nodes, max 12
      
      // Sort nodes by importance (organizations first, then events, then people)
      const sortedNodes = [...networkData.nodes].sort((a, b) => {
        const typeOrder = { 'organization': 0, 'venue': 1, 'event': 2, 'person': 3 };
        return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
      });
      
      const firstLevelNodes = sortedNodes.slice(0, firstLevelCount);
      const secondLevelNodes = sortedNodes.slice(firstLevelCount);

      // Calculate positions for first level nodes (around "You") with increased radius
      const firstLevelRadius = 600; // Increased from 400
      
      // Store created nodes for connection tracking
      const createdFirstLevel = [];
      const createdSecondLevel = [];
      
      // Create first level nodes with even spacing around the circle
      const firstLevelPromises = firstLevelNodes.map((node, i) => {
        // Skip nodes without a valid name
        if (!node.name || typeof node.name !== 'string' || node.name.trim() === '') {
          return Promise.resolve(null);
        }
        
        // Calculate position in a circle with even spacing
        const angle = (i * 2 * Math.PI) / firstLevelNodes.length;
        const x_position = Math.cos(angle) * firstLevelRadius;
        const y_position = Math.sin(angle) * firstLevelRadius;
        
        return new Promise<any>((resolve) => {
          try {
            supabase
              .from('nodes')
              .insert({
                name: node.name.trim(),
                type: node.type || 'person',
                network_id: networkId,
                x_position,
                y_position,
                notes: node.notes,
                address: node.address,
                date: node.date
              })
              .select()
              .single()
              .then(result => {
                if (result.data) {
                  createdFirstLevel.push({
                    ...result.data,
                    originalIndex: i,
                    angle
                  });
                }
                resolve(result);
              });
          } catch (error) {
            console.error('Error creating first level node:', error);
            resolve(null);
          }
        });
      });
      
      await Promise.all(firstLevelPromises);
      
      // Create second level nodes
      const secondLevelPromises = [];
      
      // Distribute second level nodes among first level nodes
      const nodesPerFirstLevel = Math.ceil(secondLevelNodes.length / createdFirstLevel.length);
      
      for (let i = 0; i < createdFirstLevel.length; i++) {
        const parentNode = createdFirstLevel[i];
        const childNodes = secondLevelNodes.slice(
          i * nodesPerFirstLevel, 
          Math.min((i + 1) * nodesPerFirstLevel, secondLevelNodes.length)
        );
        
        if (childNodes.length === 0) continue;
        
        // Calculate positions for children
        // Place them further out from the parent node, away from center
        const parentAngle = Math.atan2(parentNode.y_position, parentNode.x_position);
        const spreadAngle = Math.PI / 3; // 60 degrees spread for more nodes
        const secondLevelRadius = 600; // Distance from parent node (increased)
        
        childNodes.forEach((node, j) => {
          // Skip nodes without a valid name
          if (!node.name || typeof node.name !== 'string' || node.name.trim() === '') {
            return;
          }
          
          // Calculate position for this child
          const childAngle = parentAngle - spreadAngle/2 + (j * spreadAngle / Math.max(1, childNodes.length - 1));
          
          // Calculate position relative to parent, not center
          const childX = parentNode.x_position + Math.cos(childAngle) * secondLevelRadius;
          const childY = parentNode.y_position + Math.sin(childAngle) * secondLevelRadius;
          
          const promise = new Promise<any>((resolve) => {
            try {
              supabase
                .from('nodes')
                .insert({
                  name: node.name.trim(),
                  type: node.type || 'person',
                  network_id: networkId,
                  x_position: childX,
                  y_position: childY,
                  notes: node.notes,
                  address: node.address,
                  date: node.date
                })
                .select()
                .single()
                .then(result => {
                  if (result.data) {
                    createdSecondLevel.push({
                      ...result.data,
                      parentId: parentNode.id
                    });
                  }
                  resolve(result);
                });
            } catch (error) {
              console.error('Error creating second level node:', error);
              resolve(null);
            }
          });
          
          secondLevelPromises.push(promise);
        });
      }
      
      await Promise.all(secondLevelPromises);
      
      // Create edges
      const edgePromises = [];
      
      // Connect "You" to all first level nodes
      createdFirstLevel.forEach(node => {
        if (node && node.id && centralNode && centralNode.id) {
          edgePromises.push(
            supabase.from('edges').insert({
              network_id: networkId,
              source_id: centralNode.id,
              target_id: node.id,
              label: getActionLabel(node)
            })
          );
        }
      });
      
      // Connect first level nodes to their children
      createdSecondLevel.forEach(node => {
        if (node && node.id && node.parentId) {
          edgePromises.push(
            supabase.from('edges').insert({
              network_id: networkId,
              source_id: node.parentId,
              target_id: node.id,
              label: getRelationshipLabel('organization', node.type)
            })
          );
        }
      });

      await Promise.all(edgePromises);
      setIsGenerating(false);
      onOpenChange?.(false);
      
      if (onNetworkCreated) {
        onNetworkCreated(networkId);
      }
    } catch (error) {
      console.error('Error generating network:', error);
      setIsGenerating(false);
      throw error;
    }
  };

  // Generate network data using OpenAI
  const generateNetworkDataFromAI = async (prompt: string, industry: string) => {
    try {
      const systemPrompt = `
You are an expert in professional networking, relationship mapping, and industry influence strategies.
Your task is to generate an extensive, realistic professional network for someone in the ${industry || "professional"} industry.

### Objective
Create a comprehensive network map (approximately 100 nodes) that represents a realistic professional ecosystem, including:
- Actual companies, organizations, and institutions (use real names)
- Professional roles and positions (use realistic titles)
- Industry events and conferences (use real event names)
- Real networking venues and locations

### Network Structure (100+ nodes total)
1. Organizations (40-50 nodes):
   - Major companies in the industry (use real company names)
   - Professional associations and trade bodies
   - Investment firms and relevant financial institutions
   - Media organizations and industry publications
   - Research institutions and think tanks
   - Regulatory bodies and government agencies

2. Professional Roles (30-40 nodes):
   - C-suite executives and decision-makers
   - Industry experts and thought leaders
   - Technical specialists and domain experts
   - Department heads and team leaders
   - Entrepreneurs and innovators
   - Consultants and advisors

3. Industry Events (15-20 nodes):
   - Major industry conferences
   - Trade shows and exhibitions
   - Professional seminars and workshops
   - Industry awards ceremonies
   - Networking events and meetups

4. Networking Venues (10-15 nodes):
   - Business clubs and professional associations
   - Conference centers and event spaces
   - Coworking spaces and innovation hubs
   - Industry-specific facilities
   - Educational institutions

### Critical Requirements
1. Use REAL names for:
   - Companies and organizations
   - Industry events and conferences
   - Venues and locations
   - Professional associations
   
2. Include SPECIFIC details:
   - Company locations and headquarters
   - Event dates (use future dates)
   - Venue addresses
   - Professional roles and responsibilities

3. Create MEANINGFUL relationships:
   - Professional collaborations
   - Business partnerships
   - Mentor-mentee relationships
   - Industry influence flows
   - Knowledge exchange pathways

### Output Format
Return valid JSON with the following structure:
\`\`\`json
{
  "nodes": [
    {
      "name": "Google",
      "type": "organization",
      "notes": "Global technology leader in AI and cloud computing",
      "address": "Mountain View, CA"
    }
  ],
  "relationships": [
    {
      "source": 1,
      "target": 2,
      "label": "Strategic partnership",
      "notes": "Joint AI research initiative"
    }
  ]
}
\`\`\`

Focus on creating a rich, interconnected network that provides a comprehensive view of the industry's ecosystem.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate a comprehensive professional network for the ${industry} industry, incorporating the user's context: ${prompt}` }
          ],
          temperature: 0.8,
          max_tokens: 4000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(errorData.error?.message || 'Failed to get response from AI');
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      console.log("Raw AI response:", content);
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Failed to extract JSON from AI response");
        throw new Error('Failed to parse JSON from AI response');
      }
      
      try {
        const networkData = JSON.parse(jsonMatch[0]);
        
        // Validate the structure
        if (!networkData.nodes || !Array.isArray(networkData.nodes) || 
            !networkData.relationships || !Array.isArray(networkData.relationships)) {
          console.error("Invalid network data structure:", networkData);
          throw new Error('Invalid network data structure from AI');
        }
        
        // Filter out any nodes with empty or missing names
        networkData.nodes = networkData.nodes.filter(node => 
          node && node.name && typeof node.name === 'string' && node.name.trim() !== ''
        );
        
        // If no valid nodes remain, throw an error
        if (networkData.nodes.length === 0) {
          console.error("No valid nodes found in AI response");
          throw new Error('No valid nodes found in AI response');
        }
        
        return networkData;
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "for content:", jsonMatch[0]);
        throw new Error('Failed to parse JSON from AI response');
      }
    } catch (error) {
      console.error('Error generating network data from AI:', error);
      // Fallback to default network generation if AI fails
      return generateDefaultNetworkData(industry);
    }
  };

  // Fallback network generation if AI fails
  const generateDefaultNetworkData = (industry: string) => {
    // Default nodes if no industry selected
    if (!industry) {
      industry = "Technology";
    }
    
    // Base structure with different node types
    const nodes = [];
    const relationships = [];
    
    // Calculate positions in a radial layout
    const generatePosition = (index: number, total: number, radius: number) => {
      const angle = (index / total) * 2 * Math.PI;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      };
    };
    
    // Industry-specific organizations
    const organizations = getDefaultOrganizationsForIndustry(industry)
      .filter(org => org && org.name && typeof org.name === 'string' && org.name.trim() !== '');
    
    organizations.forEach((org, index) => {
      const pos = generatePosition(index, organizations.length, 300);
      nodes.push({
        name: org.name.trim(),
        type: "organization",
        x_position: pos.x,
        y_position: pos.y,
        notes: org.description
      });
      
      // Add relationship to user
      relationships.push({
        source: 0, // User node (will be added separately)
        target: index + 1, // 1-based index for the current node
        label: getRelationshipLabel("person", "organization")
      });
    });
    
    // Industry-specific people
    const people = getDefaultPeopleForIndustry(industry)
      .filter(person => person && person.name && typeof person.name === 'string' && person.name.trim() !== '');
    
    const peopleStartIndex = nodes.length;
    people.forEach((person, index) => {
      const pos = generatePosition(index, people.length, 500);
      nodes.push({
        name: person.name.trim(),
        type: "person",
        x_position: pos.x,
        y_position: pos.y,
        notes: person.role
      });
      
      // Add relationships between people and organizations
      if (index < organizations.length) {
        relationships.push({
          source: peopleStartIndex + index + 1, // 1-based index
          target: index + 1, // 1-based index
          label: getRelationshipLabel("person", "organization")
        });
      }
    });
    
    // Industry-specific events
    const events = getDefaultEventsForIndustry(industry)
      .filter(event => event && event.name && typeof event.name === 'string' && event.name.trim() !== '');
    
    const eventsStartIndex = nodes.length;
    events.forEach((event, index) => {
      const pos = generatePosition(index, events.length, 700);
      nodes.push({
        name: event.name.trim(),
        type: "event",
        x_position: pos.x,
        y_position: pos.y,
        date: event.date,
        notes: event.description
      });
      
      // Add relationships between events and organizations
      relationships.push({
        source: eventsStartIndex + index + 1, // 1-based index
        target: (index % organizations.length) + 1, // 1-based index
        label: getRelationshipLabel("event", "organization")
      });
    });
    
    // Industry-specific venues
    const venues = getDefaultVenuesForIndustry(industry)
      .filter(venue => venue && venue.name && typeof venue.name === 'string' && venue.name.trim() !== '');
    
    const venuesStartIndex = nodes.length;
    venues.forEach((venue, index) => {
      const pos = generatePosition(index, venues.length, 600);
      nodes.push({
        name: venue.name.trim(),
        type: "venue",
        x_position: pos.x,
        y_position: pos.y,
        address: venue.address,
        notes: venue.description
      });
      
      // Add relationships between venues and events
      if (index < events.length) {
        relationships.push({
          source: venuesStartIndex + index + 1, // 1-based index
          target: eventsStartIndex + index + 1, // 1-based index
          label: getRelationshipLabel("venue", "event")
        });
      }
    });
    
    return { nodes, relationships };
  };

  // Default organizations (fallback)
  const getDefaultOrganizationsForIndustry = (industry: string) => {
    const defaultOrgs = [
      { name: "Google", description: "Tech giant with strong networking opportunities" },
      { name: "Microsoft", description: "Major tech company with extensive partner network" },
      { name: "Amazon Web Services", description: "Cloud provider with partner programs" },
      { name: "TechCrunch", description: "Tech media company hosting networking events" },
      { name: "Y Combinator", description: "Startup accelerator with strong alumni network" }
    ];
    
    const industryMap: Record<string, any[]> = {
      "Technology": defaultOrgs,
      "Finance": [
        { name: "Goldman Sachs", description: "Investment banking firm" },
        { name: "JP Morgan Chase", description: "Global financial services firm" },
        { name: "BlackRock", description: "Investment management corporation" },
        { name: "Visa", description: "Global payments technology company" },
        { name: "Bloomberg", description: "Financial software and media company" }
      ],
      "Healthcare": [
        { name: "Mayo Clinic", description: "Nonprofit medical center" },
        { name: "Johnson & Johnson", description: "Healthcare products manufacturer" },
        { name: "Pfizer", description: "Pharmaceutical corporation" },
        { name: "UnitedHealth Group", description: "Health insurance provider" },
        { name: "Cleveland Clinic", description: "Academic medical center" }
      ],
      "Education": [
        { name: "Harvard University", description: "Ivy League research university" },
        { name: "Khan Academy", description: "Educational organization" },
        { name: "Coursera", description: "Online learning platform" },
        { name: "National Education Association", description: "Labor union and professional interest group" },
        { name: "Pearson Education", description: "Educational publishing company" }
      ],
      "Entertainment": [
        { name: "Netflix", description: "Streaming service and production company" },
        { name: "Disney", description: "Entertainment conglomerate" },
        { name: "Live Nation", description: "Entertainment company" },
        { name: "Sony Pictures", description: "Film production and distribution studio" },
        { name: "Spotify", description: "Audio streaming platform" }
      ]
    };
    
    // Return industry-specific organizations or default to Technology
    const result = industryMap[industry] || defaultOrgs;
    
    // Ensure we always return an array with at least one valid organization
    return result.length > 0 ? result : defaultOrgs;
  };

  // Default people (fallback)
  const getDefaultPeopleForIndustry = (industry: string) => {
    const defaultPeople = [
      { name: "Sarah Chen", role: "CTO at Tech Innovators" },
      { name: "Michael Rodriguez", role: "Venture Capitalist at Sequoia" },
      { name: "Priya Patel", role: "Engineering Director at Google" },
      { name: "David Kim", role: "Startup Founder" },
      { name: "Lisa Johnson", role: "Tech Recruiter" }
    ];
    
    const industryMap: Record<string, any[]> = {
      "Technology": defaultPeople,
      "Finance": [
        { name: "James Wilson", role: "Investment Banker" },
        { name: "Emma Thompson", role: "Financial Analyst" },
        { name: "Robert Chen", role: "Hedge Fund Manager" },
        { name: "Sophia Garcia", role: "FinTech Entrepreneur" },
        { name: "William Taylor", role: "Wealth Management Advisor" }
      ],
      "Healthcare": [
        { name: "Dr. Elizabeth Brown", role: "Chief Medical Officer" },
        { name: "Dr. John Smith", role: "Research Scientist" },
        { name: "Maria Rodriguez", role: "Hospital Administrator" },
        { name: "Dr. Samuel Lee", role: "Pharmaceutical Executive" },
        { name: "Jennifer Wilson", role: "Healthcare Policy Advisor" }
      ],
      "Education": [
        { name: "Professor Thomas Clark", role: "Department Chair" },
        { name: "Dr. Rebecca White", role: "Education Researcher" },
        { name: "Mark Johnson", role: "School Superintendent" },
        { name: "Amanda Lewis", role: "EdTech Entrepreneur" },
        { name: "Daniel Martinez", role: "Education Policy Advisor" }
      ],
      "Entertainment": [
        { name: "Jessica Williams", role: "Talent Agent" },
        { name: "Christopher Lee", role: "Film Producer" },
        { name: "Olivia Davis", role: "Studio Executive" },
        { name: "Ryan Murphy", role: "Director" },
        { name: "Samantha Brown", role: "Casting Director" }
      ]
    };
    
    // Return industry-specific people or default to Technology
    const result = industryMap[industry] || defaultPeople;
    
    // Ensure we always return an array with at least one valid person
    return result.length > 0 ? result : defaultPeople;
  };

  // Default events (fallback)
  const getDefaultEventsForIndustry = (industry: string) => {
    // Create future dates for events
    const getRandomFutureDate = () => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + Math.floor(Math.random() * 365));
      return futureDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };
    
    const defaultEvents = [
      { name: "TechCrunch Disrupt", date: getRandomFutureDate(), description: "Startup and tech conference" },
      { name: "Web Summit", date: getRandomFutureDate(), description: "Global technology conference" },
      { name: "Developer Conference", date: getRandomFutureDate(), description: "Annual coding and development event" }
    ];
    
    const industryMap: Record<string, any[]> = {
      "Technology": defaultEvents,
      "Finance": [
        { name: "Financial Innovation Summit", date: getRandomFutureDate(), description: "Conference on financial technology" },
        { name: "Investment Forum", date: getRandomFutureDate(), description: "Meeting of investment professionals" },
        { name: "Banking Technology Conference", date: getRandomFutureDate(), description: "Event focused on banking tech" }
      ],
      "Healthcare": [
        { name: "Healthcare Innovation Summit", date: getRandomFutureDate(), description: "Conference on healthcare advancements" },
        { name: "Medical Research Symposium", date: getRandomFutureDate(), description: "Gathering of medical researchers" },
        { name: "Health Tech Expo", date: getRandomFutureDate(), description: "Exhibition of healthcare technology" }
      ],
      "Education": [
        { name: "Education Innovation Conference", date: getRandomFutureDate(), description: "Conference on educational advancements" },
        { name: "Teachers' Symposium", date: getRandomFutureDate(), description: "Professional development for educators" },
        { name: "EdTech Showcase", date: getRandomFutureDate(), description: "Exhibition of educational technology" }
      ],
      "Entertainment": [
        { name: "Film Festival", date: getRandomFutureDate(), description: "Celebration of cinema" },
        { name: "Industry Awards Ceremony", date: getRandomFutureDate(), description: "Recognition of entertainment achievements" },
        { name: "Entertainment Expo", date: getRandomFutureDate(), description: "Exhibition of entertainment industry" }
      ]
    };
    
    // Return industry-specific events or default to Technology
    const result = industryMap[industry] || defaultEvents;
    
    // Ensure we always return an array with at least one valid event
    return result.length > 0 ? result : defaultEvents;
  };

  // Default venues (fallback)
  const getDefaultVenuesForIndustry = (industry: string) => {
    const defaultVenues = [
      { name: "Innovation Hub", address: "123 Tech Blvd, San Francisco, CA", description: "Coworking space for tech startups" },
      { name: "Convention Center", address: "456 Expo Ave, Las Vegas, NV", description: "Large venue for tech conferences" }
    ];
    
    const industryMap: Record<string, any[]> = {
      "Technology": defaultVenues,
      "Finance": [
        { name: "Financial District Club", address: "789 Wall St, New York, NY", description: "Exclusive club for finance professionals" },
        { name: "Investment Conference Center", address: "101 Finance Rd, Chicago, IL", description: "Venue for financial events" }
      ],
      "Healthcare": [
        { name: "Medical Convention Center", address: "202 Health Blvd, Boston, MA", description: "Venue for medical conferences" },
        { name: "Research Institute", address: "303 Science Way, Rochester, MN", description: "Facility for medical research" }
      ],
      "Education": [
        { name: "University Conference Center", address: "404 Campus Dr, Cambridge, MA", description: "Academic event venue" },
        { name: "Education Forum", address: "505 Learning Lane, Washington, DC", description: "Venue for education policy events" }
      ],
      "Entertainment": [
        { name: "Hollywood Venue", address: "606 Star Blvd, Los Angeles, CA", description: "Exclusive entertainment industry venue" },
        { name: "Media Center", address: "707 Broadcast Way, New York, NY", description: "Venue for media events" }
      ]
    };
    
    // Return industry-specific venues or default to Technology
    const result = industryMap[industry] || defaultVenues;
    
    // Ensure we always return an array with at least one valid venue
    return result.length > 0 ? result : defaultVenues;
  };

  // Generate relationship labels based on node types (fallback)
  const getRelationshipLabel = (sourceType: string, targetType: string) => {
    // Ensure we have valid types
    const validSourceType = sourceType && typeof sourceType === 'string' ? sourceType.toLowerCase() : 'person';
    const validTargetType = targetType && typeof targetType === 'string' ? targetType.toLowerCase() : 'person';
    
    const relationshipMap: Record<string, Record<string, string[]>> = {
      "person": {
        "person": ["Colleague", "Mentor", "Friend", "Former classmate", "Professional contact"],
        "organization": ["Works at", "Consults for", "Investor in", "Board member", "Former employee"],
        "event": ["Speaker at", "Attending", "Organizing", "Sponsoring", "Presenting at"],
        "venue": ["Frequents", "Member of", "Hosts events at", "Affiliated with"]
      },
      "organization": {
        "person": ["Employs", "Client of", "Partnered with", "Sponsored by", "Advised by"],
        "organization": ["Partnership with", "Competitor to", "Supplier for", "Client of", "Investor in"],
        "event": ["Hosting", "Sponsoring", "Participating in", "Exhibiting at"],
        "venue": ["Headquartered at", "Branch location", "Event space", "Meeting location"]
      },
      "event": {
        "person": ["Features", "Organized by", "Sponsored by", "Attended by"],
        "organization": ["Organized by", "Sponsored by", "Featuring", "Partnered with"],
        "event": ["Related to", "Preceding", "Following", "Concurrent with"],
        "venue": ["Held at", "Located at", "Venue for"]
      },
      "venue": {
        "person": ["Hosts", "Owned by", "Managed by", "Regular client"],
        "organization": ["Houses", "Hosts events for", "Partnered with", "Service provider for"],
        "event": ["Location for", "Hosting", "Venue of"],
        "venue": ["Near", "Affiliated with", "Sister location", "Managed by same group"]
      }
    };
    
    // Default relationship if nothing matches
    const defaultRelationship = "Connected to";
    
    // Get possible relationships based on node types
    const possibleRelationships = relationshipMap[validSourceType]?.[validTargetType] || [defaultRelationship];
    
    // Return a random relationship from the possibilities or the default
    return possibleRelationships[Math.floor(Math.random() * possibleRelationships.length)] || defaultRelationship;
  };

  // Helper function for action-oriented labels
  const getActionLabel = (targetNode: any) => {
    // Default action if node is invalid or type is missing
    if (!targetNode || !targetNode.type) {
      return 'Connect with';
    }
    
    // Ensure we have a valid type string
    const nodeType = typeof targetNode.type === 'string' ? targetNode.type.toLowerCase() : '';
    
    switch(nodeType) {
      case 'person':
        return 'Meet with';
      case 'organization':
        return 'Connect with';
      case 'event':
        return 'Attend';
      case 'venue':
        return 'Visit';
      default:
        return 'Explore';
    }
  };

  return (
    <>
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="w-full">
              Create Network
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b">
            <DialogTitle className="text-xl font-bold">Create New Network</DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Choose how to create your network:</h3>
            </div>
            
            <div className="space-y-3">
              {/* AI Generated Network Option */}
              <div 
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => {
                  setShowAIDialog(true);
                  onOpenChange?.(false);
                }}
              >
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-600 dark:text-blue-400">AI Generated Network</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Let AI create a professional network based on your description
                    </p>
                  </div>
                </div>
              </div>

              {/* Blank Network Option */}
              <div 
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-green-400 transition-colors"
                onClick={() => createNetwork(true)}
              >
                <div className="bg-green-50 dark:bg-green-950/20 p-4 flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <PencilLine className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-600 dark:text-green-400">Blank Network</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start with an empty network and add nodes manually
                    </p>
                  </div>
                </div>
              </div>

              {/* CSV/Excel Import Option */}
              <div 
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-orange-400 transition-colors"
                onClick={handleFileUpload}
              >
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 flex items-center gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-orange-600 dark:text-orange-400">Import Data</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Import from CSV or Excel file with existing data
                    </p>
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Network Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Generate AI Network
            </DialogTitle>
            <DialogDescription>
              Describe the professional network you want to create
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Your network description</Label>
              <Textarea
                id="ai-prompt"
                placeholder="E.g., 'A professional network for a software engineer in San Francisco' or 'A network for a healthcare startup founder'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about industry, roles, and connections you're interested in.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createNetwork(false)} 
              disabled={!prompt.trim() || isGenerating}
              className="gap-2"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
