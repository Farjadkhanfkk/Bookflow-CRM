import { CRMAppointment, CRMPatient, QuickStatMetric, ClinicRoom } from '../types';

export const MOCK_QUICK_STATS: QuickStatMetric[] = [
  {
    id: 'appointments-today',
    title: 'Appointments Today',
    value: '22',
    change: '+14% vs avg',
    isPositive: true,
    subtext: '4 checked in • 2 in treatment • 6 completed',
    iconName: 'Calendar'
  },
  {
    id: 'revenue-today',
    title: "Today's Revenue",
    value: '$8,640',
    change: '+$1,450 vs target',
    isPositive: true,
    subtext: '$5,150 collected • $3,490 at checkout',
    iconName: 'DollarSign'
  },
  {
    id: 'new-leads',
    title: 'New Patient Leads',
    value: '9 Today',
    change: '+3 from yesterday',
    isPositive: true,
    subtext: '7 via BookFlow Web • 2 Phone Intake',
    iconName: 'UserCheck'
  },
  {
    id: 'pending-payments',
    title: 'Pending Payments',
    value: '3 Invoices',
    change: '$1,225 pending',
    isPositive: false,
    subtext: 'Awaiting checkout terminal settlement',
    iconName: 'CreditCard'
  },
  {
    id: 'room-occupancy',
    title: 'Sanctuary Occupancy',
    value: '88%',
    change: '4 / 5 Suites Active',
    isPositive: true,
    subtext: 'Next turnover in 25 mins (Suite 2)',
    iconName: 'Activity'
  }
];

export const MOCK_ROOMS: ClinicRoom[] = [
  {
    id: 'suite-1',
    name: 'Suite 1 — Laser & RF Pavilion',
    type: 'Laser & Energy',
    currentStatus: 'occupied',
    currentAppointment: 'Morpheus8 RF Microneedling',
    currentSpecialist: 'Dr. Emma Harrison, MD'
  },
  {
    id: 'suite-2',
    name: 'Suite 2 — Clinical Facial Suite',
    type: 'Facials & Peels',
    currentStatus: 'occupied',
    currentAppointment: 'Platinum HydraFacial® MD',
    currentSpecialist: 'Sarah Jenkins, LE'
  },
  {
    id: 'suite-3',
    name: 'Suite 3 — Injectables Studio',
    type: 'Injectables & Fillers',
    currentStatus: 'occupied',
    currentAppointment: 'Precision Botox & Contouring',
    currentSpecialist: 'Michael Chang, RN'
  },
  {
    id: 'suite-4',
    name: 'Suite 4 — Restorative Therapy Suite',
    type: 'Lymphatic & Peels',
    currentStatus: 'available',
    currentAppointment: 'Available for walk-in / prep',
    currentSpecialist: 'Elena Vance, LMT'
  },
  {
    id: 'suite-5',
    name: 'Suite 5 — NAD+ Longevity Lounge',
    type: 'IV & Recovery',
    currentStatus: 'reserved',
    currentAppointment: 'NAD+ IV & Glutathione Glow at 02:00 PM',
    currentSpecialist: 'Staff Nurse'
  }
];

