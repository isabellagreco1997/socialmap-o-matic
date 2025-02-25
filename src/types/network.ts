
export type Network = Database['public']['Tables']['networks']['Row'];

export type NodeType = "person" | "organization" | "event" | "venue";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  [key: string]: unknown;
}

export interface NodeData {
  type: NodeType;
  name: string;
  profileUrl?: string;
  imageUrl?: string;
  date?: string;
  address?: string;
  contactDetails?: {
    notes?: string;
    [key: string]: unknown;
  };
  todos?: TodoItem[];
  [key: string]: unknown;
}
