import React, { useEffect, useState, useMemo } from "react";
import apiClient from "../../api/axios";
import {
  SortableTable,
  type SortableColumn,
  type SortDirection,
} from "../../components/ui/sortable-table";
import { Input } from "../../components/ui/input";
import { Link } from "react-router-dom";
import { StarIcon, Search } from "lucide-react";

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
  const [searchFilter, setSearchFilter] = useState("");
  const [searchFields, setSearchFields] = useState<string[]>([
    "name",
    "email",
    "address",
  ]);

  // Sorting
  const [sortKey, setSortKey] = useState<keyof Store | null>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter, searchFields]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      // Create query parameters for filtering
      const params = new URLSearchParams();

      if (searchFilter) {
        params.append("search", searchFilter);

        // Add search fields
        if (searchFields.length > 0) {
          params.append("searchFields", searchFields.join(","));
        }
      }

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

  // Handle search fields change
  const handleSearchFieldToggle = (field: string) => {
    if (searchFields.includes(field)) {
      // Remove field if already selected
      setSearchFields(searchFields.filter((f) => f !== field));
    } else {
      // Add field if not selected
      setSearchFields([...searchFields, field]);
    }
  };
  // Handle sort change
  const handleSort = (key: keyof Store | string) => {
    if (sortKey === key) {
      // Toggle direction if same key
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection("asc");
        setSortKey(key as keyof Store);
      }
    } else {
      // New sort key
      setSortKey(key as keyof Store);
      setSortDirection("asc");
    }
  };

  // Sort stores based on sort key and direction
  const sortedStores = useMemo(() => {
    if (!sortKey || !sortDirection) return stores;

    return [...stores].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null || aValue === undefined)
        return sortDirection === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined)
        return sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For numeric values like rating
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // For boolean values
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortDirection === "asc"
          ? aValue === bValue
            ? 0
            : aValue
            ? 1
            : -1
          : aValue === bValue
          ? 0
          : aValue
          ? -1
          : 1;
      }

      return 0;
    });
  }, [stores, sortKey, sortDirection]);

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

  // Define columns for the table
  const columns: SortableColumn<Store>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (store) => <div className="font-medium">{store.name}</div>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
    },
    {
      key: "averageRating",
      label: "Rating",
      sortable: true,
      render: (store) => renderRatingStars(store.averageRating),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (store) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            store.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {store.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (store) => (
        <div className="flex space-x-2">
          <Link
            to={`/admin/stores/${store.id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </Link>
        </div>
      ),
    },
  ];

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
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <div className="relative">
            <Input
              placeholder="Search stores..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-gray-500">Search in:</span>
            {[
              { id: "name", label: "Name" },
              { id: "email", label: "Email" },
              { id: "address", label: "Address" },
            ].map((field) => (
              <button
                key={field.id}
                onClick={() => handleSearchFieldToggle(field.id)}
                className={`px-2 py-1 text-xs rounded-full ${
                  searchFields.includes(field.id)
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {field.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">Loading stores...</div>
      ) : error ? (
        <div className="text-center text-red-500 p-8">{error}</div>
      ) : (
        <div className="bg-white rounded-md shadow">
          <div className="overflow-x-auto">
            <SortableTable
              data={sortedStores}
              columns={columns}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
              emptyMessage="No stores found"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresList;
