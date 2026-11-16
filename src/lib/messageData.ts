export type ChatMessage = {
  id: string;
  driverId: string;
  text: string;
  outgoing: boolean;
  time: string;
  reactions: string[];
  image?: { name: string; url: string };
};
export const suggestions = [
  "Ano na ang ETA mo?",
  "Paki-send ng POD photo pagdating.",
  "May bagong booking ka sa app.",
  "Ingat sa biyahe.",
];
/*TAKE_NOTE: MOCK UP */
export const initialMessages: ChatMessage[] = [
  {
    id: "a1",
    driverId: "arnel",
    text: "Arnel, may pickup ka sa Valenzuela Gateway after lunch. 6 pallets.",
    outgoing: true,
    time: "Nov 9, 8:21 PM",
    reactions: [],
  },
  {
    id: "a2",
    driverId: "arnel",
    text: "Noted po boss. Papunta na.",
    outgoing: false,
    time: "Nov 9, 9:27 PM",
    reactions: [],
  },
  {
    id: "r1",
    driverId: "rodel",
    text: "Copy. Ingat sa NLEX.",
    outgoing: true,
    time: "Nov 9, 7:15 PM",
    reactions: [],
  },
  {
    id: "m1",
    driverId: "mark",
    text: "Nandito na po sa Kapitolyo, naglo-load na.",
    outgoing: false,
    time: "Nov 9, 6:30 PM",
    reactions: [],
  },
];
