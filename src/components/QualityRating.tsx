import { Star } from "lucide-react";

interface QualityRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const QualityRating = ({ rating, onRatingChange }: QualityRatingProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">
        Quality Rating
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className="transition-all duration-300 hover:scale-110 active:scale-95"
            type="button"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? "fill-saffron-gold text-saffron-gold"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-xs text-muted-foreground">
          {rating === 5 && "Master Vessel"}
          {rating === 4 && "Excellent"}
          {rating === 3 && "Good"}
          {rating === 2 && "Needs Refinement"}
          {rating === 1 && "Requires Rework"}
        </span>
      )}
    </div>
  );
};

export default QualityRating;
