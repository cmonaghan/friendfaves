
import { Person } from "@/utils/types";
import { Avatar as AvatarUI, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarProps {
  person: Person;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar = ({ person, showName = false, size = 'md', className }: AvatarProps) => {
  const avatarSize = 
    size === 'sm' ? 'h-8 w-8' : 
    size === 'md' ? 'h-10 w-10' : 
    'h-12 w-12';
  
  const textSize = 
    size === 'sm' ? 'text-xs' : 
    size === 'md' ? 'text-sm' : 
    'text-base';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn('flex items-center', className)}>
      <AvatarUI className={cn('rounded-full border', avatarSize)}>
        <AvatarImage src={person.avatar} alt={person.name} />
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {getInitials(person.name)}
        </AvatarFallback>
      </AvatarUI>
      {showName && (
        <span className={cn('ml-2 font-medium', textSize)}>{person.name}</span>
      )}
    </div>
  );
};

export default Avatar;
