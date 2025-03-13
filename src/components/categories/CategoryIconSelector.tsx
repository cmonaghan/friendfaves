
import { LucideIcon } from "lucide-react";
import { 
  Store, Headphones, PlaneTakeoff, MapPin, Music, Building, Gift, Newspaper, Binoculars, Rocket, HelpCircle 
} from 'lucide-react';
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CategoryFormValues } from "./types";

export const iconOptions = [
  { value: "PlaneTakeoff", label: "Travel", icon: PlaneTakeoff },
  { value: "MapPin", label: "Location", icon: MapPin },
  { value: "Music", label: "Music", icon: Music },
  { value: "Building", label: "Building", icon: Building },
  { value: "Gift", label: "Gift", icon: Gift },
  { value: "Newspaper", label: "News", icon: Newspaper },
  { value: "Binoculars", label: "Discover", icon: Binoculars },
  { value: "Store", label: "Store", icon: Store },
  { value: "Headphones", label: "Audio", icon: Headphones },
  { value: "Rocket", label: "Other", icon: Rocket }
];

// Helper function to get icon component by name
export const getIconComponent = (iconName: string): LucideIcon => {
  const iconOption = iconOptions.find(option => option.value === iconName);
  return iconOption?.icon || HelpCircle;
};

interface CategoryIconSelectorProps {
  form: UseFormReturn<CategoryFormValues>;
}

export function CategoryIconSelector({ form }: CategoryIconSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="icon"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category Icon</FormLabel>
          <div className="grid grid-cols-4 gap-2">
            {iconOptions.map((iconOption) => (
              <div
                key={iconOption.value}
                className={`rounded-md p-2 cursor-pointer text-center flex flex-col items-center transition-all ${
                  field.value === iconOption.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-primary/5"
                }`}
                onClick={() => form.setValue("icon", iconOption.value)}
              >
                <iconOption.icon size={24} />
                <span className="text-xs mt-1">{iconOption.label}</span>
              </div>
            ))}
          </div>
        </FormItem>
      )}
    />
  );
}
