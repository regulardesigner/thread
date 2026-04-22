const CACHE_KEY = "mastodon_instances_cache_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const API_URL = "https://api.joinmastodon.org/servers";

const FALLBACK_INSTANCES = [
  "mastodon.social",
  "mstdn.social",
  "fosstodon.org",
  "hachyderm.io",
  "infosec.exchange",
  "mas.to",
  "mastodon.online",
  "techhub.social",
  "social.coop",
  "universeodon.com",
  "mastodon.world",
  "aus.social",
];

export async function loadInstances() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { timestamp, domains } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return domains;
      }
    }
  } catch {
    // corrupted cache — fall through to fetch
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const servers = await response.json();
    const domains = servers
      .map((s) => s.domain)
      .filter((d) => typeof d === "string" && d.length > 0);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), domains }));
    return domains;
  } catch {
    return FALLBACK_INSTANCES;
  }
}

export function filterInstances(list, query) {
  if (!query || !list.length) return [];
  const lower = query.toLowerCase();
  const results = [];
  for (const domain of list) {
    if (domain.toLowerCase().includes(lower)) {
      results.push(domain);
      if (results.length === 8) break;
    }
  }
  return results;
}
