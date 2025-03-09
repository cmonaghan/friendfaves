
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RecommendationFormValues } from "./types";

interface CustomCategoryFieldProps {
  form: UseFormReturn<RecommendationFormValues>;
  isCustomCategory: boolean;
}

export function CustomCategoryField({ form, isCustomCategory }: CustomCategoryFieldProps) {
  if (!isCustomCategory) return null;
  
  return (
    <FormField
      control={form.control}
      name="customCategory"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Custom Category Name</FormLabel>
          <FormControl>
            <Input placeholder="E.g. Podcast, Board Game, etc." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
