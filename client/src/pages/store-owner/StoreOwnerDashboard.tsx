import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { storeOwnerApi } from "../../api/storeOwner";
import type { Rating, Store } from "../../types/store";
import type { User } from "../../types/user";
import { Loader2 } from "lucide-react";

interface RatingWithUser extends Omit<Rating, "user"> {
  user: Pick<User, "id" | "name" | "email">;
}

interface StoreWithRatings extends Store {
  ratings: RatingWithUser[];
}

function StoreOwnerDashboard() {
  const [storeData, setStoreData] = useState<StoreWithRatings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const { data } = await storeOwnerApi.getStoreWithRatings();
        setStoreData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch store data:", err);
        setError("Failed to load store data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading store data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
        <p>
          No store found. Please contact support if you believe this is an
          error.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Store Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Store Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>{storeData.name}</CardTitle>
            <CardDescription>{storeData.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2">{storeData.email}</span>
            </div>
            {storeData.phone && (
              <div className="flex items-center mt-2">
                <span className="text-muted-foreground">Phone:</span>
                <span className="ml-2">{storeData.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Rating Card */}
        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
            <CardDescription>
              Based on {storeData.ratingCount} ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-5xl font-bold text-amber-500">
                {typeof storeData.overallRating === "number"
                  ? storeData.overallRating.toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-2xl ml-2 text-amber-500">/5</div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Count Card */}
        <Card>
          <CardHeader>
            <CardTitle>Total Reviews</CardTitle>
            <CardDescription>Users who rated your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-center">
              {storeData.ratingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ratings Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Ratings</CardTitle>
          <CardDescription>All user ratings for your store</CardDescription>
        </CardHeader>
        <CardContent>
          {storeData.ratings && storeData.ratings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeData.ratings.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {rating.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{rating.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {rating.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRatingVariant(rating.rating)}>
                        {rating.rating} / 5
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {rating.review ? (
                        rating.review
                      ) : (
                        <span className="text-muted-foreground italic">
                          No review provided
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              No ratings yet. Ratings will appear here when users rate your
              store.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to determine badge color based on rating
function getRatingVariant(
  rating: number
): "default" | "outline" | "secondary" | "destructive" {
  if (rating >= 4) return "default";
  if (rating >= 3) return "secondary";
  if (rating >= 2) return "outline";
  return "destructive";
}

export default StoreOwnerDashboard;
