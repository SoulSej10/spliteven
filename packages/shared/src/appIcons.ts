/**
 * Group, account and category icons are stored as emoji strings in the
 * database. Rather than render those system emoji (which look different on
 * every device and clash with the soft themes), both apps draw the matching
 * duotone line icon in the user's accent color. Old rows keep working because
 * the stored value is unchanged: this file only says which drawing goes with
 * which stored value. Anything not listed here still renders as the emoji.
 *
 * Each entry is [stored emoji, Phosphor icon name, label]. Add new ones here, then run
 * `node scripts/gen-icon-components.js` so both apps import the new drawings.
 */
export type IconEntry = readonly [emoji: string, icon: string, label: string];

export interface IconSection {
  id: string;
  label: string;
  items: readonly IconEntry[];
}

export const ICON_SECTIONS: readonly IconSection[] = [
  {
    id: "money",
    label: "Money & banking",
    items: [
      ["💵", "Money", "Cash"],
      ["💳", "CreditCard", "Card"],
      ["👛", "Wallet", "Wallet"],
      ["🏦", "Bank", "Bank"],
      ["🐷", "PiggyBank", "Savings"],
      ["📈", "ChartLineUp", "Investments"],
      ["💰", "Coins", "Income"],
      ["🪙", "Coin", "Coins"],
      ["🏧", "Vault", "ATM"],
      ["💎", "Diamond", "Valuables"],
      ["🧾", "Receipt", "Bills"],
      ["🎯", "Target", "Goals"],
      ["🤝", "Handshake", "Loans"],
      ["💸", "HandCoins", "Payments"],
      ["⚖️", "Scales", "Taxes & legal"],
      ["📅", "Calendar", "Scheduled"],
      ["🔁", "Repeat", "Subscriptions"],
      ["☁️", "Cloud", "Cloud & apps"],
    ],
  },
  {
    id: "phone",
    label: "Phone & internet",
    items: [
      ["📱", "DeviceMobile", "Mobile phone"],
      ["☎️", "Phone", "Landline"],
      ["📞", "PhoneCall", "Calls & load"],
      ["📶", "CellSignalFull", "Mobile data"],
      ["🌐", "GlobeHemisphereWest", "Internet"],
      ["🛜", "WifiHigh", "Wi-Fi"],
      ["📟", "SimCard", "SIM & prepaid"],
    ],
  },
  {
    id: "electronics",
    label: "Electronics & gadgets",
    items: [
      ["💻", "Laptop", "Laptop"],
      ["🖥️", "Desktop", "Desktop PC"],
      ["📲", "DeviceTablet", "Tablet"],
      ["📺", "Television", "TV"],
      ["🎧", "Headphones", "Headphones"],
      ["⌚", "Watch", "Watch"],
      ["📷", "Camera", "Camera"],
      ["🎮", "GameController", "Gaming"],
      ["🔌", "Plug", "Chargers & cables"],
      ["🔋", "BatteryFull", "Power bank"],
      ["🖨️", "Printer", "Printer"],
      ["⌨️", "Keyboard", "Keyboard"],
      ["🖱️", "Mouse", "Mouse"],
      ["🔊", "SpeakerHigh", "Speakers"],
      ["🧠", "Cpu", "PC parts"],
      ["💾", "HardDrives", "Storage"],
      ["🤖", "Robot", "Smart gadgets"],
    ],
  },
  {
    id: "home",
    label: "Home & appliances",
    items: [
      ["🏠", "House", "Home"],
      ["🛋️", "Couch", "Furniture"],
      ["🛏️", "Bed", "Bedroom"],
      ["🪑", "Armchair", "Chairs"],
      ["🛁", "Bathtub", "Bathroom"],
      ["🚽", "Toilet", "Plumbing"],
      ["🧺", "WashingMachine", "Washing machine"],
      ["♨️", "Oven", "Oven & stove"],
      ["🍲", "CookingPot", "Cookware"],
      ["🌀", "Fan", "Electric fan"],
      ["❄️", "Snowflake", "Aircon & fridge"],
      ["🌡️", "Thermometer", "Heating"],
      ["⚡", "Lightning", "Electricity"],
      ["💧", "Drop", "Water"],
      ["🔥", "Flame", "Gas"],
      ["💡", "Lightbulb", "Utilities"],
      ["🪔", "Lamp", "Lighting"],
      ["🔧", "Wrench", "Repairs"],
      ["🔨", "Hammer", "Tools"],
      ["🪛", "Screwdriver", "DIY"],
      ["🧰", "Toolbox", "Toolbox"],
      ["🖌️", "PaintBrush", "Painting"],
      ["🧹", "Broom", "Cleaning"],
      ["🚪", "Garage", "Garage"],
      ["🔑", "Key", "Rent"],
    ],
  },
  {
    id: "food",
    label: "Food & drink",
    items: [
      ["🛒", "ShoppingCart", "Groceries"],
      ["🍔", "Hamburger", "Fast food"],
      ["🍕", "Pizza", "Pizza"],
      ["🍽️", "ForkKnife", "Dining out"],
      ["☕", "Coffee", "Coffee"],
      ["🍪", "Cookie", "Snacks"],
      ["🍦", "IceCream", "Dessert"],
      ["🍺", "BeerBottle", "Beer"],
      ["🍷", "Wine", "Wine"],
      ["🍸", "Martini", "Drinks"],
      ["🥕", "Carrot", "Vegetables"],
      ["🥚", "Egg", "Eggs"],
      ["🍞", "Bread", "Bakery"],
      ["🍜", "BowlFood", "Noodles & rice"],
      ["🎂", "Cake", "Cake"],
      ["🐟", "Fish", "Seafood"],
      ["🐄", "Cow", "Meat"],
      ["🌶️", "Pepper", "Spices"],
    ],
  },
  {
    id: "shopping",
    label: "Shopping & style",
    items: [
      ["🛍️", "ShoppingBag", "Shopping"],
      ["🏷️", "Tag", "Sale"],
      ["👕", "TShirt", "Clothes"],
      ["👗", "Dress", "Dresses"],
      ["👖", "Pants", "Pants"],
      ["👟", "Sneaker", "Shoes"],
      ["👜", "Handbag", "Bags"],
      ["👓", "Eyeglasses", "Eyewear"],
      ["✂️", "Scissors", "Salon & haircut"],
      ["✨", "Sparkle", "Beauty"],
      ["🏪", "Storefront", "Stores"],
      ["🎁", "Gift", "Gifts"],
      ["📦", "Package", "Parcels"],
      ["🚚", "Truck", "Delivery"],
      ["🗞️", "Newspaper", "News & magazines"],
    ],
  },
  {
    id: "family",
    label: "Baby, kids & pets",
    items: [
      ["👶", "Baby", "Baby"],
      ["🍼", "BabyCarriage", "Baby gear"],
      ["🎈", "Balloon", "Kids' parties"],
      ["🎒", "Backpack", "School"],
      ["🧩", "PuzzlePiece", "Toys"],
      ["🎓", "GraduationCap", "Education"],
      ["🧑‍🎓", "Student", "Tuition"],
      ["✏️", "Pencil", "School supplies"],
      ["📚", "Books", "Books"],
      ["📖", "BookOpen", "Reading"],
      ["👥", "UsersThree", "Family & friends"],
      ["❤️", "Heart", "Dates & love"],
      ["🐾", "PawPrint", "Pets"],
      ["🐶", "Dog", "Dog"],
      ["🐱", "Cat", "Cat"],
      ["🦴", "Bone", "Pet food"],
    ],
  },
  {
    id: "fun",
    label: "Entertainment & hobbies",
    items: [
      ["🎬", "FilmSlate", "Movies & streaming"],
      ["🍿", "Popcorn", "Cinema"],
      ["🎵", "MusicNotes", "Music"],
      ["🎟️", "Ticket", "Events"],
      ["🎤", "Microphone", "Karaoke"],
      ["🎭", "MaskHappy", "Theatre"],
      ["🎉", "Confetti", "Parties"],
      ["🏖️", "BeachBall", "Beach & leisure"],
      ["🎨", "Palette", "Art & hobbies"],
      ["🚬", "Cigarette", "Smoking"],
    ],
  },
  {
    id: "health",
    label: "Health & fitness",
    items: [
      ["💊", "Pill", "Medicine"],
      ["🩺", "Stethoscope", "Doctor"],
      ["🏥", "FirstAid", "Hospital"],
      ["💓", "Heartbeat", "Check-ups"],
      ["🦷", "Tooth", "Dental"],
      ["💉", "Syringe", "Vaccines"],
      ["🩹", "Bandaids", "First aid"],
      ["🏋️", "Barbell", "Gym"],
      ["🏃", "PersonSimpleRun", "Running"],
      ["⚽", "SoccerBall", "Football"],
      ["🏀", "Basketball", "Basketball"],
      ["🏈", "Football", "Sports"],
      ["⛳", "Golf", "Golf"],
      ["🎾", "TennisBall", "Tennis"],
    ],
  },
  {
    id: "travel",
    label: "Transport & travel",
    items: [
      ["🚗", "Car", "Car"],
      ["🚌", "Bus", "Bus"],
      ["🚆", "Train", "Train"],
      ["🏍️", "Motorcycle", "Motorcycle"],
      ["🚲", "Bicycle", "Bicycle"],
      ["⛽", "GasPump", "Fuel"],
      ["🚕", "Taxi", "Taxi & rides"],
      ["🛴", "Scooter", "Scooter"],
      ["⛵", "Boat", "Boat"],
      ["✈️", "Airplane", "Flights"],
      ["🧳", "Suitcase", "Trips"],
      ["⛺", "Tent", "Camping"],
      ["🧭", "Compass", "Adventure"],
      ["📍", "MapPin", "Places"],
      ["🏔️", "Mountains", "Hiking"],
    ],
  },
  {
    id: "other",
    label: "Work & other",
    items: [
      ["💼", "Briefcase", "Work"],
      ["🏢", "Buildings", "Office"],
      ["🛡️", "ShieldCheck", "Insurance"],
      ["☂️", "Umbrella", "Emergency"],
      ["⛪", "Church", "Donations"],
      ["🤲", "HandHeart", "Charity"],
      ["💐", "Flower", "Flowers"],
      ["🌱", "Plant", "Plants"],
      ["🌳", "Tree", "Garden"],
      ["♻️", "Recycle", "Recycling"],
      ["🔒", "Lock", "Security"],
      ["⭐", "Star", "Favorites"],
      ["⚙️", "Gear", "Services"],
      ["🌙", "Moon", "Night out"],
      ["☀️", "Sun", "Daytime"],
    ],
  },
];

