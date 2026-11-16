export type CrewRole = "Driver" | "Helper";
export interface CrewMember {
  id: string;
  name: string;
  phone: string;
  role: CrewRole;
  status: "On trip" | "On duty" | "Off duty";
  vehicle: string;
  license: string;
  codes: string;
  licenseExpiry?: string;
  licenseWarning?: string;
  payType: "daily" | "percentage";
  rate: number;
  rating: number | null;
  trips: number;
  pay: number;
  joined?: string;
}

export const crewVehicles = [
  "NDA 7183",
  "NBC 4522",
  "CAR 9056",
  "NEX 3317",
  "DAB 2149",
  "NFQ 6640",
  "NGH 5408",
];

export const sampleCrew: CrewMember[] = [
  {
    id: "arnel",
    name: "Arnel Bautista",
    phone: "0919 555 0203",
    role: "Driver",
    status: "On trip",
    vehicle: "CAR 9056",
    license: "N03-14-550921",
    codes: "B, B2, C",
    payType: "daily",
    rate: 1100,
    rating: 4.8,
    trips: 3,
    pay: 3300,
  },
  {
    id: "christian",
    name: "Christian Flores",
    phone: "0916 555 0207",
    role: "Driver",
    status: "On duty",
    vehicle: "",
    license: "N02-10-664190",
    codes: "B, B2, C",
    licenseWarning: "Expires in 11 d",
    payType: "daily",
    rate: 900,
    rating: 4.4,
    trips: 1,
    pay: 900,
  },
  {
    id: "jessie",
    name: "Jessie Ramos",
    phone: "0915 555 0206",
    role: "Driver",
    status: "On duty",
    vehicle: "NFQ 6640",
    license: "N05-18-118842",
    codes: "B, B2",
    payType: "percentage",
    rate: 13,
    rating: 4.8,
    trips: 3,
    pay: 714,
  },
  {
    id: "jun",
    name: "Jun Dela Cruz",
    phone: "0918 555 0202",
    role: "Driver",
    status: "On duty",
    vehicle: "NBC 4522",
    license: "N02-11-193377",
    codes: "B, B2, C",
    payType: "percentage",
    rate: 15,
    rating: 4.7,
    trips: 1,
    pay: 930,
  },
  {
    id: "mark",
    name: "Mark Villanueva",
    phone: "0927 555 0204",
    role: "Driver",
    status: "On trip",
    vehicle: "NEX 3317",
    license: "N04-16-772013",
    codes: "B, B2",
    payType: "percentage",
    rate: 14,
    rating: 4.6,
    trips: 1,
    pay: 500,
  },
  {
    id: "ramil",
    name: "Ramil Garcia",
    phone: "0908 555 0205",
    role: "Driver",
    status: "Off duty",
    vehicle: "DAB 2149",
    license: "N01-12-430068",
    codes: "B, B2, C",
    payType: "daily",
    rate: 950,
    rating: 4.5,
    trips: 0,
    pay: 0,
  },
  {
    id: "rodel",
    name: "Rodel Santos",
    phone: "0917 555 0201",
    role: "Driver",
    status: "On trip",
    vehicle: "NDA 7183",
    license: "N01-09-284511",
    codes: "B, B2, C, CE",
    payType: "percentage",
    rate: 15,
    rating: 4.9,
    trips: 0,
    pay: 0,
  },
  {
    id: "bong",
    name: "Bong Mercado",
    phone: "0917 555 0212",
    role: "Helper",
    status: "On duty",
    vehicle: "NBC 4522",
    license: "",
    codes: "",
    payType: "daily",
    rate: 650,
    rating: 4.6,
    trips: 1,
    pay: 650,
  },
  {
    id: "noel",
    name: "Noel Aquino",
    phone: "0926 555 0211",
    role: "Helper",
    status: "On trip",
    vehicle: "NDA 7183",
    license: "",
    codes: "",
    payType: "daily",
    rate: 650,
    rating: 4.7,
    trips: 0,
    pay: 0,
  },
];
