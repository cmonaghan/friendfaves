
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { addCustomCategory } from "@/utils/storage";
import { queryKeys, useCustomCategories } from "@/hooks/useRecommendationQueries";
import { CategoryForm } from "./CategoryForm";
import { CategoryFormValues } from "./types";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: (categoryType: string) => void;
}

export function AddCategoryDialog({ open, onOpenChange, onCategoryCreated }: AddCategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: customCategories = [] } = useCustomCategories();
  
  const handleFormSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    
    try {
      const type = values.label.toLowerCase().replace(/\s+/g, '-');
      
      // Get the first unused color from our pool
      const unusedColor = getUnusedColor();
      
      const newCategory = {
        type,
        label: values.label,
        color: unusedColor,
        icon: values.icon || "HelpCircle"
      };
      
      const result = await addCustomCategory(newCategory);
      
      if (result) {
        if (user) {
          toast.success("Category added successfully to your account");
        } else {
          toast.success("Category added for this session");
        }
        
        queryClient.invalidateQueries({
          queryKey: queryKeys.customCategories
        });
        
        onOpenChange(false);
        
        // Call the onCategoryCreated callback if provided
        if (onCategoryCreated) {
          onCategoryCreated(type);
        }
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

  const handleCancel = () => {
    onOpenChange(false);
  };

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
        
        <CategoryForm 
          customCategories={customCategories}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          open={open}
        />
      </DialogContent>
    </Dialog>
  );
}

// Import at the end to avoid circular dependencies
import { colorOptions } from './types';
