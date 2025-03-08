import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AudioWaveform, PencilLine } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateNetworkDialogProps {
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onNetworkCreated?: (networkId: string) => void;
}

export const CreateNetworkDialog = ({
  onOpenChange,
  trigger,
  onNetworkCreated,
}: CreateNetworkDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const createNetwork = async (isBlank: boolean = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: network, error } = await supabase
        .from('networks')
        .insert([{
          name: isBlank ? 'New Network' : prompt,
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
        // Here you would integrate with an AI service to generate the network
        // For now, we'll just create a simple network
        const nodes = [
          { name: "Central Node", type: "person", x_position: 0, y_position: 0 },
          { name: "Connected Node 1", type: "person", x_position: 200, y_position: 0 },
          { name: "Connected Node 2", type: "person", x_position: -200, y_position: 0 },
        ];

        for (const node of nodes) {
          await supabase.from('nodes').insert({
            ...node,
            network_id: network.id
          });
        }
        setIsGenerating(false);
      }

      toast({
        title: "Network created",
        description: isBlank ? "Created a blank network" : "Generated network from prompt"
      });

      onOpenChange?.(false);
    } catch (error) {
      console.error('Error creating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network"
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
        // Calculate position in a circle with even spacing
        const angle = (i * 2 * Math.PI) / firstLevelNodes.length;
        const x_position = Math.cos(angle) * firstLevelRadius;
        const y_position = Math.sin(angle) * firstLevelRadius;
        
        return new Promise<any>((resolve) => {
          supabase
            .from('nodes')
            .insert({
              name: node.name,
              type: node.type,
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
          // Calculate position for this child
          const childAngle = parentAngle - spreadAngle/2 + (j * spreadAngle / Math.max(1, childNodes.length - 1));
          
          // Calculate position relative to parent, not center
          const childX = parentNode.x_position + Math.cos(childAngle) * secondLevelRadius;
          const childY = parentNode.y_position + Math.sin(childAngle) * secondLevelRadius;
          
          const promise = new Promise<any>((resolve) => {
            supabase
              .from('nodes')
              .insert({
                name: node.name,
                type: node.type,
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
          });
          
          secondLevelPromises.push(promise);
        });
      }
      
      await Promise.all(secondLevelPromises);
      
      // Create edges
      const edgePromises = [];
      
      // Connect "You" to all first level nodes
      createdFirstLevel.forEach(node => {
        edgePromises.push(
          supabase.from('edges').insert({
            network_id: networkId,
            source_id: centralNode.id,
            target_id: node.id,
            label: getActionLabel(node)
          })
        );
      });
      
      // Connect first level nodes to their children
      createdSecondLevel.forEach(node => {
        edgePromises.push(
          supabase.from('edges').insert({
            network_id: networkId,
            source_id: node.parentId,
            target_id: node.id,
            label: getRelationshipLabel('organization', node.type)
          })
        );
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
    const organizations = getDefaultOrganizationsForIndustry(industry);
    organizations.forEach((org, index) => {
      const pos = generatePosition(index, organizations.length, 300);
      nodes.push({
        name: org.name,
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
    const people = getDefaultPeopleForIndustry(industry);
    const peopleStartIndex = nodes.length;
    people.forEach((person, index) => {
      const pos = generatePosition(index, people.length, 500);
      nodes.push({
        name: person.name,
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
    const events = getDefaultEventsForIndustry(industry);
    const eventsStartIndex = nodes.length;
    events.forEach((event, index) => {
      const pos = generatePosition(index, events.length, 700);
      nodes.push({
        name: event.name,
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
    const venues = getDefaultVenuesForIndustry(industry);
    const venuesStartIndex = nodes.length;
    venues.forEach((venue, index) => {
      const pos = generatePosition(index, venues.length, 600);
      nodes.push({
        name: venue.name,
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
    const industryMap: Record<string, any[]> = {
      "Technology": [
        { name: "Google", description: "Tech giant with strong networking opportunities" },
        { name: "Microsoft", description: "Major tech company with extensive partner network" },
        { name: "Amazon Web Services", description: "Cloud provider with partner programs" },
        { name: "TechCrunch", description: "Tech media company hosting networking events" },
        { name: "Y Combinator", description: "Startup accelerator with strong alumni network" }
      ],
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
    return industryMap[industry] || industryMap["Technology"];
  };

  // Default people (fallback)
  const getDefaultPeopleForIndustry = (industry: string) => {
    const industryMap: Record<string, any[]> = {
      "Technology": [
        { name: "Sarah Chen", role: "CTO at Tech Innovators" },
        { name: "Michael Rodriguez", role: "Venture Capitalist at Sequoia" },
        { name: "Priya Patel", role: "Engineering Director at Google" },
        { name: "David Kim", role: "Startup Founder" },
        { name: "Lisa Johnson", role: "Tech Recruiter" }
      ],
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
    return industryMap[industry] || industryMap["Technology"];
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
    
    const industryMap: Record<string, any[]> = {
      "Technology": [
        { name: "TechCrunch Disrupt", date: getRandomFutureDate(), description: "Startup and tech conference" },
        { name: "Web Summit", date: getRandomFutureDate(), description: "Global technology conference" },
        { name: "Developer Conference", date: getRandomFutureDate(), description: "Annual coding and development event" }
      ],
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
    return industryMap[industry] || industryMap["Technology"];
  };

  // Default venues (fallback)
  const getDefaultVenuesForIndustry = (industry: string) => {
    const industryMap: Record<string, any[]> = {
      "Technology": [
        { name: "Innovation Hub", address: "123 Tech Blvd, San Francisco, CA", description: "Coworking space for tech startups" },
        { name: "Convention Center", address: "456 Expo Ave, Las Vegas, NV", description: "Large venue for tech conferences" }
      ],
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
    return industryMap[industry] || industryMap["Technology"];
  };

  // Generate relationship labels based on node types (fallback)
  const getRelationshipLabel = (sourceType: string, targetType: string) => {
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
    
    // Get possible relationships based on node types
    const possibleRelationships = relationshipMap[sourceType]?.[targetType] || ["Connected to"];
    
    // Return a random relationship from the possibilities
    return possibleRelationships[Math.floor(Math.random() * possibleRelationships.length)];
  };

  // Helper function for action-oriented labels
  const getActionLabel = (targetNode: any) => {
    switch(targetNode.type) {
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
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            Create Network
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Network</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="justify-start gap-3"
              onClick={() => createNetwork(true)}
              disabled={isGenerating}
            >
              <PencilLine className="h-4 w-4" />
              Create Blank Network
            </Button>
            <div className="space-y-2">
              <Label htmlFor="prompt">Or generate from prompt:</Label>
              <Textarea
                id="prompt"
                placeholder="Describe your network..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-24"
              />
              <Button
                className="w-full justify-start gap-3"
                onClick={() => createNetwork(false)}
                disabled={!prompt.trim() || isGenerating}
              >
                <AudioWaveform className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Network'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
