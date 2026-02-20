









export const FOOD_SUBCATEGORIES = [
  "restaurants",
  "cafes",
  "bakeries",
  "street food",
  "juice shops",
  "sweet shops",
  "ice cream parlours",
  "catering services",
  "food delivery",
  "mess services",
];

// ========================================
// CATEGORY 2: HOSPITALS & HEALTHCARE
// ========================================
export const HOSPITAL_SUBCATEGORIES = [
  "hospitals",
  "clinics",
  "dental clinics",
  "eye hospitals",
  "dermatologists",
  "diagnostic labs",
  "blood banks",
  "ambulance services",
  "physiotherapy centres",
  "nursing services",
  "vet hospitals",
  "medical shops",
];

// ========================================
// CATEGORY 3: PLUMBERS & HOME REPAIR
// ========================================
export const PLUMBERS_SUBCATEGORIES = [
  "plumbers",
  "electricians",
  "carpenters",
  "painters",
  "painting contractors",
  "ac repair",
  "fridge repair",
  "washing machine repair",
  "water purifier service",
  "gas stove repair",
  "solar panel installation",
];

// ========================================
// CATEGORY 4: HOTELS & TRAVEL
// ========================================
export const HOTEL_SUBCATEGORIES = [
  "hotels",
  "budget hotels",
  "luxury hotels",
  "resorts",
  "lodges",
  "guest houses",
  "homestays",
  "service apartments",
  "hostels",
  "pg / paying guest",
  "travel agencies",
  "tour packages",
  "taxi services",
  "vehicle rentals",
  "bus ticket booking",
  "train ticket booking",
];

// ========================================
// CATEGORY 5: BEAUTY & WELLNESS
// ========================================
export const BEAUTY_SUBCATEGORIES = [
  "beauty parlours",
  "beauty-parlours",
  "beauty parlour",
  "salons",
  "salon",
  "spa & massage centres",
  "spa-&-massage-centres",
  "spa & massage",
  "spa",
  "massage centres",
  "massage",
  "makeup artists",
  "makeup-artists",
  "makeup artist",
  "mehendi artists",
  "mehendi-artists",
  "mehendi artist",
  "mehndi artists",
  "mehndi-artists",
  "fitness centres",
  "fitness-centres",

  "yoga centres",
  "yoga-centres",
  "yoga centre",
  "skin clinics",
  "skin-clinics",
  "skin clinic",
  "tattoo studios",
  "tattoo-studios",
  "tattoo studio",
];

// ========================================
// CATEGORY 6: REAL ESTATE & CONSTRUCTION
// ========================================
export const REAL_ESTATE_SUBCATEGORIES = [
  "property dealers",
  "property-dealers",
  "property",
  "dealers",
  "real estate agents",
  "real-estate-agents",
  "rent lease listings",
  "rent-lease-listings",
  "rent lease",
  "rent",
  "lease",
  "rental properties",
  "properties for rent",
  "builders developers",
  "builders-developers",
  "builders & developers",
  "builders",
  "developers",
  "construction companies",
  "architect services",
  "architect-services",
  "architects",
  "architectural services",
  "interior designers",
  "interior-designers",
  "interior",
  "interior design",
  "construction contractors",
  "construction-contractors",
  "construction",
  "contractors",
  "home construction",
];

// ========================================
// CATEGORY 7: SHOPPING & RETAIL
// ========================================
export const SHOPPING_SUBCATEGORIES = [
  "supermarkets",
  "supermarket",
  "clothing stores",
  "clothing-stores",
  "clothing",
  "cloth",
  "clothes",
  "garments",
  "apparel",
  "shoe shops",
  "shoe-shops",
  "shoes",
  "footwear",
  "mobile stores",
  "mobile-stores",
  "mobile",
  "phone stores",
  "electronics shops",
  "electronics-shops",
  "electronics",
  "electronic",
  "furniture stores",
  "furniture-stores",
  "furniture",
  "jewellery stores",
  "jewellery-stores",
  "jewellery showrooms",
  "jewellery",
  "jewelry",
  "jeweller",
  "stationery shops",
  "stationery-shops",
  "stationery",
  "stationary",
  "gift shops",
  "gift-shops",
  "gift",
  "gifts",
  "optical shops",
  "optical-shops",
  "optical",
  "opticals",
  "eyewear",
];

