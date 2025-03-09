
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { RecommendationType } from "@/utils/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { RecommendationFormValues } from "./types";

interface TitleAndTypeFieldsProps {
  form: UseFormReturn<RecommendationFormValues>;
  onTypeChange: (value: string) => void;
}

export function TitleAndTypeFields({ form, onTypeChange }: TitleAndTypeFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <Select
              onValueChange={onTypeChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={RecommendationType.BOOK}>Book</SelectItem>
                <SelectItem value={RecommendationType.MOVIE}>Movie</SelectItem>
                <SelectItem value={RecommendationType.TV}>TV Show</SelectItem>
                <SelectItem value={RecommendationType.RECIPE}>Recipe</SelectItem>
                <SelectItem value={RecommendationType.RESTAURANT}>Restaurant</SelectItem>
                <SelectItem value={RecommendationType.PODCAST}>Podcast</SelectItem>
                <SelectItem value={RecommendationType.OTHER}>
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Custom Category</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
