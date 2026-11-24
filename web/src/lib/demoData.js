/**
 * CampusGear Exchange Demo Data & Vector SVG Cover Generator
 * Realistic Indian academic textbook & lab gear catalog with verified student sellers.
 */

export const BRANCH_OPTIONS = ['CSIT', 'CSE', 'EC', 'EE', 'ME', 'CE'];
export const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
export const PICKUP_POINTS = [
  'AITR Central Library',
  'Main Canteen',
  'CSIT Block',
  'Hostel Gate',
  'Mechanical Workshop',
];

export const EXCHANGE_TYPES = [
  'Sell / Lend / Give Away',
  'Sell',
  'Lend',
  'Give Away',
];

export const ITEM_TYPES = [
  { id: 'book', label: 'Book' },
  { id: 'lab_gear', label: 'Lab Gear' },
];

// Helper to generate a crisp, vector SVG textbook or lab gear cover as a data URI
export function generateCoverSvg({ title, author, category, colorHex, accentHex, itemType }) {
  const cleanTitle = (title || 'Item').replace(/[<>&"]/g, '');
  const cleanAuthor = (author || 'AITR').replace(/[<>&"]/g, '');
  const cleanCategory = (category || (itemType === 'lab_gear' ? 'Lab Gear' : 'Academic')).toUpperCase().replace(/[<>&"]/g, '');
  const isLabGear = itemType === 'lab_gear' || cleanCategory.includes('LAB');

  // Wrap title text into 2-3 lines if long
  const words = cleanTitle.split(' ');
  const line1 = words.slice(0, 3).join(' ');
  const line2 = words.slice(3, 7).join(' ');
  const line3 = words.slice(7, 10).join(' ');

  const graphicSvg = isLabGear
    ? `
    <!-- Lab Gear Graphic: Drafter/Compass/Gears -->
    <g transform="translate(140, 280)">
      <circle cx="60" cy="60" r="50" fill="rgba(255,255,255,0.06)" />
      <!-- Drawing Compass / Caliper -->
      <path d="M60 20 L40 90 M60 20 L80 90" stroke="${accentHex}" stroke-width="3" stroke-linecap="round" />
      <circle cx="60" cy="20" r="6" fill="${accentHex}" />
      <path d="M48 65 Q60 55 72 65" stroke="rgba(255,255,255,0.6)" stroke-width="2" fill="none" />
      <!-- Drafting Ruler / Protractor Arc -->
      <path d="M30 92 L90 92" stroke="${accentHex}" stroke-width="2.5" stroke-linecap="round" />
    </g>`
    : `
    <!-- Book Icon Graphic -->
    <g transform="translate(140, 290)">
      <circle cx="60" cy="60" r="50" fill="rgba(255,255,255,0.06)" />
      <path d="M40 45 L60 38 L80 45 L80 82 L60 76 L40 82 Z" fill="none" stroke="${accentHex}" stroke-width="3" stroke-linejoin="round" />
      <line x1="60" y1="38" x2="60" y2="76" stroke="${accentHex}" stroke-width="2.5" />
      <path d="M40 54 L60 48 L80 54" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
      <path d="M40 64 L60 58 L80 64" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
    </g>`;

  const badgeText = isLabGear ? 'CAMPUSGEAR VERIFIED LAB GEAR' : 'CAMPUSGEAR VERIFIED TEXTBOOK';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="400" height="520">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorHex || '#1E3A8A'}" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="spine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="520" fill="url(#grad)" rx="8" />

  <!-- Spine Shadow -->
  <rect x="0" y="0" width="28" height="520" fill="url(#spine)" />
  <line x1="28" y1="0" x2="28" y2="520" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

  <!-- Category Tag -->
  <rect x="44" y="36" width="160" height="26" rx="4" fill="${accentHex || '#B42318'}" fill-opacity="0.25" stroke="${accentHex || '#B42318'}" stroke-width="1.5" />
  <text x="52" y="53" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="${accentHex || '#B42318'}" letter-spacing="1.2">${cleanCategory}</text>

  <!-- Title Lines -->
  <text x="44" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">${line1}</text>
  ${line2 ? `<text x="44" y="148" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">${line2}</text>` : ''}
  ${line3 ? `<text x="44" y="181" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#E5E7EB">${line3}</text>` : ''}

  <!-- Decorative Separator Line -->
  <line x1="44" y1="210" x2="120" y2="210" stroke="${accentHex || '#B42318'}" stroke-width="4" stroke-linecap="round" />

  <!-- Author/Brand -->
  <text x="44" y="245" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#D1D5DB">${isLabGear ? 'Lab Gear: ' : 'by '}${cleanAuthor}</text>

  ${graphicSvg}

  <!-- Badge at bottom -->
  <rect x="44" y="452" width="312" height="36" rx="6" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
  <text x="56" y="475" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#9CA3AF">${badgeText}</text>
  <circle cx="334" cy="470" r="6" fill="${accentHex || '#B42318'}" />
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_INSTITUTIONS = [
  { id: 'inst-1', name: 'Acropolis Institute of Technology and Research (AITR)', institution_type: 'college', city: 'Indore', area: 'Manglia / Bypass', is_active: true },
  { id: 'inst-2', name: 'IET DAVV', institution_type: 'college', city: 'Indore', area: 'Khandwa Road', is_active: true },
  { id: 'inst-3', name: 'SGSITS Indore', institution_type: 'college', city: 'Indore', area: 'Vallabh Nagar', is_active: true },
  { id: 'inst-4', name: 'IIT Indore', institution_type: 'college', city: 'Indore', area: 'Simrol', is_active: true },
  { id: 'inst-5', name: 'Medicaps University', institution_type: 'college', city: 'Indore', area: 'Rau', is_active: true },
  { id: 'inst-6', name: 'IPS Academy', institution_type: 'college', city: 'Indore', area: 'Rajendra Nagar', is_active: true },
  { id: 'inst-s1', name: 'Delhi Public School (DPS Indore)', institution_type: 'school', city: 'Indore', area: 'Nipania', is_active: true },
  { id: 'inst-s2', name: 'The Emerald Heights International School', institution_type: 'school', city: 'Indore', area: 'Rau', is_active: true },
  { id: 'inst-s3', name: 'Choithram School', institution_type: 'school', city: 'Indore', area: 'Manik Bagh', is_active: true },
  { id: 'inst-s4', name: 'St. Paul Higher Secondary School', institution_type: 'school', city: 'Indore', area: 'Boundary Road', is_active: true },
  { id: 'inst-s5', name: 'The Shishukunj International School', institution_type: 'school', city: 'Indore', area: 'Jhalaria', is_active: true },
  { id: 'inst-s6', name: 'Advanced Academy', institution_type: 'school', city: 'Indore', area: 'Nipania', is_active: true },
];

export const DEMO_CATEGORIES = [
  { id: 'cat-labgear', name: 'Lab Gear', is_active: true },
  { id: 'cat-cs', name: 'Computer Science', is_active: true },
  { id: 'cat-ee', name: 'Electrical Engineering', is_active: true },
  { id: 'cat-math', name: 'Mathematics', is_active: true },
  { id: 'cat-phys', name: 'Physics', is_active: true },
  { id: 'cat-chem', name: 'Chemistry', is_active: true },
  { id: 'cat-mgmt', name: 'Management', is_active: true },
  { id: 'cat-eng', name: 'Engineering', is_active: true },
  { id: 'cat-exam', name: 'Competitive Exams', is_active: true },
];

export const DEMO_USERS = [
  {
    id: 'user-bhagyesh',
    email: 'bhagyeshjain@gmail.com',
    display_name: 'Bhagyesh Jain',
    institution_id: 'inst-1',
    course_or_class: 'B.Tech CSIT, 3rd Year',
    graduation_year: 2028,
    whatsapp_number: '+919876543210',
    role: 'user',
    account_status: 'active',
  },
  {
    id: 'user-priya',
    email: 'priya.nair@ietdavv.edu',
    display_name: 'Priya Nair',
    institution_id: 'inst-2',
    course_or_class: 'B.Tech IT, 2nd Year',
    graduation_year: 2027,
    whatsapp_number: '+919826099887',
    role: 'user',
    account_status: 'active',
  },
  {
    id: 'user-rohan',
    email: 'rohan.verma@sgsits.ac.in',
    display_name: 'Rohan Verma',
    institution_id: 'inst-3',
    course_or_class: 'B.Tech Electrical, 3rd Year',
    graduation_year: 2026,
    whatsapp_number: '+919893012345',
    role: 'user',
    account_status: 'active',
  },
  {
    id: 'user-admin',
    email: 'admin@campusgear.test',
    display_name: 'CampusGear Admin',
    institution_id: 'inst-1',
    course_or_class: 'Campus Administration',
    graduation_year: 2024,
    whatsapp_number: '+919800011223',
    role: 'admin',
    account_status: 'active',
  },
];

export const INITIAL_DEMO_BOOKS = [
  // ── 6 Required Sample Listings (Lab Gear + Korth Book) ──
  {
    id: 'gear-1',
    item_type: 'lab_gear',
    title: 'Engineering Drafter Set',
    author: 'Omega Mini Drafter',
    edition: 'Standard Kit',
    category_id: 'cat-labgear',
    branch: 'CSIT',
    semester: 1,
    course_or_exam: 'BT105 / Engineering Graphics & Drawing',
    condition: 'good',
    price_paise: 45000, // ₹450
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'AITR Central Library',
    description: 'Complete engineering mini-drafter with steel clamp, scale, protractor head, and drafting sheet clips. Required for CSIT 1st semester drawing lab.',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    cover_color: '#0F766E',
    accent_color: '#B42318',
  },
  {
    id: 'gear-2',
    item_type: 'lab_gear',
    title: 'Lab Coat (Size M)',
    author: 'Cotton Labwear',
    edition: 'Size M',
    category_id: 'cat-labgear',
    branch: 'CSIT',
    semester: 3,
    course_or_exam: 'CSIT Hardware & Chemistry Lab',
    condition: 'like_new',
    price_paise: 30000, // ₹300
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'CSIT Block',
    description: 'Pure cotton full-sleeve white lab coat, Size M, stainless snap buttons, clean collar and double front pockets. Worn only twice.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    cover_color: '#1E3A8A',
    accent_color: '#60A5FA',
  },
  {
    id: 'gear-3',
    item_type: 'lab_gear',
    title: 'Scientific Calculator fx-991',
    author: 'Casio',
    edition: 'fx-991ES Plus 2nd Gen',
    category_id: 'cat-labgear',
    branch: 'EC',
    semester: 2,
    course_or_exam: 'EC201 / Signals & Networks',
    condition: 'good',
    price_paise: 65000, // ₹650
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'Main Canteen',
    description: 'Original Casio fx-991 non-programmable scientific calculator with 417 functions, matrix/vector operations, natural textbook display. Fully working.',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    cover_color: '#312E81',
    accent_color: '#B42318',
  },
  {
    id: 'gear-4',
    item_type: 'lab_gear',
    title: 'Drawing Instruments Kit',
    author: 'Kohinoor / Apsara',
    edition: 'Complete Set',
    category_id: 'cat-labgear',
    branch: 'ME',
    semester: 1,
    course_or_exam: 'ME101 / Engineering Drawing',
    condition: 'good',
    price_paise: 35000, // ₹350
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'Mechanical Workshop',
    description: 'Set includes 30cm roller scale, precision divider, beam compass with pen attachment, French curves, set squares, and drawing clips in durable box.',
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    cover_color: '#831843',
    accent_color: '#FBBF24',
  },
  {
    id: 'gear-5',
    item_type: 'lab_gear',
    title: 'Lab Apron + Safety Goggles',
    author: 'AITR Safety Kit',
    edition: 'Standard Combo',
    category_id: 'cat-labgear',
    branch: 'EE',
    semester: 3,
    course_or_exam: 'EE302 / Electrical Machines Lab',
    condition: 'fair',
    price_paise: 18000, // ₹180
    status: 'active',
    seller_id: 'user-priya',
    institution_id: 'inst-1',
    pickup_point: 'Hostel Gate',
    description: 'Durable anti-splash lab apron and polycarbonate UV-protective transparent safety goggles. Required for electrical machine & high-voltage lab experiments.',
    created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
    cover_color: '#065F46',
    accent_color: '#34D399',
  },
  {
    id: 'book-13',
    item_type: 'book',
    title: 'DBMS by Korth (Database System Concepts)',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    edition: '7th Edition',
    category_id: 'cat-cs',
    branch: 'CSIT',
    semester: 5,
    course_or_exam: 'CSIT502 / Database Management Systems',
    condition: 'good',
    price_paise: 30000, // ₹300
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'AITR Central Library',
    description: 'The standard textbook for database concepts by Korth. Covers relational algebra, SQL, indexing, transaction recovery, and concurrency control.',
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    cover_color: '#1E3A8A',
    accent_color: '#93C5FD',
  },

  // ── Existing Textbooks with Branch & Semester Added ──
  {
    id: 'book-1',
    item_type: 'book',
    title: 'Operating System Concepts (10th Dinosaur Edition)',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    edition: '10th Edition',
    category_id: 'cat-cs',
    branch: 'CSIT',
    semester: 4,
    course_or_exam: 'CSIT401 / Operating Systems',
    condition: 'good',
    price_paise: 42000, // ₹420
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'CSIT Block',
    description: 'Crisp copy with no missing or torn pages. Covers virtual memory, scheduling, file systems, and concurrency in depth.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    cover_color: '#1E3A8A',
    accent_color: '#60A5FA',
  },
  {
    id: 'book-2',
    item_type: 'book',
    title: 'Introduction to Algorithms (CLRS 3rd Edition)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    edition: '3rd Edition',
    category_id: 'cat-cs',
    branch: 'CSE',
    semester: 4,
    course_or_exam: 'CS402 / Design & Analysis of Algorithms',
    condition: 'like_new',
    price_paise: 65000, // ₹650
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'AITR Central Library',
    description: 'The standard bible for algorithms. Pristine condition with zero pencil notes or yellowing. Perfect for semester exams & placements.',
    created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
    cover_color: '#1E3A8A',
    accent_color: '#B42318',
  },
  {
    id: 'book-3',
    item_type: 'book',
    title: 'Higher Engineering Mathematics (44th Edition)',
    author: 'Dr. B.S. Grewal',
    edition: '44th Edition',
    category_id: 'cat-math',
    branch: 'CSIT',
    semester: 1,
    course_or_exam: 'MA101 / Engineering Mathematics',
    condition: 'good',
    price_paise: 35000, // ₹350
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'Main Canteen',
    description: 'Comprehensive math guide for all engineering streams. Contains solved university questions for calculus, matrices, and differential equations.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    cover_color: '#4338CA',
    accent_color: '#A5B4FC',
  },
  {
    id: 'book-4',
    item_type: 'book',
    title: 'Database System Concepts (6th Edition)',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    edition: '6th Edition',
    category_id: 'cat-cs',
    branch: 'CSE',
    semester: 5,
    course_or_exam: 'CS403 / Database Management Systems',
    condition: 'fair',
    price_paise: 30000, // ₹300
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'CSIT Block',
    description: 'Very helpful reference covering ER diagrams, relational calculus, normalization up to BCNF, and SQL queries.',
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    cover_color: '#1E3A8A',
    accent_color: '#93C5FD',
  },
  {
    id: 'book-5',
    item_type: 'book',
    title: 'Data Structures and Algorithms in C++',
    author: 'Mark Allen Weiss',
    edition: '4th Edition',
    category_id: 'cat-cs',
    branch: 'CSE',
    semester: 3,
    course_or_exam: 'CS201 / Data Structures',
    condition: 'like_new',
    price_paise: 48000, // ₹480
    status: 'active',
    seller_id: 'user-priya',
    institution_id: 'inst-2',
    pickup_point: 'AITR Central Library',
    description: 'Excellent condition with full code snippets for AVL trees, red-black trees, graphs, and dynamic programming.',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    cover_color: '#0F766E',
    accent_color: '#2DD4BF',
  },
  {
    id: 'book-6',
    item_type: 'book',
    title: 'Concepts of Physics (Vol 1 & Vol 2 Set)',
    author: 'Dr. H.C. Verma',
    edition: 'Latest Edition',
    category_id: 'cat-phys',
    branch: 'EC',
    semester: 1,
    course_or_exam: 'PH101 / Engineering Physics',
    condition: 'like_new',
    price_paise: 29000, // ₹290
    status: 'active',
    seller_id: 'user-rohan',
    institution_id: 'inst-3',
    pickup_point: 'Main Canteen',
    description: 'Both volumes included together. Pristine pages, clear diagrams for classical mechanics, wave optics, and electrodynamics.',
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    cover_color: '#047857',
    accent_color: '#34D399',
  },
  {
    id: 'book-7',
    item_type: 'book',
    title: 'Computer Networking: A Top-Down Approach (7th Edition)',
    author: 'James F. Kurose, Keith W. Ross',
    edition: '7th Edition',
    category_id: 'cat-cs',
    branch: 'CSIT',
    semester: 5,
    course_or_exam: 'CS501 / Computer Networks',
    condition: 'good',
    price_paise: 52000, // ₹520
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'CSIT Block',
    description: 'Clean textbook explaining application layer (HTTP/DNS), transport (TCP/UDP), routing algorithms, and Wireshark trace exercises.',
    created_at: new Date(Date.now() - 3600000 * 34).toISOString(),
    cover_color: '#1E3A8A',
    accent_color: '#FCD34D',
  },
  {
    id: 'book-8',
    item_type: 'book',
    title: 'Basic Electrical Engineering (Revised Ed)',
    author: 'D.C. Kulshreshtha',
    edition: '2nd Edition',
    category_id: 'cat-ee',
    branch: 'EE',
    semester: 2,
    course_or_exam: 'EE101 / Basic Electrical',
    condition: 'good',
    price_paise: 26000, // ₹260
    status: 'active',
    seller_id: 'user-rohan',
    institution_id: 'inst-1',
    pickup_point: 'Hostel Gate',
    description: 'Clear explanations with solved numericals for Thevenin theorem, Norton theorem, AC transients, and 3-phase induction motors.',
    created_at: new Date(Date.now() - 3600000 * 38).toISOString(),
    cover_color: '#B45309',
    accent_color: '#FBBF24',
  },
  {
    id: 'book-9',
    item_type: 'book',
    title: 'Quantitative Aptitude for Competitive Exams',
    author: 'Dr. R.S. Aggarwal',
    edition: 'Revised Edition',
    category_id: 'cat-exam',
    branch: 'CSE',
    semester: 6,
    course_or_exam: 'Campus Placements & GATE',
    condition: 'good',
    price_paise: 18000, // ₹180
    status: 'active',
    seller_id: 'user-bhagyesh',
    institution_id: 'inst-1',
    pickup_point: 'AITR Central Library',
    description: 'The golden book for campus placement tests, TCS NQT, and competitive exams. Clean pages, no torn corners.',
    created_at: new Date(Date.now() - 3600000 * 42).toISOString(),
    cover_color: '#831843',
    accent_color: '#F472B6',
  },
  {
    id: 'book-10',
    item_type: 'book',
    title: 'Digital Design: With an Introduction to Verilog HDL',
    author: 'M. Morris Mano, Michael D. Ciletti',
    edition: '5th Edition',
    category_id: 'cat-eng',
    branch: 'EC',
    semester: 3,
    course_or_exam: 'EC202 / Digital Systems',
    condition: 'fair',
    price_paise: 31000, // ₹310
    status: 'active',
    seller_id: 'user-priya',
    institution_id: 'inst-2',
    pickup_point: 'Main Canteen',
    description: 'Detailed coverage of K-maps, sequential circuits, flip-flops, registers, and basic Verilog hardware descriptions.',
    created_at: new Date(Date.now() - 3600000 * 46).toISOString(),
    cover_color: '#1E293B',
    accent_color: '#38BDF8',
  },
  {
    id: 'book-11',
    item_type: 'book',
    title: 'Organic Chemistry (7th Edition)',
    author: 'Robert T. Morrison, Robert N. Boyd',
    edition: '7th Edition',
    category_id: 'cat-chem',
    branch: 'CE',
    semester: 1,
    course_or_exam: 'CH101 / Engineering Chemistry',
    condition: 'like_new',
    price_paise: 45000, // ₹450
    status: 'active',
    seller_id: 'user-priya',
    institution_id: 'inst-1',
    pickup_point: 'Mechanical Workshop',
    description: 'Hardcover volume in great condition. Clear reaction mechanisms, stereochemistry, and synthesis pathways.',
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    cover_color: '#0F766E',
    accent_color: '#5EEAD4',
  },
  {
    id: 'book-12',
    item_type: 'book',
    title: 'Financial Management: Theory & Practice',
    author: 'Prasanna Chandra',
    edition: '10th Edition',
    category_id: 'cat-mgmt',
    branch: 'ME',
    semester: 4,
    course_or_exam: 'MBA / Engineering Economics',
    condition: 'fair',
    price_paise: 38000, // ₹380
    status: 'active',
    seller_id: 'user-rohan',
    institution_id: 'inst-3',
    pickup_point: 'Main Canteen',
    description: 'Great guide for capital budgeting, financial ratios, time value of money, and dividend policy.',
    created_at: new Date(Date.now() - 3600000 * 54).toISOString(),
    cover_color: '#7C2D12',
    accent_color: '#FB923C',
  },
];
