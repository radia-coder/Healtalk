"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Heart, ArrowRight, MapPin, Star, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface Favorite {
  id: string;
  psychologistId: string;
  psychologist: {
    id: string;
    credentials: string;
    specializations: string[];
    rating: number;
    reviewCount: number;
    price60: number;
    user: {
      name: string;
      image: string | null;
    };
    hospital: {
      name: string;
      location: string;
    } | null;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(psychologistId: string) {
    if (!confirm("Remove from favorites?")) return;

    setRemoving(psychologistId);
    try {
      const csrfRes = await fetch("/api/security/csrf", { credentials: "include" });
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData?.csrfToken;

      if (!csrfToken) {
        alert("Unable to remove favorite. Please refresh and try again.");
        return;
      }

      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ psychologistId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove favorite");
      }

      // Remove from local state
      setFavorites((prev) => prev.filter((f) => f.psychologistId !== psychologistId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove favorite");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Favorite Psychologists
          </h1>
          <p className="text-gray-500">
            {loading
              ? "Loading favorites..."
              : favorites.length > 0
              ? `You have ${favorites.length} saved psychologist${favorites.length !== 1 ? "s" : ""}`
              : "Psychologists you've saved for quick access"}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-[24px]">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white border border-red-200 rounded-[24px]">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-[24px]">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Favorites Yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              You haven&apos;t saved any psychologists yet. Browse our list to find
              specialists that match your needs.
            </p>
            <Link href="/find-psychologists">
              <Button className="bg-[#5B6CFF] hover:bg-[#4a5ae0] gap-2 h-11 px-6">
                Find Psychologists <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white border border-gray-200 rounded-[24px] p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header with image and remove button */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {favorite.psychologist.user.image ? (
                        <Image
                          src={favorite.psychologist.user.image}
                          alt={favorite.psychologist.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {favorite.psychologist.user.name}
                      </h3>
                      <p className="text-sm text-gray-500">{favorite.psychologist.credentials}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(favorite.psychologistId)}
                    disabled={removing === favorite.psychologistId}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {removing === favorite.psychologistId ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </Button>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {favorite.psychologist.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({favorite.psychologist.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Location */}
                  {favorite.psychologist.hospital && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="truncate">{favorite.psychologist.hospital.location}</span>
                    </div>
                  )}

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2">
                    {favorite.psychologist.specializations.slice(0, 2).map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                    {favorite.psychologist.specializations.length > 2 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
                        +{favorite.psychologist.specializations.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-sm text-gray-900 font-semibold">
                    ${(favorite.psychologist.price60 / 100).toFixed(0)} per session
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/psychologists/${favorite.psychologistId}`} className="flex-1">
                    <Button className="w-full bg-[#5B6CFF] hover:bg-[#4a5ae0]">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
