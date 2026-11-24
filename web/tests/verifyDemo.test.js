import assert from 'node:assert';
import {
  DEMO_USERS,
  DEMO_CATEGORIES,
  INITIAL_DEMO_BOOKS,
  BRANCH_OPTIONS,
  SEMESTER_OPTIONS,
  PICKUP_POINTS,
  ITEM_TYPES,
} from '../src/lib/demoData.js';
import { DemoStore, initDemoState } from '../src/lib/demoStore.js';

console.log('--- RUNNING CAMPUSGEAR DEMO MODE VERIFICATION ---');

// Mock localStorage for Node environment if not present
if (typeof localStorage === 'undefined') {
  const storage = new Map();
  global.localStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear(),
  };
}

if (typeof window === 'undefined') {
  global.window = {
    dispatchEvent: () => {},
  };
  global.CustomEvent = class CustomEvent {};
}

// 1. Verify User Profile Bug Fix
const bhagyesh = DEMO_USERS.find((u) => u.id === 'user-bhagyesh');
assert(bhagyesh, 'Bhagyesh user must exist');
assert.strictEqual(bhagyesh.course_or_class, 'B.Tech CSIT, 3rd Year', 'Bhagyesh course must be B.Tech CSIT, 3rd Year');
assert.strictEqual(bhagyesh.graduation_year, 2028, 'Bhagyesh graduation year must be 2028');
console.log('✓ 1. Bhagyesh profile bug fix verified: B.Tech CSIT, 3rd Year, graduating 2028');

// 2. Verify Category & Item Types
const labGearCat = DEMO_CATEGORIES.find((c) => c.id === 'cat-labgear' && c.name === 'Lab Gear');
assert(labGearCat, 'Lab Gear category must exist in DEMO_CATEGORIES');
assert.deepStrictEqual(BRANCH_OPTIONS, ['CSIT', 'CSE', 'EC', 'EE', 'ME', 'CE'], 'Branches must be CSIT, CSE, EC, EE, ME, CE');
assert.deepStrictEqual(SEMESTER_OPTIONS, [1, 2, 3, 4, 5, 6, 7, 8], 'Semesters must be 1 to 8');
assert.strictEqual(PICKUP_POINTS.length, 5, 'Must have 5 designated pickup points');
console.log('✓ 2. Lab Gear category, branches, semesters, and pickup points verified');

// 3. Verify 6 Required Sample Listings
const drafter = INITIAL_DEMO_BOOKS.find((b) => b.title.includes('Engineering Drafter Set'));
assert(drafter, 'Engineering Drafter Set listing must exist');
assert.strictEqual(drafter.branch, 'CSIT', 'Drafter branch must be CSIT');
assert.strictEqual(drafter.semester, 1, 'Drafter semester must be 1');
assert.strictEqual(drafter.price_paise, 45000, 'Drafter price must be Rs 450');
assert.strictEqual(drafter.item_type, 'lab_gear', 'Drafter item_type must be lab_gear');

const labCoat = INITIAL_DEMO_BOOKS.find((b) => b.title.includes('Lab Coat'));
assert(labCoat, 'Lab Coat listing must exist');
assert.strictEqual(labCoat.branch, 'CSIT');
assert.strictEqual(labCoat.semester, 3);
assert.strictEqual(labCoat.price_paise, 30000);
assert.strictEqual(labCoat.item_type, 'lab_gear');

const calc = INITIAL_DEMO_BOOKS.find((b) => b.title.includes('Scientific Calculator fx-991'));
assert(calc, 'Scientific Calculator listing must exist');
assert.strictEqual(calc.branch, 'EC');
assert.strictEqual(calc.semester, 2);
assert.strictEqual(calc.price_paise, 65000);
assert.strictEqual(calc.item_type, 'lab_gear');

const drawingKit = INITIAL_DEMO_BOOKS.find((b) => b.title.includes('Drawing Instruments Kit'));
assert(drawingKit, 'Drawing Instruments Kit listing must exist');
assert.strictEqual(drawingKit.branch, 'ME');
assert.strictEqual(drawingKit.semester, 1);
assert.strictEqual(drawingKit.price_paise, 35000);
assert.strictEqual(drawingKit.item_type, 'lab_gear');

const apron = INITIAL_DEMO_BOOKS.find((b) => b.title.includes('Lab Apron + Safety Goggles'));
assert(apron, 'Lab Apron + Safety Goggles listing must exist');
assert.strictEqual(apron.branch, 'EE');
assert.strictEqual(apron.semester, 3);
assert.strictEqual(apron.price_paise, 18000);
assert.strictEqual(apron.item_type, 'lab_gear');

