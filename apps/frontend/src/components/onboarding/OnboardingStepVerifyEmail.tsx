import React, { useState } from "react";

export default function OnboardingStepVerifyEmail({ onNext, user }: { onNext: () => void; user: any; }) {
    const [resending, setResending] = useState(false);
    const handleResend = async () => {
        setResending(true);
        // TODO: Call resend email API
        setTimeout(() => setResending(false), 1000);
    };
    return (
        <div className="flex flex-col w-full">
            <h2 className="text-2xl font-semibold mb-2">Verify your email</h2>
            <p className="mb-4 text-sm">We've sent an email for you to confirm your email. If you haven't received it, click 'Resend email' below. Otherwise, click 'Next'.</p>
            <div className="flex items-center mb-6">
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                    <span key={i} className={`mx-1 w-3 h-3 rounded-full ${i === 1 ? 'bg-black' : 'bg-gray-300'}`} />
                ))}
            </div>
            <div className="flex justify-end items-center gap-4">
                <button
                    className="text-black px-2 py-2 rounded disabled:opacity-50"
                    onClick={handleResend}
                    disabled={resending}
                >
                    {resending ? "Resending..." : "Resend Email"}
                </button>
                <button
                    className="bg-black text-white px-8 py-2 rounded-lg text-lg"
                    onClick={onNext}
                >
                    Next
                </button>
            </div>
        </div>
    );
} 