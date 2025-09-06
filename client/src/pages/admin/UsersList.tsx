import React, { useEffect, useState } from "react";
import apiClient from "../../api/axios";
import { adminApi } from "../../api/admin";
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
import { toast } from "sonner";

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
  const [updatingUserIds, setUpdatingUserIds] = useState<string[]>([]);

  // Filters
  const [searchFilter, setSearchFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Create query parameters for filtering
      const params = new URLSearchParams();
      if (searchFilter) params.append("search", searchFilter);
      if (roleFilter && roleFilter !== "all") params.append("role", roleFilter);

      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case "search":
        setSearchFilter(value);
        break;
      case "role":
        setRoleFilter(value);
        break;
      default:
        break;
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    // Check if already updating
    if (updatingUserIds.includes(userId)) return;

    // Add userId to updating list
    setUpdatingUserIds((prev) => [...prev, userId]);

    try {
      const response = await adminApi.updateUserRole(userId, newRole);

      if (response.data && response.data.user) {
        // Update the user in the list
        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, role: response.data.user.role }
              : user
          )
        );
        toast.success("User role updated successfully");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      // Remove userId from updating list
      setUpdatingUserIds((prev) => prev.filter((id) => id !== userId));
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Search by name, email or address"
              value={searchFilter}
              onChange={(e) => handleFilterChange("search", e.target.value)}
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
        <div className="bg-white rounded-md shadow h-[calc(100vh-20rem)] flex flex-col">
          <div className="overflow-auto flex-1">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-white">Name</TableHead>
                  <TableHead className="sticky top-0 bg-white">Email</TableHead>
                  <TableHead className="sticky top-0 bg-white">
                    Address
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white">Role</TableHead>
                  <TableHead className="sticky top-0 bg-white">
                    Status
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white">
                    Actions
                  </TableHead>
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
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {user.name}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {user.email}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {user.address || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
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
                          <Select
                            defaultValue={user.role}
                            onValueChange={(value) =>
                              handleRoleUpdate(user.id, value)
                            }
                            disabled={updatingUserIds.includes(user.id)}
                          >
                            <SelectTrigger className="w-32 h-7 text-xs">
                              <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal_user">
                                Normal User
                              </SelectItem>
                              <SelectItem value="store_owner">
                                Store Owner
                              </SelectItem>
                              <SelectItem value="system_administrator">
                                Administrator
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
        </div>
      )}
    </div>
  );
};

export default UsersList;