// ========================================
// CATEGORY 8: EDUCATION & TRAINING
// ========================================
export const EDUCATION_SUBCATEGORIES = [
  "schools",
  "colleges",
  "coaching centres",
  "coaching",
  "tuition teachers",
  "computer training institutes",
  "music & dance classes",
  "spoken english classes",
  "driving schools",
  "skill development centres",
];

// ========================================
// CATEGORY 9: AUTOMOTIVE SERVICES
// ========================================
export const AUTOMOTIVE_SUBCATEGORIES = [
  "car repair",
  "bike repair",
  "car wash",
  "bike wash",
  "automobile spare parts",
  "towing services",
];
// ========================================
// ✅ HOME & PERSONAL SERVICES - CORRECTED
// ========================================

export const HOME_PERSONAL_CATEGORY_MAP: Record<string, string[]> = {
  "maid-services": [
    "maid services",          // UI label from JSON
    "maid",
    "maids",
    "house maid",
    "domestic maid",
    "domestic help",
    "home maid",
    "full time maid",
    "part time maid",
  ],

  "cook-services": [
    "cook services",          // UI label from JSON
    "cook",
    "cooks",
    "home cook",
    "personal cook",
    "veg cook",
    "non veg cook",
    "chef",
    "home chef",
  ],

  "babysitters": [
    "babysitters",            // UI label from JSON
    "babysitter",
    "baby sitter",
    "baby care",
    "child care",
    "nanny",
    "nannies",
  ],

  "elderly-care": [
    "elderly care",           // UI label from JSON
    "old age care",
    "senior care",
    "caretaker",
    "patient care",
    "home nursing",
  ],

  "laundry-services": [
    "laundry services",       // UI label from JSON
    "laundry",
    "dry cleaning",
    "washing clothes",
    "cloth washing",
    "ironing",
    "ironing services",
    "steam press",
  ],

  "house-keeping-services": [
    "house keeping services", // UI label from JSON
    "house keeping",
    "housekeeping",
    "home cleaning",
    "house cleaning",
    "deep cleaning",
    "cleaning services",
  ],

  "water-can-supply": [
    "water can supply",       // UI label from JSON
    "water supply",
    "drinking water supply",
    "mineral water",
    "water can",
    "water cans",
    "water bottle supply",
    "20 litre water",
  ],
};

// ✅ CRITICAL: This array MUST match your JSON subcategories exactly (lowercase)
export const HOME_PERSONAL_SUBCATEGORIES = [
  "maid services",          // ← Matches JSON: "Maid Services"
  "cook services",          // ← Matches JSON: "Cook Services"
  "babysitters",            // ← Matches JSON: "Babysitters"
  "elderly care",           // ← Matches JSON: "Elderly Care"
  "laundry services",       // ← Matches JSON: "Laundry Services"
  "house keeping services", // ← Matches JSON: "House Keeping Services"
  "water can supply",       // ← Matches JSON: "Water Can Supply"
];

// ========================================
// TESTING: Add this helper to verify
// ========================================
export const testHomePersonalMatching = () => {
  const testCases = [
    "Maid Services",
    "Cook Services",
    "Babysitters",
    "Elderly Care",
    "Laundry Services",
    "House Keeping Services",
    "Water Can Supply",
  ];

  console.log("🧪 Testing HOME_PERSONAL matching:");
  testCases.forEach(testCase => {
    const slug = testCase.toLowerCase().trim();
    const slugWithDash = slug.replace(/\s+/g, "-");
    
    // Check array match
    const arrayMatch = HOME_PERSONAL_SUBCATEGORIES.includes(slug);
    
    // Check map keys match
    const mapKeyMatch = Object.keys(HOME_PERSONAL_CATEGORY_MAP).includes(slugWithDash);
    
    console.log(`  "${testCase}":`);
    console.log(`    - slug: "${slug}"`);
    console.log(`    - slugWithDash: "${slugWithDash}"`);
    console.log(`    - Array match: ${arrayMatch ? "✅" : "❌"}`);
    console.log(`    - Map key match: ${mapKeyMatch ? "✅" : "❌"}`);
  });
};
// ========================================
// CATEGORY 11: BUSINESS & PROFESSIONAL SERVICES
// ========================================
export const BUSINESS_SUBCATEGORIES = [
  "chartered accountant",
  "lawyers",
  "notary",
  "insurance agents",
  "marketing agencies",
  "printing & xerox shops",
  "printing & publishing services",
  "event planners",
  "placement services",
  "registration consultants",
];

