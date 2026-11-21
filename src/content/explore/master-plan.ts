/**
 * "Abuja Master Plan" guide. Facts only, each section linked to its sources.
 * Edit the wording here; the page renders whatever is in this file.
 */

export type Source = { label: string; url: string };

export type GuideSection = {
  id: string;
  title: string;
  paragraphs: string[];
  points?: string[];
  sources: Source[];
};

const FCDA_WHY: Source = { label: "FCDA: Why Abuja?", url: "https://www.fcda.gov.ng/about/why-abuja" };
const WIKI: Source = { label: "Wikipedia: Abuja", url: "https://en.wikipedia.org/wiki/Abuja" };
const EXPLORE_PLAN: Source = {
  label: "Explore Abuja: Abuja Master Plan (1979)",
  url: "https://www.exploreabuja.ng/?p=1374",
};
const DAILY_TRUST: Source = {
  label: "Daily Trust: Guide to obtaining building plan approval in the FCT",
  url: "https://dailytrust.com/guide-to-obtaining-building-plans-approval-in-fct/",
};
const AGIS: Source = { label: "AGIS: Processes and payment requirements", url: "https://www.agis.fcta.gov.ng/processes-and-payments-requirements/" };

export const MASTER_PLAN_SECTIONS: GuideSection[] = [
  {
    id: "why",
    title: "Why Abuja was planned",
    paragraphs: [
      "After twelve states were created in 1967, Lagos served as both the federal capital and the capital of Lagos State. The strain showed in overcrowding, high rents, traffic congestion and stretched infrastructure.",
      "In 1975 the Federal Military Government set up a panel led by Justice Akinola Aguda to study the problem. It concluded that Lagos had too little land for both roles and recommended a new capital on a central site, easy to reach from every part of the country and seen as neutral ground that would help national unity.",
      "Decree No. 6 of 1976 created the Federal Capital Territory and the Federal Capital Development Authority (FCDA) to build the new city. The seat of government moved from Lagos to Abuja on 12 December 1991.",
    ],
    sources: [FCDA_WHY, WIKI],
  },
  {
    id: "structure",
    title: "The structure of the Federal Capital Territory",
    paragraphs: [
      "The Federal Capital Territory (FCT) covers about 8,000 km² in the centre of Nigeria. Under the 1976 decree the Federal Government holds the land of the whole territory, which is why titles in the FCT are issued by the FCT Administration rather than a state government.",
      "The territory is divided into six area councils. The Federal Capital City itself, the planned city most people mean by \"Abuja\", sits in the Abuja Municipal Area Council (AMAC); towns such as Kubwa, Bwari, Gwagwalada, Kuje, Kwali and Abaji lie in the wider territory.",
    ],
    points: [
      "Abuja Municipal Area Council (AMAC)",
      "Bwari Area Council",
      "Gwagwalada Area Council",
      "Kuje Area Council",
      "Kwali Area Council",
      "Abaji Area Council",
    ],
    sources: [FCDA_WHY, EXPLORE_PLAN, WIKI],
  },
  {
    id: "districts",
    title: "The city districts and phases",
    paragraphs: [
      "The city is built in phases spreading out from the foot of Aso Rock. Expressways separate the phases. Each phase is divided into districts, and districts into neighbourhoods with their own markets, schools and services. The districts are also known by cadastral zone codes used on land documents.",
      "Phase 1 is the oldest and most developed part of the city. Phases further out are newer, still filling in, and usually cheaper, which is why many buyers look there first.",
    ],
    points: [
      "Phase 1: Central Area, Garki, Garki II, Wuse, Wuse II, Maitama, Asokoro, Guzape",
      "Phase 2: Utako, Jabi, Wuye, Mabushi, Katampe, Jahi, Kado, Durumi, Gudu, Apo-Dutse and others",
      "Phase 3: Gwarinpa, Life Camp, Lokogoma, Galadimawa, Dakwo, Dape, Kafe and others",
      "Phase 4 and 5: outer districts such as Karsana, Kagini, Gwagwa, Kyami and Lugbe",
      "Outside the original plan: satellite towns such as Kubwa, Nyanya, Karu, Kuje, Mpape and Dawaki",
    ],
    sources: [EXPLORE_PLAN, WIKI],
  },
  {
    id: "land-use",
    title: "Land use designations",
    paragraphs: [
      "Every plot in the city has an approved land use, shown on its title documents and the district layout. Building something different, such as offices on a residential plot, needs a change of land use from the FCT Administration.",
      "Broadly, the plan separates areas for homes, business, government and open space:",
    ],
    points: [
      "Residential: most of Maitama, Asokoro, Gwarinpa and the newer districts",
      "Commercial and business: the Central Business District, Wuse and the district centres",
      "Government and institutional: the Three Arms Zone (Presidency, National Assembly, Supreme Court) and ministries",
      "Parks and green areas: Millennium Park, the green belts and reserved open spaces, which are not meant to be built on",
    ],
    sources: [WIKI, EXPLORE_PLAN],
  },
  {
    id: "purpose",
    title: "Purpose of the Master Plan",
    paragraphs: [
      "The FCDA commissioned International Planning Associates, a consortium of three American firms, in 1977; their master plan was submitted on 15 February 1979. The Japanese architect Kenzo Tange designed the city's central area and monumental core.",
      "The plan set out long-term land use, housing, transport and infrastructure for the capital, so the city would grow in an orderly way instead of the unplanned growth that strained Lagos. It still guides where roads, utilities and each type of building can go.",
    ],
    sources: [EXPLORE_PLAN, WIKI],
  },
  {
    id: "approvals",
    title: "How development and planning approvals work",
    paragraphs: [
      "Two things matter before you build or buy: a genuine title to the land, and approval for what is built on it.",
    ],
    points: [
      "Title: land in the FCT is allocated by the FCT Administration and recorded at AGIS (Abuja Geographic Information Systems). Before any land deal, search the title at AGIS to confirm the owner and check for disputes or revocation.",
      "Building plan approval: apply to the Development Control department with your title documents (C of O or R of O), the Title Deed Plan, architectural, structural, mechanical and electrical drawings, a site analysis report and, where required, an environmental impact assessment.",
      "Setting-out: once approved, get setting-out approval when excavating the foundation, before building further.",
      "Time limit: construction should start within two years of approval, or the approval must be revalidated.",
      "Transfers: when a property changes hands, the sale needs the Minister's consent and registration to be fully in the buyer's name.",
    ],
    sources: [DAILY_TRUST, AGIS],
  },
];

export const MASTER_PLAN_NOTE =
  "This guide is a summary for buyers and renters, not legal or planning advice. Rules and fees change; confirm current requirements with AGIS, the FCDA or a property lawyer.";