export const MOCK_PATIENTS: CRMPatient[] = [
  {
    id: 'p-101',
    name: 'Jessica Sterling',
    email: 'jessica.sterling@luxurybrand.com',
    phone: '(310) 555-0192',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    membershipTier: 'Founder Circle',
    joinDate: 'Jan 2024',
    createdAt: '2024-01-15',
    totalSpend: 5850,
    visitsCount: 14,
    lastVisit: '2 weeks ago',
    preferredSpecialistId: 'dr-emma-harrison',
    skinType: 'Fitzpatrick II • Normal-Dehydrated',
    allergies: ['Aspirin derivatives (no heavy Salicylic)'],
    notes: 'Prefers quiet sessions with chilled lavender towel during mask step. VIP executive client.',
    status: 'active',
    recentTreatments: [
      {
        serviceName: 'Platinum HydraFacial® MD',
        date: 'Today, 10:00 AM',
        specialistName: 'Dr. Emma Harrison, MD',
        price: 295
      },
      {
        serviceName: 'Botox & Dysport Precision (34 units)',
        date: 'Jul 12, 2026',
        specialistName: 'Dr. Emma Harrison, MD',
        price: 520
      },
      {
        serviceName: 'Morpheus8 RF Full Face',
        date: 'May 04, 2026',
        specialistName: 'Dr. Emma Harrison, MD',
        price: 850
      }
    ]
  },
  {
    id: 'p-102',
    name: 'Victoria Montgomery',
    email: 'v.montgomery@beverlylaw.com',
    phone: '(310) 555-8371',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    membershipTier: 'Privilege VIP',
    joinDate: 'Oct 2024',
    createdAt: '2024-01-15',
    totalSpend: 3420,
    visitsCount: 8,
    lastVisit: 'Today',
    preferredSpecialistId: 'sarah-jenkins',
    skinType: 'Fitzpatrick III • Hyperpigmentation prone',
    allergies: ['None declared'],
    notes: 'Focus on post-sun melasma on cheekbones. Highly interested in winter laser series.',
    status: 'active',
    recentTreatments: [
      {
        serviceName: 'Medical-Grade Chemical Peel',
        date: 'Today, 10:30 AM',
        specialistName: 'Sarah Jenkins, LE',
        price: 225
      },
      {
        serviceName: 'Dermaplaning & Pure Oxygen Lift',
        date: 'Jun 28, 2026',
        specialistName: 'Sarah Jenkins, LE',
        price: 195
      }
    ]
  },
  {
    id: 'p-103',
    name: 'Alexander Hayes',
    email: 'alex.hayes@vcpartners.io',
    phone: '(415) 555-9204',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    membershipTier: 'Privilege VIP',
    joinDate: 'Feb 2025',
    createdAt: '2024-01-15',
    totalSpend: 4100,
    visitsCount: 6,
    lastVisit: 'Today',
    preferredSpecialistId: 'dr-emma-harrison',
    skinType: 'Fitzpatrick II • Sensitive / Acne Scars',
    allergies: ['Latex sensitivity'],
    notes: 'Working on jawline acne scar remodeling with Morpheus8 RF. Uses prescribed recovery balm.',
    status: 'active',
    recentTreatments: [
      {
        serviceName: 'Morpheus8 RF Microneedling',
        date: 'Today, 01:30 PM',
        specialistName: 'Dr. Emma Harrison, MD',
        price: 850
      },
      {
        serviceName: 'Clear + Brilliant® Laser',
        date: 'Jun 10, 2026',
        specialistName: 'Dr. Emma Harrison, MD',
        price: 395
      }
    ]
  },
  {
    id: 'p-104',
    name: 'Sophia Chen-Laurent',
    email: 'sophia@laurentdesign.co',
    phone: '(323) 555-4819',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    membershipTier: 'Founder Circle',
    joinDate: 'Nov 2023',
    createdAt: '2024-01-15',
    totalSpend: 9240,
    visitsCount: 22,
    lastVisit: 'Today',
    preferredSpecialistId: 'michael-chang',
    skinType: 'Fitzpatrick III • Combination',
    allergies: ['Lidocaine mild flushing'],
    notes: 'Regular lip & micro-tox client. Drinks green matcha upon arrival.',
    status: 'active',
    recentTreatments: [
      {
        serviceName: 'Lip Architecture & Jawline Sculpt',
        date: 'Today, 03:30 PM',
        specialistName: 'Michael Chang, RN',
        price: 650
      }
    ]
  },
  {
    id: 'p-105',
    name: 'Chloe Kensington',
    email: 'chloe.k@kensingtongallery.org',
    phone: '(310) 555-7281',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    membershipTier: 'Standard',
    joinDate: 'Aug 2026',
    createdAt: '2024-01-15',
    totalSpend: 295,
    visitsCount: 1,
    lastVisit: 'First Visit Today',
    preferredSpecialistId: 'sarah-jenkins',
    skinType: 'Fitzpatrick I • Rosacea prone',
    allergies: ['Fragrance & Essential Oils'],
    notes: 'First time at Lumina. Booked via BookFlow web widget. Include complimentary VISIA scan.',
    status: 'active',
    recentTreatments: [
      {
        serviceName: 'Platinum HydraFacial® MD (First Visit)',
        date: 'Today, 02:00 PM',
        specialistName: 'Sarah Jenkins, LE',
        price: 295
      }
    ]
  },
  {
    id: 'p-106',
    name: 'Marcus Vance',
    email: 'marcus.vance@beverlyestates.com',
    phone: '(310) 555-3004',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    membershipTier: 'Privilege VIP',
    joinDate: 'Mar 2025',
    createdAt: '2024-01-15',
    totalSpend: 2650,
    visitsCount: 5,
    lastVisit: '3 weeks ago',
    preferredSpecialistId: 'elena-vance',
    skinType: 'Fitzpatrick IV • Oily',
    allergies: ['None declared'],
    notes: 'Monthly executive wellness: NAD+ infusion & lymphatic reset.',
    status: 'active',
    recentTreatments: [
      {
        serviceName: 'Restorative NAD+ & Glow IV Infusion',
        date: 'Today, 09:00 AM',
        specialistName: 'Elena Vance, LMT',
        price: 275
      }
    ]
  }
];

