import React from "react";

export default function OnboardingStepAddClient({ onNext, onSkip }: { onNext: () => void; onSkip: () => void; }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full flex justify-center mb-4">
                <div className="bg-gray-300 w-[400px] h-[200px] rounded" />
            </div>
            <div className="w-full px-2">
                <h2 className="text-xl font-semibold mb-2">Create or Add Existing Client to Your New Project</h2>
                <p className="mb-4 text-sm">Once the project is created, navigate to 'Client Access', and type in the email address of your client. If they are not already added to you, click to add them. You'll be prompted to enter their name. Once done, we'll send an email to them with the access code.</p>
                <div className="flex items-center mb-6">
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <span key={i} className={`mx-1 w-3 h-3 rounded-full ${i === 4 ? 'bg-black' : 'bg-gray-300'}`} />
                    ))}
                </div>
                <div className="flex flex-row justify-between items-center gap-4">
                    <span className="text-black cursor-pointer" onClick={onSkip}>Skip</span>
                    <button
                        className="bg-black text-white px-8 py-2 rounded-lg text-lg"
                        onClick={onNext}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
} 