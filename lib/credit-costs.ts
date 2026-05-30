// Costul în credite pentru fiecare serviciu eVerify.
// Sursă unică de adevăr — folosită de rutele API care consumă sold.
export const CREDIT_COSTS = {
  ai: 1,    // analiză AI mesaj/text — /api/analyze
  url: 2,   // verificare site web — /api/check-url
  phone: 2, // verificare număr de telefon (planificat)
  iban: 3,  // verificare IBAN (planificat)
  pdf: 5,   // analiză document PDF (planificat)
} as const

export type CreditService = keyof typeof CREDIT_COSTS
