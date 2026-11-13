export interface FestEvent {
  id: string;
  title: string;
  tagline: string;
  category: 'Coding' | 'Robotics' | 'Aero & Drone' | 'Esports' | 'Startup & Pitch' | 'Mechanical & Civil' | 'Fun & Brain';
  date: string;
  time: string;
  venue: string;
  image: string;
  description: string;
  teamSize: string;
  entryFee: string;
  prizes: string;
  rules: string[];
  coordinators: { name: string; contact: string }[];
  featured?: boolean;
}

export interface FestPass {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  tagline: string;
  isPopular?: boolean;
  features: string[];
  accessScope: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  category: string;
  venue: string;
  day: 'Day 1' | 'Day 2';
  description: string;
}

export interface CampusClub {
  id: string;
  name: string;
  role: string;
  icon: 'code' | 'bot' | 'plane' | 'sparkles' | 'gamepad' | 'cpu';
  colorClass: string;
  leadName: string;
}

export interface OrganizerMember {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  category: 'faculty' | 'student' | 'team';
  featuredFooter: boolean;
}

export const FEST_INFO = {
  name: "TechySheikhpura '26",
  shortName: "TechySheikhpura",
  tagline: "Where Ideas Meet Innovation",
  subtitle: "The Premier Intra-College Techno-Cultural & Innovation Festival",
  collegeName: "Government Engineering College, Sheikhpura",
  shortCollegeName: "GEC Sheikhpura",
  dates: "September 28 - 29, 2026",
  venue: "GEC Sheikhpura Main Campus, NH-333A, Mehus, Sheikhpura, Bihar — 811105",
  stats: [
    { label: "Engineering Events", value: "14+" },
    { label: "Cash Prize Pool", value: "₹75,000+" },
    { label: "Expected Innovators", value: "1,200+" },
    { label: "Days of Innovation", value: "2 Days" },
  ],
  contacts: {
    email: "techy@gecsheikhpura.ac.in",
    phone: "+91 6341 223010",
    studentConvenor: "+91 98765 43210",
    telegram: "https://t.me/beucsepreparation",
  }
};

