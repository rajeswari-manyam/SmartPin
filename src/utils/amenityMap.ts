export const AMENITY_MAP: Record<string, string[]> = {
  // 🍽 FOOD
  restaurants: ["amenity=restaurant"],
  cafes: ["amenity=cafe"],
  bakeries: ["shop=bakery"],
  "street food": ["amenity=fast_food"],
  "juice & smoothie shops": ["amenity=cafe", "shop=beverages"],
  "sweet shops": ["shop=confectionery"],
  "ice cream parlours": ["amenity=ice_cream"],

  // 🏥 MEDICAL
  hospitals: ["amenity=hospital"],
  clinics: ["amenity=clinic", "amenity=doctors"],
  "dental clinics": ["amenity=dentist"],
  "eye hospitals": ["amenity=hospital"],
  "diagnostic labs": ["amenity=laboratory"],
  "blood banks": ["amenity=blood_bank"],
  "medical shops": ["amenity=pharmacy"],
  "nursing services": ["amenity=nursing"],
  "vet hospitals / pet clinics": ["amenity=veterinary"],
  "physiotherapy centres": ["amenity=physiotherapy"],
  

  // 🏨 STAY
  hotels: ["tourism=hotel"],
  resorts: ["tourism=resort"],
  lodges: ["tourism=guest_house"],
  "guest houses": ["tourism=guest_house"],

  // 💪 FITNESS
  gyms: ["leisure=fitness_centre"],
  "fitness centres / gyms": ["leisure=fitness_centre"],
  "yoga centres": ["leisure=sports_centre"],

  // 🎓 EDUCATION
  schools: ["amenity=school"],
  colleges: ["amenity=college"],
  "coaching centres": ["amenity=training"],
  coaching: ["amenity=training"],

  // 🛒 SHOPPING
  supermarkets: ["shop=supermarket"],
  "grocery stores": ["shop=convenience", "shop=supermarket"],

  // 🐾 PETS
  "pet shops": ["shop=pet"],
  "vet clinics": ["amenity=veterinary"],

  // 📱 SERVICES
  "mobile repair": ["shop=mobile_phone"],
  "courier offices": ["amenity=courier"],

  // fallback
  default: ["amenity=restaurant"],
};
