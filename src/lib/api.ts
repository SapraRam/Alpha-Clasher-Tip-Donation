const API_URL = (process.env["NEXT_PUBLIC_API_URL"] ?? "http://127.0.0.1:8000").replace(
  "localhost",
  "127.0.0.1",
);

/** Direct backend URL (tip form, server components). */
export function getApiUrl(): string {
  return API_URL.replace(/\/$/, "");
}

/** Same-origin proxy — use in browser/OBS overlay to avoid cross-port issues. */
export function getBrowserApiUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/backend`;
  }
  return getApiUrl();
}

export interface StreamerProfile {
  id: string;
  display_name: string;
}

export interface CreateDonationResponse {
  donation_id: string;
  status: string;
  short_url: string | null;
  amount: number;
  dev_mock_pay?: boolean;
}

export interface DonationStatusResponse {
  donation_id: string;
  status: "pending" | "confirmed" | "expired" | "failed";
  amount: number;
  name?: string | null;
  message?: string | null;
  meme_url?: string;
  voice_url?: string | null;
}

export async function fetchStreamer(streamerId: string): Promise<StreamerProfile> {
  const res = await fetch(`${getApiUrl()}/streamers/${streamerId}`);
  if (!res.ok) throw new Error("Streamer not found");
  return res.json();
}

export async function createDonation(formData: FormData): Promise<CreateDonationResponse> {
  const res = await fetch(`${getBrowserApiUrl()}/donations/create`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create donation" }));
    throw new Error(err.detail ?? "Failed to create donation");
  }
  return res.json();
}

export async function getDonationStatus(donationId: string): Promise<DonationStatusResponse> {
  const res = await fetch(`${getBrowserApiUrl()}/donations/status/${donationId}`);
  if (!res.ok) throw new Error("Donation not found");
  return res.json();
}

export async function mockConfirmDonation(donationId: string): Promise<void> {
  const res = await fetch(`${getBrowserApiUrl()}/donations/${donationId}/mock-confirm`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Mock confirm failed");
}
