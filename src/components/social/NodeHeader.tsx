import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Building2, User, Edit, Trash2, ExternalLink, Palette, Tag, CircleDashed, FileText } from 'lucide-react';
import { NodeData } from '@/types/network';
import { cn } from '@/lib/utils';

interface NodeHeaderProps {
  data: NodeData;
  onEdit: () => void;
  onDelete: () => void;
  onColorChange: () => void;
  onTagsEdit: () => void;
}

const NodeHeader = ({ data, onEdit, onDelete, onColorChange, onTagsEdit }: NodeHeaderProps) => {
  const getTypeConfig = () => {
    const configs = {
      person: { icon: User, color: 'blue' },
      organization: { icon: Building2, color: 'emerald' },
      event: { icon: Calendar, color: 'purple' },
      venue: { icon: MapPin, color: 'rose' },
      uncategorized: { icon: CircleDashed, color: 'slate' },
      text: { icon: FileText, color: 'amber' }
    };
    return configs[data.type] || configs.person;
  };

  const config = getTypeConfig();
  const TypeIcon = config.icon;

  // Get the color styles for the header
  const getHeaderStyle = () => {
    if (data.color) {
      return {
        backgroundColor: `${data.color}10`,
      };
    }
    return {};
  };

  // Default color classes based on node type
  const defaultColorClasses = {
    person: 'bg-blue-50/50',
    organization: 'bg-emerald-50/50',
    event: 'bg-purple-50/50',
    venue: 'bg-rose-50/50',
    uncategorized: 'bg-slate-50/50',
    text: 'bg-amber-50/50'
  };

  // Get the avatar style for custom colors
  const getAvatarStyle = () => {
    if (data.color) {
      return {
        borderColor: data.color,
      };
    }
    return {};
  };

  return (
    <div 
      className={cn(
        "p-4",
        !data.color && defaultColorClasses[data.type]
      )}
      style={getHeaderStyle()}
    >
      <div className="flex items-start gap-4">
        {/* Avatar Section */}
        <Avatar 
          className={cn(
            "h-12 w-12 border-2",
            !data.color && `border-${config.color}-200`
          )}
          style={getAvatarStyle()}
        >
          <AvatarImage src={data.imageUrl || ''} alt={data.name} />
          <AvatarFallback className="font-semibold bg-white">
            {data.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className={cn(
              "h-4 w-4",
              data.color ? "text-current" : `text-${config.color}-500`
            )} 
            style={data.color ? { color: data.color } : {}}
            />
            <h3 className="font-medium text-gray-900 truncate">{data.name}</h3>
          </div>

          <div className="space-y-1">
            {data.profileUrl && (
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors group"
              >
                View Profile
                <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </a>
            )}
            {data.date && (
              <div className="text-sm text-gray-600 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span className="truncate">{new Date(data.date).toLocaleDateString()}</span>
              </div>
            )}
            {data.address && (
              <div className="text-sm text-gray-600 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{data.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex gap-1 -mt-1 -mr-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTagsEdit}
            className="h-8 w-8 rounded-full hover:bg-yellow-100 hover:text-yellow-700"
            title="Edit tags"
          >
            <Tag className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onColorChange}
            className="h-8 w-8 rounded-full hover:bg-purple-100 hover:text-purple-700"
            title="Change color"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-700"
            title="Edit node"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-700"
            title="Delete node"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NodeHeader;
