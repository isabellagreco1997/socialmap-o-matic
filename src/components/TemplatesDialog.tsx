import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const templates = [
  {
    id: "real-estate-networking",
    name: "Real Estate Agent Network",
    description: "Build and maintain relationships with real estate professionals",
    nodes: [
      { name: "You", type: "person", x_position: 400, y_position: 50 },
      
      { name: "Local Brokers", type: "organization", x_position: 200, y_position: 150 },
      { name: "Property Managers", type: "organization", x_position: 400, y_position: 150 },
      { name: "Title Companies", type: "organization", x_position: 600, y_position: 150 },
      
      { name: "Real Estate Board", type: "organization", x_position: 100, y_position: 250 },
      { name: "Networking Events", type: "event", x_position: 300, y_position: 250 },
      { name: "Industry Conferences", type: "event", x_position: 500, y_position: 250 },
      
      { name: "Home Inspectors", type: "organization", x_position: 150, y_position: 350 },
      { name: "Mortgage Brokers", type: "organization", x_position: 350, y_position: 350 },
      { name: "Real Estate Attorneys", type: "organization", x_position: 550, y_position: 350 },
      
      { name: "Social Media", type: "organization", x_position: 200, y_position: 450 },
      { name: "Real Estate Platforms", type: "organization", x_position: 400, y_position: 450 },
      { name: "Local Forums", type: "organization", x_position: 600, y_position: 450 },
      
      { name: "Local Coffee Shops", type: "venue", x_position: 250, y_position: 550 },
      { name: "Co-working Spaces", type: "venue", x_position: 450, y_position: 550 },
      { name: "Community Centers", type: "venue", x_position: 650, y_position: 550 }
    ],
    edges: [
      { source: 0, target: 1, label: "Join Agencies" },
      { source: 0, target: 2, label: "Partner With" },
      { source: 0, target: 3, label: "Work With" },
      
      { source: 0, target: 4, label: "Member" },
      { source: 0, target: 5, label: "Attend Monthly" },
      { source: 0, target: 6, label: "Annual Events" },
      
      { source: 0, target: 7, label: "Trusted Partners" },
      { source: 0, target: 8, label: "Referral Network" },
      { source: 0, target: 9, label: "Legal Support" },
      
      { source: 0, target: 10, label: "Regular Posts" },
      { source: 0, target: 11, label: "Active Profile" },
      { source: 0, target: 12, label: "Community Engagement" },
      
      { source: 0, target: 13, label: "Weekly Meetings" },
      { source: 0, target: 14, label: "Work Sessions" },
      { source: 0, target: 15, label: "Community Events" },
      
      { source: 1, target: 5, label: "Agency Events" },
      { source: 2, target: 8, label: "Property Financing" },
      { source: 3, target: 9, label: "Legal Processing" },
      { source: 4, target: 6, label: "Industry Updates" },
      { source: 7, target: 11, label: "Reviews" },
      { source: 10, target: 12, label: "Cross Promotion" }
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
