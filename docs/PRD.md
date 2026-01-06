# IKEA Installation Forms Manager - PRD

## Product Overview

**Product Name:** IKEA Forms Manager (рабочее название)
**Version:** MVP 1.0
**Target Users:** Форманы-установщики IKEA кухонь (Phoenix NY Inc.)
**Platform:** PWA (Progressive Web App) для мобильных устройств

---

## Problem Statement

Установщики IKEA кухонь тратят значительное время на заполнение бумажных/PDF форм на объектах:
- Неудобно заполнять PDF с телефона
- Ручной ввод одних и тех же данных (Customer, Address, Installer) на каждую форму
- Риск забыть заполнить обязательные поля
- Сложность с подписями и отправкой документов

---

## Solution

Мобильное PWA-приложение с:
1. **Парсингом данных** из текста календаря Google
2. **Автозаполнением** шапок форм
3. **Пошаговым интерфейсом** для заполнения
4. **Валидацией** обязательных полей
5. **Электронными подписями**
6. **Экспортом в PDF** и отправкой в Telegram

---

## User Roles (MVP)

### Форман (Installer)
- Создаёт заказ через вставку текста
- Заполняет формы на объекте
- Собирает подписи клиента
- Отправляет готовые формы

---

## Job Types & Required Forms

| Тип работы | Определитель | Формы |
|------------|-------------|-------|
| **Installation** | Нет "prefit" и "wo" | Start Notes → Kitchen Article Request → Change Notes → Completion Report → Wall Anchoring |
| **Work Order (WO)** | Содержит "wo" | Change Notes → Completion Report |
| **Prefit** | Содержит "prefit" | Site Condition Report |

---

## Core Features (MVP)

### 1. Text Parser
**Input:** Текст из Google Calendar
```
Confirmed/IKEA CT Windzer Pierre-Louis 12033260349
Вторник, 2 декабря⋅9:00AM–6:00PM
3 Locust Ln, Farmington, CT 06032, USA
door
```

**Output:**
```json
{
  "status": "confirmed",
  "jobType": "installation",
  "region": "CT",
  "customer": {
    "name": "Windzer Pierre-Louis",
    "phone": "2033260349"
  },
  "address": "3 Locust Ln, Farmington, CT 06032, USA",
  "date": "2024-12-02",
  "time": "9:00AM–6:00PM",
  "notes": "door"
}
```

**Parser Rules:**
- `prefit` в тексте → jobType = "prefit"
- `wo` в тексте → jobType = "wo"
- Иначе → jobType = "installation"
- Имя: 2-3 слова с заглавной буквы после IKEA/региона, до цифр
- Телефон: 10-11 цифр в конце первой строки
- Адрес: строка с ZIP кодом (5 цифр)
- Регион: 2 заглавные буквы после IKEA

### 2. Installer Profile (Local Storage)
```json
{
  "name": "John Smith",
  "phone": "1234567890",
  "company": "Phoenix NY Inc."
}
```
- Вводится один раз при первом запуске
- Сохраняется в localStorage
- Можно редактировать в настройках

### 3. Form Filling Interface

#### Start Notes (3 pages)
**Page 1 - Header & Pre-installation:**
- Customer (auto)
- Address (auto)
- Installer (auto)
- 14 checkboxes (pre-installation discussion)

**Page 1 - Appliance Fit Guide:**
- 7 appliances × (New/Existing radio + W/D/H measurements)

**Page 1 - Job Site Conditions:**
- Text area for notes
- Customer signature
- Installer signature

**Page 2 - Ceiling & Toe Kick:**
- Ceiling gaps (largest/smallest)
- Toe kick gaps (largest/smallest)
- Ceiling treatment (6 radio options)
- Under cabinet trim (4 radio options)

**Page 3 - Cabinet Placement:**
- Countertop thickness
- Notes text area
- Customer signature
- Installer signature

#### Change Notes (1 page)
- Customer, Address, Installer (auto)
- 12 rows: Description, Price, Quantity, Total
- Total amount (auto-calculated)
- Date fields
- Signatures

