
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  nodes: any[];
  edges: any[];
}

const templates: Template[] = [
  {
    id: "team-structure",
    title: "Team Structure",
    description: "Visualize your team's organizational structure",
    category: "Organization",
    nodes: [
      {
        id: '1',
        type: 'social',
        position: { x: 250, y: 0 },
        data: { type: 'person', name: 'CEO', imageUrl: '', todos: [] }
      },
      {
        id: '2',
        type: 'social',
        position: { x: 100, y: 100 },
        data: { type: 'person', name: 'CTO', imageUrl: '', todos: [] }
      },
      {
        id: '3',
        type: 'social',
        position: { x: 400, y: 100 },
        data: { type: 'person', name: 'COO', imageUrl: '', todos: [] }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'custom' },
      { id: 'e1-3', source: '1', target: '3', type: 'custom' }
    ]
  },
  {
    id: "project-planning",
    title: "Project Planning",
    description: "Map out project stakeholders and milestones",
    category: "Project Management",
    nodes: [
      {
        id: '1',
        type: 'social',
        position: { x: 250, y: 0 },
        data: { type: 'event', name: 'Project Kickoff', date: '2024-04-01', todos: [] }
      },
      {
        id: '2',
        type: 'social',
        position: { x: 100, y: 100 },
        data: { type: 'person', name: 'Project Manager', todos: [] }
      },
      {
        id: '3',
        type: 'social',
        position: { x: 400, y: 100 },
        data: { type: 'organization', name: 'Client Company', todos: [] }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'custom' },
      { id: 'e1-3', source: '1', target: '3', type: 'custom' }
    ]
  },
  {
    id: "event-planning",
    title: "Event Planning",
    description: "Organize events and manage venues and attendees",
    category: "Events",
    nodes: [
      {
        id: '1',
        type: 'social',
        position: { x: 250, y: 0 },
        data: { type: 'event', name: 'Conference 2024', date: '2024-06-15', todos: [] }
      },
      {
        id: '2',
        type: 'social',
        position: { x: 100, y: 100 },
        data: { type: 'venue', name: 'Convention Center', address: '123 Main St', todos: [] }
      },
      {
        id: '3',
        type: 'social',
        position: { x: 400, y: 100 },
        data: { type: 'person', name: 'Event Coordinator', todos: [] }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'custom' },
      { id: 'e1-3', source: '1', target: '3', type: 'custom' }
    ]
  }
];

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Template) => void;
}

export function TemplatesDialog({
  open,
  onOpenChange,
  onSelectTemplate
}: TemplatesDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Templates</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="flex-1 pr-4">
          {categories.map(category => {
            const categoryTemplates = filteredTemplates.filter(t => t.category === category);
            if (categoryTemplates.length === 0) return null;

            return (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map(template => (
                    <Card
                      key={template.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onSelectTemplate(template)}
                    >
                      <h4 className="font-medium mb-2">{template.title}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