// ========================================
// CATEGORY 12: TECH & DIGITAL SERVICES
// ========================================
export const TECH_DIGITAL_SUBCATEGORIES = [
  "mobile repair",
  "mobile-repair",
  "phone repair",
  "smartphone repair",
  "computer & laptop repair",
  "computer-&-laptop-repair",
  "computer-laptop-repair",
  "laptop repair",
  "laptop-repair",
  "computer repair",
  "cctv installation",
  "cctv-installation",
  "security system",
  "security-system",
  "surveillance",
  "software services",
  "software-services",
  "software development",
  "software-development",
  "website development",
  "website-development",
  "web development",
  "web-development",
  "internet website designers",
  "internet-website-designers",
  "website designers",
  "website-designers",
  "web designers",
  "digital marketing",
  "digital-marketing",
  "online marketing",
  "seo services",
  "graphic designers",
  "graphic-designers",
  "graphic design",
  "graphic-design",
  "designers",
];

// ========================================
// CATEGORY 13: PET SERVICES
// ========================================
export const PET_SERVICE_SUBCATEGORIES = [
  "pet shops",
  "pet grooming",
  "pet training",
  "pet clinics",
];

// ========================================
// CATEGORY 14: EVENTS & ENTERTAINMENT
// ========================================
export const EVENT_SUBCATEGORIES = [
  "dj services",
  "dj-services",
  "disc jockey",
  "disc-jockey",
  "dj",
  "party decorations",
  "party-decorations",
  "party decoration",
  "decorations",
  "mandap decorations",
  "mandap-decorations",
  "mandap decoration",
];

// ========================================
// CATEGORY 15: INDUSTRIAL & LOCAL SERVICES
// ========================================
export const INDUSTRIAL_SUBCATEGORIES = [
  "transporters",
  "water tank cleaning",
  "borewell services",
  "fabricators",
  "machine repair",
  "scrap dealers",
];

// ========================================
// CATEGORY 16: COURIER & LOGISTICS
// ========================================
export const COURIER_SUBCATEGORIES = [
  "courier offices",
  "courier-offices",
  "courier office",
  "courier",
  "courier services",
  "delivery services",
  "delivery-services",
  "delivery",
  "express delivery",
  "same day delivery",
  "parcel services",
  "parcel-services",
  "parcel",
  "parcels",
  "packers",
];

// ========================================
// CATEGORY 17: SPORTS & ACTIVITIES
// ========================================
export const SPORTS_SUBCATEGORIES = [
  "gyms",
  "gym",
  "fitness centres",
  "fitness centers",
  "fitness centres / gyms",
  "sports clubs",
  "sports club",
  "sports academy",
  "sports academies",
  "indoor play areas",
  "indoor play area",
  "indoor games",
  "stadiums",
  "stadium",
  "playgrounds",
  "playground",
  "badminton courts",
  "badminton court",
  "cricket grounds",
  "cricket ground",
  "football grounds",
  "football ground",
  "swimming pools",
  "swimming pool",
];

// ========================================
// CATEGORY 18: DAILY WAGE LABOUR HIRING
// ========================================
export const DAILY_WAGE_SUBCATEGORIES = [
  "construction labor",
  "loading workers",
  "cleaning helpers",
  "watchmen",
];

// ========================================
// CATEGORY 19: AGRICULTURE & FARMING
// ========================================
export const AGRICULTURE_SUBCATEGORIES = [
  "fertilizer shops",
  "fertiliser shops",
  "tractor rental",
  "seeds shops",
  "seed stores",
  "farming tools",
  "farm equipment",
  "irrigation equipment",
  "veterinary doctors",
  "animal doctors",
  "water pump repair",
  "motor pump repair",
];

