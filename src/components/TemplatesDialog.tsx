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
    id: "virtual-family-office",
    name: "Virtual Family Office Network",
    description: "Comprehensive map of a modern virtual family office structure including wealth management, legal, tax, and operations",
    nodes: [
      // Core Family & Governance
      {
        name: "Family Council",
        type: "organization",
        x_position: 600,
        y_position: 300,
        notes: "Primary decision-making body for family matters"
      },
      // Wealth Management
      {
        name: "Chief Investment Officer",
        type: "person",
        x_position: 400,
        y_position: 200,
        notes: "Oversees investment strategy and portfolio management"
      },
      {
        name: "Portfolio Manager",
        type: "person",
        x_position: 800,
        y_position: 200,
        notes: "Manages day-to-day investment decisions"
      },
      {
        name: "Private Bank",
        type: "organization",
        x_position: 400,
        y_position: 100,
        notes: "Provides banking and lending services"
      },
      {
        name: "Investment Bank",
        type: "organization",
        x_position: 800,
        y_position: 100,
        notes: "Advises on M&A, capital raising, and other transactions"
      },
      // Legal & Tax
      {
        name: "Estate Planning Attorney",
        type: "person",
        x_position: 200,
        y_position: 300,
        notes: "Advises on estate planning and wealth transfer"
      },
      {
        name: "Tax Advisor",
        type: "person",
        x_position: 1000,
        y_position: 300,
        notes: "Provides tax planning and compliance services"
      },
      {
        name: "Trust Company",
        type: "organization",
        x_position: 200,
        y_position: 400,
        notes: "Administers trusts and provides fiduciary services"
      },
      {
        name: "Insurance Broker",
        type: "person",
        x_position: 1000,
        y_position: 400,
        notes: "Provides insurance solutions for risk management"
      },
      // Operations & Administration
      {
        name: "Family Office Manager",
        type: "person",
        x_position: 600,
        y_position: 400,
        notes: "Oversees day-to-day operations and administration"
      },
      {
        name: "Accountant",
        type: "person",
        x_position: 400,
        y_position: 500,
        notes: "Manages financial reporting and accounting"
      },
      {
        name: "Technology Provider",
        type: "organization",
        x_position: 800,
        y_position: 500,
        notes: "Provides technology solutions for data management"
      },
      {
        name: "Cybersecurity Firm",
        type: "organization",
        x_position: 600,
        y_position: 50,
        notes: "Protects family data and assets from cyber threats"
      },
      // Philanthropy
      {
        name: "Philanthropy Advisor",
        type: "person",
        x_position: 200,
        y_position: 200,
        notes: "Advises on charitable giving and foundation management"
      },
      {
        name: "Foundation Manager",
        type: "person",
        x_position: 1000,
        y_position: 200,
        notes: "Manages foundation operations and grantmaking"
      },
      // Lifestyle & Concierge
      {
        name: "Travel Agent",
        type: "person",
        x_position: 200,
        y_position: 500,
        notes: "Arranges travel and accommodations"
      },
      {
        name: "Concierge Service",
        type: "organization",
        x_position: 1000,
        y_position: 500,
        notes: "Provides personal assistance and lifestyle management"
      }
    ],
    edges: [
      // Governance
      { source: 0, target: 1, label: "Investment Oversight" },
      { source: 0, target: 5, label: "Estate Planning" },
      { source: 0, target: 9, label: "Operational Management" },
      // Wealth Management
      { source: 1, target: 2, label: "Portfolio Management" },
      { source: 1, target: 3, label: "Banking Services" },
      { source: 1, target: 4, label: "Investment Advice" },
      // Legal & Tax
      { source: 5, target: 7, label: "Trust Administration" },
      { source: 5, target: 6, label: "Tax Planning" },
      { source: 6, target: 8, label: "Insurance Solutions" },
      // Operations
      { source: 9, target: 10, label: "Financial Reporting" },
      { source: 9, target: 11, label: "Technology Solutions" },
      { source: 9, target: 12, label: "Cybersecurity" },
      // Philanthropy
      { source: 0, target: 13, label: "Charitable Giving" },
      { source: 13, target: 14, label: "Foundation Management" },
      // Lifestyle
      { source: 9, target: 15, label: "Travel Arrangements" },
      { source: 9, target: 16, label: "Personal Assistance" }
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
      { name: "Wind Turbine Manufacturer", type: "organization", x_position: 6
