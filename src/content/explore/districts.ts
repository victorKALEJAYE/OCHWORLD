/**
 * District profiles for Explore Abuja. Descriptive facts only; scores
 * (security, power, flooding…) come from the OCHWORLD team via the
 * district_ratings table, never from this file.
 *
 * Coordinates are the approximate centre of each district, for the map.
 * Phase follows the Abuja Master Plan (see master-plan.ts sources).
 */
export type DistrictProfile = {
  phase: "Phase 1" | "Phase 2" | "Phase 3" | "Phase 4" | "Phase 5" | "Satellite town";
  summary: string;
  /** Approximate centre: [latitude, longitude]. */
  centre: [number, number];
};

export const DISTRICT_PROFILES: Record<string, DistrictProfile> = {
  apo: {
    phase: "Phase 2",
    summary: "South of the city centre, around Apo-Dutse. A mix of estates and older housing, with quick access to Garki and the Central Area.",
    centre: [8.995, 7.495],
  },
  asokoro: {
    phase: "Phase 1",
    summary: "At the foot of Aso Rock, home to many diplomats, senior government officials and the Presidential Villa nearby. One of the most exclusive residential districts.",
    centre: [9.043, 7.524],
  },
  "central-business-district": {
    phase: "Phase 1",
    summary: "The city's main business district and monumental core, with federal ministries, corporate offices, the National Mosque and the National Christian Centre.",
    centre: [9.056, 7.49],
  },
  dawaki: {
    phase: "Satellite town",
    summary: "A growing area north of Gwarinpa along the Kubwa road, popular for newer estates at lower prices than the inner districts.",
    centre: [9.135, 7.43],
  },
  durumi: {
    phase: "Phase 2",
    summary: "A central district between Garki and Gudu, mostly residential, close to the Central Area.",
    centre: [9.025, 7.45],
  },
  galadimawa: {
    phase: "Phase 3",
    summary: "A Phase 3 district south-west of the centre along the airport road side of the city, with many newer estates.",
    centre: [8.99, 7.43],
  },
  garki: {
    phase: "Phase 1",
    summary: "One of the first districts built: a major business and administrative area with established housing, Garki International Market and government offices.",
    centre: [9.033, 7.488],
  },
  gudu: {
    phase: "Phase 2",
    summary: "A central-south district between Apo and Durumi, mainly residential, with good links to Garki and the Central Area.",
    centre: [9.01, 7.475],
  },
  guzape: {
    phase: "Phase 1",
    summary: "A hilly Phase 1 district next to Asokoro, known for newer upmarket homes and city views.",
    centre: [9.017, 7.505],
  },
  gwarinpa: {
    phase: "Phase 3",
    summary: "Home to one of the largest housing estates in West Africa, laid out along numbered avenues, with a wide range of homes and prices.",
    centre: [9.11, 7.4],
  },
  jabi: {
    phase: "Phase 2",
    summary: "A central-west district around Jabi Lake, with Jabi Lake Mall, offices and apartments.",
    centre: [9.067, 7.427],
  },
  jahi: {
    phase: "Phase 2",
    summary: "North of the centre, between Kado and Katampe. A popular area for newer estates and family homes.",
    centre: [9.095, 7.44],
  },
  kado: {
    phase: "Phase 2",
    summary: "A residential district north of Jabi and Utako, known for Kado Fish Market.",
    centre: [9.085, 7.435],
  },
  karsana: {
    phase: "Phase 4",
    summary: "An outer Phase 4 district north-west of Gwarinpa, still developing, with land and new estates at lower prices.",
    centre: [9.165, 7.38],
  },
  katampe: {
    phase: "Phase 2",
    summary: "On the hills north of Maitama, with Katampe Extension known for newer upmarket homes and views over the city.",
    centre: [9.12, 7.46],
  },
  kubwa: {
    phase: "Satellite town",
    summary: "A large satellite town north-west of the city on the Kaduna road, with its own markets and services and more affordable housing.",
    centre: [9.155, 7.322],
  },
  "life-camp": {
    phase: "Phase 3",
    summary: "A residential district west of the centre, between Jabi and Gwarinpa.",
    centre: [9.08, 7.4],
  },
  lokogoma: {
    phase: "Phase 3",
    summary: "A Phase 3 district south of the centre, with many newer estates and bungalows.",
    centre: [8.978, 7.46],
  },
  lugbe: {
    phase: "Phase 5",
    summary: "On the airport road south-west of the city, a large and fast-growing residential area.",
    centre: [8.975, 7.38],
  },
  mabushi: {
    phase: "Phase 2",
    summary: "A central district between Utako and Wuse, with offices, apartments and quick access to the city centre.",
    centre: [9.08, 7.45],
  },
  maitama: {
    phase: "Phase 1",
    summary: "One of the city's most exclusive residential districts, home to embassies, high-end homes and Millennium Park.",
    centre: [9.089, 7.493],
  },
  utako: {
    phase: "Phase 2",
    summary: "A busy commercial and residential district with Utako Market, offices and a major motor park.",
    centre: [9.07, 7.44],
  },
  wuse: {
    phase: "Phase 1",
    summary: "A central commercial district built around Wuse Market, with offices, shops and housing.",
    centre: [9.065, 7.475],
  },
  "wuse-ii": {
    phase: "Phase 1",
    summary: "A lively central district of restaurants, shops, offices and serviced apartments around Aminu Kano Crescent.",
    centre: [9.079, 7.47],
  },
  wuye: {
    phase: "Phase 2",
    summary: "A central district between Utako and Jabi, mostly residential, close to the city centre.",
    centre: [9.055, 7.44],
  },
};
