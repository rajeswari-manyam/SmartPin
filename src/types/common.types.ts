// Common component props
export interface HeaderProps {
    onBack: () => void;
    onSkip: () => void;
}

export interface TitleSectionProps {
    title: string;
    subtitle: string;
}

export interface ContinueButtonProps {
    onContinue: () => void;
    disabled: boolean;
}
