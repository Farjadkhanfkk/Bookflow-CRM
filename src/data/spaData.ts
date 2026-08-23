import { Service, TeamMember, Review, FaqItem } from '../types';

export const SPA_INFO = {
  name: "Lumina Med Spa",
  tagline: "Clinical Precision Meets Holistic Serenity",
  subhead: "Bespoke medical aesthetics, physician-formulated skincare, and restorative wellness designed to enhance your natural beauty.",
  phone: "(555) 849-GLOW",
  formattedPhone: "+1 (555) 849-4569",
  email: "concierge@luminamedspa.com",
  address: "428 Beverly Hills Boulevard, Suite 300, Beverly Hills, CA 90210",
  hours: [
    { days: "Monday – Friday", hours: "9:00 AM – 7:00 PM" },
    { days: "Saturday", hours: "9:00 AM – 6:00 PM" },
    { days: "Sunday", hours: "10:00 AM – 4:00 PM (By Appointment)" }
  ],
  stats: {
    clientsServed: "12,500+",
    satisfactionRate: "99.4%",
    yearsExperience: "18+",
    doctorLed: "100%"
  }
};

export const SERVICES: Service[] = [
  {
    id: "hydrafacial-platinum",
    name: "Platinum HydraFacial® MD",
    category: "facials",
    tagline: "Vortex-infusion deep cleanse, painless extractions, peptide infusion & LED light therapy.",
    description: "The ultimate 6-step medical facial experience. We begin with soothing lymphatic drainage to reduce puffiness, followed by deep pore vortex extraction, glycolic exfoliation, antioxidant serum saturation, and customized medical-grade LED light therapy.",
    price: "$295",
    startingPriceNumber: 295,
    duration: "60 min",
    downtime: "Zero (Instant Glow)",
    idealFor: ["Clogged Pores", "Dull Complexion", "Uneven Texture", "Dehydration"],
    benefits: [
      "Immediate visible radiance without irritation",
      "Painless vortex-suction blackhead extraction",
      "Medical-grade hyaluronic acid and peptide bath",
      "Lymphatic drainage detox to contour cheekbones"
    ],
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80",
    popular: true,
    featured: true,
    procedureSteps: [
      "Detoxifying facial lymphatic therapy",
      "Deep vortex exfoliation with lactic acid",
      "Gentle glycolic and salicylic acid peel",
      "Painless vortex-suction pore purification",
      "Custom antioxidant & peptide booster infusion",
      "Medical Red/Blue LED collagen stimulation"
    ]
  },
  {
    id: "medical-chemical-peel",
    name: "Medical-Grade Chemical Peel",
    category: "facials",
    tagline: "Customized clinical acid formulation to dramatically resurface sun damage & hyperpigmentation.",
    description: "Formulated specifically for your unique skin barrier by Dr. Emma and our lead aesthetician Sarah. Using medical blends of TCA, Jessner, or Mandelic acids to accelerate cellular turnover, clear stubborn melasma, and smooth fine lines.",
    price: "$225",
    startingPriceNumber: 225,
    duration: "45 min",
    downtime: "2–4 Days (Gentle Flaking)",
    idealFor: ["Sun Spots & Melasma", "Acne Scarring", "Fine Lines", "Rough Skin Texture"],
    benefits: [
      "Significantly fades stubborn dark spots & post-acne marks",
      "Stimulates deep epidermal collagen turnover",
      "Smoothes rough texture and refines enlarged pores",
      "Includes take-home post-peel recovery serum kit"
    ],
    image: "https://images.unsplash.com/photo-1512290903671-17adc8174f88?auto=format&fit=crop&w=1000&q=80",
    popular: true,
    featured: true,
    procedureSteps: [
      "Comprehensive skin barrier & sebum analysis",
      "Double clarifying cleanse & pH prep balance",
      "Custom acid layer application (monitored closely)",
      "Cooling peptide neutralizer & botanical compress",
      "Barrier restoration lipid cream application"
    ]
  },
  {
    id: "rf-microneedling",
    name: "Morpheus8 RF Microneedling",
    category: "lasers",
    tagline: "Subdermal fractional radiofrequency to tighten, sculpt, and rebuild elastin.",
    description: "Combining ultra-fine insulated microneedles with targeted radiofrequency energy to remodel collagen in the deepest layers of the dermis. Tightens jawline contour, diminishes deep wrinkles, and transforms acne scars.",
    price: "$650",
    startingPriceNumber: 650,
    duration: "75 min",
    downtime: "24–48 Hours (Mild Pinkness)",
    idealFor: ["Skin Laxity & Jowls", "Deep Wrinkles", "Acne Scars", "Neck & Jaw Definition"],
    benefits: [
      "Reaches up to 4mm depth for structural tightening",
      "Dramatic boost in natural collagen and elastin synthesis",
      "Safe and effective across all skin tones (Fitzpatrick I-VI)",
      "Includes topical prescription numbing for maximum comfort"
    ],
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=80",
    popular: true,
    featured: true,
    procedureSteps: [
      "Medical-grade compound numbing for 30 minutes",
      "Skin sanitization & targeted mapping",
      "Multi-depth fractional RF pass delivery",
      "Exosome regenerative serum application",
      "Calming hydrogel cooling mask with Cryo-wand"
    ]
  },
  {
    id: "precision-botox-injectables",
    name: "Physician-Led Botox® & Dysport®",
    category: "injectables",
    tagline: "Subtle, natural-looking muscle relaxation that preserves your expressive grace.",
    description: "Administered exclusively by Dr. Emma Harrison and certified nurse injectors. We prioritize the 'undetectable enhancement' philosophy—smoothing forehead lines, crow's feet, and frown furrows while maintaining natural facial movement.",
    price: "$14 / unit",
    startingPriceNumber: 280,
    duration: "30 min",
    downtime: "Zero (Lunchtime Procedure)",
    idealFor: ["Forehead Lines", "Crow's Feet", "11 Lines (Glabella)", "Masseter Jaw Slimming"],
    benefits: [
      "Conservative dosing tailored to your muscle anatomy",
      "No frozen or unnatural look",
      "Results appear in 3–7 days and last 3–5 months",
      "Complimentary 2-week touch-up assessment"
    ],
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
    popular: true,
    featured: true,
    procedureSteps: [
      "Dynamic facial expression mapping & consultation",
      "Micro-cannula / ultra-fine needle preparation",
      "Gentle precision micro-injections with vibration distraction",
      "Post-injection arnica soothing balm application"
    ]
  },
  {
    id: "dermal-fillers",
    name: "Lip & Cheek Contour Fillers",
    category: "injectables",
    tagline: "Restylane® & Juvéderm® hyaluronic acid to restore volume and define facial harmony.",
    description: "Replenish lost mid-face volume, refine jawlines, or add soft, hydrated fullness to lips. Dr. Emma utilizes micro-cannula techniques for minimal bruising and smooth, harmonious contours.",
    price: "$680 / syringe",
    startingPriceNumber: 680,
    duration: "45 min",
    downtime: "1–2 Days (Mild Swelling)",
    idealFor: ["Thinning Lips", "Hollow Cheeks", "Under-Eye Shadows", "Nasolabial Folds"],
    benefits: [
      "Natural hydration and subtle structural lift",
      "Reversible hyaluronic acid formulas",
      "Micro-cannula technique minimizes bruising risk",
      "Immediate results with continuous integration over 2 weeks"
    ],
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
    popular: false,
    featured: false,
    procedureSteps: [
      "Facial balance and golden-ratio proportion analysis",
      "Topical and local comfort numbing",
      "Precision placement using micro-cannulas",
      "Gentle sculpting massage and cold compress"
    ]
  },
  {
    id: "clear-brilliant-laser",
    name: "Clear + Brilliant® Laser Perméa",
    category: "lasers",
    tagline: "The 'baby Fraxel' that prevents early aging, shrinks pores, and illuminates tone.",
    description: "A gentle fractional laser treatment that creates millions of microscopic thermal zones in upper skin layers. Triggers natural healing to replace damaged tissue with healthy, radiant, youthful skin.",
    price: "$395",
    startingPriceNumber: 395,
    duration: "50 min",
    downtime: "24 Hours (Subtle Sandpaper Texture)",
    idealFor: ["Pore Tightening", "Early Fine Lines", "Uneven Tone", "Preventative Anti-Aging"],
    benefits: [
      "Boosts skin permeability for 500% better serum absorption",
      "Safe year-round maintenance laser",
      "Visibly shrinks pore appearance within 5 days",
      "Includes medical antioxidant infusion during treatment"
    ],
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1000&q=80",
    popular: false,
    featured: true,
    procedureSteps: [
      "Topical soothing numbing cream (20 mins)",
      "Optical tracking laser pass across 8 skin zones",
      "Immediate medical C+E Ferulic serum saturation",
      "Bio-cellulose calming mask with ice globes"
    ]
  },
  {
    id: "nad-iv-therapy",
    name: "Restorative NAD+ & Glow IV Infusion",
    category: "body-wellness",
    tagline: "Cellular rejuvenation, mitochondrial repair, high-dose Glutathione & Vitamin C.",
    description: "Recharge your energy and skin from the inside out in our serene IV lounge. Packed with pure NAD+ coenzyme, Glutathione (the master antioxidant), and B-Complex vitamins to combat fatigue and brighten complexion.",
    price: "$275",
    startingPriceNumber: 275,
    duration: "45–60 min",
    downtime: "Zero (Instant Energy Lift)",
    idealFor: ["Brain Fog & Fatigue", "Skin Dullness", "Jet Lag", "Cellular Longevity"],
    benefits: [
      "100% bioavailability directly into the bloodstream",
      "Powerful whole-body antioxidant detoxification",
      "Supports DNA repair and cellular metabolism",
      "Administered by Registered Nurses in plush private suites"
    ],
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80",
    popular: false,
    featured: false,
    procedureSteps: [
      "Vital signs check & wellness consultation",
      "Gentle IV catheter placement by experienced RN",
      "Relax in heated zero-gravity lounger with warm herbal tea",
      "Slow infusion with high-potency vitamins and electrolytes"
    ]
  },
  {
    id: "dermaplaning-glow",
    name: "Dermaplaning & Pure Oxygen Lift",
    category: "facials",
    tagline: "Manual exfoliation removing peach fuzz followed by hyperbaric oxygen infusion.",
    description: "A surgical-grade scalpel gently removes dead surface cells and fine vellus hair, allowing hyperbaric oxygen and botanical vitamins to penetrate deep into the skin. Flawless canvas for makeup or a natural makeup-free glow.",
    price: "$195",
    startingPriceNumber: 195,
    duration: "45 min",
    downtime: "Zero",
    idealFor: ["Peach Fuzz Removal", "Dry Flaky Patches", "Event Prep", "Glass Skin Finish"],
    benefits: [
      "Instant glass-skin smoothness and light reflection",
      "Zero peach fuzz for silky smooth skincare application",
      "Infused with 98% pure pressurized oxygen & peptides",
      "Safe for pregnant and nursing mothers"
    ],
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=80",
    popular: false,
    featured: false,
    procedureSteps: [
      "Gentle enzyme pre-cleanse",
      "Sterile single-use blade dermaplane exfoliation",
      "Hyperbaric oxygen peptide mist application",
      "Lightweight barrier shield moisturizer"
    ]
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "dr-emma-harrison",
    name: "Dr. Emma Harrison, MD",
    title: "Medical Director & Board-Certified Dermatologist",
    role: "Physician & Founder",
    credentials: "MD, FAAD, Board-Certified",
    experience: "16+ Years Experience",
    bio: "Dr. Emma Harrison completed her dermatology residency and fellowship at Stanford Medicine and Harvard. Renowned for her conservative, artful approach to facial balancing and regenerative aesthetics, Dr. Emma personally designs every treatment protocol at Lumina.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    specialties: ["Full Facial Harmonization", "Advanced Neuromodulators", "Biostimulatory Fillers (Sculptra)"],
    favoriteTreatment: "Bespoke Liquid Facelift Protocol",
    quote: "True aesthetic medicine is not about altering who you are, but restoring the natural balance and vitality of your skin.",
    education: "Stanford University School of Medicine (MD) • Board Certified Dermatology"
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins, LE, CLT",
    title: "Lead Clinical Aesthetician & Laser Specialist",
    role: "Master Aesthetician",
    credentials: "LE, CLT, Master HydraFacial Specialist",
    experience: "11+ Years Experience",
    bio: "Sarah is our celebrated master aesthetician with over a decade of clinical experience in medical peels, laser resurfacing, and stubborn pigment correction. Her holistic skin consultations have transformed thousands of complex acne and melasma conditions.",
    avatar: "https://images.unsplash.com/photo-1594824813511-208cb21ec68a?auto=format&fit=crop&w=600&q=80",
    specialties: ["Platinum HydraFacial®", "Medical-Grade Chemical Peels", "RF Microneedling"],
    favoriteTreatment: "Triple Acid Glow & Infusion Peel",
    quote: "Healthy, luminous skin is built on cellular integrity, clinical actives, and meticulous barrier care.",
    education: "CIDESCO International Diplomat • Certified Laser Technician (CLT)"
  },
  {
    id: "michael-chang",
    name: "Michael Chang, RN, BSN",
    title: "Aesthetic Injector & Micro-Cannula Specialist",
    role: "Injectables Specialist",
    credentials: "RN, BSN, CANS Certified",
    experience: "8+ Years Experience",
    bio: "Michael blends surgical precision with an intuitive eye for facial proportion. Having performed thousands of injectable treatments, he specializes in painless micro-cannula lip contouring, jawline sculpting, and smooth natural wrinkle relaxation.",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    specialties: ["Micro-Cannula Tear Trough", "Lip Architecture", "Preventative Tox"],
    favoriteTreatment: "Under-Eye Brightening Restoration",
    quote: "Precision and micro-dosing ensure subtle rejuvenation that moves naturally with your expressions.",
    education: "Johns Hopkins University (BSN, RN) • Certified Aesthetic Nurse Specialist (CANS)"
  },
  {
    id: "elena-vancet",
    name: "Elena Vancet, LMT, CCE",
    title: "Master Body Contouring & Lymphatic Specialist",
    role: "Wellness & Lymphatic Expert",
    credentials: "LMT, Vodder Certified Lymphatic Specialist",
    experience: "9+ Years Experience",
    bio: "Elena specializes in post-procedure recovery, facial sculpting massage, and full-body lymphatic drainage. Her treatments dramatically reduce inflammation, flush toxins, and impart a profound sense of inner calm.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    specialties: ["Sculptural Face Massage", "Post-Op Lymphatic Drainage", "Radiofrequency Body Sculpting"],
    favoriteTreatment: "Sculpt & Contour Buccal Facial",
    quote: "Detoxification and structural lymphatic drainage are the foundation of sculpted, radiant skin.",
    education: "Swedish Institute College of Health Sciences • Certified Clinical Electrologist"
  }
];

