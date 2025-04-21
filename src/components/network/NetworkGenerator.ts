import { supabase } from "@/integrations/supabase/client";
import { getActionLabel, generateDefaultNetworkData, generateFallbackNetworkFromText } from "./NetworkAiGenerator";

/**
 * Generates a network from AI prompt
 */
export const generateNetworkFromPrompt = async (networkId: string, prompt: string, industry: string) => {
  try {
    console.log('NetworkGenerator: Starting generateNetworkFromPrompt for network', networkId);
    console.log('NetworkGenerator: Prompt:', prompt);
    console.log('NetworkGenerator: Industry:', industry);
    
    // Validate network ID
    if (!networkId || typeof networkId !== 'string' || networkId.trim() === '') {
      console.error('NetworkGenerator: Invalid network ID provided:', networkId);
      throw new Error('Invalid network ID');
    }
    
    const networkData = await generateNetworkDataFromAI(prompt, industry);
    console.log("Network data from AI:", networkData);

    if (!networkData || !networkData.nodes || networkData.nodes.length === 0) {
      console.error("NetworkGenerator: No valid network data received from AI");
      throw new Error("Failed to generate network data");
    }

    // Create a map to store node names to IDs for relationship mapping
    const nodeNameToId = new Map();

    // Create the central node (You)
    console.log('NetworkGenerator: Creating central node for network:', networkId);
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

    if (centralNodeError) {
      console.error("NetworkGenerator: Error creating central node:", centralNodeError);
      throw centralNodeError;
    }

    console.log('NetworkGenerator: Central node created:', centralNode);

    // Organize nodes into a cleaner tree-like structure
    // First level: directly connected to "You" in a circle
    // Second level: each connected to a first level node to form branches
    const maxFirstLevelNodes = 8; // Limit first level nodes for clarity
    
    // Sort nodes by importance (organizations first, then events, then people)
    const sortedNodes = [...networkData.nodes].sort((a, b) => {
      const typeOrder = { 'organization': 0, 'venue': 1, 'event': 2, 'person': 3 };
      return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    });
    
    // Limit first level nodes for a cleaner layout
    const firstLevelCount = Math.min(maxFirstLevelNodes, Math.ceil(sortedNodes.length / 5));
    const firstLevelNodes = sortedNodes.slice(0, firstLevelCount);
    const secondLevelNodes = sortedNodes.slice(firstLevelCount);

    // Calculate positions for first level nodes in a simple ring around "You"
    const firstLevelRadius = 500; // Increased from 300 to 500 for more spacing
    
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
      
      // Add random distance variation for more natural layout
      const radiusVariation = 1 + (Math.random() * 0.3 - 0.15); // ±15% variation
      const x_position = Math.cos(angle) * firstLevelRadius * radiusVariation;
      const y_position = Math.sin(angle) * firstLevelRadius * radiusVariation;
      
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
    
    // Distribute second level nodes among first level nodes evenly to form a tree structure
    const chunkedSecondLevel = [];
    const maxNodesPerBranch = 5; // Limit nodes per branch for better spacing
    const nodesPerFirstLevel = Math.min(
      maxNodesPerBranch,
      Math.ceil(secondLevelNodes.length / createdFirstLevel.length)
    );
    
    // Split second level nodes into chunks, one chunk per first level node
    for (let i = 0; i < createdFirstLevel.length; i++) {
      chunkedSecondLevel.push(
        secondLevelNodes.slice(
          i * nodesPerFirstLevel, 
          Math.min((i + 1) * nodesPerFirstLevel, secondLevelNodes.length)
        )
      );
    }
    
    const secondLevelPromises = [];
    
    // Create second level nodes in a line extending outward from first level nodes
    for (let i = 0; i < createdFirstLevel.length; i++) {
      const parentNode = createdFirstLevel[i];
      const childNodes = chunkedSecondLevel[i] || [];
      
      if (childNodes.length === 0) continue;
      
      // Calculate branch direction vector from center to parent
      const dirX = parentNode.x_position;
      const dirY = parentNode.y_position;
      const distance = Math.sqrt(dirX * dirX + dirY * dirY);
      const normalizedDirX = dirX / distance;
      const normalizedDirY = dirY / distance;
      
      // Line up child nodes outward along this vector
      childNodes.forEach((node, j) => {
        // Skip nodes without a valid name
        if (!node.name || typeof node.name !== 'string' || node.name.trim() === '') {
          return;
        }
        
        // Calculate position along the branch line
        // Start beyond parent node and space evenly
        const branchLength = 300 + (j * 250); // Increased from 200 to 300 base distance and from 150 to 250 spacing
        
        // Add random offset to prevent perfect alignment
        const randomOffset = () => (Math.random() - 0.5) * 100;
        const offsetX = randomOffset();
        const offsetY = randomOffset();
        
        const childX = parentNode.x_position + (normalizedDirX * branchLength) + offsetX;
        const childY = parentNode.y_position + (normalizedDirY * branchLength) + offsetY;
        
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
    
    // Create edges - keep only tree structure edges to avoid crossings
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
    
    // Connect first level nodes to their children (maintaining tree structure)
    createdSecondLevel.forEach(node => {
      if (node && node.id && node.parentId) {
        // Get the relationship label synchronously instead of using a Promise
        const relationshipLabel = getActionLabel({ type: node.type });
        
        edgePromises.push(
          supabase.from('edges').insert({
            network_id: networkId,
            source_id: node.parentId,
            target_id: node.id,
            label: relationshipLabel
          })
        );
      }
    });

    // Add a limited number of additional relationships from the AI response
    // Focus only on meaningful connections that don't create crossings
    if (networkData.relationships && Array.isArray(networkData.relationships)) {
      // Build the node name to ID map for relationship mapping
      const nodeMap = new Map();
      
      // First, build a map of node names to IDs from all created nodes
      createdFirstLevel.forEach(node => {
        if (node && node.id && node.name) {
          nodeMap.set(node.name.toLowerCase(), {
            id: node.id,
            level: 1,
            index: node.originalIndex
          });
        }
      });
      
      createdSecondLevel.forEach(node => {
        if (node && node.id && node.name) {
          nodeMap.set(node.name.toLowerCase(), {
            id: node.id,
            level: 2,
            parentId: node.parentId
          });
        }
      });
      
      // Add "You" to the map
      if (centralNode && centralNode.id) {
        nodeMap.set("you", {
          id: centralNode.id,
          level: 0
        });
      }
      
      // Filter relationships to only include ones that maintain the tree structure
      // or connect nodes that are nearby (siblings)
      const maxAdditionalEdges = 5; // Limit additional edges beyond the tree structure
      let additionalEdgesAdded = 0;
      
      for (const rel of networkData.relationships) {
        if (additionalEdgesAdded >= maxAdditionalEdges) break;
        if (!rel.source || !rel.target) continue;
        
        let sourceKey = typeof rel.source === 'string' ? rel.source.toLowerCase() : null;
        let targetKey = typeof rel.target === 'string' ? rel.target.toLowerCase() : null;
        
        if (!sourceKey || !targetKey) continue;
        
        const sourceNode = nodeMap.get(sourceKey);
        const targetNode = nodeMap.get(targetKey);
        
        if (!sourceNode || !targetNode) continue;
        
        // Skip if we already have this edge in the tree (parent-child)
        if (
          (sourceNode.level === 0 && targetNode.level === 1) || 
          (sourceNode.level === 1 && targetNode.level === 0) ||
          (sourceNode.level === 1 && targetNode.level === 2 && sourceNode.id === targetNode.parentId) ||
          (sourceNode.level === 2 && targetNode.level === 1 && targetNode.id === sourceNode.parentId)
        ) {
          continue;
        }
        
        // Only add edges between siblings (nodes with same parent)
        // or nodes that are conceptually close in the tree
        if (
          (sourceNode.level === 1 && targetNode.level === 1 && Math.abs(sourceNode.index - targetNode.index) <= 1) ||
          (sourceNode.level === 2 && targetNode.level === 2 && sourceNode.parentId === targetNode.parentId)
        ) {
          edgePromises.push(
            supabase.from('edges').insert({
              network_id: networkId,
              source_id: sourceNode.id,
              target_id: targetNode.id,
              label: rel.label || 'Connected to',
              notes: rel.notes
            })
          );
          additionalEdgesAdded++;
        }
      }
    }

    await Promise.all(edgePromises);
    
    // Ensure the loading state is cleared and notify completion
    try {
      // Clear any previous cache for this network to ensure fresh data load
      console.log('NetworkGenerator: Clearing cache for network before completion event', networkId);
      
      // Clear all localStorage cache for this network
      localStorage.removeItem(`socialmap-nodes-${networkId}`);
      localStorage.removeItem(`socialmap-edges-${networkId}`);
      
      // Dispatch an internal event to clear the nodes and edges from state first
      const clearStateEvent = new CustomEvent('pre-network-generation-complete', {
        detail: { 
          networkId,
          action: 'clear-state'
        }
      });
      window.dispatchEvent(clearStateEvent);
      
      // Give a short delay for the clear state event to be processed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Dispatch event to notify the network generation is complete
      console.log('NetworkGenerator: Dispatching network-generation-complete event for network', networkId);
      const completionEvent = new CustomEvent('network-generation-complete', {
        detail: { 
          networkId,
          timestamp: Date.now(),
          forceServerRefresh: true
        }
      });
      window.dispatchEvent(completionEvent);
      console.log('Network generation complete event dispatched');
    } catch (error) {
      console.error('Error clearing cache before completion event:', error);
      // Still dispatch the event even if cache clearing fails
      const errorEvent = new CustomEvent('network-generation-complete', {
        detail: { 
          networkId,
          timestamp: Date.now(),
          forceServerRefresh: true,
          error: 'cache-clear-failed'
        }
      });
      window.dispatchEvent(errorEvent);
    }
  } catch (error) {
    console.error("Error generating network from prompt:", error);
    
    // Also dispatch the completion event on error to ensure loading screen disappears
    setTimeout(() => {
      console.log('NetworkGenerator: Dispatching network-generation-complete event on error');
      window.dispatchEvent(new CustomEvent('network-generation-complete', {
        detail: { 
          networkId,
          error: true,
          timestamp: Date.now()
        }
      }));
      console.log('Network generation complete event dispatched on error');
    }, 1000);
    
    throw error;
  }
};

/**
 * Generate network data using OpenAI
 */
export const generateNetworkDataFromAI = async (prompt: string, industry: string) => {
  try {
    console.log('NetworkGenerator: Starting AI data generation for industry:', industry);
    console.log('NetworkGenerator: Using prompt:', prompt);
    
    // Check if API key exists
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    if (!apiKey || apiKey.trim() === '') {
      console.error("No OpenAI API key found. Check your .env file.");
      throw new Error("Missing OpenAI API key");
    }
    
    console.log("API key status:", apiKey ? "Present (length: " + apiKey.length + ")" : "Missing");
    
    const systemPrompt = `
You are an expert in professional networking, relationship mapping, and industry influence strategies.

### PRIORITY INSTRUCTION 
The user's request is: "${prompt}"
This request must be your PRIMARY focus. The network generated MUST be customized to reflect EXACTLY what the user has requested. DO NOT create a generic ${industry} network - instead create a network that specifically addresses "${prompt}".

### Network Structure (15-20 nodes total)
1. Organizations (5-7 nodes):
   - Companies and organizations that DIRECTLY relate to: "${prompt}"
   - Must include specific, real organizations relevant to the user's request
   - Each organization must have a clear connection to the user's specific needs

2. People (5-7 nodes):
   - Real job roles/positions that would help with: "${prompt}" 
   - Professionals with expertise specifically requested by the user
   - Contacts that would be valuable for the exact situation described

3. Events/Venues (3-5 nodes):
   - Specific conferences, events, or places directly relevant to: "${prompt}"
   - Must be tailored to the user's exact request, not generic industry events

### CRITICAL REQUIREMENTS
1. DO NOT generate generic nodes. Each node MUST directly relate to: "${prompt}"
2. If the user asks for a specific type of network (e.g., "tech startups in healthcare"), EVERY node must relate to that specific focus
3. If the user includes specific companies, people, or events in their prompt, those MUST be included as nodes
4. The network should solve the specific problem or address the specific situation in: "${prompt}"

### Output Format
Return a STRICT, VALID JSON object with these exact fields:
{
  "nodes": [
    {
      "name": "Specific Company/Person Name",
      "type": "organization/person/event/venue",
      "notes": "Description showing direct relevance to user's prompt: ${prompt}",
      "address": "Location (for organizations/venues)"
    }
  ],
  "relationships": [
    {
      "source": "Source Name",
      "target": "Target Name",
      "label": "Nature of relationship",
      "notes": "How this connection helps with: ${prompt}"
    }
  ]
}`;

    console.log('NetworkGenerator: Sending request to OpenAI API');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `I need a professional network specifically focused on: "${prompt}" in the ${industry} industry. Please generate ONLY relevant nodes that directly address my specific request, not generic industry contacts.` }
        ],
        temperature: 0.5,
        max_tokens: 4000
      })
    });
    
    console.log('NetworkGenerator: Received response from OpenAI API');
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      console.log("API key used (first 5 chars):", apiKey.substring(0, 5) + "...");
      throw new Error(errorData.error?.message || 'Failed to get response from AI');
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log("Raw AI response received, length:", content.length);
    console.log("Response starts with:", content.substring(0, 100));
    
    let parsedData;
    
    // First try to parse the entire response as JSON directly
    try {
      parsedData = JSON.parse(content);
      console.log("Direct JSON parsing successful");
      console.log("Parsed data node count:", parsedData?.nodes?.length || 0);
    } catch (directParseError) {
      console.log("Direct JSON parsing failed with error:", directParseError.message);
      
      // Try different regex patterns to extract JSON
      // Pattern 1: JSON inside code blocks
      let jsonContent = null;
      const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
      const codeBlockMatch = content.match(codeBlockRegex);
      
      if (codeBlockMatch && codeBlockMatch[1]) {
        console.log("Found JSON in code block");
        jsonContent = codeBlockMatch[1].trim();
      } else {
        // Pattern 2: Look for a JSON object with curly braces
        const jsonObjectRegex = /(\{[\s\S]*\})/;
        const jsonObjectMatch = content.match(jsonObjectRegex);
        
        if (jsonObjectMatch && jsonObjectMatch[1]) {
          console.log("Found JSON with regex pattern");
          jsonContent = jsonObjectMatch[1].trim();
        }
      }
      
      if (!jsonContent) {
        console.error("Could not extract JSON from AI response, falling back to text parsing");
        console.log("Displaying first 300 chars of response:", content.substring(0, 300));
        
        // Emergency fallback - try to create a basic network structure from the text
        return generateFallbackNetworkFromText(content, industry, prompt);
      }
      
      try {
        parsedData = JSON.parse(jsonContent);
        console.log("Extracted JSON parsing successful");
        console.log("Parsed data node count:", parsedData?.nodes?.length || 0);
      } catch (extractParseError) {
        console.error("Error parsing extracted JSON:", extractParseError, "content first 100 chars:", jsonContent.substring(0, 100));
        
        // Emergency fallback if JSON parsing fails
        return generateFallbackNetworkFromText(content, industry, prompt);
      }
    }
    
    // Validate the structure
    if (!parsedData || !parsedData.nodes || !Array.isArray(parsedData.nodes)) {
      console.error("Invalid network data structure - missing nodes:", parsedData);
      return generateFallbackNetworkFromText(content, industry, prompt);
    }
    
    if (parsedData.nodes.length < 5) {
      console.error("Too few nodes in response, expected 20+ but got:", parsedData.nodes.length);
      return generateFallbackNetworkFromText(content, industry, prompt);
    }
    
    console.log("Successfully parsed network data from AI with", parsedData.nodes.length, "nodes");
    
    if (!parsedData.relationships || !Array.isArray(parsedData.relationships)) {
      console.log("Missing relationships, creating an empty array");
      parsedData.relationships = [];
    } else {
      console.log("Relationship count:", parsedData.relationships.length);
    }
    
    // Return a network with the relationships
    return {
      nodes: [
        // Add the central "You" node first
        {
          name: "You",
          type: "person",
          notes: "Your central position in the network",
          x_position: 0,
          y_position: 0
        },
        ...parsedData.nodes
      ],
      relationships: parsedData.relationships
    };
  } catch (error) {
    console.error('Error generating network data from AI:', error);
    // Ensure we have a fallback with the user's prompt
    return generateFallbackNetworkFromText("", industry, prompt);
  }
};

/**
 * Helper function to get relationship label between node types
 */
export const getRelationshipLabel = (sourceType: string, targetType: string) => {
  // Use imported utility function
  return import("./NetworkAiGenerator").then(({ getRelationshipLabel }) => {
    return getRelationshipLabel(sourceType, targetType);
  }).catch(() => {
    // Fallback if import fails
    return "Connected to";
  });
}; 