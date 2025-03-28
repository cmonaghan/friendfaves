
import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { RecommendationType, CustomCategory } from "@/utils/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { RecommendationFormValues } from "./types";
import { useCustomCategories } from "@/hooks/useRecommendationQueries";
import { useAuth } from "@/contexts/AuthProvider";
import { AddCategoryDialog } from "@/components/categories/AddCategoryDialog";

interface TitleAndTypeFieldsProps {
  form: UseFormReturn<RecommendationFormValues>;
  onTypeChange: (value: string) => void;
}

export function TitleAndTypeFields({ form, onTypeChange }: TitleAndTypeFieldsProps) {
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newlyCreatedCategory, setNewlyCreatedCategory] = useState<string | null>(null);
  // Fetch custom categories from the database
  const { data: customCategories = [] } = useCustomCategories();
  const { user } = useAuth();
  
  const handleTypeChange = (value: string) => {
    if (value === RecommendationType.OTHER) {
      // Open the AddCategoryDialog when "Custom Category" is selected
      setShowAddCategoryDialog(true);
      return;
    }
    
    // Call the parent component's onTypeChange for other type selections
    onTypeChange(value);
  };

  // Function to handle when a new category is created
  const handleCategoryCreated = (categoryType: string) => {
    console.log("Category created, setting form value to:", categoryType);
    setNewlyCreatedCategory(categoryType);
    
    // When a new category is created, update the form field
    form.setValue("type", categoryType, {
      shouldValidate: false, // Prevent validation from being triggered
      shouldDirty: true,     // Mark field as dirty
      shouldTouch: true      // Mark field as touched
    });
    
    // Call parent onTypeChange to update any dependent state
    onTypeChange(categoryType);
  };
  
  // Handle dialog open/close
  const handleDialogOpenChange = (open: boolean) => {
    setShowAddCategoryDialog(open);
    
    if (!open) {
      // If dialog is closed and we have a newly created category, ensure it's selected
      if (newlyCreatedCategory) {
        console.log("Dialog closed with new category:", newlyCreatedCategory);
        
        // Set form value again when dialog closes to ensure it takes effect
        setTimeout(() => {
          form.setValue("type", newlyCreatedCategory, {
            shouldValidate: false,
            shouldDirty: true,
            shouldTouch: true
          });
          onTypeChange(newlyCreatedCategory);
          setNewlyCreatedCategory(null);
        }, 0);
      } 
      // If dialog is closed without a category being created, reset to default
      else if (form.getValues("type") === RecommendationType.OTHER) {
        form.setValue("type", RecommendationType.BOOK, {
          shouldValidate: false,
          shouldDirty: true,
          shouldTouch: true
        });
        onTypeChange(RecommendationType.BOOK);
      }
    }
  };

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
              onValueChange={handleTypeChange}
              defaultValue={field.value}
              value={field.value}
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
                
                {/* Render custom categories as options */}
                {customCategories.map((category: CustomCategory) => (
                  <SelectItem key={category.type} value={category.type}>
                    {category.label}
                  </SelectItem>
                ))}
                
                <SelectItem value={RecommendationType.OTHER}>
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>{user ? "Custom Category" : "Custom Category (Session Only)"}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Add the AddCategoryDialog component with onCategoryCreated handler */}
      <AddCategoryDialog 
        open={showAddCategoryDialog} 
        onOpenChange={handleDialogOpenChange}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}
