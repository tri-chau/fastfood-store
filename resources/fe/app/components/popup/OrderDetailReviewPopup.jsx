import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { formatDate } from '../../locales/dateFormat.js';
import { notify } from "../../layouts/Notification/notify.jsx";
import { usePopup } from "../../hooks/contexts/popupContext/popupState.jsx";
import { useTranslation } from "react-i18next";
import connectApi from "../../../settings/ConnectApi.js";

const OrderDetailReviewPopup = ({ isVisible, orderDetail, productId }) => {
    const [hasReview, setHasReview] = useState(false); // true if review exists
    const [editClicked, setEditClicked] = useState(false); // true if editing
    const [deleteClicked, setDeleteClicked] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);
    const [comment, setComment] = useState('');
    const [review, setReview] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const dispatch = useDispatch();
    const { closePopup, switchPopup, popupHistory } = usePopup();
    const { t } = useTranslation();

    // Simulate review data
    // const review = {
    //     rating: 4,
    //     comment: "Sản phẩm rất ngon, giá cả hợp lí, giao hàng nhanh chóng, rất hài lòng với sản phẩm này.",
    //     created_at: "2025-05-22T10:00:00.000000Z",
    //     is_edited: true,
    // };

    // Fetch review on mount or when productId changes
    useEffect(() => {
        if (isVisible && orderDetail) {
            getReview();
        }
        // eslint-disable-next-line
    }, [isVisible, productId]);

    // Fetch review from backend
    const getReview = async () => {
        try {
            const { data } = await connectApi.get('/api/customer/reviews/one-by-product', {
                params: { product_id: productId }
            });

            if (data && data.data) {
                setReview(data.data);
                setHasReview(true);
                setEditClicked(false);
                setSelectedRating(data.data.rating);
                setComment(data.data.comment);
            } else {
                setHasReview(false);
                setReview(null);
                setSelectedRating(0);
                setComment('');
            }
        } catch (error) {
            setHasReview(false);
            setReview(null);
            setSelectedRating(0);
            setComment('');
        }
    };

    // Submit review to backend
    const handleSubmitReview = async () => {
        if (selectedRating === 0) {
            notify('', t('REVIEWS.SELECT_RATING'));
            return;
        }
        if (!comment.trim()) {
            notify('', t('REVIEWS.PLACEHOLDER_COMMENT'));
            return;
        }
        try {
            if (hasReview && editMode && review?.id) {
                // Edit existing review
                await connectApi.put(`/api/customer/reviews/update/${review.id}`, {
                    product_id: productId,
                    order_detail_id: orderDetail.id,
                    rating: selectedRating,
                    comment: comment,
                    is_edited: true
                });
                notify('success', t('REVIEWS.SUBMISSION_SUCCEEDED'));
            } else {
                // Create new review
                await connectApi.post(`/api/customer/reviews/add`, {
                    product_id: productId,
                    order_detail_id: orderDetail.id,
                    rating: selectedRating,
                    comment: comment,
                    is_edited: false
                });
                notify('success', t('REVIEWS.SUBMISSION_SUCCEEDED'));
            }
            setEditMode(false);
            await getReview(); // Refresh review display
        } catch (error) {
            notify('error', t('REVIEWS.SUBMISSION_FAILED'));
        }
    };

    // Delete review from backend
    const handleDeleteReview = async () => {
        if (!review || !review.id) return;
        try {
            console.log('Review:', review);
            await connectApi.delete(`/api/customer/reviews/delete/${review.id}`);
            notify('success', t('REVIEWS.DELETE_SUCCEEDED'));
            setHasReview(false);
            setReview(null);
            setSelectedRating(0);
            setComment('');
            closePopup();
        } catch (error) {
            notify('error', t('REVIEWS.DELETE_FAILED'));
        }
    };

    const closeReview = () => {
        if (editClicked) {
            setEditClicked(false); // Return to complete popup
        } else if (popupHistory && popupHistory.length > 1) {
            const lastPopup = popupHistory[popupHistory.length - 2];
            switchPopup(lastPopup);
        } else {
            closePopup();
        }
    };

    const handleMouseEnterRating = (rating) => setHoveredRating(rating);
    const handleMouseLeaveRating = () => setHoveredRating(0);
    const handleClickRating = (rating) => setSelectedRating(rating);

    if (!isVisible) return null;

    // Show input popup if no review or editing
    const showInput = !hasReview || editClicked || editMode;

    return (
        <div onClick={closePopup} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                id="review-popup"
                className="top-20 z-99 right-25 w-[1200px] h-[550px] max-w-6xl px-5 py-5 overflow-y-auto transition-transform-translate-x-full bg-white dark:bg-gray-800 rounded-2xl border"
                onClick={e => e.stopPropagation()}
            >
                <div className="drawer-header flex justify-between items-center pl-0 pr-4 pt-0 pb-2">
                    <h2 className="flex justify-center text-3xl font-semibold text-[#9f1000]">{t('REVIEWS.REVIEW')}</h2>
                    <button onClick={closeReview} className="text-3xl">&times;</button>
                </div>
                <div className="flex w-full space-y-4 py-4 bg-white">
                    {/* Product image */}
                    <div className="w-[50%] min-w-[60px]">
                        <span className="text-[24px] font-semibold text-[#002a86]">{orderDetail.product_name} ({orderDetail.size})</span>
                        <img src={orderDetail.image ||'storage_fail/build/assets/Product/empty-image.png'}
                            alt="Product"
                            className="w-[400px] shadow-md rounded-lg aspect-square text-[#002a86]" />
                    </div>
                    <div className="w-[50%] px-5 pt-3">
                        {showInput ? (
                            <>
                                <div className="flex flex-wrap">
                                    <span className="text-[24px] text-[#002a86] font-semibold px-0 w-[50%]">{t("REVIEWS.RATING")}</span>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill={star <= (hoveredRating || selectedRating) ? 'gold' : 'gray'}
                                                className="w-8 h-8 cursor-pointer transition-all duration-200"
                                                onMouseEnter={() => handleMouseEnterRating(star)}
                                                onMouseLeave={handleMouseLeaveRating}
                                                onClick={() => handleClickRating(star)}
                                            >
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[24px] text-[#002a86] font-semibold px-0">{t("REVIEWS.COMMENT")}</span>
                                    <div>
                                        <textarea
                                            className="block p-2.5 w-full h-[200px] rounded-lg p-2 border border-[#002a86] focus:outline-none focus:ring-2 focus:ring-[#9f1000] focus:border-[#9f1000]"
                                            placeholder={t("REVIEWS.PLACEHOLDER_COMMENT")}
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            rows="4"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        className="bg-white font-bold px-6 text-[20px] rounded-lg transition-all mr-2"
                                        onClick={() => {
                                            setEditClicked(false);
                                            setEditMode(false);
                                            if (hasReview) {
                                                setSelectedRating(review.rating);
                                                setComment(review.comment);
                                            } else {
                                                setSelectedRating(0);
                                                setComment('');
                                                closePopup();
                                            }
                                        }}
                                    >
                                        {t("REVIEWS.CANCEL")}
                                    </button>
                                    <button
                                        className="bg-[#9f1000] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#d45560] transition-all"
                                        onClick={handleSubmitReview}
                                    >
                                        {editMode ? t("REVIEWS.EDIT") : t("REVIEWS.SUBMIT")}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-wrap">
                                    <span className="text-[24px] text-[#002a86] font-semibold px-0 w-[50%]">{t("REVIEWS.RATING")}</span>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill={star <= (review?.rating || 0) ? 'gold' : 'gray'}
                                                className="w-8 h-8"
                                            >
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col block py-5 pr-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg">
                                    <div className="flex w-full">
                                        <span className="flex w-full text-[18px] font-serif">
                                            {review?.comment}
                                        </span>
                                    </div>
                                    <div className="flex flex-row flex-wrap items-center justify-end mt-4 w-full">
                                        <span className="text-[18px] font-serif italic">
                                            {formatDate(review?.created_at)}
                                        </span>
                                        {review?.is_edited === 1 && (
                                            <span className="text-[18px] font-serif text-stone-300 ml-2">
                                                {"(edited)"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Delete and Edit Button */}
                                {!deleteClicked ? (
                                    <div className="relative flex justify-between mt-4 pr-10 w-full">
                                        <button
                                            className="bg-white text-[#9f1000] font-bold px-6 text-[20px] rounded-lg transition-all"
                                            onClick={() => setDeleteClicked(true)}
                                        >
                                            {t("REVIEWS.DELETE")}
                                        </button>
                                        <button
                                            className="bg-white font-bold px-6 text-[20px] rounded-lg transition-all"
                                            onClick={() => {
                                                setEditMode(true);
                                                setSelectedRating(review.rating);
                                                setComment(review.comment);
                                            }}
                                        >
                                            {t("REVIEWS.EDIT")}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative flex justify-end mt-4 pr-10 w-full">
                                        <span className="text-[18px] font-serif italic mr-2">
                                            {t("REVIEWS.DELETE_CONFIRM")}
                                        </span>
                                        <button
                                            className="bg-[#9f1000] text-white font-bold px-6 text-[20px] rounded-lg transition-all mr-2"
                                            onClick={handleDeleteReview}
                                        >
                                            {t("REVIEWS.CONFIRM")}
                                        </button>
                                        <button
                                            className="bg-gray-200 text-black font-bold px-6 text-[20px] rounded-lg transition-all"
                                            onClick={() => setDeleteClicked(false)}
                                        >
                                            {t("REVIEWS.CANCEL_CONFIRM")}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailReviewPopup;
