import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecommendationType, Person } from "@/utils/types";
import { getPeople, addRecommendation, addPerson } from "@/utils/localStorage";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  type: z.nativeEnum(RecommendationType),
  recommenderId: z.string().min(1, { message: "Please select who recommended this" }),
  newFriendName: z.string().optional(),
  reason: z.string().min(5, { message: "Please add why they recommended it" }),
  notes: z.string().optional(),
  source: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddRecommendationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingNewFriend, setIsAddingNewFriend] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: RecommendationType.BOOK,
      recommenderId: "",
      newFriendName: "",
      reason: "",
      notes: "",
      source: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let recommender: Person;
      
      if (isAddingNewFriend && data.newFriendName) {
        const newPerson: Person = {
          id: uuidv4(),
          name: data.newFriendName,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
        };
        
        addPerson(newPerson);
        recommender = newPerson;
        console.log("Added new friend:", newPerson);
      } else {
        const people = getPeople();
        recommender = people.find(p => p.id === data.recommenderId)!;
      }
      
      const newRecommendation = {
        id: uuidv4(),
        title: data.title,
        type: data.type,
        recommender: recommender,
        reason: data.reason,
        notes: data.notes || undefined,
        source: data.source || undefined,
        date: new Date().toISOString().split('T')[0],
        isCompleted: false
      };
      
      addRecommendation(newRecommendation);
      console.log("Added recommendation:", newRecommendation);
      
      toast.success("Recommendation added successfully!");
      navigate("/recommendations");
    } catch (error) {
      toast.error("Failed to add recommendation. Please try again.");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecommenderChange = (value: string) => {
    if (value === "new") {
      setIsAddingNewFriend(true);
      form.setValue("recommenderId", "new");
    } else {
      setIsAddingNewFriend(false);
      form.setValue("recommenderId", value);
    }
  };

  const people = getPeople();

  return (
    <Card className="w-full max-w-lg mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Add New Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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
                        <SelectItem value={RecommendationType.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recommenderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommended By</FormLabel>
                    <Select
                      onValueChange={handleRecommenderChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {people.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new" className="text-primary">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            <span>Add new friend</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isAddingNewFriend && (
              <FormField
                control={form.control}
                name="newFriendName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Friend's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter their name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why they recommended it</FormLabel>
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

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Where to find it (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Netflix, Amazon, Local bookstore" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this recommendation"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Recommendation"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddRecommendationForm;
