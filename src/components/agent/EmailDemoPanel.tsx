import { mockOrders } from "@/lib/mock-data/orders";

// This is the actual differentiator for the email agent: a live Order
// History Panel that mirrors state changes as the agent processes an
// incoming email. Right now it renders the static mock order — wiring
// it to update live off agent tool calls is the next build step.
export function EmailDemoPanel() {
  const order = mockOrders[0];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-950">
          Order History Panel
        </p>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500">
          Static preview — not yet live
        </span>
      </div>
      <div className="mt-4 rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-950">{order.id}</span>
          <span className="text-neutral-500">{order.customerName}</span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">{order.shippingAddress}</p>
        <ul className="mt-3 space-y-2">
          {order.items.map((item) => (
            <li
              key={item.sku}
              className="flex items-center justify-between text-sm text-neutral-700"
            >
              <span>{item.name}</span>
              <span className="text-neutral-400">×{item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-xs text-neutral-400">
        TODO: stream state updates here as the email agent applies edits
        (address change, cancel item, quantity update) via MCP tool calls.
      </p>
    </div>
  );
}
