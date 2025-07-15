import { Button } from "../ui/button";

export default function OnboardingStepPreferences({ onNext, onSkip }: { onNext: () => void; onSkip: () => void; }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full flex justify-center mb-4">
                <div className="bg-gray-300 w-[400px] h-[200px] rounded" />
            </div>
            <div className="w-full px-2 space-y-2">
                <h2 className="text-xl font-semibold">Set Your Preferences</h2>
                <p className="text-sm">Navigate to 'Settings' to update your preferences such as email notifications, max client upload size, backup preferences, and more!</p>

                <div className="flex flex-row justify-between items-center gap-4 mt-6">
                    <div className="flex items-center">
                        {[0, 1, 2, 3, 4, 5, 6].map(i => (
                            <span key={i} className={`mx-1 w-3 h-3 rounded-full ${i === 5 ? 'bg-black' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <span className="text-black cursor-pointer" onClick={onSkip}>Skip</span>
                        <Button
                            type="button"

                            onClick={onNext}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 