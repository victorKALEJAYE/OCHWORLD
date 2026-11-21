import type { Source } from "@/content/explore/master-plan";

export type Attraction = {
  name: string;
  kind: "Landmark" | "Park and nature" | "Market" | "Arts and culture";
  /** Where it is, in words. */
  area: string;
  /** Matching district page, when the attraction is inside one. */
  districtSlug?: string;
  description: string;
  sources: Source[];
};

const WIKI: Source = { label: "Wikipedia: Abuja", url: "https://en.wikipedia.org/wiki/Abuja" };
const CULTURE_TRIP: Source = {
  label: "Culture Trip: Top things to see and do in Abuja",
  url: "https://theculturetrip.com/africa/nigeria/articles/11-top-things-to-see-and-do-in-abuja",
};

export const ATTRACTIONS: Attraction[] = [
  {
    name: "Aso Rock",
    kind: "Landmark",
    area: "Asokoro, east end of the Central Area",
    districtSlug: "asokoro",
    description: "A 400 m granite monolith that the city is planned around. The Presidential Villa lies at its foot.",
    sources: [WIKI, CULTURE_TRIP],
  },
  {
    name: "National Mosque",
    kind: "Landmark",
    area: "Independence Avenue, Central Business District",
    districtSlug: "central-business-district",
    description: "Abuja's main mosque, completed in 1984, with its golden dome and four minarets. Visitors are welcome outside prayer times.",
    sources: [WIKI, CULTURE_TRIP],
  },
  {
    name: "National Christian Centre",
    kind: "Landmark",
    area: "Independence Avenue, Central Business District",
    districtSlug: "central-business-district",
    description: "The national ecumenical cathedral, a modern neo-gothic building facing the National Mosque across Independence Avenue.",
    sources: [WIKI, CULTURE_TRIP],
  },
  {
    name: "Millennium Park",
    kind: "Park and nature",
    area: "Maitama",
    districtSlug: "maitama",
    description: "The city's largest park, designed by the architect Manfredi Nicoletti and opened in 2003. Popular for walks, picnics and weekend events.",
    sources: [WIKI, CULTURE_TRIP],
  },
  {
    name: "Jabi Lake",
    kind: "Park and nature",
    area: "Jabi",
    districtSlug: "jabi",
    description: "A lake with boat rides, a waterfront park and evening views, next to Jabi Lake Mall.",
    sources: [CULTURE_TRIP],
  },
  {
    name: "Wuse Market",
    kind: "Market",
    area: "Wuse",
    districtSlug: "wuse",
    description: "The city's best-known market, for fresh food, fabrics and household goods.",
    sources: [WIKI, CULTURE_TRIP],
  },
  {
    name: "Garki International Market",
    kind: "Market",
    area: "Garki",
    districtSlug: "garki",
    description: "A large market for clothing and everyday goods; Garki Model Market nearby is calmer and well organised.",
    sources: [CULTURE_TRIP],
  },
  {
    name: "Abuja Arts and Crafts Village",
    kind: "Arts and culture",
    area: "Abuja",
    description: "Stalls of carvings, textiles, beadwork and paintings from across Nigeria.",
    sources: [CULTURE_TRIP],
  },
  {
    name: "Bwari Pottery Village",
    kind: "Arts and culture",
    area: "Bwari Area Council",
    description: "A village where you can watch potters at work and buy pottery directly from them.",
    sources: [CULTURE_TRIP],
  },
  {
    name: "Usuma Dam",
    kind: "Park and nature",
    area: "Bwari Area Council, north of the city",
    description: "The reservoir that supplies much of the city's water, with open land for picnics and bird-watching.",
    sources: [WIKI, CULTURE_TRIP],
  },
  {
    name: "Zuma Rock",
    kind: "Landmark",
    area: "Just outside the FCT, on the Abuja–Kaduna expressway",
    description: "A 725 m monolith near Madalla, often called the gateway to Abuja; it appears on the ₦100 note.",
    sources: [WIKI, CULTURE_TRIP],
  },
];
