# Verification Email

We send this email right after signup so users can verify their account.

## Why We Need It

- We confirm the email really belongs to the user.
- We reduce fake accounts.

## Route References

- Register route creates token and sends email.
- Verify route confirms token and activates email verification state.