export const REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Claire Sterling",
    location: "Beverly Hills, CA",
    treatment: "Platinum HydraFacial® MD",
    specialist: "Sarah Jenkins, LE",
    rating: 5,
    date: "3 days ago",
    text: "Sarah is an absolute magician! My skin has never looked this clear and dewy. The BookFlow booking system was so seamless, sending me prep reminders and letting me select my exact preferred aesthetician. 10/10 experience!",
    verifiedBookFlow: true
  },
  {
    id: "rev-2",
    author: "Victoria Vance",
    location: "West Hollywood, CA",
    treatment: "Physician-Led Botox & Glow",
    specialist: "Dr. Emma Harrison, MD",
    rating: 5,
    date: "1 week ago",
    text: "I was so nervous about getting Botox for the first time, but Dr. Emma is unmatched. She took 20 minutes just studying how my face moves. The result is completely natural—no frozen look at all! Everyone just asks if I went on vacation.",
    verifiedBookFlow: true
  },
  {
    id: "rev-3",
    author: "Jessica Lin-Montgomery",
    location: "Santa Monica, CA",
    treatment: "Medical Chemical Peel & Peel Kit",
    specialist: "Sarah Jenkins, LE",
    rating: 5,
    date: "2 weeks ago",
    text: "Had stubborn postpartum melasma on my forehead for two years. Two customized peels with Sarah and it is 80% gone. Lumina feels like a 5-star hotel sanctuary where clinical science actually delivers.",
    verifiedBookFlow: true
  },
  {
    id: "rev-4",
    author: "Dr. Jonathan Reyes",
    location: "Brentwood, CA",
    treatment: "Morpheus8 RF Microneedling",
    specialist: "Dr. Emma Harrison, MD",
    rating: 5,
    date: "3 weeks ago",
    text: "As a physician myself, I hold medical spas to the strictest safety standards. Dr. Emma and her team operate with pristine clinical protocols while maintaining the most relaxing spa ambiance I've experienced.",
    verifiedBookFlow: true
  }
];

