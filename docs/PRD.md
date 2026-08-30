# Product Requirements Document — CTP Digital Service Portal

## 1. Product Vision
"Single-window digital service platform for UPTD CTP and BITC." The platform aims to consolidate service offerings, streamline administrative workflows, and provide an integrated, seamless experience for both internal staff and external stakeholders.

## 2. Product Goals
1. **Service Portal**: Provide a single, centralized public entry point for all service requests.
2. **Self Service**: Empower users with status tracking, document uploads, and direct communication.
3. **Integrated**: Seamlessly connect with existing internal systems (WADUH, PKL Website) without duplication.
4. **Configurable**: Enable administrators to build and deploy new services without writing code.
5. **Auditable**: Ensure all major state changes, communications, and workflows maintain a strict audit trail.
6. **Expandable**: Designed as a modular platform to accommodate future phases and service types.

## 3. Stakeholders and User Roles

| Role | Internal/External | Description | Key Permissions |
| --- | --- | --- | --- |
| Pemohon (Applicant) | External / Internal | User requesting a service (OPD/Instansi, Ekraf, Lainnya) | View own requests, upload documents, check statuses |
| Admin UPTD | Internal | Primary operator managing requests and systems | Verify docs/payments, manage bookings, assign PIC |
| Kasubag TU | Internal | Supervisor of administration | Substitute PICs, view attendances, overview dashboards |
| Kepala UPTD | Internal | Head of the Unit | Approve requests, view high-level monitoring dashboards |
| Sekretaris | Internal | Secretary (Dinas level) | View agendas, high-level reports |
| Kepala Dinas | Internal | Head of the Department | View agendas, high-level reports |

## 4. Services Catalog
- **SVC-001**: Room Booking CTP
- **SVC-002**: Room Booking BITC
- **SVC-003**: PKL/Internship/Research
- **SVC-004**: Product Photography (FOKUS)
- **SVC-005**: Working Space BITC
- **SVC-006**: Virtual Office
- **SVC-007**: Studio Dubbing
- **SVC-008**: Other Services (configurable)

### Service Attributes per Layanan

| Layanan | `requiresDisposition` | `requiresPayment` | Catatan |
|---|---|---|---|
| SVC-001 Room Booking CTP | ✅ **TRUE** | Sesuai tarif | Sesuai raw.md §XI: semua pengajuan wajib disposisi |
| SVC-002 Room Booking BITC | ✅ **TRUE** | Sesuai tarif | Sesuai raw.md §XI |
| SVC-003 PKL/Internship | ⏳ Pending OQ-020 | ❌ FALSE | Integrasi PKL existing |
| SVC-004 FOKUS | N/A (redirect) | N/A | Hanya katalog + link eksternal |
| SVC-005 Working Space | ⏳ Pending OQ-020 | ✅ TRUE | Via WADUH |
| SVC-006 Virtual Office | ⏳ Pending OQ-020 | ✅ TRUE | Lihat OQ-021 untuk lifecycle |
| SVC-007 Studio Dubbing | ⏳ Pending OQ-020 | ⏳ Pending | raw.md §XXIX tidak menyebutkan |
| SVC-008 Other | Dikonfigurasi Admin | Dikonfigurasi Admin | Via Service Builder |

> Nilai ⏳ Pending OQ-020 akan diisi setelah konfirmasi klien. Sementara: default `requiresDisposition = true` untuk semua layanan sesuai raw.md §XI.

## 5. Functional Requirements

### FR-BOOKING: Room Booking
- **FR-BOOKING-001** to **FR-BOOKING-020**: Covers building/room selection, date/time scheduling, form filling, document uploads, admin verification, disposition (manual upload), approval, room lock, payment, execution, check-out, and SKM generation.
- Capacity rules: Convention Hall CTP (min 100, max 500), Convention Hall BITC (max 77, full-day booking only).
- Applicant categories include: OPD/Instansi/Lembaga, Ekonomi Kreatif (with 17 subsectors), and Lainnya.

### FR-PAYMENT: Payment
- **FR-PAYMENT-001** to **FR-PAYMENT-006**: Manual payment processes involving QRIS/payment codes issued by Admin. Applicants or Admin (via WhatsApp) upload proof (bukti bayar) for Admin verification. Deadline is H-1 (24 hours before event). Non-refundable policy applies. System must issue a warning when approaching the payment deadline.
- **FR-PAYMENT-007**: Tolerance flow — if payment is overdue H-1 and Admin needs to grant tolerance, Admin submits a formal tolerance request to Kepala UPTD via the system. Kepala UPTD receives a WhatsApp notification and must approve or reject via portal. If approved: booking remains active. If rejected: Admin decides next action. Both decisions are recorded in AuditLog. (Sesuai raw.md §XV.)

