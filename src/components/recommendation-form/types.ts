
import { z } from "zod";
import { RecommendationType } from "@/utils/types";

export const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  type: z.nativeEnum(RecommendationType),
  recommenderId: z.string().min(1, { message: "Please select who recommended this" }),
  newFriendName: z.string().optional(),
  reason: z.string().optional(),
  source: z.string().optional(),
  customCategory: z.string().optional(),
});

export type RecommendationFormValues = z.infer<typeof formSchema>;
