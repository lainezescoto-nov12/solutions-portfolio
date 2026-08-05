// Mock product catalog + troubleshooting KB for the Chat agent (IoT).
// Intended to be seeded into Firestore under `mockDevices` /
// `mockTroubleshootingSteps` collections.

export type Device = {
  sku: string;
  name: string;
  category: "camera" | "sensor" | "hub" | "thermostat" | "lock";
  wireless: boolean;
  requiresHub: boolean;
  priceUsd: number;
  goodFor: string[];
};

export const mockDevices: Device[] = [
  {
    sku: "CAM-PORCH-2",
    name: "Wireless Porch Cam 2",
    category: "camera",
    wireless: true,
    requiresHub: false,
    priceUsd: 79,
    goodFor: ["no existing wiring", "battery powered", "outdoor"],
  },
  {
    sku: "THERM-NOC",
    name: "No-C-Wire Smart Thermostat",
    category: "thermostat",
    wireless: true,
    requiresHub: false,
    priceUsd: 129,
    goodFor: ["older HVAC systems", "no C-wire"],
  },
  {
    sku: "HUB-CORE",
    name: "Home Hub Core",
    category: "hub",
    wireless: false,
    requiresHub: false,
    priceUsd: 59,
    goodFor: ["central hub", "required for door/window sensors"],
  },
];

export type TroubleshootingStep = {
  issue: string;
  steps: string[];
};

export const mockTroubleshootingSteps: TroubleshootingStep[] = [
  {
    issue: "sensor drops offline intermittently",
    steps: [
      "Check the sensor's battery level in the app.",
      "Confirm it's within 30ft of the hub with no more than one wall between them.",
      "Re-pair the sensor by holding its button for 5 seconds until it blinks blue.",
      "If it keeps dropping, check for wifi channel congestion on the hub's 2.4GHz band.",
    ],
  },
];
