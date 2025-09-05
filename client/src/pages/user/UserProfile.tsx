import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../store/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Alert, AlertDescription } from "../../components/ui/alert";
import apiClient from "../../api/axios";

// Password update validation schema
const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(16, "Password must not exceed 16 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordUpdateFormValues = z.infer<typeof passwordUpdateSchema>;

const UserProfile: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordUpdateFormValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordUpdateFormValues) => {
    setSuccess(null);
    setError(null);
    setIsSubmitting(true);

    try {
      // Call the API to update password
      await apiClient.put("/user/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      // Reset form and show success message
      form.reset();
      setSuccess("Password updated successfully");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error updating password:", err);
      // Handle specific error messages
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        Please log in to view your profile
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-500">Name</h3>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Email</h3>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Address</h3>
                <p className="text-lg">
                  {user.address || "No address provided"}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Account Type</h3>
                <p className="text-lg capitalize">{user.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4 bg-green-50 border border-green-400 text-green-700">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4 bg-red-50 border border-red-400 text-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
