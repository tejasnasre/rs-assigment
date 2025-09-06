import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { storeApi } from "../../api/store";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import type { StoreWithUserRating } from "../../types/store";

const UserStores: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [stores, setStores] = useState<StoreWithUserRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameFilter, setNameFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [newRating, setNewRating] = useState<number>(0);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Fetch stores with user ratings
  const fetchStores = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      const filters = {
        name: nameFilter || undefined,
        address: addressFilter || undefined,
      };

      const response = await storeApi.getStoresWithUserRating({
        userId: user.id,
        ...filters,
      });
      setStores(response.data);
    } catch (err) {
      console.error("Error fetching stores:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load stores. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally omitting fetchStores from dependency array to prevent infinite loops

  // Search with filters
  const handleSearch = () => {
    fetchStores();
  };

  // Reset filters
  const handleReset = () => {
    setNameFilter("");
    setAddressFilter("");
    fetchStores();
  };

  // View store details
  const handleViewStore = (storeId: string) => {
    navigate(`/user/stores/${storeId}`);
  };

  // Open rating dialog
  const handleOpenRatingDialog = (storeId: string) => {
    setSelectedStoreId(storeId);
    const store = stores.find((s) => s.id === storeId);
    setNewRating(store?.userRating || 0);
    setRatingDialogOpen(true);
  };

  // Submit or update rating
  const handleSubmitRating = async () => {
    if (!selectedStoreId || !user?.id || newRating < 1 || newRating > 5) {
      return;
    }

    setSubmittingRating(true);

    try {
      await storeApi.submitRating(user.id, {
        storeId: selectedStoreId,
        rating: newRating,
      });

      // Update local state
      setStores((prev) =>
        prev.map((store) =>
          store.id === selectedStoreId
            ? { ...store, userRating: newRating }
            : store
        )
      );

      setRatingDialogOpen(false);
    } catch (err) {
      console.error("Error submitting rating:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit rating. Please try again.");
      }
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Browse Stores</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="nameFilter">Store Name</Label>
          <Input
            id="nameFilter"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="addressFilter">Address</Label>
          <Input
            id="addressFilter"
            placeholder="Search by address..."
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
          />
        </div>
        <div className="flex items-end space-x-2">
          <Button onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            Reset
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center py-10">Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="text-center py-10">No stores found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="truncate">{store.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2 truncate">
                  {store.address}
                </p>
                <div className="flex items-center mb-2">
                  <span className="font-semibold mr-2">Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400 text-xl">
                        {star <= Math.round(store.overallRating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    (
                    {typeof store.overallRating === "number"
                      ? store.overallRating.toFixed(1)
                      : "0.0"}
                    ) from {store.ratingCount} ratings
                  </span>
                </div>
                {store.userRating ? (
                  <div className="flex items-center mt-4">
                    <span className="font-semibold mr-2">Your Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400 text-xl">
                          {star <= store.userRating! ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm italic mt-4">
                    You haven't rated this store yet
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleViewStore(store.id)}
                >
                  View Details
                </Button>
                <Button onClick={() => handleOpenRatingDialog(store.id)}>
                  {store.userRating ? "Update Rating" : "Rate Store"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stores.find((s) => s.id === selectedStoreId)?.userRating
                ? "Update Your Rating"
                : "Rate This Store"}
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

export default UserStores;
