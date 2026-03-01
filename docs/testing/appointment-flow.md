# Appointment Booking Flow Verification

## Test Date: 2026-02-02

### Flow Overview
```
Patient → Browse Psychologists → Select Psychologist → Book Appointment →
Checkout → Appointment Created → Shows in Both Dashboards → Patient in Psychologist's List
```

---

## ✅ What's Implemented

### 1. Checkout Page (`/checkout`)
- ✅ Calls POST `/api/appointments` with CSRF protection
- ✅ Sends: psychologistId, date, startTime, endTime, duration, type
- ✅ Redirects to `/patient/dashboard/appointments` on success
- ✅ Shows error messages if booking fails

### 2. Appointments API (`/api/appointments`)
- ✅ **POST**: Creates appointment in database
- ✅ Auto-creates Patient profile if missing (with role check)
- ✅ Calculates price based on duration (60 or 90 mins)
- ✅ Sends confirmation emails to both patient and psychologist
- ✅ **GET**: Returns appointments filtered by user role
  - For patients: Returns appointments with psychologist data
  - For psychologists: Returns appointments with patient data
- ✅ Supports status filtering (`?status=SCHEDULED`)

### 3. Patient Dashboard (`/patient/dashboard/appointments`)
- ✅ Uses `useAppointments()` hook
- ✅ Fetches from `/api/appointments`
- ✅ Shows appointment list with psychologist info
- ✅ Loading and error states implemented
- ✅ Empty state for no appointments

### 4. Psychologist Dashboard (`/psychologist/dashboard/appointments`)
- ✅ Uses `useAppointments()` hook
- ✅ Fetches from `/api/appointments`
- ✅ Shows appointment list with patient info
- ✅ Filters by Upcoming/Completed
- ✅ Loading and error states implemented

### 5. Psychologist Patients Page (`/psychologist/dashboard/patients`)
- ✅ NEW: Calls `/api/psychologist/patients`
- ✅ Shows unique patients from appointments
- ✅ Displays statistics: total/completed/upcoming sessions
- ✅ Shows last/next session dates
- ✅ Sorted by upcoming appointments first
- ✅ Message button links to messages page

---

## 🧪 Manual Test Checklist

### Prerequisites
- [ ] Dev server running (`npm run dev`)
- [ ] Database seeded with psychologists
- [ ] Test patient account available (or use Google OAuth)

### Test Steps

#### 1. Browse and Select Psychologist
- [ ] Navigate to `/find-psychologists`
- [ ] Verify psychologists load from database (not mock data)
- [ ] Click on a psychologist card
- [ ] Verify profile page loads with real data

#### 2. Book Appointment
- [ ] On psychologist profile, click "Book Appointment" or similar CTA
- [ ] Verify booking widget appears (or redirects to booking page)
- [ ] Select a date and time
- [ ] Click to proceed to checkout
- [ ] Verify checkout page loads with correct details:
  - [ ] Psychologist name
  - [ ] Selected date
  - [ ] Selected time
  - [ ] Duration
  - [ ] Price

#### 3. Complete Checkout
- [ ] Fill in mock payment details (name, card number, expiry, CVC)
- [ ] Click "Pay" button
- [ ] Verify no errors appear
- [ ] Verify redirect to `/patient/dashboard/appointments`

#### 4. Verify Patient Dashboard
- [ ] Check `/patient/dashboard/appointments` page
- [ ] Verify newly created appointment appears in list
- [ ] Verify appointment shows:
  - [ ] Correct psychologist name and photo
  - [ ] Correct date and time
  - [ ] Correct duration
  - [ ] Status: SCHEDULED
  - [ ] Action buttons (Start Session, Cancel, etc.)

#### 5. Verify Psychologist Dashboard
- [ ] Log in as the psychologist (or switch accounts)
- [ ] Navigate to `/psychologist/dashboard/appointments`
- [ ] Verify the appointment appears in list
- [ ] Verify appointment shows:
  - [ ] Correct patient name and photo
  - [ ] Correct date and time
  - [ ] Correct duration
  - [ ] Status: SCHEDULED

#### 6. Verify Patients List
- [ ] Navigate to `/psychologist/dashboard/patients`
- [ ] Verify the patient appears in the list
- [ ] Verify patient card shows:
  - [ ] Patient name and photo
  - [ ] Email address
  - [ ] Total Sessions: 1
  - [ ] Upcoming Sessions: 1
  - [ ] Next Session Date: [the appointment date]
  - [ ] "Active" badge
  - [ ] Message button

#### 7. Test Multiple Appointments
- [ ] Book another appointment with the same psychologist
- [ ] Verify counters update:
  - [ ] Total Sessions: 2
  - [ ] Upcoming Sessions: 2
- [ ] Book appointment with different psychologist
- [ ] Verify both psychologists show separate patient records

---

## 🔍 Database Verification

Run these queries to verify data:

```sql
-- Check appointments were created
SELECT id, "patientId", "psychologistId", "startTime", status
FROM "Appointment"
ORDER BY "createdAt" DESC
LIMIT 5;

-- Check patient profile was created
SELECT p.id, p."userId", u.name, u.email
FROM "Patient" p
JOIN "User" u ON p."userId" = u.id;

-- Verify psychologist-patient relationship
SELECT
  a."psychologistId",
  a."patientId",
  COUNT(*) as appointment_count
FROM "Appointment" a
GROUP BY a."psychologistId", a."patientId";
```

---

## 🐛 Known Issues to Check

### Booking Widget Integration
- ❓ Which profile route is being used?
  - `/psychologists/[id]` (public route)
  - `/(public)/psychologist/[id]` (alternate public route)
- ❓ Does the booking widget pass `psychologistId` correctly?
- ❓ Does it pass real date/time values (not mock)?

### Potential Issues
1. **Missing psychologistId**: If booking widget doesn't pass psychologistId, checkout will fail
2. **Mock date/time**: If hardcoded times are passed, booking won't reflect actual selection
3. **Patient profile creation**: If role is not PATIENT, booking fails with 403
4. **CSRF token**: If CSRF fetch fails, booking cannot proceed

---

## 📊 Expected Results

### After Successful Booking:

**Patient Dashboard:**
- Shows 1 appointment
- Appointment has psychologist info (name, photo, credentials)
- Status: SCHEDULED
- Can start session, send message, or cancel

**Psychologist Dashboard:**
- Shows 1 appointment
- Appointment has patient info (name, photo)
- Status: SCHEDULED
- Can start session or contact patient

**Psychologist Patients List:**
- Shows 1 patient
- Patient has correct name, photo, email
- Total Sessions: 1
- Upcoming Sessions: 1
- Next Session Date: [correct date]
- "Active" badge visible
- Message button functional

---

## 🔄 Next Steps After Verification

If all tests pass:
- ✅ Appointment flow is fully functional
- ✅ Move to Part C: Fix dashboard widget placeholders

If tests fail:
- Debug specific failure point
- Check browser console for errors
- Check server logs for API errors
- Verify database records were created
- Fix booking widget if psychologistId or dates are missing
