import React from "react";

const ReviewSection = ({ reviews }) => (
    <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Đánh giá sản phẩm</h3>
        {reviews && reviews.length > 0 ? (
            reviews.map((review, idx) => (
                <div key={idx} className="mb-2 p-2 border rounded">
                    <div className="font-semibold">{review.user || "Ẩn danh"}</div>
                    <div className="text-yellow-500">{"★".repeat(review.rating || 5)}</div>
                    <div>{review.comment}</div>
                </div>
            ))
        ) : (
            <div>Chưa có đánh giá nào.</div>
        )}
    </div>
);

export default ReviewSection;