export const MOCK_APPOINTMENTS: CRMAppointment[] = [
  {
    id: 'apt-001',
    patientId: 'p-106',
    patientName: 'Marcus Vance',
    patientEmail: 'marcus.vance@beverlyestates.com',
    patientPhone: '(310) 555-3004',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    serviceId: 'nad-iv-therapy',
    serviceName: 'Restorative NAD+ & Glow IV Infusion',
    serviceCategory: 'body-wellness',
    specialistId: 'elena-vance',
    specialistName: 'Elena Vance, LMT',
    date: 'Today',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    durationMinutes: 60,
    room: 'Suite 5 — NAD+ Lounge',
    status: 'completed',
    price: 275,
    paymentStatus: 'paid',
    notes: 'Completed without issue. Chose citrus electrolyte booster.',
    medicalAlerts: ['None'],
    isFirstVisit: false,
    intakeFormCompleted: true
  },
  {
    id: 'apt-002',
    patientId: 'p-101',
    patientName: 'Jessica Sterling',
    patientEmail: 'jessica.sterling@luxurybrand.com',
    patientPhone: '(310) 555-0192',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    serviceId: 'hydrafacial-platinum',
    serviceName: 'Platinum HydraFacial® MD',
    serviceCategory: 'facials',
    specialistId: 'dr-emma-harrison',
    specialistName: 'Dr. Emma Harrison, MD',
    date: 'Today',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    durationMinutes: 60,
    room: 'Suite 1 — Laser Pavilion',
    status: 'in_progress',
    price: 295,
    paymentStatus: 'paid',
    notes: 'Added custom peptide infusion booster. Chilled lavender compress.',
    medicalAlerts: ['Aspirin sensitive (Salicylic adjusted)'],
    isFirstVisit: false,
    intakeFormCompleted: true
  },
  {
    id: 'apt-003',
    patientId: 'p-102',
    patientName: 'Victoria Montgomery',
    patientEmail: 'v.montgomery@beverlylaw.com',
    patientPhone: '(310) 555-8371',
    patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    serviceId: 'medical-chemical-peel',
    serviceName: 'Medical-Grade Chemical Peel (Level 2)',
    serviceCategory: 'facials',
    specialistId: 'sarah-jenkins',
    specialistName: 'Sarah Jenkins, LE',
    date: 'Today',
    startTime: '10:30 AM',
    endTime: '11:15 AM',
    durationMinutes: 45,
    room: 'Suite 2 — Facial Suite',
    status: 'checked_in',
    price: 225,
    paymentStatus: 'deposit_only',
    depositAmount: 50,
    notes: 'Pre-peel numbing applied. Post-peel home kit ready at concierge.',
    medicalAlerts: ['Melasma protocol applied'],
    isFirstVisit: false,
    intakeFormCompleted: true
  },
  {
    id: 'apt-004',
    patientId: 'p-107',
    patientName: 'David H. Reynolds',
    patientEmail: 'david.reynolds@westcap.com',
    patientPhone: '(310) 555-1940',
    patientAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    serviceId: 'clear-brilliant-laser',
    serviceName: 'Clear + Brilliant® Fractional Laser',
    serviceCategory: 'lasers',
    specialistId: 'michael-chang',
    specialistName: 'Michael Chang, RN',
    date: 'Today',
    startTime: '11:00 AM',
    endTime: '11:50 AM',
    durationMinutes: 50,
    room: 'Suite 3 — Injectables Studio',
    status: 'confirmed',
    price: 395,
    paymentStatus: 'pending',
    notes: '20 min pre-treatment topical lidocaine allocated.',
    medicalAlerts: ['None'],
    isFirstVisit: false,
    intakeFormCompleted: true
  },
  {
    id: 'apt-005',
    patientId: 'p-103',
    patientName: 'Alexander Hayes',
    patientEmail: 'alex.hayes@vcpartners.io',
    patientPhone: '(415) 555-9204',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    serviceId: 'morpheus8-rf',
    serviceName: 'Morpheus8 RF Microneedling (Full Face)',
    serviceCategory: 'lasers',
    specialistId: 'dr-emma-harrison',
    specialistName: 'Dr. Emma Harrison, MD',
    date: 'Today',
    startTime: '01:30 PM',
    endTime: '02:45 PM',
    durationMinutes: 75,
    room: 'Suite 1 — Laser Pavilion',
    status: 'confirmed',
    price: 850,
    paymentStatus: 'paid',
    notes: 'Exosome regenerative serum booster added (+$250).',
    medicalAlerts: ['Latex sensitivity'],
    isFirstVisit: false,
    intakeFormCompleted: true
  },
  {
    id: 'apt-006',
    patientId: 'p-105',
    patientName: 'Chloe Kensington',
    patientEmail: 'chloe.k@kensingtongallery.org',
    patientPhone: '(310) 555-7281',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    serviceId: 'hydrafacial-platinum',
    serviceName: 'Platinum HydraFacial® MD',
    serviceCategory: 'facials',
    specialistId: 'sarah-jenkins',
    specialistName: 'Sarah Jenkins, LE',
    date: 'Today',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    durationMinutes: 60,
    room: 'Suite 2 — Facial Suite',
    status: 'confirmed',
    price: 295,
    paymentStatus: 'deposit_only',
    depositAmount: 50,
    notes: 'FIRST VISIT: Complimentary VISIA Digital Complexion Scan requested.',
    medicalAlerts: ['Rosacea prone', 'Fragrance allergy'],
    isFirstVisit: true,
    intakeFormCompleted: true
  },
  {
    id: 'apt-007',
    patientId: 'p-108',
    patientName: 'Genevieve Dupond',
    patientEmail: 'genevieve@artelys.fr',
    patientPhone: '(310) 555-9012',
    patientAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    serviceId: 'dermaplaning-glow',
    serviceName: 'Dermaplaning & Pure Oxygen Lift',
    serviceCategory: 'facials',
    specialistId: 'elena-vance',
    specialistName: 'Elena Vance, LMT',
    date: 'Today',
    startTime: '02:30 PM',
    endTime: '03:15 PM',
    durationMinutes: 45,
    room: 'Suite 4 — Restorative Suite',
    status: 'confirmed',
    price: 195,
    paymentStatus: 'pending',
    notes: 'Red carpet event prep tomorrow evening.',
    medicalAlerts: ['None'],
    isFirstVisit: false,
    intakeFormCompleted: true
  },
  {
    id: 'apt-008',
    patientId: 'p-104',
    patientName: 'Sophia Chen-Laurent',
    patientEmail: 'sophia@laurentdesign.co',
    patientPhone: '(323) 555-4819',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    serviceId: 'botox-dermal',
    serviceName: 'Lip Architecture & Natural Contouring',
    serviceCategory: 'injectables',
    specialistId: 'michael-chang',
    specialistName: 'Michael Chang, RN',
    date: 'Today',
    startTime: '03:30 PM',
    endTime: '04:15 PM',
    durationMinutes: 45,
    room: 'Suite 3 — Injectables Studio',
    status: 'confirmed',
    price: 650,
    paymentStatus: 'pending',
    notes: '1 syringe Restylane Kysse + 12 units micro-tox brow lift.',
    medicalAlerts: ['Mild lidocaine flushing'],
    isFirstVisit: false,
    intakeFormCompleted: true
  },
  {
    id: 'apt-009',
    patientId: 'p-109',
    patientName: 'Rachel Green-Sloan',
    patientEmail: 'rachel.sloan@modernevents.com',
    patientPhone: '(310) 555-6677',
    patientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    serviceId: 'hydrafacial-platinum',
    serviceName: 'Platinum HydraFacial® MD',
    serviceCategory: 'facials',
    specialistId: 'sarah-jenkins',
    specialistName: 'Sarah Jenkins, LE',
    date: 'Today',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    durationMinutes: 60,
    room: 'Suite 2 — Facial Suite',
    status: 'confirmed',
    price: 295,
    paymentStatus: 'paid',
    notes: 'Bridal series session #3.',
    medicalAlerts: ['None'],
    isFirstVisit: false,
    intakeFormCompleted: true
  },
  {
    id: 'apt-010',
    patientId: 'p-110',
    patientName: 'William Sterling III',
    patientEmail: 'w.sterling@sterlingholdings.com',
    patientPhone: '(310) 555-8821',
    patientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    serviceId: 'nad-iv-therapy',
    serviceName: 'Executive NAD+ & Cellular Glow IV',
    serviceCategory: 'body-wellness',
    specialistId: 'dr-emma-harrison',
    specialistName: 'Dr. Emma Harrison, MD',
    date: 'Today',
    startTime: '04:30 PM',
    endTime: '05:30 PM',
    durationMinutes: 60,
    room: 'Suite 5 — NAD+ Lounge',
    status: 'confirmed',
    price: 275,
    paymentStatus: 'pending',
    notes: 'Follow-up longevity consultation with Dr. Emma prior to IV.',
    medicalAlerts: ['Gout history'],
    isFirstVisit: false,
    intakeFormCompleted: true
  }
];

export const MOCK_ACTIVITY_LOGS = [
  {
    id: 'act-1',
    time: '10:04 AM',
    action: 'Patient Checked In',
    details: 'Victoria Montgomery arrived for Chemical Peel with Sarah Jenkins.',
    badge: 'Check-In',
    type: 'checkin'
  },
  {
    id: 'act-2',
    time: '09:58 AM',
    action: 'Online Booking Confirmed',
    details: 'BookFlow Web Widget processed Jessica Sterling for HydraFacial MD.',
    badge: 'Web Booking',
    type: 'booking'
  },
  {
    id: 'act-3',
    time: '09:50 AM',
    action: 'Payment Collected',
    details: 'Marcus Vance settled $275.00 via Terminal 1 (NAD+ Infusion).',
    badge: '$275.00',
    type: 'payment'
  },
  {
    id: 'act-4',
    time: '09:15 AM',
    action: 'Digital Intake Received',
    details: 'Chloe Kensington submitted Medical History & Consent Form.',
    badge: 'Intake Completed',
    type: 'intake'
  }
];

