import type { SignUpData, User } from "../types/user";
import { UserRole } from "../types/user";

// Mock users data
let mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    address: "123 Admin St",
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Normal User",
    email: "user@example.com",
    address: "456 User Ave",
    role: UserRole.USER,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Store Owner",
    email: "owner@example.com",
    address: "789 Store Blvd",
    role: UserRole.STORE_OWNER,
    createdAt: new Date().toISOString(),
  },
];

for (let i = 4; i <= 20; i++) {
  const role =
    i % 3 === 0
      ? UserRole.STORE_OWNER
      : i % 2 === 0
      ? UserRole.USER
      : UserRole.ADMIN;

  mockUsers.push({
    id: i.toString(),
    name: `User ${i}`,
    email: `user${i}@example.com`,
    address: `${i}00 Mock Address`,
    role,
    createdAt: new Date().toISOString(),
  });
}

export const userApi = {
  getUsers: async (filters?: {
    name?: string;
    email?: string;
    address?: string;
    role?: string;
  }) => {
    // In a real app, this would be an actual API call with query params
    // return axios.get(`${API_URL}/users`, { params: filters });

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredUsers = [...mockUsers];

        if (filters) {
          if (filters.name) {
            filteredUsers = filteredUsers.filter((user) =>
              user.name.toLowerCase().includes(filters.name!.toLowerCase())
            );
          }

          if (filters.email) {
            filteredUsers = filteredUsers.filter((user) =>
              user.email.toLowerCase().includes(filters.email!.toLowerCase())
            );
          }

          if (filters.address) {
            filteredUsers = filteredUsers.filter((user) =>
              user.address
                .toLowerCase()
                .includes(filters.address!.toLowerCase())
            );
          }

          if (filters.role) {
            filteredUsers = filteredUsers.filter(
              (user) => user.role === filters.role
            );
          }
        }

        resolve({
          data: filteredUsers,
        });
      }, 500);
    });
  },

  getUserById: async (id: string) => {
    // In a real app, this would be an actual API call
    // return axios.get(`${API_URL}/users/${id}`);

    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find((u) => u.id === id);

        if (user) {
          resolve({
            data: user,
          });
        } else {
          reject({ message: "User not found" });
        }
      }, 300);
    });
  },

  createUser: async (data: SignUpData) => {
    // In a real app, this would be an actual API call
    // return axios.post(`${API_URL}/users`, data);

    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = mockUsers.find((u) => u.email === data.email);

        if (existingUser) {
          reject({ message: "User with this email already exists" });
        } else {
          const newUser: User = {
            id: (mockUsers.length + 1).toString(),
            name: data.name,
            email: data.email,
            address: data.address,
            role: data.role || UserRole.USER,
            createdAt: new Date().toISOString(),
          };

          mockUsers.push(newUser);

          resolve({
            data: newUser,
          });
        }
      }, 500);
    });
  },

  updateUser: async (id: string, data: Partial<User>) => {
    // In a real app, this would be an actual API call
    // return axios.put(`${API_URL}/users/${id}`, data);

    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex((u) => u.id === id);

        if (index !== -1) {
          mockUsers[index] = {
            ...mockUsers[index],
            ...data,
          };

          resolve({
            data: mockUsers[index],
          });
        } else {
          reject({ message: "User not found" });
        }
      }, 300);
    });
  },

  deleteUser: async (id: string) => {
    // In a real app, this would be an actual API call
    // return axios.delete(`${API_URL}/users/${id}`);

    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex((u) => u.id === id);

        if (index !== -1) {
          const deletedUser = mockUsers[index];
          mockUsers = mockUsers.filter((u) => u.id !== id);

          resolve({
            data: deletedUser,
          });
        } else {
          reject({ message: "User not found" });
        }
      }, 300);
    });
  },

  // Admin dashboard statistics
  getUserStats: async () => {
    // In a real app, this would be an actual API call
    // return axios.get(`${API_URL}/users/stats`);

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalUsers = mockUsers.length;
        const adminCount = mockUsers.filter(
          (u) => u.role === "system_administrator"
        ).length;
        const normalUserCount = mockUsers.filter(
          (u) => u.role === "normal_user"
        ).length;
        const storeOwnerCount = mockUsers.filter(
          (u) => u.role === "store_owner"
        ).length;

        resolve({
          data: {
            totalUsers,
            adminCount,
            normalUserCount,
            storeOwnerCount,
          },
        });
      }, 300);
    });
  },
};
