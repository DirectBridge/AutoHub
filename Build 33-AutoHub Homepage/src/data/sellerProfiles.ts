import { sellers } from "./mockListings";
import { getProfileOverrides } from "@/context/AuthContext";
import { readPrivacy } from "@/lib/userPrefs";

interface SellerExtra {
  about: string;
  wilaya: string;
  isDealership?: boolean;
  soldCount: number;
  responseRate: number;
  replyTime: string;
  verifiedOn?: string;
}

const extras: Record<string, SellerExtra> = {
  s1: {
    about:
      "Car enthusiast selling my family's cars. Every car is serviced on time, papers are always in order and I'm happy to meet for an inspection anywhere in Alger. I answer messages in the evening after work.",
    wilaya: "Alger",
    soldCount: 11,
    responseRate: 94,
    replyTime: "Usually replies within a few hours",
    verifiedOn: "2026-11-02",
  },
  s2: {
    about: "Selling and renting out well-kept city cars in Oran.",
    wilaya: "Oran",
    soldCount: 4,
    responseRate: 88,
    replyTime: "Usually replies within a day",
    verifiedOn: "2025-03-14",
  },
  s3: {
    about: "",
    wilaya: "Constantine",
    soldCount: 0,
    responseRate: 71,
    replyTime: "Usually replies within a day",
  },
  s4: {
    about:
      "Small dealership in Oran since 2015. All our cars come with a technical inspection report and a 3-month warranty on the engine and gearbox.",
    wilaya: "Oran",
    isDealership: true,
    soldCount: 186,
    responseRate: 98,
    replyTime: "Usually replies within an hour",
    verifiedOn: "2024-09-01",
  },
  s5: {
    about: "Mechanic by trade, I sell cars I have personally checked.",
    wilaya: "Sétif",
    soldCount: 9,
    responseRate: 91,
    replyTime: "Usually replies within a few hours",
    verifiedOn: "2025-07-20",
  },
  s6: {
    about: "Family cars and weekend rentals in Blida and Alger.",
    wilaya: "Blida",
    soldCount: 6,
    responseRate: 90,
    replyTime: "Usually replies within a few hours",
    verifiedOn: "2025-01-10",
  },
  s7: {
    about: "",
    wilaya: "Annaba",
    soldCount: 1,
    responseRate: 64,
    replyTime: "Usually replies within a day",
  },
};

export interface SellerProfile {
  id: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  memberSince: string;
  about: string;
  wilaya?: string;
  isDealership: boolean;
  soldCount: number;
  responseRate: number;
  replyTime: string;
  verifiedOn?: string;
}

/** Merges mock seller data with any edits the seller made in /settings. */
export function getSellerProfile(id: string): SellerProfile | undefined {
  const base = sellers.find((item) => item.id === id);
  if (!base) return undefined;
  const extra = extras[id];
  const edits = getProfileOverrides(id);
  const name =
    edits.firstName && edits.lastName
      ? `${edits.firstName} ${edits.lastName.charAt(0)}.`
      : base.name;
  const isVerified = edits.isVerified ?? base.isVerified;
  return {
    id,
    name,
    avatar: edits.avatar === undefined ? base.avatar : edits.avatar,
    isVerified,
    memberSince: base.memberSince,
    about: edits.about ?? extra?.about ?? "",
    wilaya: readPrivacy(id).showWilaya ? (edits.wilaya ?? extra?.wilaya) : undefined,
    isDealership: Boolean(extra?.isDealership),
    soldCount: extra?.soldCount ?? 0,
    responseRate: extra?.responseRate ?? 80,
    replyTime: extra?.replyTime ?? "Usually replies within a day",
    verifiedOn: isVerified
      ? (extra?.verifiedOn ?? new Date().toISOString().slice(0, 10))
      : undefined,
  };
}

export const defaultProfileFields = (id: string) => ({
  about: extras[id]?.about ?? "",
  wilaya: extras[id]?.wilaya ?? "",
});
