import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../api/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { StarIcon } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  address: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
}

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
}

const roleLabels: Record<string, string> = {
  system_administrator: "Administrator",
  normal_user: "Normal User",
  store_owner: "Store Owner",
};

const UserDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await apiClient.get(`/admin/users/${userId}`);
        setUser(response.data.user);

        // If the user has stores, set them
        if (response.data.stores) {
          setStores(response.data.stores);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // Function to render stars based on rating
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarIcon
            key={`full-${i}`}
            className="h-4 w-4 text-yellow-500 fill-yellow-500"
          />
        ))}

        {hasHalfStar && (
          <div className="relative">
            <StarIcon className="h-4 w-4 text-gray-300 fill-gray-300" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        )}

        {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map(
          (_, i) => (
            <StarIcon
              key={`empty-${i}`}
              className="h-4 w-4 text-gray-300 fill-gray-300"
            />
          )
        )}

        <span className="ml-2 text-sm text-gray-600">
          {typeof rating === "number" ? rating.toFixed(1) : "0.0"} (
          {stores.find((s) => s.averageRating === rating)?.totalRatings || 0})
        </span>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading user details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="p-6 text-center">User not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-200">
              <div className="py-3 grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {user.name}
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {user.email}
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {user.address || "—"}
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "system_administrator"
                        ? "bg-purple-100 text-purple-800"
                        : user.role === "store_owner"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {roleLabels[user.role] || user.role}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-gray-200">
              <div className="py-3 grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">
                  Email Verification
                </dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.emailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </span>
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">
                  Registration Date
                </dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">
                  Last Login
                </dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Never"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {user.role === "store_owner" && (
        <Card>
          <CardHeader>
            <CardTitle>Stores</CardTitle>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <p className="text-gray-500">
                This store owner has no stores yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">
                        {store.name}
                      </TableCell>
                      <TableCell>{store.email}</TableCell>
                      <TableCell>{store.address}</TableCell>
                      <TableCell>
                        {renderRatingStars(store.averageRating)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDetails;