### FR-CANCEL: Cancellation
- **FR-CANCEL-001** to **FR-CANCEL-005**: Cancellation window (`cancellationWindowDays`, default H-7) is a configurable system parameter — not hard-coded. (Sesuai raw.md §XVI: "harus dijadikan parameter dalam workflow.") Cancellation is strictly Admin-only. A mandatory reason is required. Room availability is restored if the booking was unpaid. Cancellations after payment are non-refundable.

### FR-RESCHEDULE: Rescheduling
- **FR-RESCHEDULE-001** to **FR-RESCHEDULE-006**: Allowed maximum 3 times. Regular rooms require H-3 notice (`SystemConfig.rescheduleWindowDaysRegular`); Convention Hall requires H-30 notice (`SystemConfig.rescheduleWindowDaysConvHall`) and must be within the same calendar year. The booking number remains the same, maintaining full historical records.
- **FR-RESCHEDULE-007**: Reschedule is Admin-initiated only — Pemohon contacts Admin via WhatsApp or directly. No self-service reschedule button in the portal. (Konsisten dengan FR-CANCEL.)

### FR-PIC: PIC Management
- **FR-PIC-001** to **FR-PIC-007**: Mandatory PIC roles for Convention Hall CTP include Main PIC, Videotron Operator, Cleaning, and Technician. Only internal UPTD staff can be assigned. System must prevent double-assignment conflicts. Kasubag TU can substitute a PIC without formal approval. Notifications go to the new PIC and applicant (no private numbers are shared; all communication goes via Admin).

### FR-DOSSIER: Digital Dossier
- **FR-DOSSIER-001** to **FR-DOSSIER-006**: Uses the booking number as an anchor. Managed document types include: surat permohonan, proposal, surat pernyataan, TTD, e-Meterai, disposisi, bukti bayar, bukti booking, histori, PIC assignments, admin notes, and SKM. Features versioning with active/history states and restricts document deletion.

### FR-AUDIT: Audit Trail
- **FR-AUDIT-001** to **FR-AUDIT-005**: Mandatory logging for significant changes. Includes fields: timestamp, actor, field changed, before value, after value, and reason. Covers approvals, payments, documents, tariffs, PICs, cancellations, reschedules, master data updates, and workflow changes.

### FR-SKM: Satisfaction Survey
- **FR-SKM-001** to **FR-SKM-004**: Native SKM integration. Triggered post check-out. SKM **wajib diisi** untuk menutup booking (sesuai raw.md §XXIV: flow berakhir setelah SKM di-submit). SKM tidak memblokir pembuatan booking baru. Auto-close setelah timeout (`SystemConfig.skmTimeoutDays`). Linked directly to the booking number. Admin has access to survey statistics.

### FR-NOTIFICATION: Notifications
- **FR-NOTIF-001** to **FR-NOTIF-010**: Event-driven WhatsApp outbound messaging for submission, approval, rejection, payment instructions, reminders, changes, reschedules, PIC assignments, and SKM prompts. Inbound tracking handles questions, documents, and payment proof via WhatsApp that Admins upload with metadata.

### FR-CALENDAR: Calendar
- **FR-CAL-001** to **FR-CAL-003**: Offers monthly, weekly, and daily views. Filterable by building, room, status, applicant, PIC, service, and period. Clickable entries for detailed views.

### FR-REPORT: Reports
- **FR-REPORT-001** to **FR-REPORT-004**: Detailed reporting filterable by period, building, room, service, applicant, OPD, subsector, status, payment, and PIC. Export capabilities to Excel, PDF, and CSV.

### FR-MASTER: Master Data
- **FR-MASTER-001** to **FR-MASTER-015**: Core system configuration covering buildings, rooms, facilities, capacities, tariffs, services, employees, PICs, organizations, creative economy subsectors, holiday calendars, document templates, WhatsApp templates, categories, and workflows.

### FR-PKL: PKL/Internship Integration
- **FR-PKL-001** to **FR-PKL-005**: Admin interface to create openings (type, title, description, quota, requirements, period, deadline). Applicants view and apply through the portal. Approvals trigger TTE recommendation letters to Bakesbangpol. Integrates with the existing PKL website without duplicating the database.

