import { Button } from "../ui/button";

export default function OnboardingStepCreateProject({ onNext, onSkip }: { onNext: () => void; onSkip: () => void; }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full flex justify-center mb-4">
                <div className="bg-gray-300 w-[400px] h-[200px] rounded" />
            </div>
            <div className="w-full px-2">
                <h2 className="text-2xl font-semibold mb-2">Create a Project</h2>
                <p className="mb-4 text-sm">Click the +New button then add details to create a new project. Once you've created a project, we can add a client to it.</p>

                <div className="flex flex-row justify-between items-center gap-4">
                    <div className="flex items-center mb-6">
                        {[0, 1, 2, 3, 4, 5, 6].map(i => (
                            <span key={i} className={`mx-1 w-3 h-3 rounded-full ${i === 3 ? 'bg-black' : 'bg-gray-300'}`} />
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