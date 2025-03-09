
import { z } from "zod";

export const categoryFormSchema = z.object({
  label: z.string().min(2, { message: "Category name must be at least 2 characters" }).max(30, { message: "Category name must be less than 30 characters" }),
  icon: z.string().default("HelpCircle"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const colorOptions = [
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
