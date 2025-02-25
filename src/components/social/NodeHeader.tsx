
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Building2, User, Edit, Trash2, ExternalLink } from 'lucide-react';
import { NodeData } from '@/types/network';

interface NodeHeaderProps {
  data: NodeData;
  onEdit: () => void;
  onDelete: () => void;
}

const NodeHeader = ({ data, onEdit, onDelete }: NodeHeaderProps) => {
  const getTypeIcon = () => {
    switch (data.type) {
      case 'person':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'organization':
        return <Building2 className="h-4 w-4 text-green-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'venue':
        return <MapPin className="h-4 w-4 text-red-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={data.imageUrl} />
        <AvatarFallback>{data.name ? data.name[0] : '?'}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <span className="font-medium">{data.name}</span>
        </div>
        {data.profileUrl && (
          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
          >
            View Profile
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {data.date && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(data.date).toLocaleDateString()}
          </span>
        )}
        {data.address && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {data.address}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={onDelete} className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NodeHeader;
