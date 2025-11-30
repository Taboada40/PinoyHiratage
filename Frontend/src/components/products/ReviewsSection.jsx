import React from 'react';
import '../../styles/products/ReviewSection.css';

function ReviewsSection({ rating, totalReviews, reviews }) {
  const renderStars = (count) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={index < count ? 'star filled' : 'star empty'}>
        ★
      </span>
    ));
  };

  return (
    <div className="reviews-section">
      <h2 className="reviews-title">Reviews ({totalReviews})</h2>

      <div className="overall-rating">
        <span className="rating-score">{rating}/5</span>
        <div className="rating-stars">{renderStars(Math.floor(rating))}</div>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 && <p>No reviews yet. Be the first to review!</p>}

        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <div className="review-stars">{renderStars(review.rating)}</div>
              <span className="review-date">{review.date}</span>
            </div>
            <p className="review-author">By {review.author}</p>
            <div className="review-tags">
              {review.tags.map((tag, index) => (
                <span key={index} className="review-tag">{tag}</span>
              ))}
            </div>
            <p className="review-description">{review.description}</p>

            {/* Media Files */}
            {review.mediaFiles && review.mediaFiles.length > 0 && (
              <div className="review-media-container">
                {review.mediaFiles.map((media, idx) => {
                  const isVideo = media.type.startsWith("video");
                  return (
                    <div key={idx} className="review-media-card">
                      {isVideo ? (
                        <video src={media.url} controls />
                      ) : (
                        <img src={media.url} alt={`review media ${idx + 1}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewsSection;
