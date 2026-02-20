import React from "react";

interface OTPInputBoxesProps {
    otp: string[];
    setOtp: React.Dispatch<React.SetStateAction<string[]>>;
    inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    isVerifying: boolean;
}

const OTPInputBoxes: React.FC<OTPInputBoxesProps> = ({
    otp,
    setOtp,
    inputRefs,
    isVerifying,
}) => {
    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split("");
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);

        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    return (
        <div className="flex justify-center gap-3 py-4">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isVerifying}
                    className={`w-14 h-16 text-center text-3xl font-bold bg-white border-b-2 transition-colors ${
                        digit
                            ? "text-gray-900 border-blue-600"
                            : "text-gray-400 border-gray-300"
                    } focus:outline-none focus:border-blue-600 focus:text-gray-900 ${
                        isVerifying ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    autoFocus={index === 0}
                />
            ))}
        </div>
    );
};

export default OTPInputBoxes;
