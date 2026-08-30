# Source of Truth — CTP Digital Service Portal

## 1. Why Source of Truth Matters
In a multi-system architecture, defining a single "Source of Truth" for every piece of data is critical to prevent conflicts and ensure data integrity.
For example, consider the Working Space booking via WADUH: if the Portal caches availability but WADUH processes a booking simultaneously, the Portal might show a desk as available when WADUH knows it is full. This results in a booking conflict. To solve this, every data domain must have exactly one authoritative system.

## 2. Source of Truth Matrix

| Data Domain | System of Record | Data Owner | R/W from Portal | Sync Strategy | Conflict Rule | Fallback |
|---|---|---|---|---|---|---|
| CTP Room Bookings | Portal | Portal Admin | R/W | N/A | Portal wins | N/A |
| BITC Room Bookings (non-WS) | Portal | Portal Admin | R/W | N/A | Portal wins | N/A |
| Working Space BITC Occupancy | WADUH | WADUH Admin | Read-Only | Real-time API query | WADUH wins | Show "Unavailable" |
| Working Space BITC Booking | WADUH | WADUH Admin | Read-Only | Real-time API query | WADUH wins | Block booking |
| PKL Registration | PKL Website | PKL Admin | Redirect | N/A | PKL wins | Link to PKL site |
| PKL Openings Catalog | Portal | Portal Admin | R/W | N/A | Portal wins | N/A |
| FOKUS Catalog (photos) | Portal | Portal Admin | R/W | Manual admin entry | Portal wins | N/A |
| FOKUS Registration | FOKUS System | FOKUS Admin | Redirect | N/A | FOKUS wins | Link to FOKUS |
| User Profiles (Applicants) | Portal | Applicant | R/W | N/A | Portal wins | N/A |
| Employee Master | Portal | HR / Admin | R/W | N/A | Portal wins | N/A |
| Attendance Raw Data | Device | HR | Read-Only | Batch export | Device wins | Manual entry |
| Attendance Records | Portal | HR | R/W (imported) | Daily Batch import | Portal copy wins | N/A |
| Tariffs | Portal | Finance/Admin | R/W | N/A | Portal wins | N/A |
| Service Catalog | Portal | Admin | R/W | N/A | Portal wins | N/A |
| SKM Responses | Portal | Admin | R/W | N/A | Portal wins | N/A |
| Payment Records | Portal | Admin | R/W | N/A | Portal wins | N/A |
| WhatsApp Delivery Status | WhatsApp BSP | BSP | Read-Only | Webhook / Polling | BSP wins | Log as Failed |

## 3. Critical Anti-Patterns (FORBIDDEN)
- **NEVER** store duplicates of WADUH occupancy data in the Portal database. Always fetch real-time.
- **NEVER** allow Portal users to directly write or modify records in systems where the Portal is not the Source of Truth (e.g., bypassing APIs to write to external databases).
- **NEVER** process payments for external services (WADUH, PKL) on the Portal if the external system is supposed to handle it.
- **NEVER** overwrite Employee data from an attendance device sync; the Portal Employee master is the Source of Truth for profiles, devices are for raw logs only.

## 4. Sync Timing and Cache Strategy

| Data | Cache TTL | Refresh Trigger | Stale Behavior |
|---|---|---|---|
| Working Space Occupancy | 0 (No cache) | On user request | N/A (must be real-time) |
| FOKUS Catalog Info | 24 Hours | Admin manual clear | Serve stale |
| PKL Openings Summary | 1 Hour | Scheduled job | Serve stale |
| Attendance Logs | N/A | Daily CRON job | Wait for next sync |

## 5. Data Ownership Responsibility

| Data Owner | Responsible For | System |
|---|---|---|
| Portal Admin | Room master, tariffs, service catalog, bookings | CTP Portal |
| HR Admin | Employee master, assignment eligibility | CTP Portal |
| WADUH Admin | Working space occupancy, co-working data | WADUH |
| PKL Admin | Internship capacities, registrations | PKL System |
| Finance Admin | Payment verification, QRIS master | CTP Portal |
