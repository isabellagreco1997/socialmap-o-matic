
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Building2, User, Edit, Trash2, ExternalLink, Palette, Tag } from 'lucide-react';
import { NodeData } from '@/types/network';

interface NodeHeaderProps {
  data: NodeData;
  onEdit: () => void;
  onDelete: () => void;
  onColorChange: () => void;
  onTagsEdit: () => void;
}

const NodeHeader = ({ data, onEdit, onDelete, onColorChange, onTagsEdit }: NodeHeaderProps) => {
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

  const getBorderColor = () => {
    if (data.color) {
      return `border-2 border-${data.color}-500/40`;
    }
    
    switch (data.type) {
      case 'person':
        return 'border-blue-300/60';
      case 'organization':
        return 'border-green-300/60';
      case 'event':
        return 'border-purple-300/60';
      case 'venue':
        return 'border-red-300/60';
      default:
        return 'border-gray-300/60';
    }
  };

  // Get avatar style for custom color with transparency
  const getCustomAvatarStyle = () => {
    if (!data.color) return {};
    
    // Convert hex to rgba
    const hexToRgba = (hex: string, alpha: number = 0.5) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    return { 
      borderColor: hexToRgba(data.color, 0.5),
      boxShadow: `0 0 0 2px ${hexToRgba(data.color, 0.2)}`
    };
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar 
        className={`h-14 w-14 ring-2 ring-offset-2 ${getBorderColor()}`}
        style={getCustomAvatarStyle()}
      >
        <AvatarImage src={data.imageUrl} />
        <AvatarFallback className={`font-bold text-lg uppercase bg-white text-gray-700`}>
          {data.name ? data.name[0] : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <span className="font-medium text-base">{data.name}</span>
        </div>
        {data.profileUrl && (
          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors mt-0.5"
          >
            View Profile
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {data.date && (
          <span className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" />
            {new Date(data.date).toLocaleDateString()}
          </span>
        )}
        {data.address && (
          <span className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {data.address}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onTagsEdit} 
          className="h-8 w-8 rounded-full hover:bg-yellow-100 transition-colors duration-200"
          title="Edit tags"
        >
          <Tag className="h-4 w-4 text-yellow-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onColorChange} 
          className="h-8 w-8 rounded-full hover:bg-purple-100 transition-colors duration-200"
          title="Change node color"
        >
          <Palette className="h-4 w-4 text-purple-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onEdit} 
          className="h-8 w-8 rounded-full hover:bg-blue-100 transition-colors duration-200"
        >
          <Edit className="h-4 w-4 text-blue-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete} 
          className="h-8 w-8 rounded-full hover:bg-red-100 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
};

export default NodeHeader;
