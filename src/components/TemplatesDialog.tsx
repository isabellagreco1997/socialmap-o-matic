import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Template {
  id: string;
  name: string;
  description: string;
  nodes: Array<{
    name: string;
    type: string;
    x_position: number;
    y_position: number;
    notes?: string;
    address?: string;
    date?: string;
    image_url?: string;
  }>;
  edges: Array<{
    source: number;
    target: number;
    label: string;
  }>;
}

const templates: Template[] = [
  {
    id: "london-startup-engineer",
    name: "London Startup Engineer Network",
    description: "Strategic network map for transitioning from Vodafone to London's startup ecosystem",
    nodes: [
      // Core Target - You
      { 
        name: "You (Junior Engineer)", 
        type: "person", 
        x_position: 600, 
        y_position: 300,
        notes: "Current: Vodafone Software Engineer"
      },
      
      // Target Companies
      { 
        name: "Revolut", 
        type: "organization", 
        x_position: 400, 
        y_position: 100,
        notes: "Fintech unicorn, rapid growth",
        address: "7 Westferry Circus, London"
      },
      { 
        name: "Monzo", 
        type: "organization", 
        x_position: 600, 
        y_position: 50,
        notes: "Digital bank, strong engineering culture",
        address: "Finsbury Square, London"
      },
      { 
        name: "Deliveroo", 
        type: "organization", 
        x_position: 800, 
        y_position: 100,
        notes: "Food delivery tech, scaling teams",
        address: "The River Building, London"
      },
      
      // Tech Recruiters
      { 
        name: "Talent.io", 
        type: "organization", 
        x_position: 300, 
        y_position: 200,
        notes: "Tech-focused recruiting platform"
      },
      { 
        name: "Hired", 
        type: "organization", 
        x_position: 900, 
        y_position: 200,
        notes: "Developer hiring marketplace"
      },
      
      // Hiring Managers
      { 
        name: "Engineering Managers", 
        type: "person", 
        x_position: 200, 
        y_position: 300,
        notes: "Target companies' tech leads on LinkedIn"
      },
      { 
        name: "Tech Recruiters", 
        type: "person", 
        x_position: 1000, 
        y_position: 300,
        notes: "Internal recruiters at target companies"
      },
      
      // Skill Development
      { 
        name: "CodeAcademy", 
        type: "organization", 
        x_position: 400, 
        y_position: 400,
        notes: "Modern web development courses"
      },
      { 
        name: "LeetCode", 
        type: "organization", 
        x_position: 800, 
        y_position: 400,
        notes: "Interview preparation platform"
      },
      
      // Events & Meetups
      { 
        name: "Silicon Milk Roundabout", 
        type: "event", 
        x_position: 300, 
        y_position: 500,
        date: "2024-05-18",
        notes: "Major London tech job fair",
        address: "The Old Truman Brewery, London"
      },
      { 
        name: "London Tech Week", 
        type: "event", 
        x_position: 900, 
        y_position: 500,
        date: "2024-06-10",
        notes: "Networking and company showcases"
      },
      
      // Community Spaces
      { 
        name: "Google for Startups", 
        type: "venue", 
        x_position: 500, 
        y_position: 200,
        address: "4-5 Bonhill St, London",
        notes: "Startup events and workshops"
      },
      { 
        name: "WeWork Moorgate", 
        type: "venue", 
        x_position: 700, 
        y_position: 200,
        address: "1 Fore St Ave, London",
        notes: "Tech meetup venue"
      },
      
      // Tech Communities
      { 
        name: "London Node User Group", 
        type: "organization", 
        x_position: 600, 
        y_position: 500,
        notes: "Monthly NodeJS meetups"
      },
      { 
        name: "React London", 
        type: "organization", 
        x_position: 400, 
        y_position: 600,
        notes: "React developer community"
      },
      
      // Online Platforms
      { 
        name: "LinkedIn", 
        type: "organization", 
        x_position: 200, 
        y_position: 400,
        notes: "Professional networking"
      },
      { 
        name: "GitHub", 
        type: "organization", 
        x_position: 1000, 
        y_position: 400,
        notes: "Portfolio and open source"
      },
      
      // Current Network
      { 
        name: "Vodafone Colleagues", 
        type: "person", 
        x_position: 300, 
        y_position: 350,
        notes: "Internal references and recommendations"
      },
      { 
        name: "Alumni Network", 
        type: "person", 
        x_position: 900, 
        y_position: 350,
        notes: "Ex-Vodafone in startups"
      },
      
      // Learning Resources
      { 
        name: "System Design Course", 
        type: "event", 
        x_position: 500, 
        y_position: 450,
        date: "2024-07-01",
        notes: "Online intensive course"
      },
      { 
        name: "Mock Interviews", 
        type: "event", 
        x_position: 700, 
        y_position: 450,
        date: "2024-06-15",
        notes: "Practice technical interviews"
      },
      
      // Industry News
      { 
        name: "TechCrunch", 
        type: "organization", 
        x_position: 400, 
        y_position: 250,
        notes: "Startup news and job postings"
      },
      { 
        name: "Stack Overflow", 
        type: "organization", 
        x_position: 800, 
        y_position: 250,
        notes: "Tech community and job board"
      }
    ],
    edges: [
      // Target Company Connections
      { source: 0, target: 1, label: "Apply" },
      { source: 0, target: 2, label: "Apply" },
      { source: 0, target: 3, label: "Apply" },
      
      // Recruiter Connections
      { source: 0, target: 4, label: "Profile" },
      { source: 0, target: 5, label: "Profile" },
      { source: 0, target: 6, label: "Connect" },
      { source: 0, target: 7, label: "Connect" },
      
      // Skill Development
      { source: 0, target: 8, label: "Learn" },
      { source: 0, target: 9, label: "Practice" },
      { source: 0, target: 20, label: "Study" },
      { source: 0, target: 21, label: "Practice" },
      
      // Event Participation
      { source: 0, target: 10, label: "Attend" },
      { source: 0, target: 11, label: "Network" },
      
      // Community Engagement
      { source: 0, target: 12, label: "Events" },
      { source: 0, target: 13, label: "Meetups" },
      { source: 0, target: 14, label: "Join" },
      { source: 0, target: 15, label: "Join" },
      
      // Online Presence
      { source: 0, target: 16, label: "Profile" },
      { source: 0, target: 17, label: "Portfolio" },
      
      // Current Network
      { source: 0, target: 18, label: "References" },
      { source: 0, target: 19, label: "Introductions" },
      
      // Industry Resources
      { source: 0, target: 22, label: "Research" },
      { source: 0, target: 23, label: "Community" },
      
      // Cross Connections
      { source: 6, target: 1, label: "Hiring" },
      { source: 7, target: 2, label: "Recruitment" },
      { source: 10, target: 3, label: "Showcase" },
      { source: 14, target: 12, label: "Venue" },
      { source: 15, target: 13, label: "Venue" },
      { source: 18, target: 19, label: "Network" },
      { source: 22, target: 1, label: "News" },
      { source: 23, target: 17, label: "Integration" }
    ]
  },
  {
    id: "london-vc-network",
    name: "London VC Network",
    description: "Map of London's venture capital ecosystem and startup community connections",
    nodes: [
      // Core Target - You
      { 
        name: "Your Startup", 
        type: "organization", 
        x_position: 600, 
        y_position: 300,
        notes: "Your company and immediate team"
      },
      
      // Tier 1 VCs
      { 
        name: "Index Ventures", 
        type: "organization", 
        x_position: 400, 
        y_position: 100,
        notes: "Major European VC, London office",
        address: "16 Great Portland Street, London"
      },
      { 
        name: "Atomico", 
        type: "organization", 
        x_position: 600, 
        y_position: 50,
        notes: "Founded by Skype co-founder",
        address: "The Stables, 2 Accelerator Building, London"
      },
      { 
        name: "Balderton Capital", 
        type: "organization", 
        x_position: 800, 
        y_position: 100,
        notes: "Series A specialist",
        address: "20 Balderton St, London"
      },
      
      // Seed VCs
      { 
        name: "LocalGlobe", 
        type: "organization", 
        x_position: 300, 
        y_position: 200,
        notes: "Seed-stage focus",
        address: "Phoenix Court, London"
      },
      { 
        name: "Seedcamp", 
        type: "organization", 
        x_position: 900, 
        y_position: 200,
        notes: "Pre-seed and seed specialist",
        address: "5 Bonhill Street, London"
      },
      
      // Angel Networks
      { 
        name: "Angel Investment Network", 
        type: "organization", 
        x_position: 200, 
        y_position: 300,
        notes: "Large angel investor platform"
      },
      { 
        name: "Cambridge Angels", 
        type: "organization", 
        x_position: 1000, 
        y_position: 300,
        notes: "Tech-focused angel group"
      },
      
      // Accelerators
      { 
        name: "Entrepreneur First", 
        type: "organization", 
        x_position: 400, 
        y_position: 400,
        notes: "Talent-first accelerator",
        address: "Block L, The Biscuit Factory, London"
      },
      { 
        name: "TechStars London", 
        type: "organization", 
        x_position: 800, 
        y_position: 400,
        notes: "Global accelerator network",
        address: "41 Luke St, London"
      },
      
      // Key Events
      { 
        name: "London Tech Week", 
        type: "event", 
        x_position: 300, 
        y_position: 500,
        date: "2024-06-10",
        notes: "Major tech conference"
      },
      { 
        name: "SaaStock", 
        type: "event", 
        x_position: 900, 
        y_position: 500,
        date: "2024-10-15",
        notes: "SaaS-focused conference"
      },
      
      // Co-Working Spaces
      { 
        name: "Second Home", 
        type: "venue", 
        x_position: 500, 
        y_position: 200,
        address: "68-80 Hanbury St, London",
        notes: "Popular with VCs and founders"
      },
      { 
        name: "Google Campus", 
        type: "venue", 
        x_position: 700, 
        y_position: 200,
        address: "4-5 Bonhill St, London",
        notes: "Startup hub and event space"
      },
      
      // Community Organizations
      { 
        name: "Tech Nation", 
        type: "organization", 
        x_position: 600, 
        y_position: 500,
        notes: "UK tech ecosystem support"
      },
      { 
        name: "Silicon Roundabout", 
        type: "organization", 
        x_position: 400, 
        y_position: 600,
        notes: "Tech community hub"
      },
      
      // Key People
      { 
        name: "Successful Founders", 
        type: "person", 
        x_position: 200, 
        y_position: 400,
        notes: "Previous successful exits"
      },
      { 
        name: "Angel Investors", 
        type: "person", 
        x_position: 1000, 
        y_position: 400,
        notes: "Active individual investors"
      },
      
      // Support Services
      { 
        name: "Tech Law Firms", 
        type: "organization", 
        x_position: 300, 
        y_position: 300,
        notes: "Specialist startup lawyers"
      },
      { 
        name: "Startup Accountants", 
        type: "organization", 
        x_position: 900, 
        y_position: 300,
        notes: "Financial/tax advisors"
      }
    ],
    edges: [
      // VC Connections
      { source: 0, target: 1, label: "Series A+" },
      { source: 0, target: 2, label: "Growth Stage" },
      { source: 0, target: 3, label: "Series A" },
      { source: 0, target: 4, label: "Seed Round" },
      { source: 0, target: 5, label: "Pre-seed" },
      
      // Angel Network Connections
      { source: 0, target: 6, label: "Early Investment" },
      { source: 0, target: 7, label: "Angel Rounds" },
      
      // Accelerator Relations
      { source: 0, target: 8, label: "Acceleration" },
      { source: 0, target: 9, label: "Mentorship" },
      
      // Event Participation
      { source: 0, target: 10, label: "Networking" },
      { source: 0, target: 11, label: "Conference" },
      
      // Space & Community
      { source: 0, target: 12, label: "Workspace" },
      { source: 0, target: 13, label: "Events" },
      { source: 0, target: 14, label: "Support" },
      { source: 0, target: 15, label: "Community" },
      
      // People Connections
      { source: 0, target: 16, label: "Mentorship" },
      { source: 0, target: 17, label: "Investment" },
      
      // Service Connections
      { source: 0, target: 18, label: "Legal" },
      { source: 0, target: 19, label: "Finance" },
      
      // Cross Connections
      { source: 8, target: 16, label: "Alumni Network" },
      { source: 9, target: 17, label: "Investor Network" },
      { source: 10, target: 14, label: "Organization" },
      { source: 12, target: 17, label: "Community" },
      { source: 13, target: 15, label: "Tech Hub" },
      { source: 1, target: 16, label: "Portfolio" },
      { source: 4, target: 8, label: "Pipeline" },
      { source: 5, target: 9, label: "Partnership" }
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
  }
];

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect: (template: Template) => void;
}

export function TemplatesDialog({
  open,
  onOpenChange,
  onTemplateSelect
}: TemplatesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => onTemplateSelect(template)}
            >
              <div className="font-medium">{template.name}</div>
              <div className="text-sm text-muted-foreground text-left">
                {template.description}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
