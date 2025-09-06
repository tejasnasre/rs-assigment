import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { storeApi } from "../../api/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import type { Store, Rating } from "../../types/store";

const StoreView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [store, setStore] = useState<Store | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [storeRatings, setStoreRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newRating, setNewRating] = useState<number>(0);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!id) {
        setError("Store ID is required");
        setIsLoading(false);
        return;
      }

      if (!user?.id) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch store details
        const storeResponse = await storeApi.getStoreById(id);

        if (storeResponse.store) {
          setStore(storeResponse.store);

          // If the API also returned the user's rating
          if (storeResponse.userRating) {
            setUserRating(storeResponse.userRating.rating);
            setNewRating(storeResponse.userRating.rating);
          }
        } else {
          setError("Failed to load store details. Unexpected response format.");
          return;
        }

        // Fetch store ratings
        try {
          const ratingsResponse = (await storeApi.getRatingsForStore(id)) as {
            data: Rating[];
          };

          if (ratingsResponse.data) {
            setStoreRatings(ratingsResponse.data);

            // Get user's rating for this store if exists
            if (user?.id) {
              const userRatingObj = ratingsResponse.data.find(
                (rating) => rating.userId === user.id
              );

              if (userRatingObj) {
                setUserRating(userRatingObj.rating);
                setNewRating(userRatingObj.rating);
              }
            }
          }
        } catch {
          // We don't fail the whole component if just ratings fail
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load store details. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [id, user?.id]);

  // Open rating dialog
  const handleOpenRatingDialog = () => {
    setNewRating(userRating || 0);
    setRatingDialogOpen(true);
  };

  // Submit or update rating
  const handleSubmitRating = async () => {
    if (!id || !user?.id || newRating < 1 || newRating > 5) {
      return;
    }

    setSubmittingRating(true);

    try {
      // Check if user already has a rating for this store
      if (userRating) {
        // Update existing rating
        await storeApi.updateRating(id, newRating);
      } else {
        // Submit new rating
        await storeApi.submitRating(user.id, {
          storeId: id,
          rating: newRating,
        });
      }

      // Update local state
      setUserRating(newRating);

      // Refresh store data to get updated ratings
      const refreshedStoreResponse = await storeApi.getStoreById(id);
      if (refreshedStoreResponse.store) {
        setStore(refreshedStoreResponse.store);
      }

      const ratingsResponse = (await storeApi.getRatingsForStore(id)) as {
        data: Rating[];
      };
      setStoreRatings(ratingsResponse.data);

      setRatingDialogOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit rating. Please try again.");
      }
    } finally {
      setSubmittingRating(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading store details...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Button onClick={() => navigate("/user/stores")}>Back to Stores</Button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-10">Store not found</div>
        <Button onClick={() => navigate("/user/stores")}>Back to Stores</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate("/user/stores")}
      >
        ← Back to Stores
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Store Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">{store.name}</CardTitle>
            <CardDescription>{store.address}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {store.description && (
              <div>
                <h3 className="font-medium text-gray-500">Description</h3>
                <p>{store.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-500">Contact</h3>
              <p>{store.email}</p>
              {store.phone && <p>{store.phone}</p>}
            </div>

            <div>
              <h3 className="font-medium text-gray-500">Rating</h3>
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">
                      {star <= Math.round(store.overallRating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="ml-2">
                  (
                  {typeof store.overallRating === "number"
                    ? store.overallRating.toFixed(1)
                    : "0.0"}
                  ) from {store.ratingCount} ratings
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleOpenRatingDialog}>
              {userRating ? "Update Your Rating" : "Rate This Store"}
            </Button>
          </CardFooter>
        </Card>

        {/* User Rating Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rating</CardTitle>
          </CardHeader>
          <CardContent>
            {userRating ? (
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-2xl">
                      {star <= userRating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <p className="text-lg font-semibold">
                  You rated this store {userRating}/5
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  You haven't rated this store yet
                </p>
                <Button onClick={handleOpenRatingDialog}>Rate Now</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Other Ratings Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Ratings</h2>
        <Separator className="mb-4" />

        {storeRatings.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No ratings yet</p>
        ) : (
          <div className="space-y-4">
            {storeRatings.map((rating) => (
              <Card key={rating.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {rating.userId === user?.id
                          ? "Your rating"
                          : `User ${rating.userId.substring(0, 6)}...`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400">
                          {star <= rating.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>
                  {rating.review && <p className="mt-2">{rating.review}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userRating ? "Update Your Rating" : "Rate This Store"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rating">Your Rating (1-5)</Label>
            <div className="flex justify-center items-center py-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewRating(rating)}
                  className="mx-1 text-2xl focus:outline-none"
                >
                  <span
                    className={`${
                      newRating >= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRatingDialogOpen(false)}
              disabled={submittingRating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={submittingRating || newRating < 1}
            >
              {submittingRating ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreView;
