/**
 * Extract digits from voice input text
 * Converts number words to digits and removes non-numeric characters
 */
export const extractDigits = (text: string): string => {
    const numberWords: Record<string, string> = {
        zero: "0",
        one: "1",
        two: "2",
        three: "3",
        four: "4",
        five: "5",
        six: "6",
        seven: "7",
        eight: "8",
        nine: "9",
        oh: "0",
    };

    let processed = text.toLowerCase();
    Object.keys(numberWords).forEach((word) => {
        processed = processed.replace(new RegExp(word, "g"), numberWords[word]);
    });

    return processed.replace(/\D/g, "");
};
