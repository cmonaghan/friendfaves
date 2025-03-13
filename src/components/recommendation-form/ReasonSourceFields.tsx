
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { RecommendationFormValues } from "./types";

interface ReasonSourceFieldsProps {
  form: UseFormReturn<RecommendationFormValues>;
}

export function ReasonSourceFields({ form }: ReasonSourceFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Why they recommended it (optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter their reason for recommending it"
                className="min-h-24"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
