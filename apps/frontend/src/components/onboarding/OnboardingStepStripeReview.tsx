import React, { useState } from "react";

export default function OnboardingStepStripeReview({ onNext, user }: { onNext: () => void; user: any; }) {
    const [loading, setLoading] = useState(false);
    const handleReview = async () => {
        setLoading(true);
        // TODO: Call Stripe review API
        setTimeout(() => {
            setLoading(false);
            onNext();
        }, 1500);
    };
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full flex justify-center mb-4">
                <div className="bg-gray-300 w-[400px] h-[200px] rounded" />
            </div>
            <div className="w-full px-2">
                <h2 className="text-2xl font-semibold mb-2">Stripe needs more information</h2>
                <p className="mb-4 text-sm">Our records indicate that your Stripe account has been linked but Stripe may be requesting additional information from you.</p>
                <div className="flex items-center mb-6">
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <span key={i} className={i === 2 ? 'mx-1 w-3 h-3 rounded-full bg-black' : 'mx-1 w-3 h-3 rounded-full bg-gray-300'} />
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        className={"w-full bg-black text-white px-4 py-3 rounded-lg text-lg mb-2 disabled:bg-gray-400"}
                        onClick={handleReview}
                        disabled={loading}
                    >
                        {loading ? "Redirecting to Stripe Portal..." : "Review Stripe Account"}
                    </button>
                    <span className="text-black cursor-pointer" onClick={onNext}>Skip</span>
                </div>
            </div>
        </div>
    );
} 