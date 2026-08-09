# Security Notes

- Do not commit `data/`, `.env`, build outputs or Android/iOS generated folders.
- Store production secrets only in environment variables.
- Use HTTPS for any real server deployment.
- Local HTTP is only for LAN testing.
- Admin panel sessions are short-lived.
- Branch app sessions rotate according to the existing password/session policy.
