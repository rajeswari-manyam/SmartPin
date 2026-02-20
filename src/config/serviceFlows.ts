/**
 * Service Flow Configuration
 * Defines which services belong to Customer Flow (Listed Jobs) vs Worker Flow (My Business)
 */

export enum ServiceFlow {
  CUSTOMER_JOBS = 'customer_jobs',
  WORKER_SERVICES = 'worker_services',
}

// Customer Flow: Job cards posted by customers that workers can apply for
export const CUSTOMER_JOB_CATEGORIES = {
  AUTOMOTIVE: 9,
  PLUMBER: 3,
  HOME_PERSONAL: 10,
};

// Worker Flow: Service cards offered by workers
export const WORKER_SERVICE_CATEGORIES = {
  FOOD: 1,
  HOSPITAL: 2,
  HOTEL: 4,
  BEAUTY: 5,
  REAL_ESTATE: 6,
  SHOPPING: 7,
  EDUCATION: 8,
  DIGITAL: 12,
  PET: 13,
  EVENT: 14,
  INDUSTRIAL: 15,
  BUSINESS: 16,
  COURIER: 17,
  DAILY_WAGE: 18,
  AGRICULTURE: 19,
  CORPORATE: 20,
  WEDDING: 21,
  ART: 22,
  SPORTS: 6, // ✅ Added Sports (assuming id 6 based on pattern, verify in your DB)
};

/**
 * Check if a category belongs to customer flow
 */
export const isCustomerJobCategory = (categoryId: number): boolean => {
  return Object.values(CUSTOMER_JOB_CATEGORIES).includes(categoryId);
};

/**
 * Check if a category belongs to worker flow
 */
export const isWorkerServiceCategory = (categoryId: number): boolean => {
  return Object.values(WORKER_SERVICE_CATEGORIES).includes(categoryId);
};

/**
 * Get the flow type for a category
 */
export const getServiceFlow = (categoryId: number): ServiceFlow | null => {
  if (isCustomerJobCategory(categoryId)) return ServiceFlow.CUSTOMER_JOBS;
  if (isWorkerServiceCategory(categoryId)) return ServiceFlow.WORKER_SERVICES;
  return null;
};