// ========================================
// CATEGORY 20: CORPORATE & OFFICE SERVICES
// ========================================
export const CORPORATE_SUBCATEGORIES = [
  "background verification",
  "document courier",
  "office cleaning",
];

// ========================================
// CATEGORY 21: CREATIVE & ART SERVICES
// ========================================
export const ART_SERVICE_SUBCATEGORIES = [
  "painting artists",
  "painter artists",
  "artists",
  "caricature artists",
  "caricature artist",
  "portrait artists",
  "sketch artists",
  "handmade gift designers",
  "handmade gifts",
  "custom gifts",
  "craft designers",
  "wall murals",
  "wall mural artists",
  "mural painting",
  "wall painting",
  "craft training",
  "art classes",
  "painting classes",
  "drawing classes",
];

// ========================================
// CATEGORY 22: WEDDING & TRADITIONAL SERVICES
// ========================================
export const WEDDING_SUBCATEGORIES = [
  "wedding planners",
  "wedding-planners",
  "wedding planner",
  "wedding planning",
  "marriage planners",
  "marriage planner",
  "event coordination",
  "poojari",
  "pandits / poojari",
  "pandits-/-poojari",
  "pandits/poojari",
  "pandit",
  "pandits",
  "priest services",
  "priest",
  "wedding priest",
  "hindu priest",
  "pooja services",
  "puja services",
  "band / music team",
  "band-/-music-team",
  "band/music team",
  "band",
  "bands",
  "music band",
  "wedding band",
  "wedding bands",
  "live band",
  "nadaswaram",
  "nadaswaram team",
  "wedding music",
  "music team",
  "shehnai",
  "baraat band",
  "flower decoration",
  "flower-decoration",
  "flower decorations",
  "floral decoration",
  "floral decorations",
  "wedding decoration",
  "wedding decorations",
  "mandap decoration",
  "stage decoration",
  "stage decorations",
  "wedding stage",
  "event decoration",
  "sangeet choreographers",
  "sangeet-choreographers",
  "sangeet choreographer",
  "sangeet choreography",
  "wedding choreographers",
  "wedding choreographer",
  "dance choreographers",
  "dance choreographer",
  "choreographer",
  "choreographers",
  "wedding dance",
  "sangeet dance",
  "bridal choreography",
];

// ========================================
// COMBINED ARRAYS FOR ROUTING
// ========================================

export const PLACE_SUBCATEGORIES = [
  // Category 1: Restaurants & Food
  ...FOOD_SUBCATEGORIES,

  // Category 2: Hospitals & Healthcare
  ...HOSPITAL_SUBCATEGORIES,

  // Category 4: Hotels & Travel
  ...HOTEL_SUBCATEGORIES,

  // Category 5: Beauty & Wellness
  "beauty parlours",
  "salons",
  "spa & massage centres",
  "makeup artists",
  "mehendi artists",
  "fitness centres / gyms",
  "yoga centres",
  "skin clinics",
  "tattoo studios",

  // Category 6: Real Estate & Construction
  "property dealers",
  "rent lease listings",
  "builders developers",
  "architect services",
  "interior designers",
  "construction contractors",

  // Category 7: Shopping & Retail
  "supermarkets",
  "clothing stores",
  "shoe shops",
  "mobile stores",
  "electronics shops",
  "furniture stores",
  "jewellery stores",
  "stationery shops",
  "gift shops",
  "optical shops",

  // Category 8: Education & Training
  ...EDUCATION_SUBCATEGORIES,

  // Category 13: Pet Services (Places)
  "pet shops",
  "pet clinics",

  // Category 16: Courier & Logistics (Places)
  "courier offices",
  "parcel services",
  "packers",

  // Category 17: Sports & Activities
  "gyms",
  "sports clubs",
  "indoor play areas",
  "stadiums",

  // Category 19: Agriculture & Farming (Places)
  "fertilizer shops",
  "seeds shops",
  "farming tools",

  // Category 22: Wedding Services (Places)
  "wedding-planners",
  "pandits",
  "wedding-bands",
  "flower-decoration",
  "sangeet-choreographers",
];

