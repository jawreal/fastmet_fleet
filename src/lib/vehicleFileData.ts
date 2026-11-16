export interface VehicleFileDefinition {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface VehicleFile {
  name: string;
  url: string;
  mimeType: string;
}

export type VehicleFiles = Record<string, VehicleFile | undefined>;
export type FleetVehicleFiles = Record<string, VehicleFiles | undefined>;

export const vehicleFileDefinitions: VehicleFileDefinition[] = [
  {
    id: "officialReceipt",
    title: "OR (Official Receipt)",
    description: "Latest LTO registration receipt",
    required: true,
  },
  {
    id: "registration",
    title: "CR (Certificate of Registration)",
    description: "Photo or PDF scan",
    required: true,
  },
  {
    id: "chassisPhoto",
    title: "Photo of chassis number",
    description: "Close-up, every character readable",
    required: true,
  },
  {
    id: "enginePhoto",
    title: "Photo of engine number",
    description: "Close-up, every character readable",
    required: true,
  },
  {
    id: "frontPhoto",
    title: "Vehicle photo: front with plate",
    description: "Clear photo",
    required: true,
  },
  {
    id: "sidePhoto",
    title: "Vehicle photo: side",
    description: "Clear photo",
    required: false,
  },
  {
    id: "backPhoto",
    title: "Vehicle photo: back with plate",
    description: "Clear photo",
    required: false,
  },
  {
    id: "insurance",
    title: "Insurance policy",
    description: "CTPL or comprehensive",
    required: false,
  },
  {
    id: "franchise",
    title: "LTFRB franchise (CPC)",
    description: "For trucks for hire, if you have one",
    required: false,
  },
  {
    id: "authorization",
    title: "Deed of sale or authorization letter",
    description: "If the CR is not in your company name",
    required: false,
  },
];

const acceptedTypes = new Set(["image/jpeg", "image/png", "application/pdf"]);
const maximumFileSize = 10 * 1024 * 1024;

export async function readVehicleFile(file: File): Promise<VehicleFile> {
  if (!acceptedTypes.has(file.type)) {
    throw new Error("Choose a JPG, PNG, or PDF file.");
  }
  if (file.size === 0 || file.size > maximumFileSize) {
    throw new Error("Choose a non-empty file up to 10 MB.");
  }

  // Decode pictures before replacing the existing file so corrupt images never overwrite it.
  if (file.type.startsWith("image/")) {
    try {
      const image = await createImageBitmap(file);
      image.close();
    } catch {
      throw new Error(
        "This image could not be opened. Choose another JPG or PNG.",
      );
    }
  } else {
    const header = await file.slice(0, 5).text();
    if (header !== "%PDF-") throw new Error("This file is not a valid PDF.");
  }

  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("The file could not be read."));
    reader.onerror = () =>
      reject(new Error("The file could not be read. Try again."));
    reader.readAsDataURL(file);
  });

  return { name: file.name, mimeType: file.type, url };
}