const ALL_ENTRIES: IconEntry[] = ICON_SECTIONS.flatMap((s) => s.items);

/** Every icon name used by the catalog (for typing and for the apps' icon maps). */
export type AppIconName = string;
export const APP_ICON_NAMES: string[] = [...new Set(ALL_ENTRIES.map(([, icon]) => icon))];

/** Older stored values that map onto a drawing but aren't the catalog's own emoji. */
const ALIASES: Record<string, string> = {
  "⛰️": "Mountains",
  "⛰": "Mountains",
};

export const EMOJI_TO_ICON: Record<string, AppIconName> = {
  ...Object.fromEntries(ALL_ENTRIES.map(([emoji, icon]) => [emoji, icon])),
  ...ALIASES,
};

/** Emoji can arrive with or without the variation selector; match either way. */
export function iconNameFor(value: string | null | undefined): AppIconName | null {
  if (!value) return null;
  const trimmed = value.trim();
  return EMOJI_TO_ICON[trimmed] ?? EMOJI_TO_ICON[trimmed.replace(/️/g, "")] ?? EMOJI_TO_ICON[`${trimmed}️`] ?? null;
}

/** Which sections come first on each creation screen, so the likeliest picks are at the top. */
const SECTION_ORDER: Record<"group" | "account" | "category", string[]> = {
  category: ["food", "shopping", "home", "phone", "electronics", "family", "fun", "health", "travel", "money", "other"],
  account: ["money", "phone", "electronics", "shopping", "home", "other"],
  group: ["home", "travel", "food", "fun", "family", "shopping", "electronics", "money", "health", "other", "phone"],
};

/** The icon sections for a creation screen, in the order that suits it. */
export function iconSectionsFor(kind: "group" | "account" | "category"): IconSection[] {
  const byId = new Map(ICON_SECTIONS.map((s) => [s.id, s]));
  const ordered = SECTION_ORDER[kind].map((id) => byId.get(id)).filter((s): s is IconSection => !!s);
  const rest = ICON_SECTIONS.filter((s) => !SECTION_ORDER[kind].includes(s.id));
  return [...ordered, ...rest];
}

// The short lists the first version of the pickers used; kept so older imports still compile.
export const GROUP_ICON_OPTIONS = ["👥", "🏠", "✈️", "🍕", "🎉", "💰", "🚗", "🏖️"];
export const ACCOUNT_ICON_OPTIONS = ["💵", "💳", "👛", "🏦", "🐷", "📈", "💰", "🪙", "🏧", "💎", "🧾", "🎯"];
export const CATEGORY_ICON_OPTIONS = ["🛒", "🍔", "🚗", "🏠", "💡", "🎬", "💊", "📚", "✈️", "💰", "🎁", "📱"];
