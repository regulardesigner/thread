export const DEFAULT_CHAR_LIMIT = 500;
export const APP_SCOPES = "read write";

export const STORAGE_KEYS = {
  authSession: "mastodon_auth_session_v1",
  pendingAuth: "mastodon_pending_auth_v1",
  draft: "mastodon_draft_v1",
  checkpoint: "mastodon_publish_checkpoint_v1",
  lastInstance: "mastodon_last_instance_v1",
  preferredLanguage: "mastodon_preferred_language_v1",
};

export function hashtagCacheKey(instanceDomain) {
  return `mastodon_followed_tags_cache_v1_${instanceDomain}`;
}