export const FEST_EVENTS: FestEvent[] = [
  {
    id: "hackarena",
    title: "HackArena",
    tagline: "24-Hour Non-Stop Collaborative Code Sprint",
    category: "Coding",
    date: "Day 1 (Sep 28)",
    time: "10:30 AM (24 Hours)",
    venue: "Central Computing Center, Admin Block",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    description: "Form a team, build production-grade web/mobile/AI solutions to address real-world Bihar civic, agriculture, and education challenges. High-speed network and midnight snacks provided.",
    teamSize: "2 - 4 Members",
    entryFee: "Included in Fest Pass",
    prizes: "₹18,000 + Cloud Credits & Trophies",
    rules: [
      "Open exclusively to GEC Sheikhpura students across all branches and batches.",
      "Code repositories must be initialized after the opening ceremony prompt announcement.",
      "Projects will be judged on innovation, UI/UX, tech implementation, and final pitch.",
    ],
    coordinators: [
      { name: "Aryan Raj (CSE 3rd Year)", contact: "+91 98765 43210" },
      { name: "Pooja Sharma (CSE 3rd Year)", contact: "+91 98765 43211" }
    ],
    featured: true,
  },
  {
    id: "track-o-bot",
    title: "Track-O-Bot",
    tagline: "High-Speed Autonomous Line Follower & Obstacle Bot",
    category: "Robotics",
    date: "Day 1 (Sep 28)",
    time: "01:30 PM - 04:30 PM",
    venue: "Central Robotic Arena (Near Admin Lawn)",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    description: "Design and calibrate your autonomous micro-robot to navigate complex black/white path curves, sharp turns, intersections, and dynamic bridge slopes in the fastest recorded time.",
    teamSize: "1 - 3 Members",
    entryFee: "Included in Fest Pass",
    prizes: "₹12,000 + Maker Hardware Kits",
    rules: [
      "Bot dimensions must not exceed 25cm x 25cm x 25cm.",
      "Microcontroller can be Arduino, ESP32, STM32, or Raspberry Pi Pico.",
      "Manual intervention results in a 5-second penalty per touch.",
    ],
    coordinators: [
      { name: "Aditya Prakash (Mechatronics)", contact: "+91 98765 43212" },
      { name: "Vikash Gupta (EE)", contact: "+91 98765 43213" }
    ],
    featured: true,
  },
  {
    id: "aerostrike",
    title: "AeroStrike",
    tagline: "Precision Drone Obstacle Derby & RC Flying Duel",
    category: "Aero & Drone",
    date: "Day 2 (Sep 29)",
    time: "11:00 AM - 02:00 PM",
    venue: "College Main Sports Grounds",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    description: "Pilot your custom quadcopter or RC plane through neon hoops, smoke rings, slalom pylons, and precision pinpoint landing pads in this aerial thrill.",
    teamSize: "1 - 2 Pilots",
    entryFee: "Included in Fest Pass",
    prizes: "₹10,000 + Flight Controller Toolkits",
    rules: [
      "Quadcopter frames must comply with safety propellers guards.",
      "FPV video or Line of Sight (LOS) piloting permitted.",
      "Each team is given 2 trial runs; best lap time determines final rank.",
    ],
    coordinators: [
      { name: "Rohan Patel (Mechanical)", contact: "+91 98765 43214" }
    ],
    featured: true,
  },
  {
    id: "speed-stroke",
    title: "Speed Stroke",
    tagline: "High-Pressure Mechanical Keyboard Typing & Debugging",
    category: "Coding",
    date: "Day 1 (Sep 28)",
    time: "03:00 PM - 05:00 PM",
    venue: "Lab-3, CSE Department",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    description: "How fast can your fingers type under adrenaline rush? Test your raw words-per-minute (WPM), accuracy, and code snippet typing against the top keyboard gladiators of GEC Sheikhpura.",
    teamSize: "Solo (Individual)",
    entryFee: "Included in Fest Pass",
    prizes: "₹5,000 + Mechanical Keyboard Prizes",
    rules: [
      "Keyboard switches provided or personal mechanical boards allowed.",
      "3 rounds: Warmup Paragraph, Complex Algorithmic Code Syntax, and Speed Sprint.",
      "Accuracy under 95% incurs speed deductions.",
    ],
    coordinators: [
      { name: "Komal Verma (CSE)", contact: "+91 98765 43215" }
    ],
  },
  {
    id: "pro-to-pitch",
    title: "Pro-To-Pitch",
    tagline: "Startup Innovation & Prototype Investor Pitch",
    category: "Startup & Pitch",
    date: "Day 2 (Sep 29)",
    time: "10:30 AM - 01:00 PM",
    venue: "Main Smart Seminar Hall",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    description: "Do you have a product or tech idea that can solve real community pain points or turn into a high-growth startup? Pitch your pitch deck and functional prototype before our jury.",
    teamSize: "1 - 3 Members",
    entryFee: "Included in Fest Pass",
    prizes: "₹10,000 + Incubation Support from Startup Cell",
    rules: [
      "7 minutes pitch deck presentation + 3 minutes Q&A by faculty and guest angel mentors.",
      "Working prototype or software demo yields bonus evaluation points.",
    ],
    coordinators: [
      { name: "Surya Prakash (Startup Cell)", contact: "+91 98765 43216" }
    ],
    featured: true,
  },
  {
    id: "decode-gecs",
    title: "Decode GECS",
    tagline: "Campus-Wide Cryptic Treasure Hunt & Cipher Quest",
    category: "Fun & Brain",
    date: "Day 2 (Sep 29)",
    time: "02:00 PM - 05:00 PM",
    venue: "Starts at Administrative Block Porch",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    description: "Decode cryptographic clues, scan hidden QR codes hidden across the academic block, workshops, and sports pavilions, and race against the clock to unlock the final mystery box.",
    teamSize: "2 - 4 Members",
    entryFee: "Included in Fest Pass",
    prizes: "₹6,000 + Trophy & Goodies",
    rules: [
      "Clues involve engineering logic, ciphers, college lore, and Morse codes.",
      "No running inside classrooms during active test sessions.",
      "First team to reach the final checkpoint with solved puzzle chain wins.",
    ],
    coordinators: [
      { name: "Kajal Kumari (Civil)", contact: "+91 98765 43217" }
    ],
  },
  {
    id: "mechdash",
    title: "MechDash",
    tagline: "CAD 3D Modeling Sprint & Assembly Speedrun",
    category: "Mechanical & Civil",
    date: "Day 1 (Sep 28)",
    time: "11:30 AM - 01:30 PM",
    venue: "CAD/CAM Computing Studio",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    description: "Given 2D technical drawings of complex mechanical components, model them accurately in SolidWorks/AutoCAD within the time limit and compute stress points.",
    teamSize: "Individual / Pair",
    entryFee: "Included in Fest Pass",
    prizes: "₹6,000 + Design Certifications",
    rules: [
      "Standard CAD software (SolidWorks / Fusion 360 / AutoCAD) provided on lab systems.",
      "Scoring based on dimensional accuracy, constraint definition, and completion speed.",
    ],
    coordinators: [
      { name: "Nilesh Kumar (Mechanical)", contact: "+91 98765 43218" }
    ],
  },
  {
    id: "nirman-ignite",
    title: "Nirman (Bridge Crafter)",
    tagline: "Popsicle Stick Truss Bridge Structural Load Duel",
    category: "Mechanical & Civil",
    date: "Day 2 (Sep 29)",
    time: "11:30 AM - 02:30 PM",
    venue: "Civil Concrete Testing Bay",
    image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80",
    description: "Construct a lightweight bridge using only standard popsicle sticks and craft glue, and watch it withstand hydraulic tensile and compressive loads till destruction!",
    teamSize: "2 - 3 Members",
    entryFee: "Included in Fest Pass",
    prizes: "₹6,000 + Trophies",
    rules: [
      "Materials provided by organizing committee on the spot.",
      "Load efficiency ratio (Max Load Carried / Self Weight) determines the winner.",
    ],
    coordinators: [
      { name: "Ravi Kumar (Civil)", contact: "+91 98765 43219" }
    ],
  },
  {
    id: "esports-bgmi",
    title: "Esports Arena: BGMI Battle Royale",
    tagline: "Battlegrounds Mobile India Squad Championship",
    category: "Esports",
    date: "Day 1 (Sep 28)",
    time: "04:30 PM - 07:30 PM",
    venue: "Main Amphitheater & Live Streaming Screen",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    description: "Drop onto Erangel! 25 squads clash in competitive custom rooms with official tournament points table (Kill points + Placement points). Live shoutcasting on the big screen.",
    teamSize: "4 Players Squad",
    entryFee: "₹29 / Pass",
    prizes: "₹8,000 Cash + Winner Trophies",
    rules: [
      "Mobile phones only; strictly no emulators, iPads, or triggers allowed.",
      "Anti-cheat screencasting checks before and during matches.",
      "Maps: Erangel and Miramar. 3 matches total.",
    ],
    coordinators: [
      { name: "Shashi Sharma (EE)", contact: "+91 98765 43220" }
    ],
    featured: true,
  },
  {
    id: "esports-freefire",
    title: "Esports Arena: Free Fire Clash",
    tagline: "Fast-Paced Free Fire MAX Bermuda Tournament",
    category: "Esports",
    date: "Day 2 (Sep 29)",
    time: "03:30 PM - 06:30 PM",
    venue: "Digital Theater-2",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    description: "Fast reflex gunfights, gloo wall mastery, and squad strategy across classic Bermuda battlegrounds.",
    teamSize: "4 Players Squad",
    entryFee: "₹29 / Pass",
    prizes: "₹6,000 Cash + Diamond Packs",
    rules: [
      "No third-party configs or PC clients allowed.",
      "Custom room IDs shared 10 minutes prior to match schedule.",
    ],
    coordinators: [
      { name: "Deepak Kumar (ECE)", contact: "+91 98765 43221" }
    ],
  },
  {
    id: "trilexicon",
    title: "TriLexicon: Science & Tech Trivia",
    tagline: "The Ultimate Engineering Mind & General Science Clash",
    category: "Fun & Brain",
    date: "Day 1 (Sep 28)",
    time: "02:00 PM - 03:30 PM",
    venue: "Seminar Hall-2",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    description: "Test your encyclopedic grasp of tech breakthroughs, space missions, computing history, and rapid-fire buzzer rounds.",
    teamSize: "2 Members",
    entryFee: "Included in Fest Pass",
    prizes: "₹4,000 + Medals",
    rules: [
      "Written prelims round followed by on-stage buzzer finals for top 6 teams.",
      "Negative marking for wrong answers in buzzer round.",
    ],
    coordinators: [
      { name: "Neha Singh (EE)", contact: "+91 98765 43222" }
    ],
  },
  {
    id: "circuitrix",
    title: "Circuitrix",
    tagline: "Breadboard Debugging & Analog/Digital Hardware Hunt",
    category: "Robotics",
    date: "Day 2 (Sep 29)",
    time: "01:00 PM - 03:00 PM",
    venue: "Hardware Electronics Lab, ECE Block",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80",
    description: "Trace circuit schematics, detect intentionally planted hardware bugs, solder missing connections, and produce clean oscilloscope waveforms.",
    teamSize: "1 - 2 Members",
    entryFee: "Included in Fest Pass",
    prizes: "₹5,000 + Multimeter & Soldering Kits",
    rules: [
      "Components (Diodes, 555 timers, op-amps, logic gates) provided on workbench.",
      "Timed round with marks for elegance and neat wiring.",
    ],
    coordinators: [
      { name: "Priya Ranjan (ECE)", contact: "+91 98765 43223" }
    ],
  },
  {
    id: "webcraft",
    title: "WebCraft Studio",
    tagline: "Rapid Responsive UI/UX & Full-Stack Web Sprint",
    category: "Coding",
    date: "Day 1 (Sep 28)",
    time: "01:00 PM - 04:00 PM",
    venue: "Lab-2, CSE Department",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    description: "Build and deploy a responsive, accessible modern web experience from a live problem prompt within 3 hours using React, Tailwind, or vanilla Web APIs.",
    teamSize: "1 - 2 Members",
    entryFee: "Included in Fest Pass",
    prizes: "₹6,000 + Dev Swag Kits",
    rules: [
      "Themes and Figma wireframes revealed live at the start of the round.",
      "AI boilerplate generators restricted; clean custom code is evaluated.",
      "Judging covers responsive layout, performance, accessibility, and polish.",
    ],
    coordinators: [
      { name: "Dilkhush Kumar (CSE)", contact: "+91 98765 43224" }
    ],
  },
  {
    id: "technocross",
    title: "TechnoCross",
    tagline: "Engineering Crossword & Rapid Logic Puzzle",
    category: "Fun & Brain",
    date: "Day 2 (Sep 29)",
    time: "12:00 PM - 01:30 PM",
    venue: "Academic Hall A-204",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    description: "Decode technical crossword grids, algorithmic riddles, and core engineering trivia under a ticking countdown clock.",
    teamSize: "Solo (Individual)",
    entryFee: "Included in Fest Pass",
    prizes: "₹4,000 + Certificates & Trophies",
    rules: [
      "Printed grid round followed by rapid-fire tie-breaker puzzles.",
      "No phones or external search tools allowed inside the hall.",
    ],
    coordinators: [
      { name: "Ankit Raj (EE)", contact: "+91 98765 43225" }
    ],
  },
];

