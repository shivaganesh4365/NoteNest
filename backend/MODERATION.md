# Resource moderation

Set `MODERATOR_IDS` in the backend environment to a comma-separated list of existing MongoDB user IDs for trusted reviewers. Find each ID in the corresponding `users` record; use IDs rather than emails because accounts are not email-verified. Restart the backend after changing the setting. A moderator sees the review link after signing in again or refreshing their profile.

New uploads are checked for a PDF header and end-of-file marker, limited to 25 MB, and compared by SHA-256 against other resources. Valid, unique uploads remain private and pending until approved. Approval publishes the resource and awards the contributor 10 credits. Rejected resources remain visible only to their uploader and moderators.

Signed-in users can report a published resource once. Moderators can inspect the PDF, approve or reject pending uploads, dismiss reports, or resolve a report to remove a resource from the library.

Uploaded and archived PDFs are served through authenticated API routes; they are not exposed as public static files.