export const WORKER_SUBCATEGORIES = [
  // Category 3: Plumbers & Home Repair
  ...PLUMBERS_SUBCATEGORIES,

  // Category 10: Home & Personal Services
  ...HOME_PERSONAL_SUBCATEGORIES,

  // Category 11: Business & Professional Services
  ...BUSINESS_SUBCATEGORIES,

  // Category 12: Tech & Digital Services
  "mobile repair",
  "computer & laptop repair",
  "cctv installation",
  "software services",
  "website development",
  "internet website designers",
  "digital marketing",
  "graphic designers",

  // Category 13: Pet Services (Workers)
  "pet grooming",
  "pet training",

  // Category 14: Events & Entertainment (Workers)
  "dj services",
  "party decorations",
  "mandap decorations",

  // Category 18: Daily Wage Labour Hiring
  ...DAILY_WAGE_SUBCATEGORIES,

  // Category 19: Agriculture & Farming (Workers)
  "tractor rental",
  "veterinary doctors",
  "water pump repair",

  // Category 20: Corporate & Office Services
  ...CORPORATE_SUBCATEGORIES,

  // Category 21: Creative & Art Services
  "painting artists",
  "caricature artists",
  "handmade gift designers",
  "wall murals",
  "craft training",

  // Category 22: Wedding & Traditional Services
  "wedding planners",
  "pandits / poojari",
  "band / music team",
  "flower decoration",
  "sangeet choreographers",
];

// ========================================
// CATEGORY MAPPING OBJECTS
// ========================================

// ✅ COMPREHENSIVE INDUSTRIAL CATEGORY MAP
export const INDUSTRIAL_CATEGORY_MAP: Record<string, string[]> = {
  "transporters": [
    "transporters",
    "transporter",
    "transport services",
    "transport-services",
    "goods transport",
    "goods-transport",
    "logistics",
    "logistics services",
    "logistics-services",
    "cargo services",
    "cargo-services",
    "cargo",
    "freight services",
    "freight-services",
    "freight",
    "goods carrier",
    "goods-carrier",
  ],

  "water-tank-cleaning": [
    "water tank cleaning",
    "water-tank-cleaning",
    "watertankcleaning",
    "tank cleaning services",
    "tank-cleaning-services",
    "tank cleaning",
    "tank-cleaning",
    "overhead tank cleaning",
    "overhead-tank-cleaning",
    "underground tank cleaning",
    "underground-tank-cleaning",
    "water tank",
    "water-tank",
    "sump cleaning",
    "sump-cleaning",
  ],

  "borewell": [
    "borewell services",
    "borewell-services",
    "borewellservices",
    "borewell",
    "bore well",
    "bore-well",
    "borewell drilling",
    "borewell-drilling",
    "bore well drilling",
    "drilling services",
    "drilling-services",
    "well drilling",
    "well-drilling",
    "borewell contractors",
    "borewell-contractors",
    "borewell repair",
    "borewell-repair",
  ],

  "fabricators": [
    "fabricators",
    "fabricator",
    "fabrication work",
    "fabrication-work",
    "fabrication",
    "welding services",
    "welding-services",
    "welding",
    "metal fabrication",
    "metal-fabrication",
    "steel fabrication",
    "steel-fabrication",
    "iron fabrication",
    "iron-fabrication",
    "metal work",
    "metal-work",
    "steel work",
    "steel-work",
  ],

  "machine-repair": [
    "machine repair",
    "machine-repair",
    "machinerepair",
    "machine work",
    "machine-work",
    "machinery repair",
    "machinery-repair",
    "industrial machine repair",
    "industrial-machine-repair",
    "machine",
    "machinery",
    "machine services",
    "machine-services",
  ],

  "scrap-dealers": [
    "scrap dealers",
    "scrap-dealers",
    "scrapdealers",
    "scrap dealer",
    "scrap-dealer",
    "scrap buyers",
    "scrap-buyers",
    "scrap buyer",
    "scrap-buyer",
    "scrap",
    "battery scrap",
    "battery-scrap",
    "e-waste scrap",
    "e-waste-scrap",
    "e-waste",
    "ewaste",
    "metal scrap",
    "metal-scrap",
    "recycling",
    "recycling services",
    "recycling-services",
    "scrap metal",
    "scrap-metal",
    "kabadi",
    "raddi",
  ],
};

