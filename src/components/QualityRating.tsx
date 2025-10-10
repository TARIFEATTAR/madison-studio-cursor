import { Star } from "lucide-react";

interface QualityRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const QualityRating = ({ rating, onRatingChange }: QualityRatingProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">
        Content Quality
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className="transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-aged-brass/50 rounded"
            type="button"
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= rating
                  ? "fill-aged-brass text-aged-brass"
                  : "text-warm-gray/40 hover:text-aged-brass/60"
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-xs text-muted-foreground font-medium">
          {rating === 5 && "Exceptional"}
          {rating === 4 && "Premium"}
          {rating === 3 && "Quality"}
          {rating === 2 && "Refine"}
          {rating === 1 && "Draft"}
        </span>
      )}
    </div>
  );
};

export default QualityRating;
