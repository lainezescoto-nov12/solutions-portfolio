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

// Company policy KB -- returns, warranty, exchanges, shipping. Distinct
// from troubleshooting (a single answer, not a step-by-step fix), and
// still static/curated rather than commerce data, same reasoning as the
// troubleshooting KB above.
export type PolicyEntry = {
  question: string;
  answer: string;
};

export const mockPolicyKB: PolicyEntry[] = [
  {
    question: "what is your return policy",
    answer:
      "Devices can be returned within 30 days of delivery for a full refund, as long as they're in original condition with all included accessories. Opened-but-unused items are fine; devices with physical damage from installation (like drilled mounting holes) aren't eligible for a full refund.",
  },
  {
    question: "how do I exchange a product",
    answer:
      "Exchanges follow the same 30-day window as returns. The fastest path is to start a return for the original item and place a new order for the replacement -- that way the new device ships immediately instead of waiting on the returned one to arrive back first.",
  },
  {
    question: "what is the warranty on your devices",
    answer:
      "All Haven Home Tech devices carry a 1-year limited warranty covering manufacturing defects and hardware failure under normal use. It doesn't cover physical damage, water damage beyond the device's rated weatherproofing, or issues caused by unauthorized firmware modifications.",
  },
  {
    question: "how long does shipping take",
    answer:
      "Standard shipping takes 3-5 business days within the continental US. Expedited 2-day shipping is available at checkout for an additional fee.",
  },
  {
    question: "do you offer international shipping",
    answer:
      "Not currently -- Haven Home Tech ships within the United States only.",
  },
  {
    question: "how do I file a warranty claim",
    answer:
      "Contact support with your order number and a description of the issue. If the device is confirmed defective under warranty, we'll send a prepaid return label and ship a replacement once the defective unit is received.",
  },
];
