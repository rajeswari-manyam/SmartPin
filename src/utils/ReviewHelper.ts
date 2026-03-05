export const avatarColor = (name: string): string => {
    const colors = ["#00598a", "#2e7d32", "#c62828", "#6a1b9a", "#00695c", "#e65100", "#283593", "#558b2f"];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
};

export const fmtDate = (iso: string): string =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const ratingLabel = (rating: number): string =>
    ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating] || "";