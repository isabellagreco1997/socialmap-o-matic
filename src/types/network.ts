import type { Database } from "@/integrations/supabase/types";

export type Network = Database['public']['Tables']['networks']['Row'];

export type NodeType = "person" | "organization" | "event" | "venue";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  [key: string]: unknown;
}

export interface Tag {
  id: string;
  text: string;
  color?: string;
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
  tags?: Tag[];
  color?: string;
<<<<<<< HEAD
  [key: string]: unknown;
}

export interface EdgeData {
  label?: string;
  notes?: string;
  labelPosition?: string | number; // Allow both string and number types
=======
>>>>>>> a55cd2e (code)
  [key: string]: unknown;
}

export interface EdgeData {
  label?: string;
  notes?: string;
  labelPosition?: string | number;
  [key: string]: unknown;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  due_date?: string;
  created_at: string;
  updated_at: string;
}
