// src/types/review.ts

/** 리뷰어 정보 */
export interface Reviewer {
  name: string;
  avatar: string;
  petInfo: string; // 예: "Golden Retriever, 2 years"
}

/** 개별 리뷰 */
export interface Review {
  id: string;
  reviewer: Reviewer;
  rating: number;
  content: string;
  date: string;
  images?: string[];
}

/** 리뷰 통계 */
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: string]: number };
}