export const FEST_PASSES: FestPass[] = [
  {
    id: "all-events-pass",
    name: "All-Events Tech Pass",
    price: 149,
    originalPrice: 299,
    tagline: "The Definitive Access Pass to TechySheikhpura '26",
    isPopular: true,
    accessScope: "Full access across all 14+ technical, coding, robotics, and design events",
    features: [
      "Unlimited participation in HackArena, Track-O-Bot, AeroStrike, Speed Stroke, Pro-To-Pitch & Decode GECS",
      "Official TechySheikhpura delegate lanyard and physical fest kit",
      "Official Verified Digital Certificate of Participation",
      "Complimentary high-speed Wi-Fi token for computing labs",
      "Canteen food coupon for Day 1 & Day 2 lunch refreshments",
      "Access to keynote talks by IIT/Industry pioneers",
    ]
  },
  {
    id: "esports-pass",
    name: "E-Sports Arena Pass",
    price: 29,
    originalPrice: 99,
    tagline: "Exclusive Entry for BGMI & Free Fire MAX Champions",
    isPopular: false,
    accessScope: "Direct squad slot for esports battle royale tournaments",
    features: [
      "Confirmed slot in BGMI or Free Fire tournament rooms",
      "Big screen live stream feature with spectator commentary",
      "Official E-Sports Participant Certificate",
      "Eligible for ₹14,000 cash prize pool",
      "Esports badge and digital tournament player pass",
    ]
  },
  {
    id: "vip-innovator-pass",
    name: "VIP Innovator All-Access",
    price: 199,
    originalPrice: 499,
    tagline: "All Tech Events + All Esports + Exclusive Swag Pack",
    isPopular: false,
    accessScope: "Complete unrestricted VIP clearance for entire festival",
    features: [
      "Includes ALL Tech Events + BOTH Esports Tournaments (BGMI & Free Fire)",
      "Premium TechySheikhpura Printed Fest T-Shirt",
      "Priority registration queue & hardware testing benches",
      "Reserved seating in opening & closing felicitation ceremonies",
      "Direct 1-on-1 feedback session with Startup Incubator mentors",
    ]
  }
];