### FR-FOKUS: FOKUS Catalog
- **FR-FOKUS-001** to **FR-FOKUS-003**: Displays product photography catalog (photo, product name, category, owner, description, date, result). Registration provides seamless links to the external FOKUS system.

### FR-WS: Working Space
- **FR-WS-001** to **FR-WS-004**: Options for per-hour, daily, and monthly usage. Availability synchronization is based on WADUH, making WADUH the ultimate source of truth. The portal serves merely as a display/entry point.

### FR-VO: Virtual Office
- **FR-VO-001** to **FR-VO-005**: Handles package selection, facility information, rate displays, application data entry, document uploads, admin verification, payment processing, and final activation.

### FR-DUBBING: Studio Dubbing
- **FR-DUBBING-001** to **FR-DUBBING-004**: Processes for date selection, availability checking, time selection, requirements form, submission, approval, and booking confirmation.

### FR-ATTENDANCE: Attendance
- **FR-ATTEND-001** to **FR-ATTEND-003**: Imports attendance records from face thermal/fingerprint devices. Provides monthly recaps per employee. Accessible only by Kasubag TU and Kepala UPTD.

### FR-SEARCH: Search
- **FR-SEARCH-001**: Global unified search encompassing rooms, services, PKL listings, and FOKUS catalog items.

### FR-FAVORITES: Favorites
- **FR-FAV-001**: Feature allowing applicants to favorite specific rooms, services, and working spaces for quick access.

### FR-DASHBOARD: Dashboards
- **FR-DASH-001 Applicant**: Displays submission statuses, upcoming activities, and notifications.
- **FR-DASH-002 Admin**: Operational control center highlighting today's activities, pending queues, 7-day lookaheads, and alerts.
- **FR-DASH-003 Kepala UPTD**: High-level monitoring view.
- **FR-DASH-004 Kasubag TU**: Comprehensive view matching Kepala UPTD, with additional PIC management and attendance features.
- **FR-DASH-005 Sekretaris/Kepala Dinas**: Simplified agenda and reporting view.

### FR-CONFIG: Configurable Platform
- **FR-CONFIG-001 Service Builder**: Admins can dynamically create new services defining forms, workflows, tariffs, documents, and notifications.
- **FR-CONFIG-002 Form Builder**: Supports custom fields (text, number, date, time, select, checkbox, upload, signature).
- **FR-CONFIG-003 Workflow Builder**: Allows creation of configurable workflow steps bound by mandatory regulatory guardrails.
- **FR-CONFIG-004 Notification Builder**: Setup event-driven WhatsApp/email notifications conditioned by robust timing rules.

## 6. Non-Functional Requirements
- **NFR-PERF-001**: Main page and calendar must be highly responsive with sub-2s load times.
- **NFR-AVAIL-001**: The system must be stable and highly available for daily operational use.
- **NFR-SCALE-001**: Must seamlessly support adding new services, buildings, rooms, users, and integrations without modifying core code.
- **NFR-MAINT-001**: Administrators must be able to change configurations, forms, and workflows without coding.
- **NFR-RESP-001**: The interface must be responsive across Mobile and Desktop platforms (mobile-first strategy for the applicant portal).
- **NFR-ACCESS-001**: The public-facing portal must be accessible to general public users following standard web accessibility guidelines.
- **NFR-SEC-001**: Sensitive information such as NIK must not be displayed openly.
- **NFR-SEC-002**: Document URLs must be heavily secured and not guessable (never exposed directly without auth).
- **NFR-SEC-003**: Strong authentication via password required (OTP optional).
- **NFR-SEC-004**: Strict role-based authorization for all endpoints and model accesses.
- **NFR-SEC-005**: Proper session security implementations including session expiry and secure logout.
- **NFR-BACKUP-001**: Implement robust, scheduled database and document backup mechanisms.

## 7. Out of Scope (Phase 1)
- Automated payment gateways (manual QRIS verification only).
- Automated booking conflict resolution (Admins must manually choose priorities).
- Automated PKL recommendation letter generation without manual Admin review.
- Full parity with WADUH functionality (the new portal acts as an entry point, but WADUH remains the system of record).

## 8. Known Constraints
- Formal dispositions happen externally via physical paperwork; Admins must upload scanned documents.
- Booking cancellations cannot be executed by applicants directly; they require Admin intervention.
- PIC private phone numbers must never be exposed directly to external applicants.
- Existing operational systems (WADUH, PKL website) maintain their distinct database boundaries and must not be directly merged into the Odoo database.