#### Kitchen Article Request (1 page)
- Customer info (name, phone, email, order#)
- Installer info (name, phone, notes)
- Date, Scheduled end
- Parts Damaged table (7 rows)
- Parts Needed table (7 rows)

#### Completion Report (1 page)
- Customer, Address, Installer (auto)
- Satisfaction rating (1-5)
- Walkthrough checklist (Customer + Installer checkboxes)
- Additional work notes
- Missing items table (6 rows)
- Signatures

#### Wall Anchoring (2 pages)
- Customer name, Address
- Date, Installer name, Company
- Drywall with wooden studs section
- Drywall with metal studs section
- Solid concrete/block/brick section
- Hollow concrete/block/brick section
- Island/peninsula section

#### Site Condition Report (2 pages) - Prefit only
- Contact, Address, Phone
- Work Order Number, Service Territory, Service Resource Id
- Actual Start Date
- Plan Readiness checklist
- Additional Notes
- Signatures

### 4. Validation System

**Required Field Rules:**
- Customer name: required
- Address: required
- Installer name: required
- All checkbox sections: at least awareness (not required to check all)
- Signatures: required before export

**Empty Form Handling:**
- Kitchen Article Request: If no damaged/missing items, fill first row with "None"
- Change Notes: If no changes, fill first row with "N/A - No additional work"

### 5. Signature Capture

**Flow:**
1. User taps "Sign" button
2. Optional: "View Full Document" button → shows PDF preview
3. Full-screen signature canvas appears
4. User signs with finger
5. Signature saved as PNG
6. Embedded into PDF at correct position

### 6. PDF Export

**Process:**
1. Take original IKEA PDF template
2. Fill form fields with entered data
3. Embed signature images
4. Generate filled PDF
5. Save to device / Share

### 7. Telegram Integration

**Flow:**
1. User completes all forms for a job
2. Taps "Send to Telegram"
3. Bot sends all PDFs to foreman's group
4. Confirmation shown in app

---

## Technical Architecture

### Frontend Stack
- **Framework:** React 18
- **Build:** Vite
- **PWA:** vite-plugin-pwa
- **State:** Zustand (simple, works offline)
- **Forms:** React Hook Form
- **Styling:** Tailwind CSS
- **Signature:** react-signature-canvas
- **PDF:** pdf-lib (client-side PDF manipulation)
- **i18n:** react-i18next (EN/RU)

### Data Storage (MVP - Local Only)
```
localStorage:
├── installer-profile     # Installer data
├── current-job          # Active job data
├── draft-forms          # In-progress form data
└── completed-jobs       # History (last 50)
```

### Offline Support
- Service Worker caches app shell
- Form data saved to localStorage
- PDF templates cached
- Sync when online (future)

### File Structure
```
ikea-forms-app/
├── public/
│   ├── templates/           # Original IKEA PDF templates
│   │   ├── start-notes.pdf
│   │   ├── change-notes.pdf
│   │   ├── kitchen-articles.pdf
│   │   ├── completion-report.pdf
│   │   ├── wall-anchoring.pdf
│   │   └── site-condition.pdf
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── TextField.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   └── SignatureCanvas.tsx
│   │   ├── forms/
│   │   │   ├── StartNotes/
│   │   │   ├── ChangeNotes/
│   │   │   ├── KitchenArticles/
│   │   │   ├── CompletionReport/
│   │   │   ├── WallAnchoring/
│   │   │   └── SiteCondition/
│   │   └── layout/
│   │       ├── AppShell.tsx
│   │       └── FormStepper.tsx
│   ├── hooks/
│   │   ├── useParser.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePdfExport.ts
│   ├── store/
│   │   ├── jobStore.ts
│   │   └── installerStore.ts
│   ├── utils/
│   │   ├── parser.ts
│   │   ├── pdfFiller.ts
│   │   └── validation.ts
│   ├── locales/
│   │   ├── en.json
│   │   └── ru.json
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── pdf-field-maps/          # JSON maps of PDF field IDs
│   ├── start-notes.json
│   ├── change-notes.json
│   └── ...
├── docs/
│   └── PRD.md
├── package.json
└── vite.config.ts
```

---

## UI/UX Design Principles

### Mobile-First
- Large touch targets (min 44px)
- Single column layout
- Swipe navigation between form sections
- Bottom-anchored action buttons

### Form Flow
1. **Home:** Paste text or view recent jobs
2. **Job Created:** Shows parsed data, select forms
3. **Form List:** Progress indicator for each form
4. **Form View:** Step-by-step sections
5. **Review:** Preview before export
6. **Export:** Generate PDF, share

### Visual Feedback
- ✅ Completed sections
- 🔴 Required fields missing
- 🟡 In progress
- Haptic feedback on signature save

---

## MVP Scope Boundaries

### In Scope
- Text parsing from calendar
- Local installer profile
- All 6 form types
- Basic validation
- Signature capture
- PDF generation
- Telegram share (manual)
- Offline form filling
- EN/RU languages

### Out of Scope (Phase 2)
- Backend server
- User authentication
- Manager dashboard
- Job assignment
- Push notifications
- Analytics
- Telegram bot automation
- Photo upload to app
- Multi-device sync

---

## Success Metrics

1. **Time saved:** Form filling time reduced by 50%
2. **Error reduction:** Zero missing required fields
3. **Adoption:** All foremen using daily within 2 weeks
4. **Reliability:** Works offline on all job sites

---

## Timeline

**Week 1:**
- Project setup, PDF field mapping
- Parser implementation
- Basic form components

**Week 2:**
- All form interfaces
- Validation system
- Signature capture

**Week 3:**
- PDF generation
- Offline support
- Testing with real forms

**Week 4:**
- Polish, bug fixes
- Deploy to Vercel
- User testing with foremen
