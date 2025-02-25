
import type { Database } from "@/integrations/supabase/types";

export type Network = Database['public']['Tables']['networks']['Row'];

export type NodeData = {
  type: "person" | "organization" | "event" | "venue";
  name: string;
  profileUrl?: string;
  imageUrl?: string;
  date?: string;
  address?: string;
};
