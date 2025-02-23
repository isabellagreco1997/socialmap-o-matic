
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
  previewImage?: string;
  nodes: any[];
  edges: any[];
}

const templates: Template[] = [
  {
    id: "sales-pipeline",
    title: "Sales Pipeline",
    description: "Track leads, opportunities, and customer relationships",
    category: "Sales",
    previewImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    nodes: [
      {
        id: '1',
        type: 'social',
        position: { x: 250, y: 0 },
        data: { type: 'organization', name: 'Lead Company', imageUrl: '', todos: [] }
      },
      {
        id: '2',
        type: 'social',
        position: { x: 100, y: 100 },
        data: { type: 'person', name: 'Sales Rep', imageUrl: '', todos: [] }
      },
      {
        id: '3',
        type: 'social',
        position: { x: 400, y: 100 },
        data: { type: 'person', name: 'Decision Maker', imageUrl: '', todos: [] }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'custom' },
      { id: 'e1-3', source: '1', target: '3', type: 'custom' }
    ]
  },
  {
    id: "networking-event",
    title: "Networking Event",
    description: "Map connections made at conferences and events",
    category: "Networking",
    previewImage: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
    nodes: [
      {
        id: '1',
        type: 'social',
        position: { x: 250, y: 0 },
        data: { type: 'event', name: 'Industry Conference', date: '2024-05-15', imageUrl: '', todos: [] }
      },
      {
        id: '2',
        type: 'social',
        position: { x: 100, y: 100 },
        data: { type: 'person', name: 'Potential Partner', imageUrl: '', todos: [] }
      },
      {
        id: '3',
        type: 'social',
        position: { x: 400, y: 100 },
        data: { type: 'organization', name: 'Tech Company', imageUrl: '', todos: [] }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'custom' },
      { id: 'e1-3', source: '1', target: '3', type: 'custom' }
    ]
  },
  {
    id: "business-ecosystem",
    title: "Business Ecosystem",
    description: "Map your business partnerships and collaborations",
    category: "Business Development",
    previewImage: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    nodes: [
      {
        id: '1',
        type: 'social',
        position: { x: 250, y: 0 },
        data: { type: 'organization', name: 'Your Company', imageUrl: '', todos: [] }
      },
      {
        id: '2',
        type: 'social',
        position: { x: 100, y: 100 },
        data: { type: 'organization', name: 'Partner Company', imageUrl: '', todos: [] }
      },
      {
        id: '3',
        type: 'social',
        position: { x: 400, y: 100 },
        data: { type: 'organization', name: 'Supplier', imageUrl: '', todos: [] }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'custom' },
      { id: 'e1-3', source: '1', target: '3', type: 'custom' }
    ]
  },
  {
    id: "client-relationships",
    title: "Client Relationships",
    description: "Visualize key stakeholders and decision makers",
    category: "Account Management",
    previewImage: "https://images.unsplash.com/photo-1518005020951-eccb494ad742",
    nodes: [
      {
        id: '1',
        type: 'social',
        position: { x: 250, y: 0 },
        data: { type: 'organization', name: 'Client Organization', imageUrl: '', todos: [] }
      },
      {
        id: '2',
        type: 'social',
        position: { x: 100, y: 100 },
        data: { type: 'person', name: 'Account Manager', imageUrl: '', todos: [] }
      },
      {
        id: '3',
        type: 'social',
        position: { x: 400, y: 100 },
        data: { type: 'person', name: 'Client Stakeholder', imageUrl: '', todos: [] }
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
                      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                      onClick={() => onSelectTemplate(template)}
                    >
                      {template.previewImage && (
                        <div 
                          className="w-full h-32 bg-cover bg-center"
                          style={{ 
                            backgroundImage: `url(${template.previewImage})`,
                          }}
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-medium mb-2">{template.title}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
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