export const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    category: "general",
    question: "What makes Lumina Med Spa different from a traditional day spa?",
    answer: "Lumina is a physician-owned and directed medical spa. Unlike a traditional day spa, all our treatments utilize FDA-cleared medical technologies, clinical-grade active ingredients, and are performed by board-certified doctors, registered nurses, and licensed medical aestheticians under strict clinical oversight."
  },
  {
    id: "faq-2",
    category: "booking",
    question: "How does online booking with BookFlow work?",
    answer: "Our BookFlow CRM integration allows you to instantly view real-time availability for Dr. Emma, Sarah, and our team. You can choose your preferred treatment, select your provider, and receive instant calendar confirmations with automated SMS reminders and customized pre-treatment instructions."
  },
  {
    id: "faq-3",
    category: "treatments",
    question: "How do I know which facial or peel is right for my skin type?",
    answer: "If you're unsure, we recommend booking a 'Complimentary Clinical Skin Consultation & HydraFacial'. Sarah or Dr. Emma will perform a digital skin barrier analysis to recommend the exact treatment formula for your specific skin tone and concerns."
  },
  {
    id: "faq-4",
    category: "aftercare",
    question: "Is there any downtime with the HydraFacial or Chemical Peels?",
    answer: "The Platinum HydraFacial has zero downtime—you walk out with an immediate luminous glow. For our Medical Chemical Peels, expect mild tightness for 24-48 hours followed by light, discreet flaking for 2-4 days. We provide a complimentary post-peel recovery kit with every treatment."
  },
  {
    id: "faq-5",
    category: "treatments",
    question: "Are injectables like Botox and Dermal Fillers painful?",
    answer: "We prioritize client comfort with prescription-strength topical numbing creams, vibration distraction devices, and micro-cannula techniques. Most clients describe the feeling as a minor pinch lasting only a few seconds."
  }
];
