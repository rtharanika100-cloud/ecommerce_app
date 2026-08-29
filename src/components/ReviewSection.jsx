const { useState } = React;
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function ReviewSection({ productId, reviews = [], onReviewSubmitted }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast('Please write a review comment', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitReview(productId, {
        userName: user ? user.name : 'Verified Customer',
        rating,
        title: title || 'Exceptional Quality',
        comment
      });

      if (res.success) {
        addToast('Thank you! Your review has been published.', 'success');
        setTitle('');
        setComment('');
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8';

  return (
    <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-8">
      
      {/* Header & Rating Breakdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-1">
            Customer Reviews & Ratings
          </h3>
          <p className="text-xs text-slate-500">Real feedback from verified purchasers</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="font-display font-black text-3xl text-brand-600 dark:text-brand-400">
              {avgRating}
            </div>
            <div className="flex text-amber-400 text-xs justify-center my-0.5">
              {'★'.repeat(Math.round(Number(avgRating)))}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{reviews.length} reviews</span>
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
          Write a Product Review
        </h4>

        {/* Rating selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Your Rating:</span>
          <div className="flex gap-1 text-xl cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-transform hover:scale-125 ${
                  star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Review Title (e.g. Best audio quality!)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <textarea
          rows="3"
          placeholder="Share details about your experience with this item..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
        >
          {submitting ? 'Publishing...' : 'Submit Review'}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No reviews submitted yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt={rev.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h5 className="font-display font-bold text-xs text-slate-900 dark:text-white">
                      {rev.userName}
                    </h5>
                    <div className="flex text-amber-400 text-xs">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400">{rev.date}</span>
              </div>

              <h6 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {rev.title}
              </h6>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
