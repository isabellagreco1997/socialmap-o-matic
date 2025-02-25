<lov-code>
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const templates = [
  {
    id: "david-lammy-network",
    name: "David Lammy Network",
    description: "Strategic network map to connect with David Lammy, British Shadow Foreign Secretary",
    nodes: [
      // Core Target
      { 
        name: "David Lammy", 
        type: "person", 
        x_position: 600, 
        y_position: 300,
        image_url: "https://members-api.parliament.uk/api/Members/1601/Portrait?cropType=ThreeFour",
        notes: "Shadow Foreign Secretary, Labour MP for Tottenham since 2000"
      },
      
      // Political Organizations
      { 
        name: "Labour Party HQ", 
        type: "organization", 
        x_position: 400, 
        y_position: 200,
        notes: "Main opposition party headquarters"
      },
      { 
        name: "Tottenham Labour Party", 
        type: "organization", 
        x_position: 300, 
        y_position: 250,
        notes: "Local constituency party"
      },
      
      // Parliamentary Bodies
      { 
        name: "House of Commons", 
        type: "organization", 
        x_position: 800, 
        y_position: 200,
        notes: "Main chamber of UK Parliament",
        address: "Westminster, London SW1A 0AA"
      },
      { 
        name: "Foreign Affairs Committee", 
        type: "organization", 
        x_position: 700, 
        y_position: 150,
        notes: "Parliamentary committee overseeing foreign policy"
      },
      
      // Media Organizations
      { 
        name: "BBC Politics", 
        type: "organization", 
        x_position: 200, 
        y_position: 300,
        notes: "Regular media appearances"
      },
      { 
        name: "The Guardian", 
        type: "organization", 
        x_position: 250, 
        y_position: 400,
        notes: "Frequent contributor"
      },
      
      // Educational Institutions
      { 
        name: "Harvard Law School", 
        type: "organization", 
        x_position: 900, 
        y_position: 400,
        notes: "Lammy's alma mater"
      },
      { 
        name: "SOAS University", 
        type: "organization", 
        x_position: 850, 
        y_position: 300,
        notes: "Regular speaker on international affairs"
      },
      
      // Think Tanks & Policy
      { 
        name: "Chatham House", 
        type: "organization", 
        x_position: 500, 
        y_position: 500,
        notes: "International affairs think tank"
      },
      { 
        name: "Royal United Services Institute", 
        type: "organization", 
        x_position: 700, 
        y_position: 500,
        notes: "Defense and security think tank"
      },
      
      // Community Organizations
      { 
        name: "Tottenham Community Groups", 
        type: "organization", 
        x_position: 300, 
        y_position: 350,
        notes: "Local constituency organizations"
      },
      
      // Events & Venues
      { 
        name: "Labour Party Conference", 
        type: "event", 
        x_position: 400, 
        y_position: 100,
        date: "2024-09-22",
        address: "Liverpool, UK"
      },
      { 
        name: "Foreign Policy Forum", 
        type: "event", 
        x_position: 600, 
        y_position: 50,
        date: "2024-07-15",
        address: "Central Hall Westminster"
      },
      { 
        name: "Constituency Surgery", 
        type: "event", 
        x_position: 350, 
        y_position: 450,
        notes: "Regular constituent meetings",
        date: "2024-06-01"
      },
      
      // Key Staff & Contacts
      { 
        name: "Parliamentary Office", 
        type: "organization", 
        x_position: 750, 
        y_position: 250,
        notes: "David Lammy's Westminster office"
      },
      { 
        name: "Constituency Office", 
        type: "organization", 
        x_position: 450, 
        y_position: 350,
        notes: "Tottenham office",
        address: "639 High Road, London N17"
      },
      
      // International Organizations
      { 
        name: "United Nations", 
        type: "organization", 
        x_position: 1000, 
        y_position: 300,
        notes: "Regular speaker on international development"
      },
      { 
        name: "European Parliament", 
        type: "organization", 
        x_position: 950, 
        y_position: 200,
        notes: "Post-Brexit relations"
      }
    ],
    edges: [
      // Political Party Connections
      { source: 0, target: 1, label: "Senior Leadership" },
      { source: 0, target: 2, label: "Constituency MP" },
      { source: 1, target: 12, label: "Annual Conference" },
      
      // Parliamentary Connections
      { source: 0, target: 3, label: "Member of Parliament" },
      { source: 0, target: 4, label: "Shadow Foreign Secretary" },
      { source: 3, target: 15, label: "Office Location" },
      
      // Media Relations
      { source: 0, target: 5, label: "Regular Appearances" },
      { source: 0, target: 6, label: "Opinion Pieces" },
      { source: 5, target: 13, label: "Event Coverage" },
      
      // Educational & Think Tank
      { source: 0, target: 7, label: "Alumni" },
      { source: 0, target: 8, label: "Guest Speaker" },
      { source: 0, target: 9, label: "Policy Forums" },
      { source: 0, target: 10, label: "Defense Policy" },
      
      // Community Engagement
      { source: 0, target: 11, label: "Community Leader" },
      { source: 11, target: 14, label: "Regular Meetings" },
      { source: 0, target: 16, label: "Local Office" },
      
      // International Relations
      { source: 0, target: 17, label: "International Development" },
      { source: 0, target: 18, label: "European Relations" },
      
      // Cross-connections
      { source: 4, target: 13, label: "Policy Announcements" },
      { source: 9, target: 13, label: "Expert Input" },
      { source: 15, target: 16, label: "Office Coordination" },
      { source: 17, target: 18, label: "International Forums" },
      { source: 6, target: 13, label: "Media Coverage" }
    ]
  },
  {
    id: "george-clooney-network",
    name: "George Clooney Network",
    description: "Strategic network map to connect with George Clooney through entertainment industry contacts",
    nodes: [
      // Core Target
      { 
        name: "George Clooney", 
        type: "person", 
        x_position: 600, 
        y_position: 300,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/George_Clooney_2016.jpg/800px-George_Clooney_2016.jpg",
        notes: "Academy Award-winning actor, director, and producer. Known for humanitarian work."
      },
      
      // Production Companies
      { 
        name: "Smokehouse Pictures", 
        type: "organization", 
        x_position: 400, 
        y_position: 200,
        notes: "Clooney's production company, founded with Grant Heslov"
      },
      { 
        name: "Universal Pictures", 
        type: "organization", 
        x_position: 800, 
        y_position: 200,
        notes: "Major studio with multiple Clooney projects"
      },
      
      // Industry Events
      { 
        name: "Academy Awards", 
        type: "event", 
        x_position: 600, 
        y_position: 100,
        date: "2024-03-10",
        address: "Dolby Theatre, Hollywood"
      },
      { 
        name: "Venice Film Festival", 
        type: "event", 
        x_position: 400, 
        y_position: 100,
        date: "2024-08-28",
        address: "Venice Lido, Italy"
      },
      
      // Professional Connections
      { 
        name: "CAA Talent Agency", 
        type: "organization", 
        x_position: 200, 
        y_position: 300,
        notes: "Clooney's representation"
      },
      { 
        name: "Grant Heslov", 
        type: "person", 
        x_position: 300, 
        y_position: 250,
        notes: "Producing partner and close friend"
      },
      
      // Humanitarian Organizations
      { 
        name: "United Nations", 
        type: "organization", 
        x_position: 1000, 
        y_position: 300,
        notes: "Clooney is a UN Messenger of Peace"
      },
      { 
        name: "Not On Our Watch", 
        type: "organization", 
        x_position: 900, 
        y_position: 400,
        notes: "Humanitarian organization co-founded by Clooney"
      },
      
      // Film Industry Venues
      { 
        name: "Dolby Theatre", 
        type: "venue", 
        x_position: 500, 
        y_position: 500,
        address: "Hollywood Boulevard, LA"
      },
      { 
        name: "Directors Guild", 
        type: "venue", 
        x_position: 700, 
        y_position: 500,
        address: "DGA Building, Los Angeles"
      },
      
      // Media Contacts
      { 
        name: "Hollywood Reporter", 
        type: "organization", 
        x_position: 300, 
        y_position: 400,
        notes: "Leading industry publication"
      },
      { 
        name: "Variety Magazine", 
        type: "organization", 
        x_position: 900, 
        y_position: 200,
        notes: "Premier entertainment industry news"
      },
      
      // Current Projects
      { 
        name: "Upcoming Film Project", 
        type: "event", 
        x_position: 500, 
        y_position: 300,
        date: "2024-12-01"
      },
      { 
        name: "Charity Gala", 
        type: "event", 
        x_position: 700, 
        y_position: 300,
        date: "2024-09-15"
      },
      
      // Industry Organizations
      { 
        name: "Screen Actors Guild", 
        type: "organization", 
        x_position: 400, 
        y_position: 600,
        notes: "Professional actors' union"
      },
      { 
        name: "Directors Guild of America", 
        type: "organization", 
        x_position: 800, 
        y_position: 600,
        notes: "Professional directors' organization"
      }
    ],
    edges: [
      // Direct Professional Connections
      { source: 0, target: 1, label: "Co-founder" },
      { source: 0, target: 6, label: "Business Partner" },
      { source: 0, target: 5, label: "Represented by" },
      
      // Project Connections
      { source: 1, target: 2, label: "Distribution Deal" },
      { source: 0, target: 13, label: "Starring Role" },
      { source: 1, target: 13, label: "Producing" },
      
      // Event Participation
      { source: 0, target: 3, label: "Regular Attendee" },
      { source: 0, target: 4, label: "Festival Circuit" },
      { source: 3, target: 9, label: "Venue" },
      
      // Humanitarian Work
      { source: 0, target: 7, label: "Peace Ambassador" },
      { source: 0, target: 8, label: "Co-founder" },
      { source: 0, target: 14, label: "Host" },
      
      // Media Relations
      { source: 11, target: 13, label: "Coverage" },
      { source: 12, target: 0, label: "Interviews" },
      
      // Industry Organization Links
      { source: 0, target: 15, label: "Member" },
      { source: 0, target: 16, label: "Member" },
      { source: 15, target: 10, label: "Meetings" },
      
      // Cross-connections
      { source: 5, target: 13, label: "Negotiation" },
      { source: 6, target: 13, label: "Co-producing" },
      { source: 7, target: 14, label: "Supporting" },
      { source: 11, target: 14, label: "Press Coverage" },
      { source: 2, target: 13, label: "Distribution" }
    ]
  },
  {
    id: "renewable-energy",
    name: "Renewable Energy Network",
    description: "Network of renewable energy experts and organizations in California",
    nodes: [
      // Central Organizations
      { name: "California Energy Commission", type: "organization", x_position: 600, y_position: 300 },
      { name: "CAISO (Grid Operator)", type: "organization", x_position: 800, y_position: 300 },
      { name: "CPUC", type: "organization", x_position: 400, y_position: 300 },
      
      // Solar Energy Sector
      { name: "Solar Energy Association", type: "organization", x_position: 400, y_position: 100 },
      { name: "Leading Solar Manufacturer", type: "organization", x_position: 200, y_position: 50 },
      { name: "Solar Installation Company", type: "organization", x_position: 600, y_position: 50 },
      { name: "Solar Research Lab", type: "organization", x_position: 400, y_position: 0 },
      { name: "Solar Policy Expert", type: "person", x_position: 300, y_position: 150 },
      
      // Wind Energy Sector
      { name: "Wind Energy Association", type: "organization", x_position: 800, y_position: 100 },
      { name: "Offshore Wind Developer", type: "organization", x_position: 1000, y_position: 50 },
      { name: "Wind Turbine Manufacturer", type: "organization", x_position: 600, y_position: 150 },
      { name: "Wind Resource Analyst", type: "person", x_position: 900, y_position: 150 },
      
      // Storage & Grid
      { name: "Battery Storage Company", type: "organization", x_position: 200, y_position: 400 },
      { name: "Grid Technology Provider", type: "organization", x_position: 1000, y_position: 400 },
      { name: "Energy Storage Association", type: "organization", x_position: 600, y_position: 450 },
      { name: "Grid Modernization Expert", type: "person", x_position: 800, y_position: 450 },
      
      // Research & Education
      { name: "UC Berkeley Energy Lab", type: "organization", x_position: 300, y_position: 550 },
      { name: "Stanford Energy Program", type: "organization", x_position: 500, y_position: 550 },
      { name: "CalTech Energy Institute", type: "organization", x_position: 700, y_position: 550 },
      { name: "Leading Energy Researcher", type: "person", x_position: 500, y_position: 650 },
      
      // Policy & Government
      { name: "State Energy Office", type: "organization", x_position: 200, y_position: 200 },
      { name: "Environmental Policy Group", type: "organization", x_position: 1000, y_position: 200 },
      { name: "Clean Energy Advocate", type: "person", x_position: 600, y_position: 200 },
      
      // Utilities & Implementation
      { name: "PG&E", type: "organization", x_position: 300, y_position: 350 },
      { name: "Southern California Edison", type: "organization", x_position: 900, y_position: 350 },
      { name: "Municipal Utility Director", type: "person", x_position: 600, y_position: 350 },
      
      // Industry Events & Venues
      { name: "RE+ Conference", type: "event", x_position: 400, y_position: 450 },
      { name: "Energy Storage Summit", type: "event", x_position: 800, y_position: 250 },
      { name: "Moscone Center", type: "venue", x_position: 400, y_position: 250 },
      
      // Financial & Investment
      { name: "Clean Energy Fund", type: "organization", x_position: 200, y_position: 500 },
      { name: "Energy VC Firm", type: "organization", x_position: 1000, y_position: 500 },
      { name: "Project Finance Expert", type: "person", x_position: 600, y_position: 500 }
    ],
    edges: [
      // Central Organization Connections
      { source: 0, target: 1, label: "Grid Management" },
      { source: 0, target: 2, label: "Policy Coordination" },
      
      // Solar Sector Connections
      { source: 3, target: 4, label: "Supply Chain" },
      { source: 3, target: 5, label: "Implementation" },
      { source: 3, target: 6, label: "R&D" },
      { source: 3, target: 7, label: "Policy Advisory" },
      
      // Wind Sector Connections
      { source: 8, target: 9, label: "Development" },
      { source: 8, target: 10, label: "Equipment" },
      { source: 8, target: 11, label: "Analysis" },
      
      // Storage & Grid Connections
      { source: 12, target: 14, label: "Industry Group" },
      { source: 13, target: 14, label: "Technology" },
      { source: 14, target: 15, label: "Expert Guidance" },
      
      // Research Connections
      { source: 16, target: 19, label: "Research" },
      { source: 17, target: 19, label: "Studies" },
      { source: 18, target: 19, label: "Innovation" },
      
      // Policy Connections
      { source: 20, target: 21, label: "Policy Making" },
      { source: 21, target: 22, label: "Advocacy" },
      
      // Utility Connections
      { source: 23, target: 25, label: "Operations" },
      { source: 24, target: 25, label: "Management" },
      
      // Event Connections
      { source: 26, target: 28, label: "Venue" },
      { source: 27, target: 14, label: "Industry Event" },
      
      // Financial Connections
      { source: 29, target: 31, label: "Investment" },
      { source: 30, target: 31, label: "Funding" },
      
      // Cross-sector Connections
      { source: 0, target: 3, label: "Solar Policy" },
      { source: 0, target: 8, label: "Wind Policy" },
      { source: 0, target: 14, label: "Storage Policy" },
      { source: 1, target: 13, label: "Grid Tech" },
      { source: 2, target: 22, label: "Advocacy" },
      { source: 19, target: 22, label: "Research Input" },
      { source: 31, target: 22, label: "Financial Advisory" },
      { source: 25, target: 15, label: "Grid Expertise" }
    ]
  },
  {
    id: "uhnw-networking",
    name: "UHNW & Billionaire Network",
    description: "Build relationships with ultra-high-net-worth individuals and billionaires",
    nodes: [
      // Center - You
      { name: "You", type: "person", x_position: 600, y_position: 300 },
      
      // Exclusive Clubs & Venues (Top Layer)
      { name: "Private Members Clubs", type: "venue", x_position: 400, y_position: 100 },
      { name: "Golf & Country Clubs", type: "venue", x_position: 600, y_position: 50 },
      { name: "Yacht Clubs", type: "venue", x_position: 800, y_position: 100 },
      { name: "Private Jets & Terminals", type: "venue", x_position: 1000, y_position: 150 },
      
      // Financial Services (Right Side)
      { name: "Private Banks", type: "organization", x_position: 900, y_position: 200 },
      { name: "Wealth Management Firms", type: "organization", x_position: 1000, y_position: 300 },
      { name: "Family Offices", type: "organization", x_position: 900, y_position: 400 },
      { name: "Investment Banks", type: "organization", x_position: 1000, y_position: 500 },
      
      // Professional Services (Left Side)
      { name: "Elite Law Firms", type: "organization", x_position: 300, y_position: 200 },
      { name: "Tax Advisors", type: "organization", x_position: 200, y_position: 300 },
      { name: "Luxury Real Estate", type: "organization", x_position: 300, y_position: 400 },
      { name: "Art Dealers", type: "organization", x_position: 200, y_position: 500 },
      
      // Events & Gatherings (Upper Middle)
      { name: "Charity Galas", type: "event", x_position: 500, y_position: 150 },
      { name: "Art Auctions", type: "event", x_position: 700, y_position: 150 },
      { name: "Fashion Shows", type: "event", x_position: 600, y_position: 200 },
      
      // Industry Leaders (Bottom Layer)
      { name: "Tech Entrepreneurs", type: "person", x_position: 400, y_position: 500 },
      { name: "Industry CEOs", type: "person", x_position: 600, y_position: 550 },
      { name: "Investment Leaders", type: "person", x_position: 800, y_position: 500 },
      
      // Influencers & Connectors
      { name: "Celebrity Agents", type: "person", x_position: 450, y_position: 350 },
      { name: "Society Columnists", type: "person", x_position: 750, y_position: 350 },
      { name: "Philanthropic Advisors", type: "person", x_position: 600, y_position: 450 },
      
      // Global Network
      { name: "Embassy Relations", type: "organization", x_position: 400, y_position: 600 },
      { name: "International Forums", type: "event", x_position: 600, y_position: 650 },
      { name: "Global Think Tanks", type: "organization", x_position: 800, y_position: 600 }
    ],
    edges: [
      // Club & Venue Connections
      { source: 0, target: 1, label: "Membership" },
      { source: 0, target: 2, label: "Regular Events" },
      { source: 0, target: 3, label: "Social Network" },
      { source: 0, target: 4, label: "Travel Network" },
      
      // Financial Services
      { source: 0, target: 5, label: "Banking Relations" },
      { source: 0, target: 6, label: "Wealth Planning" },
      { source: 0, target: 7, label: "Investment Advice" },
      { source: 0, target: 8, label: "Capital Access" },
      
      // Professional Services
      { source: 0, target: 9, label: "Legal Network" },
      { source: 0, target: 10, label: "Tax Planning" },
      { source: 0, target: 11, label: "Property Access" },
      { source: 0, target: 12, label: "Art Investment" },
      
      // Events
      { source: 0, target: 13, label: "Philanthropy" },
      { source: 0, target: 14, label: "Collections" },
      { source: 0, target: 15, label: "Luxury Events" },
      
      // Industry Leaders
      { source: 0, target: 16, label: "Tech Network" },
      { source: 0, target: 17, label: "Business Network" },
      { source: 0, target: 18, label: "Investment Network" },
      
      // Influencers
      { source: 0, target: 19, label: "Entertainment" },
      { source: 0, target: 20, label: "Media Relations" },
      { source: 0, target: 21, label: "Charitable Advice" },
      
      // Global Network
      { source: 0, target: 22, label: "Diplomatic Ties" },
      { source: 0, target: 23, label: "Global Events" },
      { source: 0, target: 24, label: "Think Tanks" },
      
      // Cross Connections
      { source: 1, target: 13, label: "Charity Events" },
      { source: 2, target: 17, label: "Business Meetings" },
      { source: 3, target: 19, label: "Elite Network" },
      { source: 5, target: 7, label: "Wealth Management" },
      { source: 9, target: 11, label: "Property Deals" },
      { source: 14, target: 12, label: "Art Market" },
      { source: 16, target: 18, label: "Tech Investment" },
      { source: 21, target: 23, label: "Global Impact" },
      { source: 20, target: 24, label: "Thought Leadership" }
    ]
  },
  {
    id: "gym-networking",
    name: "Gym Owner Network",
    description: "Build relationships with gym owners and fitness industry professionals",
    nodes: [
      // Center - You
      { name: "You", type: "person", x_position: 600, y_position: 300 },
      
      // Core Fitness Industry (Inner Circle)
      { name: "Independent Gym Owners", type: "organization", x_position: 300, y_position: 200 },
      { name: "Franchise Gyms", type: "organization", x_position: 900, y_position: 200 },
      { name: "Boutique Studios", type: "organization", x_position: 600, y_position: 100 },
      
      // Equipment & Suppliers (Top Layer)
      { name: "Equipment Suppliers", type: "organization", x_position: 100, y_position: 150 },
      { name: "Software Providers", type: "organization", x_position: 400, y_position: 50 },
      { name: "Supplement Companies", type: "organization", x_position: 800, y_position: 50 },
      { name: "Apparel Brands", type: "organization", x_position: 1100, y_position: 150 },
      
      // Professional Development (Left Side)
      { name: "Fitness Associations", type: "organization", x_position: 150, y_position: 400 },
      { name: "Industry Conferences", type: "event", x_position: 300, y_position: 500 },
      { name: "Certification Bodies", type: "organization", x_position: 150, y_position: 600 },
      
      // Staff & Training (Right Side)
      { name: "Personal Trainers", type: "person", x_position: 1050, y_position: 400 },
      { name: "Group Instructors", type: "person", x_position: 900, y_position: 500 },
      { name: "Fitness Educators", type: "person", x_position: 1050, y_position: 600 },
      
      // Marketing & Growth (Bottom Layer)
      { name: "Social Media Influencers", type: "person", x_position: 400, y_position: 550 },
      { name: "Local Athletes", type: "person", x_position: 600, y_position: 500 },
      { name: "Sports Teams", type: "organization", x_position: 800, y_position: 550 },
      
      // Support Services
      { name: "Insurance Providers", type: "organization", x_position: 200, y_position: 300 },
      { name: "Payment Processors", type: "organization", x_position: 1000, y_position: 300 },
      { name: "Legal Services", type: "organization", x_position: 700, y_position: 650 }
    ],
    edges: [
      // Core Industry Connections
      { source: 0, target: 1, label: "Collaborate" },
      { source: 0, target: 2, label: "Partnership" },
      { source: 0, target: 3, label: "Cross Promotion" },
      
      // Equipment & Supplier Relations
      { source: 
