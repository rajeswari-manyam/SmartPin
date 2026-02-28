// ─── Review.service.ts ────────────────────────────────────────────────────────
// API service for all review-related operations

const BASE_URL = "http://192.168.1.3:3001";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ReviewUser {
    _id: string;
    email: string;
    name: string;
}

export interface ReviewWorker {
    _id: string;
    name: string;
    profilePic: string;
}

export interface ReviewData {
    _id: string;
    user: ReviewUser;
    worker: ReviewWorker;
    rating: number;
    review: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface StarRating {
    count: number;
    percentage: string;
}

export interface RatingBreakdown {
    "1_star": StarRating;
    "2_star": StarRating;
    "3_star": StarRating;
    "4_star": StarRating;
    "5_star": StarRating;
}

export interface AverageRatingData {
    averageRating: string;
    totalReviews: number;
    ratings: RatingBreakdown;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Add a new review for a worker
 */
export async function addReview({
    userId,
    workerId,
    rating,
    review,
}: {
    userId: string;
    workerId: string;
    rating: number;
    review: string;
}): Promise<{ success: boolean; message: string; data: ReviewData }> {
    const body = new URLSearchParams();
    body.append("userId", userId);
    body.append("workerId", workerId);
    body.append("rating", String(rating));
    body.append("review", review);

    const res = await fetch(`${BASE_URL}/addReview`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        redirect: "follow",
    });

    if (!res.ok) throw new Error(`addReview failed: ${res.status}`);
    return res.json();
}

/**
 * Get all reviews for a specific worker
 */
export async function getReviews(
    workerId: string
): Promise<{ success: boolean; count: number; data: ReviewData[] }> {
    const res = await fetch(
        `${BASE_URL}/getReviews?workerId=${encodeURIComponent(workerId)}`,
        { method: "GET", redirect: "follow" }
    );

    if (!res.ok) throw new Error(`getReviews failed: ${res.status}`);
    return res.json();
}

/**
 * Get a single review by its ID
 */
export async function getReviewById(
    reviewId: string
): Promise<{ success: boolean; data: ReviewData }> {
    const res = await fetch(
        `${BASE_URL}/getReviewById/${encodeURIComponent(reviewId)}`,
        { method: "GET", redirect: "follow" }
    );

    if (!res.ok) throw new Error(`getReviewById failed: ${res.status}`);
    return res.json();
}

/**
 * Get average rating and rating breakdown for a worker
 */
export async function getWorkerAverageRating(
    workerId: string
): Promise<{ success: boolean; data: AverageRatingData }> {
    const res = await fetch(
        `${BASE_URL}/getWorkerAverageRating?workerId=${encodeURIComponent(workerId)}`,
        { method: "GET", redirect: "follow" }
    );

    if (!res.ok) throw new Error(`getWorkerAverageRating failed: ${res.status}`);
    return res.json();
}

/**
 * Update an existing review
 */
export async function updateReview({
    reviewId,
    rating,
    review,
}: {
    reviewId: string;
    rating: number;
    review: string;
}): Promise<{ success: boolean; message: string; data: ReviewData }> {
    const body = new URLSearchParams();
    body.append("rating", String(rating));
    body.append("review", review);

    const res = await fetch(
        `${BASE_URL}/updateReview/${encodeURIComponent(reviewId)}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
            redirect: "follow",
        }
    );

    if (!res.ok) throw new Error(`updateReview failed: ${res.status}`);
    return res.json();
}

/**
 * Delete a review by ID
 */
export async function deleteReview(
    reviewId: string
): Promise<{ success: boolean; message: string }> {
    const res = await fetch(
        `${BASE_URL}/deleteReview/${encodeURIComponent(reviewId)}`,
        { method: "DELETE", redirect: "follow" }
    );

    if (!res.ok) throw new Error(`deleteReview failed: ${res.status}`);
    return res.json();
}