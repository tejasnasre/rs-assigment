import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { adminApi } from "../../api/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { Star, User, Mail, Phone, MapPin, Calendar, Info } from "lucide-react";

interface StoreDetailsData {
  store: {
    id: string;
    name: string;
    address: string;
    email: string;
    phone?: string;
    description?: string;
    averageRating: number;
    totalRatings: number;
    isActive: boolean;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  recentRatings: Array<{
    id: string;
    rating: number;
    review?: string;
    userId: string;
    createdAt: string;
  }>;
}

const StoreDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<StoreDetailsData | null>(null);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await adminApi.getStoreById(id);
        setStoreData(response.data);
      } catch (err) {
        console.error("Error fetching store details:", err);
        setError("Failed to load store details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Loading store details...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button asChild className="mt-4">
              <Link to="/admin/stores">Back to Stores</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Store not found</p>
            <Button asChild className="mt-4">
              <Link to="/admin/stores">Back to Stores</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { store, owner, recentRatings } = storeData;
  const formattedDate = new Date(store.createdAt).toLocaleDateString();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Store Details</h1>
        <Button asChild variant="outline">
          <Link to="/admin/stores">Back to Stores</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Store Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{store.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Badge variant={store.isActive ? "default" : "destructive"}>
                    {store.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">
                  {typeof store.averageRating === "number"
                    ? store.averageRating.toFixed(1)
                    : parseFloat(String(store.averageRating || 0)).toFixed(1)}
                </span>
                <span className="text-gray-500 text-sm">
                  ({store.totalRatings} reviews)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{store.email}</span>
                </div>
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{store.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Created on {formattedDate}</span>
                </div>
              </div>
              {store.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Description</span>
                  </div>
                  <p className="text-gray-700">{store.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle>Store Owner</CardTitle>
          </CardHeader>
          <CardContent>
            {owner ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{owner.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{owner.email}</span>
                </div>
                <Separator className="my-3" />
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/admin/users/${owner.id}`}>
                    View Owner Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">No owner assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRatings.length > 0 ? (
            <div className="space-y-4">
              {recentRatings.map((rating) => (
                <div key={rating.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">
                          User ID: {rating.userId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{rating.rating}</span>
                    </div>
                  </div>
                  {rating.review && (
                    <div className="mt-2 text-gray-700">{rating.review}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No ratings yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreDetails;
