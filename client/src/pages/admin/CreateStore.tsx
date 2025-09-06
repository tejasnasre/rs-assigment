import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { storeApi } from "../../api/store";
import { userApi } from "../../api/user";

// Create the validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(400, "Address must be less than 400 characters"),
  phone: z.string().optional(),
  description: z.string().optional(),
  ownerId: z.string().uuid("Please select a valid store owner"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateStore: React.FC = () => {
  const navigate = useNavigate();
  const [storeOwners, setStoreOwners] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      phone: "",
      description: "",
      ownerId: "",
    },
  });

  // Fetch store owners on component mount
  useEffect(() => {
    const fetchStoreOwners = async () => {
      setIsLoading(true);
      try {
        const owners = await userApi.getStoreOwners();
        setStoreOwners(owners as { id: string; name: string; email: string }[]);
      } catch (error) {
        console.error("Failed to fetch store owners:", error);
        toast.error("Failed to load store owners");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreOwners();
  }, []);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await storeApi.createStore(values);
      toast.success("Store created successfully");
      navigate("/admin/stores");
    } catch (error) {
      console.error("Failed to create store:", error);
      toast.error("Failed to create store");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Store</CardTitle>
        <CardDescription>
          Add a new store to the platform. The store will be assigned to the
          selected store owner.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter store name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter store email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter store phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Owner</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoading
                                ? "Loading store owners..."
                                : storeOwners.length > 0
                                ? "Select a store owner"
                                : "No store owners available"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {storeOwners.length > 0 ? (
                          storeOwners.map((owner) => (
                            <SelectItem key={owner.id} value={owner.id}>
                              {owner.name} ({owner.email})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No store owners available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter store address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter store description"
                      {...field}
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/stores")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Store"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateStore;
