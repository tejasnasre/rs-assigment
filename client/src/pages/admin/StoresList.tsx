import React, { useEffect, useState } from "react";
import apiClient from "../../api/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Link } from "react-router-dom";
import { StarIcon } from "lucide-react";

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  ownerId: string;
  isActive: boolean;
}

const StoresList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        // Create query parameters for filtering
        const params = new URLSearchParams();
        if (nameFilter) params.append("name", nameFilter);
        if (emailFilter) params.append("email", emailFilter);
        if (addressFilter) params.append("address", addressFilter);

        const response = await apiClient.get(
          `/admin/stores?${params.toString()}`
        );
        setStores(response.data.stores);
        setError(null);
      } catch (err) {
        console.error("Error fetching stores:", err);
        setError("Failed to load stores. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [nameFilter, emailFilter, addressFilter]);

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case "name":
        setNameFilter(value);
        break;
      case "email":
        setEmailFilter(value);
        break;
      case "address":
        setAddressFilter(value);
        break;
      default:
        break;
    }
  };

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stores Management</h1>
        <Link
          to="/admin/stores/create"
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Create Store
        </Link>
      </div>

      <div className="bg-white rounded-md shadow mb-6 p-4">
        <h2 className="text-lg font-medium mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              placeholder="Filter by name"
              value={nameFilter}
              onChange={(e) => handleFilterChange("name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              placeholder="Filter by email"
              value={emailFilter}
              onChange={(e) => handleFilterChange("email", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              placeholder="Filter by address"
              value={addressFilter}
              onChange={(e) => handleFilterChange("address", e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">Loading stores...</div>
      ) : error ? (
        <div className="text-center text-red-500 p-8">{error}</div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No stores found
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.email}</TableCell>
                    <TableCell>{store.address}</TableCell>
                    <TableCell>
                      {renderRatingStars(store.averageRating)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          store.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {store.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/stores/${store.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StoresList;
