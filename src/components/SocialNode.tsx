
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';

interface SocialNodeProps {
  data: {
    name: string;
    profileUrl: string;
    imageUrl: string;
  };
}

const SocialNode = ({ data }: SocialNodeProps) => {
  return (
    <Card className="min-w-[200px] p-4 bg-background/95 backdrop-blur">
      <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3" />
      
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={data.imageUrl} />
          <AvatarFallback>{data.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{data.name}</span>
          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
          >
            View Profile
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
};

export default SocialNode;