const korth = INITIAL_DEMO_BOOKS.find((b) => b.title.includes('DBMS by Korth'));
assert(korth, 'DBMS by Korth listing must exist');
assert.strictEqual(korth.branch, 'CSIT');
assert.strictEqual(korth.semester, 5);
assert.strictEqual(korth.price_paise, 30000);
assert.strictEqual(korth.item_type, 'book');
console.log('✓ 3. All 6 sample lab-gear & book listings verified with correct fields');

// 4. Test Search Filtering in DemoStore
initDemoState();

// Search by CSIT Sem 1 Lab Gear
const csitSem1Gear = DemoStore.searchListings({
  branch: 'CSIT',
  semester: 1,
  category: 'cat-labgear',
});
assert(csitSem1Gear.data.length >= 1, 'Should find at least 1 CSIT Sem 1 Lab Gear');
assert.strictEqual(csitSem1Gear.data[0].title, 'Engineering Drafter Set', 'CSIT Sem 1 gear must be Drafter');
assert.strictEqual(csitSem1Gear.data[0].item_type, 'lab_gear', 'Must have item_type');
assert.strictEqual(csitSem1Gear.data[0].branch, 'CSIT', 'Must have branch');
assert.strictEqual(csitSem1Gear.data[0].semester, 1, 'Must have semester');
console.log('✓ 4. Search filtering by Branch (CSIT) + Semester (1) + Category (Lab Gear) working');

// 5. Test Handover Tracker Lifecycle:
// Requested (pending) -> Accepted -> Pickup Scheduled -> Handed Over
console.log('✓ 5. Testing Handover Tracker 4-Step Lifecycle...');

// Buyer Priya logs in
DemoStore.setActiveUser('user-priya');
const reqId = DemoStore.createInterestRequest({
  p_listing_id: drafter.id,
  p_message: 'Hi Bhagyesh, I need the drafter for CSIT Sem 1 drawing lab!',
});
assert(reqId, 'Interest request created');

let currentRequests = DemoStore.getRequests();
let myReq = currentRequests.find((r) => r.id === reqId);
assert.strictEqual(myReq.status, 'pending', 'Step 1: Status must be pending (Requested)');
console.log('   Step 1: Requested (pending) -> Verified');

// Seller Bhagyesh logs in
DemoStore.setActiveUser('user-bhagyesh');
DemoStore.respondToRequest({
  p_request_id: reqId,
  p_action: 'accept',
});
currentRequests = DemoStore.getRequests();
myReq = currentRequests.find((r) => r.id === reqId);
assert.strictEqual(myReq.status, 'accepted', 'Step 2: Status must be accepted');
console.log('   Step 2: Accepted -> Verified');

// Seller schedules pickup
DemoStore.schedulePickup({
  p_request_id: reqId,
  p_pickup_point: 'AITR Central Library',
  p_pickup_time: 'Tomorrow 1:30 PM (Lunch Break)',
});
currentRequests = DemoStore.getRequests();
myReq = currentRequests.find((r) => r.id === reqId);
assert.strictEqual(myReq.status, 'pickup_scheduled', 'Step 3: Status must be pickup_scheduled');
assert.strictEqual(myReq.pickup_point, 'AITR Central Library', 'Pickup point must be Central Library');
assert.strictEqual(myReq.pickup_time, 'Tomorrow 1:30 PM (Lunch Break)', 'Pickup time must match');
console.log('   Step 3: Pickup Scheduled (AITR Central Library, Tomorrow 1:30 PM) -> Verified');

// Mark Handed Over (can be marked by seller or buyer)
DemoStore.markHandedOver({
  p_request_id: reqId,
});
currentRequests = DemoStore.getRequests();
myReq = currentRequests.find((r) => r.id === reqId);
assert.strictEqual(myReq.status, 'handed_over', 'Step 4: Status must be handed_over');

// Check that the listing was closed as sold
const listingsAfter = DemoStore.getListings();
const drafterAfter = listingsAfter.find((b) => b.id === drafter.id);
assert.strictEqual(drafterAfter.status, 'sold', 'Listing must be marked sold when handed over');
console.log('   Step 4: Handed Over -> Verified (Listing marked Sold)');

console.log('\nALL TESTS PASSED SUCCESSFULLY! 🚀');
