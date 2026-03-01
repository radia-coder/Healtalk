"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  reviews: Array<{
    id: string | number;
    patientName: string;
    rating: number;
    date: string;
    text: string;
    helpful: number;
    notHelpful: number;
  }>;
}

export default function ReviewsSection({ rating, reviewCount, reviews }: ReviewsSectionProps) {
  const [sortBy, setSortBy] = useState("Most Recent");

  // Calculate rating breakdown
  const ratingBreakdown = [
    { stars: 5, count: 85 },
    { stars: 4, count: 25 },
    { stars: 3, count: 8 },
    { stars: 2, count: 2 },
    { stars: 1, count: 0 },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-foreground mb-6">
        Patient Reviews
      </h2>

      {/* Rating Overview Card */}
      <div className="bg-background border border-border rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Overall Rating */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-accent fill-accent" size={32} />
              <span className="text-5xl font-bold text-foreground">{rating}</span>
              <span className="text-xl text-text-secondary">out of 5</span>
            </div>
            <p className="text-text-secondary">Based on {reviewCount} reviews</p>
          </div>

          {/* Rating Breakdown */}
          <div className="flex-grow">
            <h3 className="font-semibold text-foreground mb-3">Rating Breakdown</h3>
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 mb-2">
                <span className="text-sm w-12">{item.stars} ⭐</span>
                <div className="flex-grow h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(item.count / reviewCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-text-secondary w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-end mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary"
        >
          <option>Most Recent</option>
          <option>Most Helpful</option>
          <option>Highest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-card border border-border rounded-xl p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">{review.patientName[0]}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{review.patientName}</div>
                  <div className="text-sm text-text-secondary">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`${
                      i < review.rating ? "text-accent fill-accent" : "text-border"
                    }`}
                    size={16}
                  />
                ))}
              </div>
            </div>

            {/* Review Text */}
            <p className="text-foreground leading-relaxed mb-4">
              {review.text}
            </p>

            {/* Helpful Buttons */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-text-secondary">Helpful?</span>
              <Button variant="ghost" size="sm" className="gap-2">
                <ThumbsUp size={16} />
                {review.helpful}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <ThumbsDown size={16} />
                {review.notHelpful}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {reviews.length >= 3 && (
        <div className="text-center mt-6">
          <Button variant="outline" className="px-8">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}
