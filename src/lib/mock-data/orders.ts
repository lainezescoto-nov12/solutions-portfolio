// Mock order history for the Email agent (e-commerce order editing).
// Intended to be seeded into Firestore under a `mockOrders` collection —
// this file is the source of truth for that seed until the real
// seed script exists.

export type OrderItem = {
  sku: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  status: "pending" | "processing" | "shipped" | "cancelled";
  items: OrderItem[];
};

export const mockOrders: Order[] = [
  {
    id: "#10482",
    customerName: "Dana Whitfield",
    customerEmail: "dana.whitfield@example.com",
    shippingAddress: "88 Larkspur Ave, Portland, OR 97205",
    status: "processing",
    items: [
      { sku: "WB-500", name: "Insulated Water Bottle (24oz)", quantity: 1, price: 22 },
      { sku: "PC-014", name: "Slim Phone Case — Black", quantity: 1, price: 18 },
      { sku: "TW-002", name: "Travel Wallet", quantity: 1, price: 34 },
    ],
  },
  {
    id: "#10491",
    customerName: "Marcus Ionescu",
    customerEmail: "marcus.i@example.com",
    shippingAddress: "214 Birch St, Apt 2, Denver, CO 80203",
    status: "pending",
    items: [{ sku: "WB-500", name: "Insulated Water Bottle (24oz)", quantity: 1, price: 22 }],
  },
];

export function findOrderById(id: string): Order | undefined {
  return mockOrders.find((o) => o.id === id);
}
