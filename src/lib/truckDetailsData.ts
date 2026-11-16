export type TruckTrip = {
  route: string;
  date: string;
  driver: string;
  fare: number;
};
export type TruckProfile = {
  year: number | null;
  capacity: number | null;
  chassis: string;
  engine: string;
  booking: { id: string; route: string } | null;
  documents: { name: string; status: string; warning: boolean }[];
  approved: boolean;
  trips: TruckTrip[];
};

/*TAKE_NOTE: MOCK UP */
const profiles: Record<string, TruckProfile> = {
  "NDA 7183": {
    year: 2022,
    capacity: 15000,
    chassis: "FVR34-7012845",
    engine: "6HK1-519203",
    booking: {
      id: "FM-261109-9432",
      route: "Port Area, Manila → Meycauayan, Bulacan",
    },
    approved: true,
    documents: [
      { name: "OR/CR registration", status: "Expires in 17 d", warning: true },
      { name: "Insurance", status: "Valid to Mar 29, 2027", warning: false },
      {
        name: "LTFRB franchise (CPC)",
        status: "Valid to Dec 24, 2027",
        warning: false,
      },
    ],
    trips: [
      {
        route: "Caloocan → Cubao, QC",
        date: "Sat, Nov 7, 8:28 AM",
        driver: "Rodel Santos",
        fare: 12010,
      },
      {
        route: "Port Area, Manila → FTI, Taguig",
        date: "Thu, Nov 5, 11:58 AM",
        driver: "Rodel Santos",
        fare: 13300,
      },
      {
        route: "Meycauayan, Bulacan → Bacoor, Cavite",
        date: "Mon, Nov 2, 12:08 PM",
        driver: "Rodel Santos",
        fare: 14740,
      },
      {
        route: "Sucat, Parañaque → Kapitolyo, Pasig",
        date: "Sat, Oct 31, 9:41 AM",
        driver: "Rodel Santos",
        fare: 13060,
      },
    ],
  },
};
export function getTruckProfile(plate: string): TruckProfile {
  return (
    profiles[plate] ?? {
      year: null,
      capacity: null,
      chassis: "—",
      engine: "—",
      booking: null,
      approved: false,
      documents: [],
      trips: [],
    }
  );
}
export function getNumberCoding(plate: string): string {
  const ending = /\d(?=\D*$)/.exec(plate)?.[0];
  const days: Record<string, string> = {
    "1": "Mondays",
    "2": "Mondays",
    "3": "Tuesdays",
    "4": "Tuesdays",
    "5": "Wednesdays",
    "6": "Wednesdays",
    "7": "Thursdays",
    "8": "Thursdays",
    "9": "Fridays",
    "0": "Fridays",
  };
  return ending ? `${days[ending]} (plate ending ${ending})` : "—";
}
