
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Person } from "@/utils/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { RecommendationFormValues } from "./types";
import { UserPlus } from "lucide-react";

interface RecommenderFieldProps {
  form: UseFormReturn<RecommendationFormValues>;
  people: Person[];
  isAddingNewFriend: boolean;
  onRecommenderChange: (value: string) => void;
}

export function RecommenderField({ 
  form, 
  people, 
  isAddingNewFriend, 
  onRecommenderChange 
}: RecommenderFieldProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="recommenderId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recommended By</FormLabel>
            <Select
              onValueChange={onRecommenderChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
                <SelectItem value="new" className="text-primary">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Add new friend</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {isAddingNewFriend && (
        <FormField
          control={form.control}
          name="newFriendName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Friend's Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter their name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
