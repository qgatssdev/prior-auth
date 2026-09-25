const API_URL = process.env.NEXT_PUBLIC_API_URL;

export { API_URL };

// Queue, stats and case pages poll the API this often, so updates from the
// insurer appear without a refresh.
export const LIVE_REFRESH_MS = 5000;
