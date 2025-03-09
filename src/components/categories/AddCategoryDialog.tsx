
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { addCustomCategory } from "@/utils/storage";
import { queryKeys } from "@/hooks/useRecommendationQueries";

const colorOptions = [
  { value: "bg-blue-50", label: "Blue" },
  { value: "bg-purple-50", label: "Purple" },
  { value: "bg-pink-50", label: "Pink" },
  { value: "bg-green-50", label: "Green" },
  { value: "bg-amber-50", label: "Amber" },
  { value: "bg-red-50", label: "Red" },
  { value: "bg-orange-50", label: "Orange" },
  { value: "bg-teal-50", label: "Teal" },
  { value: "bg-gray-50", label: "Gray" }
];

const categoryFormSchema = z.object({
  label: z.string().min(2, { message: "Category name must be at least 2 characters" }).max(30, { message: "Category name must be less than 30 characters" }),
  color: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCategoryDialog({ open, onOpenChange }: AddCategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      label: "",
      color: "bg-gray-50"
    }
  });

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Format the type (lowercase, hyphenated version of the label)
      const type = values.label.toLowerCase().replace(/\s+/g, '-');
      
      // Create the new category
      const newCategory = {
        type,
        label: values.label,
        color: values.color || "bg-gray-50"
      };
      
      const result = await addCustomCategory(newCategory);
      
      if (result) {
        if (user) {
          toast.success("Category added successfully to your account");
        } else {
          toast.success("Category added for this session");
        }
        
        // Invalidate the custom categories query to refetch the updated data
        queryClient.invalidateQueries({
          queryKey: queryKeys.customCategories
        });
        
        // Close the dialog
        onOpenChange(false);
        
        // Reset the form
        form.reset();
      } else {
        toast.error("Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selected color preview styles
  const selectedColor = form.watch("color") || "bg-gray-50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            {user 
              ? "Create a custom category for your recommendations."
              : "Create a custom category for this session. Sign in to save it permanently."}
          </DialogDescription>
        </DialogHeader>
        
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
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Color</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map((color) => (
                      <div
                        key={color.value}
                        className={`${color.value} rounded-md p-2 cursor-pointer text-center transition-all ${
                          field.value === color.value ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
                        }`}
                        onClick={() => form.setValue("color", color.value)}
                      >
                        <span className="text-xs">{color.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center mt-2">
                    <div className={`w-5 h-5 rounded-full ${selectedColor} mr-2`} />
                    <span className="text-sm">Selected Color</span>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
