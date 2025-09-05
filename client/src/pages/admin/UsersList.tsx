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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  address: string | null;
  isActive: boolean;
}

const roleLabels: Record<string, string> = {
  system_administrator: "Admin",
  normal_user: "User",
  store_owner: "Store Owner",
};

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Create query parameters for filtering
        const params = new URLSearchParams();
        if (nameFilter) params.append("name", nameFilter);
        if (emailFilter) params.append("email", emailFilter);
        if (addressFilter) params.append("address", addressFilter);
        if (roleFilter && roleFilter !== "all")
          params.append("role", roleFilter);

        const response = await apiClient.get(
          `/admin/users?${params.toString()}`
        );
        setUsers(response.data.users);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [nameFilter, emailFilter, addressFilter, roleFilter]);

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
      case "role":
        setRoleFilter(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Link to="/admin/users/create">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-md shadow mb-6 p-4">
        <h2 className="text-lg font-medium mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <Select
              value={roleFilter}
              onValueChange={(value) => handleFilterChange("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="system_administrator">Admin</SelectItem>
                <SelectItem value="normal_user">User</SelectItem>
                <SelectItem value="store_owner">Store Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">Loading users...</div>
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
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.address || "—"}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/users/${user.id}`}
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

export default UsersList;
