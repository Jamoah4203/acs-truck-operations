# ACS Truck Operations v1.6.0

## Notifications and visible updates
- Add a persistent in-app notification inbox with unread counts.
- Target operational alerts by role instead of broadcasting every event to every user.
- Drivers receive delivery assignment and delivery-status alerts.
- Accounts receive finance/payment, completed-delivery, fuel and maintenance alerts that need financial attention.
- Operations and Admin receive delivery, fuel and maintenance operational alerts.
- Access/role changes notify the affected user.
- Notification delivery is realtime while the app is open and persists in Supabase for the next login.
- Optional browser notifications can be enabled by the user while ACS Truck is running.

## PWA update experience
- Replace silent `autoUpdate`/`skipWaiting` service-worker activation with a prompted update lifecycle.
- Show **Update now**, **Later**, and **What changed?** controls when a new version is waiting.
- Publish `/release.json` so the app can display release notes before an update is accepted.
- Show the v1.6.0 release summary once on first load so users upgrading from older silent-update builds are not left without context.

## Reliability
- Avoid duplicate finance alerts for transactions automatically generated from Delivery, Fuel and Maintenance records.
- Keep notification navigation inside each user's permitted menu areas.
- Add realtime publication and indexed unread notification queries.
