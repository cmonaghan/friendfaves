
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryIconSelector, getIconComponent } from "./CategoryIconSelector";
import { CategoryFormValues, categoryFormSchema, colorOptions } from "./types";
import { CustomCategory } from "@/utils/types";

interface CategoryFormProps {
  customCategories: CustomCategory[];
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  open: boolean;
}

export function CategoryForm({ 
  customCategories, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  open 
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      label: "",
      icon: "HelpCircle"
    }
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        label: "",
        icon: "HelpCircle"
      });
    }
  }, [open, form]);

  // Function to get a color that's not already in use
  const getUnusedColor = () => {
    // Get the colors currently in use by default and custom categories
    const usedColors = new Set([
      "bg-blue-50", "bg-purple-50", "bg-pink-50", 
      "bg-green-50", "bg-amber-50", "bg-blue-100",
      ...customCategories.map(cat => cat.color || "")
    ]);
    
    // Find the first color from our options that's not in use
    const availableColor = colorOptions.find(color => !usedColors.has(color.value));
    
    // If all colors are used, return a default
    return availableColor?.value || "bg-gray-50";
  };

  const selectedIcon = form.watch("icon") || "HelpCircle";
  const SelectedIconComponent = getIconComponent(selectedIcon);
  const previewColor = getUnusedColor();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g. Podcasts, Board Games, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <CategoryIconSelector form={form} />
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
