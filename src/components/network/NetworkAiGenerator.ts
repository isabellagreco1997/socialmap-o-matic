// Helper functions for AI network generation

/**
 * Generate relationship labels based on node types
 */
export const getRelationshipLabel = (sourceType: string, targetType: string) => {
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

/**
 * Helper function for action-oriented labels
 */
export const getActionLabel = (targetNode: any) => {
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

// Default organizations (fallback)
export const getDefaultOrganizationsForIndustry = (industry: string) => {
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
export const getDefaultPeopleForIndustry = (industry: string) => {
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
export const getDefaultEventsForIndustry = (industry: string) => {
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
export const getDefaultVenuesForIndustry = (industry: string) => {
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

/**
 * Fallback network generation if AI fails
 */
export const generateDefaultNetworkData = (industry: string) => {
  // Default nodes if no industry selected
  if (!industry) {
    industry = "Technology";
  }
  
  // Base structure with different node types
  const nodes = [];
  const relationships = [];
  
  // Industry-specific organizations - first level nodes
  const organizations = getDefaultOrganizationsForIndustry(industry)
    .filter(org => org && org.name && typeof org.name === 'string' && org.name.trim() !== '')
    .slice(0, 5); // Keep only 5 for cleaner visualization
  
  const organizationSpacing = 400; // Increased spacing between organizations
  
  organizations.forEach((org, index) => {
    // Calculate radial position for organizations
    const angle = (index * 2 * Math.PI) / organizations.length;
    // Add random variation to radius
    const radius = 500 * (1 + (Math.random() * 0.2 - 0.1)); // 500 units with ±10% variation
    
    nodes.push({
      name: org.name.trim(),
      type: "organization",
      notes: org.description,
      x_position: Math.cos(angle) * radius,
      y_position: Math.sin(angle) * radius
    });
    
    // Add relationship to user
    relationships.push({
      source: 0, // User node (will be added separately)
      target: index + 1, // 1-based index for the current node
      label: getRelationshipLabel("person", "organization")
    });
  });
  
  // Industry-specific people - second level nodes for first organization
  const people = getDefaultPeopleForIndustry(industry)
    .filter(person => person && person.name && typeof person.name === 'string' && person.name.trim() !== '')
    .slice(0, 5); // Keep only 5 for cleaner visualization
  
  const peopleStartIndex = nodes.length;
  people.forEach((person, index) => {
    // Connect each person to a corresponding organization to maintain tree structure
    const orgIndex = Math.min(index, organizations.length - 1);
    const parentOrg = nodes[orgIndex];
    
    // Calculate position branching out from the parent organization
    // Direction vector from center to parent org
    const dirX = parentOrg.x_position;
    const dirY = parentOrg.y_position;
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
    const normalizedDirX = dirX / distance;
    const normalizedDirY = dirY / distance;
    
    // Calculate position with branch angle and distance
    const branchAngle = (index * Math.PI / 4) - (Math.PI / 8); // Spread in a 45-degree arc
    const branchDistance = 300 + (Math.random() * 100); // 300-400 units from parent
    
    // Rotate the normalized direction vector by branchAngle
    const rotatedDirX = normalizedDirX * Math.cos(branchAngle) - normalizedDirY * Math.sin(branchAngle);
    const rotatedDirY = normalizedDirX * Math.sin(branchAngle) + normalizedDirY * Math.cos(branchAngle);
    
    const x_position = parentOrg.x_position + (rotatedDirX * branchDistance);
    const y_position = parentOrg.y_position + (rotatedDirY * branchDistance);
    
    nodes.push({
      name: person.name.trim(),
      type: "person",
      notes: person.role,
      x_position,
      y_position
    });
    
    relationships.push({
      source: orgIndex + 1, // 1-based organization index
      target: peopleStartIndex + index + 1, // 1-based index for person
      label: getRelationshipLabel("organization", "person")
    });
  });
  
  // Industry-specific events - second level nodes for second organization
  const events = getDefaultEventsForIndustry(industry)
    .filter(event => event && event.name && typeof event.name === 'string' && event.name.trim() !== '')
    .slice(0, 3); // Keep only 3 for cleaner visualization
  
  const eventsStartIndex = nodes.length;
  events.forEach((event, index) => {
    // Connect events to a different organization than people
    const orgIndex = Math.min(1, organizations.length - 1);
    const parentOrg = nodes[orgIndex];
    
    // Calculate position branching out from the parent organization
    // Direction vector from center to parent org
    const dirX = parentOrg.x_position;
    const dirY = parentOrg.y_position;
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
    const normalizedDirX = dirX / distance;
    const normalizedDirY = dirY / distance;
    
    // Calculate position with branch angle and distance - offset from people's angle range
    const branchAngle = (index * Math.PI / 4) + (Math.PI / 2); // Different angle range than people
    const branchDistance = 350 + (Math.random() * 100); // 350-450 units from parent
    
    // Rotate the normalized direction vector by branchAngle
    const rotatedDirX = normalizedDirX * Math.cos(branchAngle) - normalizedDirY * Math.sin(branchAngle);
    const rotatedDirY = normalizedDirX * Math.sin(branchAngle) + normalizedDirY * Math.cos(branchAngle);
    
    const x_position = parentOrg.x_position + (rotatedDirX * branchDistance);
    const y_position = parentOrg.y_position + (rotatedDirY * branchDistance);
    
    nodes.push({
      name: event.name.trim(),
      type: "event",
      date: event.date,
      notes: event.description,
      x_position,
      y_position
    });
    
    relationships.push({
      source: orgIndex + 1, // Second organization (or first if only one exists)
      target: eventsStartIndex + index + 1,
      label: getRelationshipLabel("organization", "event")
    });
  });
  
  // Industry-specific venues - second level nodes for third organization
  const venues = getDefaultVenuesForIndustry(industry)
    .filter(venue => venue && venue.name && typeof venue.name === 'string' && venue.name.trim() !== '')
    .slice(0, 3); // Keep only 3 for cleaner visualization
  
  const venuesStartIndex = nodes.length;
  venues.forEach((venue, index) => {
    // Connect venues to a different organization
    const orgIndex = Math.min(2, organizations.length - 1);
    const parentOrg = nodes[orgIndex];
    
    // Calculate position branching out from the parent organization
    // Direction vector from center to parent org
    const dirX = parentOrg.x_position;
    const dirY = parentOrg.y_position;
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
    const normalizedDirX = dirX / distance;
    const normalizedDirY = dirY / distance;
    
    // Calculate position with branch angle and distance - offset from other branches
    const branchAngle = (index * Math.PI / 4) - (Math.PI / 2); // Different angle range than others
    const branchDistance = 400 + (Math.random() * 100); // 400-500 units from parent
    
    // Rotate the normalized direction vector by branchAngle
    const rotatedDirX = normalizedDirX * Math.cos(branchAngle) - normalizedDirY * Math.sin(branchAngle);
    const rotatedDirY = normalizedDirX * Math.sin(branchAngle) + normalizedDirY * Math.cos(branchAngle);
    
    const x_position = parentOrg.x_position + (rotatedDirX * branchDistance);
    const y_position = parentOrg.y_position + (rotatedDirY * branchDistance);
    
    nodes.push({
      name: venue.name.trim(),
      type: "venue",
      address: venue.address,
      notes: venue.description,
      x_position,
      y_position
    });
    
    // Connect venues to a different organization than people/events
    relationships.push({
      source: orgIndex + 1, // Third organization (or earlier if fewer exist)
      target: venuesStartIndex + index + 1,
      label: getRelationshipLabel("organization", "venue")
    });
  });
  
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
      ...nodes
    ], 
    relationships 
  };
};

/**
 * Generate fallback network structure from text if JSON parsing fails
 */
export const generateFallbackNetworkFromText = (text: string, industry: string) => {
  console.log("Generating fallback network from text content");
  
  // Extract potential node names using regex patterns
  const extractNodes = () => {
    const nodes = [];
    
    // Look for company/organization names (often have Inc, LLC, etc.)
    const companyRegex = /([A-Z][A-Za-z0-9\s&\'\.]+(?:Inc\.?|LLC|Corp\.?|Corporation|Company|Technologies|Group|Association|Institute|Society|Agency|Foundation))/g;
    const companyMatches = [...text.matchAll(companyRegex)];
    
    // Look for people names (typically First Last format)
    const peopleRegex = /([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
    const peopleMatches = [...text.matchAll(peopleRegex)];
    
    // Look for event names (often have Conference, Summit, Expo, etc.)
    const eventRegex = /([A-Z][A-Za-z0-9\s&\'\.]+(?:Conference|Summit|Expo|Convention|Forum|Symposium|Workshop|Meetup|Event))/g;
    const eventMatches = [...text.matchAll(eventRegex)];
    
    // Add companies/organizations
    companyMatches.forEach(match => {
      if (match[1] && match[1].length > 3 && !nodes.some(n => n.name === match[1])) {
        nodes.push({
          name: match[1],
          type: "organization",
          notes: `Organization in the ${industry} industry`
        });
      }
    });
    
    // Add people
    peopleMatches.forEach(match => {
      if (match[1] && match[1].length > 3 && !nodes.some(n => n.name === match[1])) {
        nodes.push({
          name: match[1],
          type: "person",
          notes: `Professional in the ${industry} industry`
        });
      }
    });
    
    // Add events
    eventMatches.forEach(match => {
      if (match[1] && match[1].length > 3 && !nodes.some(n => n.name === match[1])) {
        nodes.push({
          name: match[1],
          type: "event",
          notes: `Event in the ${industry} industry`
        });
      }
    });
    
    // Limit to a reasonable number of nodes and ensure uniqueness
    const uniqueNodes = nodes
      .filter((node, index, self) => 
        index === self.findIndex(n => n.name === node.name))
      .slice(0, 30); // Limit to 30 nodes for clean visualization
    
    // Add more nodes from default data if we don't have enough
    if (uniqueNodes.length < 5) {
      const defaultData = generateDefaultNetworkData(industry);
      return defaultData.nodes;
    }
    
    return uniqueNodes;
  };
  
  const nodes = extractNodes();
  
  return {
    nodes,
    relationships: [] // No relationships for fallback
  };
}; 