// ✅ COMPREHENSIVE WEDDING CATEGORY MAP
export const WEDDING_CATEGORY_MAP: Record<string, string[]> = {
  "wedding-planners": [
    "wedding planners",
    "wedding-planners",
    "wedding planner",
    "wedding planning",
    "marriage planners",
    "marriage planner",
    "event coordination",
    "planner",
    "planners",
    "planning",
    "coordinator",
    "coordinators",
  ],

  "poojari": [
    "pandits / poojari",
    "pandits-/-poojari",
    "pandits/poojari",
    "pandit",
    "pandits",
    "poojari",
    "priest services",
    "priest",
    "wedding priest",
    "hindu priest",
    "pooja services",
    "puja services",
    "pooja",
    "puja",
  ],

  "music-team": [
    "band / music team",
    "band-/-music-team",
    "band/music team",
    "band",
    "bands",
    "music band",
    "wedding band",
    "wedding bands",
    "live band",
    "nadaswaram",
    "nadaswaram team",
    "wedding music",
    "music team",
    "music",
    "shehnai",
    "baraat band",
  ],

  "flower-decoration": [
    "flower decoration",
    "flower-decoration",
    "flower decorations",
    "floral decoration",
    "floral decorations",
    "flower",
    "flowers",
    "floral",
  ],

  "sangeet-choreographers": [
    "sangeet choreographers",
    "sangeet-choreographers",
    "sangeet choreographer",
    "sangeet choreography",
    "wedding choreographers",
    "wedding choreographer",
    "dance choreographers",
    "dance choreographer",
    "choreographer",
    "choreographers",
    "wedding dance",
    "sangeet dance",
    "bridal choreography",
    "sangeet",
    "choreography",
    "dance",
  ],
};

