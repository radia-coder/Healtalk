# Pages — HealTalk

This folder documents every page in HealTalk and its purpose. Pages live in `src/app/` using the Next.js App Router.

## Public Pages (no login required)

| Route                       | Description                                               |
|-----------------------------|-----------------------------------------------------------|
| `/`                         | Homepage — hero, features, how it works, testimonials, FAQ|
| `/find-psychologists`       | Search and filter psychologists                           |
| `/psychologists/[id]`       | Individual psychologist profile with booking option       |
| `/about`                    | About HealTalk, mission, team                             |
| `/contact`                  | Contact form                                              |
| `/resources`                | Mental health guides, blog posts, podcasts                |
| `/privacy`                  | Privacy policy                                            |
| `/terms`                    | Terms of service                                          |
| `/hipaa`                    | HIPAA compliance information                              |

## Auth Pages

| Route                       | Description                                               |
|-----------------------------|-----------------------------------------------------------|
| `/login`                    | Email/password or Google OAuth login                      |
| `/signup`                   | Register as patient or psychologist                       |
| `/forgot-password`          | Request password reset email                              |
| `/reset-password`           | Set new password via email link                           |
| `/verify-email`             | Email verification after signup                           |
| `/oauth-redirect`           | Handles Google OAuth redirect                             |

## Patient Dashboard (`/patient/...`)

| Route                       | Tab / Section                                             |
|-----------------------------|-----------------------------------------------------------|
| `/patient/dashboard`        | Overview — upcoming appointments, stats                   |
| `/patient/dashboard/appointments` | Book and manage appointments                      |
| `/patient/dashboard/sessions`     | Past video sessions and notes                     |
| `/patient/dashboard/messages`     | Chat with psychologist                            |
| `/patient/dashboard/mood`         | Mood tracker and history chart                    |
| `/patient/dashboard/progress`     | Progress goals                                    |
| `/patient/dashboard/settings`     | Profile and account settings                      |

## Psychologist Dashboard (`/psychologist/...`)

| Route                       | Tab / Section                                             |
|-----------------------------|-----------------------------------------------------------|
| `/psychologist/dashboard`   | Overview — earnings, upcoming appointments                |
| `/psychologist/dashboard/appointments` | Manage and confirm appointments               |
| `/psychologist/dashboard/patients`     | Patient list and history                      |
| `/psychologist/dashboard/earnings`     | Revenue and payout info                       |
| `/psychologist/dashboard/availability` | Set weekly schedule                           |
| `/psychologist/dashboard/messages`     | Chat with patients                            |
| `/psychologist/dashboard/profile`      | Edit credentials, bio, and pricing            |

## Admin Dashboard (`/admin/...`)

| Route                       | Tab / Section                                             |
|-----------------------------|-----------------------------------------------------------|
| `/admin/dashboard`          | Platform overview — users, appointments, revenue          |
| `/admin/dashboard/approvals`| Review and approve psychologist applications              |
| `/admin/dashboard/hospitals`| Add and manage partner hospitals                          |
| `/admin/dashboard/analytics`| Growth trends and platform performance                    |

## Onboarding

| Route                       | Description                                               |
|-----------------------------|-----------------------------------------------------------|
| `/onboarding`               | Multi-step onboarding for new psychologists               |
| `/onboarding/final`         | Completion step after onboarding                          |

## Checkout

| Route                       | Description                                               |
|-----------------------------|-----------------------------------------------------------|
| `/checkout`                 | Payment page when booking a paid appointment              |
