export type BloodBankRealtimeEvent =
  | { type: "transfer_created"; payload?: unknown }
  | { type: "transfer_updated"; payload?: unknown }
  | { type: "donation_created"; payload?: unknown };

const CHANNEL_NAME = "bloodbank";

export function publishBloodBankEvent(event: BloodBankRealtimeEvent) {
  if (typeof window === "undefined") return;
  const BC = (window as any).BroadcastChannel as typeof BroadcastChannel | undefined;
  if (!BC) return;
  try {
    const channel = new BC(CHANNEL_NAME);
    channel.postMessage(event);
    channel.close();
  } catch {
    // ignore
  }
}

export function subscribeBloodBankEvents(handler: (event: BloodBankRealtimeEvent) => void) {
  if (typeof window === "undefined") return () => {};
  const BC = (window as any).BroadcastChannel as typeof BroadcastChannel | undefined;
  if (!BC) return () => {};

  const channel = new BC(CHANNEL_NAME);
  const listener = (msg: MessageEvent) => {
    const data = msg.data as BloodBankRealtimeEvent;
    if (!data || typeof data !== "object") return;
    if (!("type" in data)) return;
    handler(data);
  };

  channel.addEventListener("message", listener);
  return () => {
    try {
      channel.removeEventListener("message", listener);
      channel.close();
    } catch {
      // ignore
    }
  };
}