export const FEST_SCHEDULE: ScheduleItem[] = [
  {
    day: "Day 1",
    time: "09:00 AM - 10:30 AM",
    title: "Grand Inauguration Ceremony",
    category: "Ceremony",
    venue: "Main Auditorium, GEC Sheikhpura",
    description: "Lamp lighting, address by Principal Dr. Anil Singh Yadav, and unveiling of TechySheikhpura '26 trophy.",
  },
  {
    day: "Day 1",
    time: "10:30 AM Onwards",
    title: "HackArena: 24-Hour Hackathon Kickoff",
    category: "Coding",
    venue: "Central Computing Center",
    description: "Problem statement reveal and coding sprint begins for 40+ engineering teams.",
  },
  {
    day: "Day 1",
    time: "11:30 AM - 01:30 PM",
    title: "MechDash: 3D CAD Assembly Race",
    category: "Mechanical",
    venue: "CAD Simulation Studio",
    description: "SolidWorks rapid modeling sprint under countdown clock.",
  },
  {
    day: "Day 1",
    time: "01:30 PM - 04:30 PM",
    title: "Track-O-Bot: Autonomous Line Following",
    category: "Robotics",
    venue: "Central Robotics Arena",
    description: "Autonomous robots navigate complex curved tracks.",
  },
  {
    day: "Day 1",
    time: "03:00 PM - 05:00 PM",
    title: "Speed Stroke: Typing Gladiators",
    category: "Coding",
    venue: "Computer Lab 3",
    description: "High WPM keyboard speed competition.",
  },
  {
    day: "Day 1",
    time: "04:30 PM - 07:30 PM",
    title: "Esports Arena: BGMI Battlegrounds",
    category: "Esports",
    venue: "Open Amphitheater (Big Screen)",
    description: "25 squads battle on Erangel with live crowd shoutcasting.",
  },
  {
    day: "Day 2",
    time: "10:00 AM - 10:30 AM",
    title: "HackArena Code Freeze & Submission",
    category: "Coding",
    venue: "Central Computing Center",
    description: "GitHub commit verification and jury code review.",
  },
  {
    day: "Day 2",
    time: "10:30 AM - 01:00 PM",
    title: "Pro-To-Pitch: Startup Investor Arena",
    category: "Startup",
    venue: "Smart Seminar Hall",
    description: "Student founders pitch working prototypes to angel jury.",
  },
  {
    day: "Day 2",
    time: "11:00 AM - 02:00 PM",
    title: "AeroStrike: Drone Obstacle Derby",
    category: "Aero",
    venue: "College Main Grounds",
    description: "Precision drone flying through neon hoops and smoke gates.",
  },
  {
    day: "Day 2",
    time: "02:00 PM - 05:00 PM",
    title: "Decode GECS: The Great Treasure Hunt",
    category: "Fun",
    venue: "Admin Block Porch to Campus Quads",
    description: "Campus-wide cryptographic cipher cracking challenge.",
  },
  {
    day: "Day 2",
    time: "05:30 PM - 07:30 PM",
    title: "Grand Valedictory & Prize Distribution",
    category: "Ceremony",
    venue: "Main Auditorium",
    description: "Distribution of ₹75,000 cash prizes, trophies, certificates, and celebration DJ night.",
  },
];

