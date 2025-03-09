
import { useState } from 'react';
import { Search, Filter, Check, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RecommendationFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showCompleted: boolean;
  setShowCompleted: (value: boolean) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

const RecommendationFilters = ({
  searchQuery,
  setSearchQuery,
  showCompleted,
  setShowCompleted,
  sortOrder,
  setSortOrder,
}: RecommendationFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search recommendations"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter size={16} />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Show/Hide</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowCompleted(!showCompleted)}>
              <div className="flex items-center gap-2">
                {showCompleted && <Check size={16} />}
                <span className={!showCompleted ? 'ml-5' : ''}>
                  Completed Items
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setSortOrder('desc')}>
                <div className="flex items-center gap-2">
                  {sortOrder === 'desc' && <Check size={16} />}
                  <span className={sortOrder !== 'desc' ? 'ml-5' : ''}>
                    Newest First
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('asc')}>
                <div className="flex items-center gap-2">
                  {sortOrder === 'asc' && <Check size={16} />}
                  <span className={sortOrder !== 'asc' ? 'ml-5' : ''}>
                    Oldest First
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default RecommendationFilters;
