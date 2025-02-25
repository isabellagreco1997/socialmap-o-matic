import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const templates = [
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
      { source: 0, target: 4, label: "Bulk Deals" },
      { source: 0, target: 5, label: "Tech Solutions" },
      { source: 0, target: 6, label: "Wholesale" },
      { source: 0, target: 7, label: "Merchandise" },
      
      // Professional Growth
      { source: 0, target: 8, label: "Membership" },
      { source: 0, target: 9, label: "Annual Events" },
      { source: 0, target: 10, label: "Certifications" },
      
      // Staff Network
      { source: 0, target: 11, label: "Hire/Train" },
      { source: 0, target: 12, label: "Classes" },
      { source: 0, target: 13, label: "Workshops" },
      
      // Marketing Channels
      { source: 0, target: 14, label: "Promotions" },
      { source: 0, target: 15, label: "Sponsorship" },
      { source: 0, target: 16, label: "Partnerships" },
      
      // Support Network
      { source: 0, target: 17, label: "Coverage" },
      { source: 0, target: 18, label: "Transactions" },
      { source: 0, target: 19, label: "Contracts" },
      
      // Cross-Network Connections
      { source: 1, target: 4, label: "Equipment Needs" },
      { source: 2, target: 5, label: "Management Systems" },
      { source: 3, target: 14, label: "Marketing" },
      { source: 8, target: 9, label: "Event Organization" },
      { source: 11, target: 13, label: "Training" },
      { source: 15, target: 16, label: "Local Events" },
      { source: 6, target: 14, label: "Product Placement" },
      { source: 7, target: 15, label: "Sponsorships" },
      { source: 17, target: 19, label: "Risk Management" }
    ]
  },
  {
    id: "sales",
    name: "Sales Pipeline",
    description: "Track leads, opportunities, and customer relationships",
    nodes: [
      { name: "Lead Generation", type: "organization", x_position: 100, y_position: 100 },
      { name: "Sales Qualification", type: "organization", x_position: 300, y_position: 100 },
      { name: "Proposal", type: "organization", x_position: 500, y_position: 100 },
      { name: "Negotiation", type: "organization", x_position: 700, y_position: 100 },
      { name: "Closed Won", type: "organization", x_position: 900, y_position: 100 }
    ],
    edges: [
      { source: 0, target: 1, label: "Qualified" },
      { source: 1, target: 2, label: "Interested" },
      { source: 2, target: 3, label: "Reviewing" },
      { source: 3, target: 4, label: "Agreement" }
    ]
  },
  {
    id: "business-dev",
    name: "Business Development",
    description: "Map partnerships and business opportunities",
    nodes: [
      { name: "Market Research", type: "organization", x_position: 100, y_position: 100 },
      { name: "Lead Identification", type: "organization", x_position: 300, y_position: 100 },
      { name: "Partnership Strategy", type: "organization", x_position: 500, y_position: 100 },
      { name: "Deal Structure", type: "organization", x_position: 700, y_position: 100 }
    ],
    edges: [
      { source: 0, target: 1, label: "Potential Partners" },
      { source: 1, target: 2, label: "Strategic Fit" },
      { source: 2, target: 3, label: "Terms" }
    ]
  },
  {
    id: "finance",
    name: "Financial Planning",
    description: "Visualize financial processes and investments",
    nodes: [
      { name: "Revenue Streams", type: "organization", x_position: 100, y_position: 100 },
      { name: "Cost Structure", type: "organization", x_position: 300, y_position: 100 },
      { name: "Investments", type: "organization", x_position: 500, y_position: 100 },
      { name: "Cash Flow", type: "organization", x_position: 700, y_position: 100 }
    ],
    edges: [
      { source: 0, target: 3, label: "Inflow" },
      { source: 1, target: 3, label: "Outflow" },
      { source: 2, target: 3, label: "Returns" }
    ]
  },
  {
    id: "marketing",
    name: "Marketing Campaign",
    description: "Plan and track marketing initiatives",
    nodes: [
      { name: "Campaign Planning", type: "organization", x_position: 100, y_position: 100 },
      { name: "Content Creation", type: "organization", x_position: 300, y_position: 100 },
      { name: "Channel Distribution", type: "organization", x_position: 500, y_position: 100 },
      { name: "Performance Analysis", type: "organization", x_position: 700, y_position: 100 }
    ],
    edges: [
      { source: 0, target: 1, label: "Brief" },
      { source: 1, target: 2, label: "Assets" },
      { source: 2, target: 3, label: "Metrics" }
    ]
  },
  {
    id: "org-chart",
    name: "Organizational Chart",
    description: "Create company structure and reporting lines",
    nodes: [
      { name: "CEO", type: "person", x_position: 400, y_position: 50 },
      { name: "CTO", type: "person", x_position: 200, y_position: 150 },
      { name: "CFO", type: "person", x_position: 400, y_position: 150 },
      { name: "CMO", type: "person", x_position: 600, y_position: 150 },
      { name: "Engineering", type: "organization", x_position: 200, y_position: 250 },
      { name: "Finance", type: "organization", x_position: 400, y_position: 250 },
      { name: "Marketing", type: "organization", x_position: 600, y_position: 250 }
    ],
    edges: [
      { source: 0, target: 1, label: "Reports to" },
      { source: 0, target: 2, label: "Reports to" },
      { source: 0, target: 3, label: "Reports to" },
      { source: 1, target: 4, label: "Manages" },
      { source: 2, target: 5, label: "Manages" },
      { source: 3, target: 6, label: "Manages" }
    ]
  }
];

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect: (template: any) => void;
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
