import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
} from "../ui/dialog";
import OnboardingStepWelcome from "./OnboardingStepWelcome";
import OnboardingStepVerifyEmail from "./OnboardingStepVerifyEmail";
import OnboardingStepStripe from "./OnboardingStepStripe";
import OnboardingStepCreateProject from "./OnboardingStepCreateProject";
import OnboardingStepAddClient from "./OnboardingStepAddClient";
import OnboardingStepPreferences from "./OnboardingStepPreferences";
import OnboardingStepHelp from "./OnboardingStepHelp";
import type { User } from "../../types/users";
import type { Project } from "../../types/projects";
import type { Client } from "../../hooks/useClients";

const TOTAL_STEPS = 7;

export default function OnboardingDialog({
    open,
    user,
    projects,
    clients,
    onComplete,
    forcePrompt = false,
}: {
    open: boolean;
    user: User;
    projects: Project[];
    clients: Client[];
    onComplete: () => void;
    forcePrompt?: boolean;
}) {
    const [step, setStep] = useState(0);
    const [show, setShow] = useState(open);

    useEffect(() => {
        setShow(open);
    }, [open]);

    // Step skipping logic
    useEffect(() => {
        if (step === 1 && user?.isVerified) setStep((s) => s + 1);
        if (step === 2 && user?.isConnectedToStripe) setStep((s) => s + 1);
        if (step === 3 && projects?.length > 0) setStep((s) => s + 1);
        if (step === 4 && clients?.length > 0) setStep((s) => s + 1);
    }, [step, user, projects, clients]);

    const handleNext = useCallback(() => {
        if (step < TOTAL_STEPS - 1) {
            setStep((s) => s + 1);
        } else {
            // Complete onboarding
            setShow(false);
            onComplete();
        }
    }, [step, onComplete]);

    const handleSkip = useCallback(() => {
        setShow(false);
        onComplete();
    }, [onComplete]);

    // Only allow closing if onboarding is complete or skipped
    const canClose = step === TOTAL_STEPS - 1;

    const renderStep = () => {
        switch (step) {
            case 0:
                return <OnboardingStepWelcome onNext={handleNext} />;
            case 1:
                return <OnboardingStepVerifyEmail onNext={handleNext} user={user} />;
            case 2:
                return <OnboardingStepStripe onNext={handleNext} user={user} />;
            case 3:
                return <OnboardingStepCreateProject onNext={handleNext} onSkip={handleSkip} />;
            case 4:
                return <OnboardingStepAddClient onNext={handleNext} onSkip={handleSkip} />;
            case 5:
                return <OnboardingStepPreferences onNext={handleNext} onSkip={handleSkip} />;
            case 6:
                return <OnboardingStepHelp onNext={handleNext} />;
            default:
                return null;
        }
    };

    return (
        <Dialog open={show}>
            <DialogContent showCloseButton={canClose}>
                {renderStep()}
            </DialogContent>
        </Dialog>
    );
} 