// Troubleshooting knowledge base for the Chat agent (IoT).
//
// The product catalog itself is real data, seeded into a live Shopify
// dev store (Haven Home Tech) and read via src/lib/shopify/client.ts --
// not this file. Troubleshooting steps aren't commerce data, so they
// stay here as a small static KB rather than forcing them into Shopify's
// product model.

export type TroubleshootingStep = {
  issue: string;
  steps: string[];
};

export const mockTroubleshootingSteps: TroubleshootingStep[] = [
  {
    issue: "sensor drops offline intermittently",
    steps: [
      "Check the sensor's battery level in the app.",
      "Confirm it's within 30ft of the Home Hub Core with no more than one wall between them.",
      "Re-pair the sensor by holding its button for 5 seconds until it blinks blue.",
      "If it keeps dropping, check for WiFi channel congestion on the hub's 2.4GHz band.",
    ],
  },
  {
    issue: "camera won't connect to wifi",
    steps: [
      "Confirm you're connecting to a 2.4GHz network -- the Porch Cam and Indoor Pan Cam don't support 5GHz.",
      "Move the camera within 15ft of the router for initial setup, then relocate after pairing.",
      "Forget the camera's network in the app and re-run the QR code pairing flow.",
      "If it still won't connect, check the router isn't using WPA3-only mode -- switch to WPA2/WPA3 mixed mode.",
    ],
  },
  {
    issue: "thermostat shows a wiring error",
    steps: [
      "Confirm which terminals are connected on your HVAC system -- the No-C-Wire Thermostat works without a C-wire but still needs R and W at minimum.",
      "Check the terminal labels against the in-app wiring guide for your specific HVAC type (conventional vs heat pump).",
      "If the error persists, the thermostat's built-in power-stealing circuit may need a firmware update -- check for one in the app's device settings.",
    ],
  },
  {
    issue: "smart lock won't lock or unlock remotely",
    steps: [
      "Remote lock/unlock requires the Home Hub Core -- confirm the lock is paired to a hub, not just running on local keypad-only mode.",
      "Check the lock's battery level; low battery disables remote actuation as a safety fallback even if the keypad still works.",
      "Re-sync the lock's schedule/state by opening its detail page in the app and pulling down to refresh.",
    ],
  },
  {
    issue: "hub shows online but devices paired to it keep dropping",
    steps: [
      "Check how many devices are paired to the hub -- more than 30 on one hub can cause intermittent radio congestion.",
      "Move the hub to a more central location; it should be within range of all paired devices, not just the router.",
      "Restart the hub by unplugging it for 10 seconds -- this clears its device radio cache without losing pairings.",
    ],
  },
];
