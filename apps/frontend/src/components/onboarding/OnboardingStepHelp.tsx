import { Button } from "../ui/button";

export default function OnboardingStepHelp({ onNext }: { onNext: () => void; }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full flex justify-center mb-4">
                <div className="bg-gray-300 w-[400px] h-[200px] rounded" />
            </div>
            <div className="w-full px-2">
                <h2 className="text-xl font-semibold mb-2">Need Help? Something wrong? Leave Feedback?</h2>
                <p className="mb-4 text-sm">Navigate to 'Help & Support' anytime you have any questions. If you found something wrong, anything we're missing, or just wanna provide feedback, you'll also be able to submit a ticket to us.</p>

                <div className="flex justify-between items-center gap-4 mt-6">
                    <div className="flex items-center">
                        {[0, 1, 2, 3, 4, 5, 6].map(i => (
                            <span key={i} className={`mx-1 w-3 h-3 rounded-full ${i === 6 ? 'bg-black' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                    <Button
                        type="button"
                        onClick={onNext}
                    >
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
} 