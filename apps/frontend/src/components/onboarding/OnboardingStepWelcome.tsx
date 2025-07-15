import { Button } from "../ui/button";

export default function OnboardingStepWelcome({ onNext }: { onNext: () => void; }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full flex justify-center mb-4">
                <div className="bg-gray-300 w-[400px] h-[200px] rounded" />
            </div>
            <div className="w-full px-2">
                <h2 className="text-2xl font-semibold mb-2">Welcome to Sonex!</h2>
                <p className="mb-4 text-sm">Discover a powerful collection of components designed to enhance your development workflow.</p>

                <div className="flex justify-between items-center gap-4 mt-6">
                    <div className="flex items-center ">
                        {[0, 1, 2, 3, 4, 5, 6].map(i => (
                            <span key={i} className={`mx-1 w-3 h-3 rounded-full ${i === 0 ? 'bg-black' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                    <Button
                        type="button"
                        onClick={onNext}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
} 