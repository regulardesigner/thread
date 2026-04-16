# Mastodon Posting and Timelines Reference

## Official Docs Map

- Statuses methods: `https://docs.joinmastodon.org/methods/statuses/`
- Media methods: `https://docs.joinmastodon.org/methods/media/`
- Timelines methods: `https://docs.joinmastodon.org/methods/timelines/`
- Poll methods: `https://docs.joinmastodon.org/methods/polls/`
- Trends and discovery: `https://docs.joinmastodon.org/methods/trends/`

Confirm feature availability for each target instance.

## Core Publish Endpoints

1. Upload media
- `POST /api/v2/media` (preferred where supported)
- `POST /api/v1/media` (legacy compatibility)

2. Create status
- `POST /api/v1/statuses`
- Key fields vary by feature: `status`, `media_ids[]`, `visibility`, `spoiler_text`, `poll`, `language`, `in_reply_to_id`.

3. Edit status
- `PUT /api/v1/statuses/:id`

4. Delete status
- `DELETE /api/v1/statuses/:id`

5. Fetch status context/details
- `GET /api/v1/statuses/:id`
- `GET /api/v1/statuses/:id/context`

## Interaction Endpoints

- Favourite: `POST /api/v1/statuses/:id/favourite`
- Unfavourite: `POST /api/v1/statuses/:id/unfavourite`
- Reblog: `POST /api/v1/statuses/:id/reblog`
- Unreblog: `POST /api/v1/statuses/:id/unreblog`
- Bookmark: `POST /api/v1/statuses/:id/bookmark`
- Unbookmark: `POST /api/v1/statuses/:id/unbookmark`

## Timeline Endpoints

- Home: `GET /api/v1/timelines/home`
- Public: `GET /api/v1/timelines/public`
- Hashtag: `GET /api/v1/timelines/tag/:hashtag`
- List: `GET /api/v1/timelines/list/:list_id`

## Pagination Checklist

- Prefer server-provided link headers when available.
- Use one cursor style consistently per request chain.
- Record the last item ID and request params for reproducibility.
- Guard against duplicates when paginating backwards/forwards.

## Failure Patterns

- `422 Unprocessable Entity`: Invalid content payload.
- `401 Unauthorized`: Missing or expired access token.
- `403 Forbidden`: Token lacks required privileges.
- `429 Too Many Requests`: Apply backoff with jitter.
