import { mockListings } from "./mockListings";

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  listingId: string;
  /** Set when the other person is a seller with a public profile. */
  sellerId?: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

const sellerConversations: Conversation[] = [
  {
    id: "c1",
    name: "Amine D.",
    avatar: "https://i.pravatar.cc/160?img=59",
    listingId: "car-1",
    lastMessage: "Is the price negotiable? I can come to Alger on Saturday.",
    time: "12 min",
    unread: true,
  },
  {
    id: "c2",
    name: "Meriem S.",
    avatar: "https://i.pravatar.cc/160?img=44",
    listingId: "car-7",
    lastMessage: "Hello, is it still available? Can I see the carte grise?",
    time: "1 h",
    unread: true,
  },
  {
    id: "c3",
    name: "Walid B.",
    avatar: "https://i.pravatar.cc/160?img=53",
    listingId: "car-31",
    lastMessage: "Is it available from the 12th to the 15th?",
    time: "3 h",
    unread: true,
  },
  {
    id: "c4",
    name: "Hocine L.",
    avatar: "https://i.pravatar.cc/160?img=60",
    listingId: "car-13",
    lastMessage: "Thanks, I'll confirm tomorrow morning.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "c5",
    name: "Samia K.",
    avatar: "https://i.pravatar.cc/160?img=45",
    listingId: "car-10",
    lastMessage: "Perfect, see you at 17:00.",
    time: "Mon",
    unread: false,
  },
];

const buyerConversations: Conversation[] = [
  {
    id: "c6",
    sellerId: "s4",
    name: "Auto Prestige Oran",
    avatar: "https://i.pravatar.cc/160?img=5",
    listingId: "car-2",
    lastMessage: "Yes, the Tucson is still available. When would you like to visit?",
    time: "25 min",
    unread: true,
  },
  {
    id: "c7",
    sellerId: "s2",
    name: "Amina R.",
    avatar: "https://i.pravatar.cc/160?img=47",
    listingId: "car-5",
    lastMessage: "I can lower it a little for a quick sale.",
    time: "2 h",
    unread: true,
  },
  {
    id: "c8",
    sellerId: "s5",
    name: "Sofiane K.",
    avatar: "https://i.pravatar.cc/160?img=14",
    listingId: "car-11",
    lastMessage: "The service book is complete, I'll send photos.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "c9",
    sellerId: "s6",
    name: "Lina H.",
    avatar: "https://i.pravatar.cc/160?img=32",
    listingId: "car-28",
    lastMessage: "The deposit is 40 000 DA, returned at drop-off.",
    time: "Tue",
    unread: false,
  },
  {
    id: "c10",
    sellerId: "s7",
    name: "Rachid T.",
    avatar: "https://i.pravatar.cc/160?img=15",
    listingId: "car-15",
    lastMessage: "You're welcome, good luck with your search!",
    time: "Nov 14",
    unread: false,
  },
];

export function conversationsFor(role: string) {
  const list = role === "buyer" ? buyerConversations : sellerConversations;
  return list.map((conversation) => ({
    ...conversation,
    listing: mockListings.find((item) => item.id === conversation.listingId),
  }));
}

/** Deterministic 30-day daily views history for a seller's listings. */
export function viewsHistory(sellerId: string) {
  const [start, end] = sellerId === "s1" ? [82, 140] : [6, 19];
  const today = new Date();
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const trend = start + ((end - start) * index) / 29;
    const noise = index === 0 || index === 29 ? 0 : Math.sin(index * 1.7) * (end - start) * 0.12;
    return {
      date: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date),
      views: Math.round(trend + noise),
    };
  });
}

/** Seeded favorites per demo user id. */
export const seedFavorites: Record<string, string[]> = {
  "u-buyer": ["car-2", "car-5", "car-11", "car-4", "car-28", "car-33", "car-15"],
  s1: ["car-14", "car-35"],
};

export const seedSavedSearches: Record<
  string,
  { name: string; params: string; daysAgo: number; newMatches: number }[]
> = {
  "u-buyer": [
    {
      name: "Diesel SUVs under 4M DA",
      params: "type=sale&body=suv&fuel=diesel&priceMax=4000000",
      daysAgo: 8,
      newMatches: 12,
    },
    {
      name: "Automatic hatchbacks in Alger",
      params: "type=sale&body=hatchback&transmission=automatic&location=Alger",
      daysAgo: 15,
      newMatches: 3,
    },
    {
      name: "Weekend rentals under 8 000 DA",
      params: "type=rent&priceMax=8000",
      daysAgo: 30,
      newMatches: 0,
    },
  ],
};