export const FEST_FAQS = [
  {
    q: "Who is eligible to participate in TechySheikhpura '26?",
    a: "TechySheikhpura is the official flagship intra-college technical festival of Government Engineering College, Sheikhpura (GEC Sheikhpura). All currently enrolled B.Tech students from 1st year to 4th year across all branches (CSE, ECE, EE, Civil, Mechanical, Mechatronics) are eligible to participate."
  },
  {
    q: "How do I register for events?",
    a: "You can purchase an All-Events Pass (₹149) or individual E-Sports Pass (₹29) directly through this website by clicking 'Get Pass' or 'Register Now'. You will receive an instant digital QR holographic pass."
  },
  {
    q: "Can I form cross-branch or cross-year teams?",
    a: "Yes! Multi-disciplinary teams (e.g. CSE + Mechatronics + EE) are strongly encouraged for HackArena, Track-O-Bot, AeroStrike, and Pro-To-Pitch."
  },
  {
    q: "Will participants receive certificates?",
    a: "Yes. Every registered participant who attends and competes will receive an official verifiable digital certificate signed by the Principal and Faculty Convenors of GEC Sheikhpura. Winners will receive cash awards and trophies."
  },
  {
    q: "Where will the events take place?",
    a: "All events are hosted within the permanent campus of Government Engineering College, Sheikhpura (Administrative Block, Central Computing Center, Seminar Halls, and Campus Grounds) on NH-333A, Mehus, Sheikhpura."
  }
];

