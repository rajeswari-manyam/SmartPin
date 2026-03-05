import { ReviewData } from "../services/api.service";

// ReviewData extended with a resolved display name
export type ReviewWithName = ReviewData & { resolvedName: string };