// ✅ AMENITY MAP FOR OPENSTREETMAP
export const AMENITY_MAP: Record<string, string[]> = {
  // FOOD
  restaurants: ["amenity=restaurant"],
  cafes: ["amenity=cafe"],
  bakeries: ["shop=bakery"],
  "street food": ["amenity=fast_food"],
  "juice & smoothie shops": ["amenity=cafe", "shop=beverages"],
  "sweet shops": ["shop=confectionery"],
  "ice cream parlours": ["amenity=ice_cream"],

  // MEDICAL
  hospitals: ["amenity=hospital"],
  clinics: ["amenity=clinic", "amenity=doctors"],
  "dental clinics": ["amenity=dentist"],
  "eye hospitals": ["amenity=hospital"],
  pharmacies: ["amenity=pharmacy"],
  "diagnostic labs": ["amenity=laboratory"],
  "blood banks": ["amenity=blood_bank"],

  // STAY
  hotels: ["tourism=hotel"],
  resorts: ["tourism=resort"],
  lodges: ["tourism=guest_house"],
  "guest houses": ["tourism=guest_house"],

  // FITNESS
  gyms: ["leisure=fitness_centre"],
  "fitness centres / gyms": ["leisure=fitness_centre"],
  "yoga centres": ["leisure=sports_centre"],

  // EDUCATION
  schools: ["amenity=school"],
  colleges: ["amenity=college"],
  "coaching centres": ["amenity=training"],
  coaching: ["amenity=training"],

  // SHOPPING
  supermarkets: ["shop=supermarket"],
  "grocery stores": ["shop=convenience", "shop=supermarket"],

  // PETS
  "pet shops": ["shop=pet"],
  "vet clinics": ["amenity=veterinary"],

  // SERVICES
  "mobile repair": ["shop=mobile_phone"],
  "courier offices": ["amenity=courier"],

  // INDUSTRIAL
  "borewell services": ["craft=borewell_driller"],
  fabricators: ["craft=metal_construction"],
  transporters: ["office=transport"],
  "water tank cleaning": ["office=cleaning"],
  "scrap dealers": ["shop=scrap"],
  "machine repair": ["craft=machining"],

  default: ["amenity=restaurant"],
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check if a subcategory is industrial
 */
export const isIndustrialSubcategory = (subcategory: string): boolean => {
  if (!subcategory) return false;

  const normalized = subcategory.toLowerCase().trim();

  for (const variants of Object.values(INDUSTRIAL_CATEGORY_MAP)) {
    if (variants.some(variant => {
      const variantNormalized = variant.toLowerCase();
      return normalized === variantNormalized ||
        normalized.includes(variantNormalized) ||
        variantNormalized.includes(normalized);
    })) {
      return true;
    }
  }

  return INDUSTRIAL_SUBCATEGORIES.some(sub =>
    sub.toLowerCase() === normalized ||
    normalized.includes(sub.toLowerCase())
  );
};

/**
 * Check if a subcategory is wedding-related
 */
export const isWeddingSubcategory = (subcategory: string): boolean => {
  if (!subcategory) return false;

  const normalized = subcategory.toLowerCase().trim();

  for (const variants of Object.values(WEDDING_CATEGORY_MAP)) {
    if (variants.some(variant => {
      const variantNormalized = variant.toLowerCase();
      return normalized === variantNormalized ||
        normalized.includes(variantNormalized) ||
        variantNormalized.includes(normalized);
    })) {
      return true;
    }
  }

  return WEDDING_SUBCATEGORIES.some(sub =>
    sub.toLowerCase() === normalized ||
    normalized.includes(sub.toLowerCase())
  );
};

/**
 * Get the main industrial category for a subcategory
 */
export const getMainIndustrialCategory = (subcategory: string): string | null => {
  if (!subcategory) return null;

  const normalized = subcategory.toLowerCase().trim();

  for (const [mainCategory, variants] of Object.entries(INDUSTRIAL_CATEGORY_MAP)) {
    if (variants.some(variant => {
      const variantNormalized = variant.toLowerCase();
      return normalized === variantNormalized ||
        normalized.includes(variantNormalized) ||
        variantNormalized.includes(normalized);
    })) {
      return mainCategory;
    }
  }

  return null;
};

/**
 * Get the main wedding category for a subcategory
 */
export const getMainWeddingCategory = (subcategory: string): string | null => {
  if (!subcategory) return null;

  const normalized = subcategory.toLowerCase().trim();

  for (const [mainCategory, variants] of Object.entries(WEDDING_CATEGORY_MAP)) {
    if (variants.some(variant => {
      const variantNormalized = variant.toLowerCase();
      return normalized === variantNormalized ||
        normalized.includes(variantNormalized) ||
        variantNormalized.includes(normalized);
    })) {
      return mainCategory;
    }
  }

  return null;
};

/**
 * Get the appropriate card component name for an industrial subcategory
 */
export const getIndustrialCardComponent = (subcategory: string): string | null => {
  if (!subcategory) return null;

  const mainCategory = getMainIndustrialCategory(subcategory);
  if (!mainCategory) return null;

  const cardComponentMap: Record<string, string> = {
    "borewell": "BorewellServiceCard",
    "fabricators": "FabricatorServiceCard",
    "transporters": "TransporterServiceCard",
    "water-tank-cleaning": "WaterTankCleaningCard",
    "scrap-dealers": "ScrapDealerCard",
    "machine-repair": "MachineWorkCard",
  };

  return cardComponentMap[mainCategory] || null;
};

/**
 * Get the appropriate card component name for a wedding subcategory
 */
export const getWeddingCardComponent = (subcategory: string): string | null => {
  if (!subcategory) return null;

  const mainCategory = getMainWeddingCategory(subcategory);
  if (!mainCategory) return null;

  const cardComponentMap: Record<string, string> = {
    "wedding-planners": "NearbyWeddingPlanner",
    "poojari": "NearbyPanditService",
    "music-team": "NearbyWeddingBands",
    "flower-decoration": "NearbyFlowerDecoration",
    "sangeet-choreographers": "NearbyChoreographerCard",
  };

  return cardComponentMap[mainCategory] || null;
};