export const FEST_CLUBS: CampusClub[] = [
  {
    id: 'code-gecs',
    name: 'CodeGECS Club',
    role: 'Coding & HackArena',
    icon: 'code',
    colorClass: 'text-fuchsia-400',
    leadName: 'Aryan Raj',
  },
  {
    id: 'robogec-society',
    name: 'RoboGEC Society',
    role: 'Robotics & Track-O-Bot',
    icon: 'bot',
    colorClass: 'text-purple-400',
    leadName: 'Aditya Prakash',
  },
  {
    id: 'aerox-flight-wing',
    name: 'AeroX Flight Wing',
    role: 'AeroStrike Drone Derby',
    icon: 'plane',
    colorClass: 'text-pink-400',
    leadName: 'Rohan Patel',
  },
  {
    id: 'ecell-sheikhpura',
    name: 'E-Cell Sheikhpura',
    role: 'Pro-To-Pitch Startups',
    icon: 'sparkles',
    colorClass: 'text-amber-400',
    leadName: 'Pooja Sharma',
  },
  {
    id: 'gecs-esports-guild',
    name: 'GECS Esports Guild',
    role: 'BGMI & Free Fire',
    icon: 'gamepad',
    colorClass: 'text-emerald-400',
    leadName: 'Vikash Gupta',
  },
];

export const FEST_ORGANIZERS: OrganizerMember[] = [
  {
    id: 'org-principal',
    name: 'Dr. Anil Singh Yadav',
    role: 'Chief Patron & Principal',
    department: 'GEC Sheikhpura',
    phone: '+91 6341 223010',
    category: 'faculty',
    featuredFooter: false,
  },
  {
    id: 'org-dilkhush',
    name: 'Dilkhush',
    role: 'Student Convenor & Tech Lead',
    department: 'CSE',
    phone: '+919876543210',
    category: 'student',
    featuredFooter: true,
  },
  {
    id: 'org-amrita',
    name: 'Amrita',
    role: 'Robotics & Operations Head',
    department: 'GEC Sheikhpura',
    phone: '+919876543212',
    category: 'student',
    featuredFooter: true,
  },
  {
    id: 'org-ashish',
    name: 'Ashish',
    role: 'Events & Esports Convenor',
    department: 'GEC Sheikhpura',
    phone: '+919876543213',
    category: 'student',
    featuredFooter: true,
  },
  {
    id: 'org-team-hunter',
    name: 'Team Hunter',
    role: 'Platform & Systems Engineering',
    department: 'GEC Sheikhpura',
    phone: '+91 98765 43210',
    category: 'team',
    featuredFooter: false,
  },
];

