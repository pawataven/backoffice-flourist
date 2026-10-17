// Regenerates app/mocks/*.json: `pnpm mocks`. Everything is made up for the demo, but
// deterministic (fixed seed + hashed uuids), so ids in links stay valid between runs.
// Dates count back from today, so the dashboard always has a "today".
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '../app/mocks')
fs.mkdirSync(out, { recursive: true })
const write = (name, data) =>
  fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(data, null, 2) + '\n')

const uuid = (s) => {
  const h = crypto.createHash('sha1').update(s).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${'89ab'[parseInt(h[16], 16) % 4]}${h.slice(17, 20)}-${h.slice(20, 32)}`
}
let seed = 20261015
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const int = (min, max) => min + Math.floor(rnd() * (max - min + 1))
const pick = (list) => list[Math.floor(rnd() * list.length)]
/** Picks from [value, weight] pairs. */
const weighted = (pairs) => {
  let r = rnd() * pairs.reduce((n, [, w]) => n + w, 0)
  for (const [v, w] of pairs) if ((r -= w) < 0) return v
  return pairs[0][0]
}

const NOW = new Date()
const at = (daysAgo, hour = 10, minute = int(0, 59)) => {
  const d = new Date(NOW)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}
const day = (daysAgo) => at(daysAgo, 12).slice(0, 10)
const stamps = (key) => ({
  id: uuid(key),
  created_at: at(int(60, 400), 9),
  updated_at: at(int(0, 30), 15),
})

// ── Branches ────────────────────────────────────────────────────────────

const BRANCHES = [
  ['ari', 'ดอยดาว อารีย์', 'Doi Dao Ari', 'พญาไท กรุงเทพฯ', '07:00', '19:00', 42, 'open'],
  [
    'thonglor',
    'ดอยดาว ทองหล่อ',
    'Doi Dao Thonglor',
    'วัฒนา กรุงเทพฯ',
    '08:00',
    '21:00',
    56,
    'open',
  ],
  ['siam', 'ดอยดาว สยาม', 'Doi Dao Siam', 'ปทุมวัน กรุงเทพฯ', '10:00', '22:00', 38, 'open'],
  [
    'chiangmai',
    'ดอยดาว นิมมาน',
    'Doi Dao Nimman',
    'เมือง เชียงใหม่',
    '07:30',
    '18:00',
    64,
    'closed',
  ],
  ['phuket', 'ดอยดาว ภูเก็ต', 'Doi Dao Phuket', 'เมือง ภูเก็ต', '08:00', '18:00', 30, 'soon'],
]
const BRANCH_WEIGHT = { ari: 3, thonglor: 4, siam: 4, chiangmai: 0, phuket: 0 }

// ── People pools ────────────────────────────────────────────────────────

const FIRST = [
  'ณัฐ',
  'ปิยะ',
  'สมศรี',
  'กมล',
  'อรุณี',
  'ธนา',
  'พิมพ์ชนก',
  'วรวุฒิ',
  'ศิริพร',
  'ชยพล',
  'มณีรัตน์',
  'ภูมิ',
  'กานต์',
  'นภัส',
  'ปวีณา',
  'ธีรเดช',
  'อัญชลี',
  'จิรายุ',
  'สุชาดา',
  'พงศกร',
  'รัชนี',
  'ณภัทร',
  'ชนิดา',
  'ก้องภพ',
  'วิภาวี',
  'ศุภชัย',
  'เบญจมาศ',
  'ธนวัฒน์',
  'ปาริชาต',
  'อิทธิพล',
]
const LAST = [
  'ใจดี',
  'สุขสวัสดิ์',
  'ศรีสุข',
  'มั่นคง',
  'ทองดี',
  'แสงทอง',
  'วงศ์ไทย',
  'บุญมา',
  'รุ่งเรือง',
  'พรหมมา',
  'เพชรรัตน์',
  'สายบุญ',
  'คงสวัสดิ์',
  'ชัยมงคล',
  'อินทร์แก้ว',
]
const NICK = [
  'มิ้นท์',
  'ฟ้า',
  'บอส',
  'เจได',
  'ปลา',
  'แพร',
  'ต้น',
  'ไอซ์',
  'นุ่น',
  'เก่ง',
  'ออม',
  'บีม',
  'ฝน',
  'แบม',
  'โอ๊ต',
  'จูน',
  'ตาล',
  'ภู',
]
const person = () => `${pick(FIRST)} ${pick(LAST)}`
const phone = () => `0${pick(['6', '8', '9'])}${String(int(10000000, 99999999))}`

// ── Categories + menu ───────────────────────────────────────────────────

const CATEGORIES = [
  ['coffee', 'drink', '☕', 'กาแฟ', 'Coffee'],
  ['tea', 'drink', '🍵', 'ชา', 'Tea'],
  ['non_coffee', 'drink', '🥤', 'ไม่ใส่กาแฟ', 'Non-coffee'],
  ['frappe', 'drink', '🧋', 'ปั่น', 'Frappé'],
  ['bakery', 'food', '🥐', 'เบเกอรี่', 'Bakery'],
  ['food', 'food', '🥪', 'อาหารจานเบา', 'Light meals'],
]

// [sku, th, en, category, price, cost, tag, status, desc_th, desc_en]
const MENU = [
  [
    'CF-01',
    'เอสเปรสโซ่',
    'Espresso',
    'coffee',
    55,
    14,
    null,
    'published',
    'ช็อตเข้ม เมล็ดดอยช้าง คั่วกลาง',
    'Double shot, Doi Chang beans, medium roast',
  ],
  [
    'CF-02',
    'อเมริกาโน่',
    'Americano',
    'coffee',
    60,
    15,
    null,
    'published',
    'เอสเปรสโซ่ผสมน้ำร้อน หอม สะอาด',
    'Espresso and hot water, clean and bright',
  ],
  [
    'CF-03',
    'ลาเต้',
    'Caffè Latte',
    'coffee',
    70,
    20,
    'best',
    'published',
    'นมสดสตีมเนียน ฟองนมบาง',
    'Steamed milk with a thin layer of foam',
  ],
  [
    'CF-04',
    'คาปูชิโน่',
    'Cappuccino',
    'coffee',
    70,
    20,
    null,
    'published',
    'ฟองนมหนา โรยผงโกโก้',
    'Thick foam, a dusting of cocoa',
  ],
  [
    'CF-05',
    'มอคค่า',
    'Mocha',
    'coffee',
    75,
    24,
    null,
    'published',
    'กาแฟกับช็อกโกแลตเข้มข้น',
    'Espresso with rich chocolate',
  ],
  [
    'CF-06',
    'แฟลตไวท์',
    'Flat White',
    'coffee',
    75,
    21,
    null,
    'published',
    'ริสเตรตโต้สองช็อต นมเนียนละเอียด',
    'Two ristretto shots, silky milk',
  ],
  [
    'CF-07',
    'ดอยดาวดำน้ำผึ้งมะนาว',
    'Honey Lime Black',
    'coffee',
    85,
    22,
    'signature',
    'published',
    'อเมริกาโน่เย็น น้ำผึ้งป่า มะนาวสด',
    'Iced americano, wild honey, fresh lime',
  ],
  [
    'CF-08',
    'ส้มยูซุเอสเปรสโซ่',
    'Yuzu Espresso Tonic',
    'coffee',
    95,
    28,
    'new',
    'published',
    'โทนิค ยูซุ และเอสเปรสโซ่ซ่าสดชื่น',
    'Tonic, yuzu and espresso',
  ],
  [
    'CF-09',
    'เดอร์ตี้',
    'Dirty',
    'coffee',
    85,
    26,
    null,
    'published',
    'นมเย็นจัด ราดช็อตร้อนด้านบน',
    'Ice-cold milk under a hot shot',
  ],
  [
    'CF-10',
    'โคลด์บรูว์',
    'Cold Brew',
    'coffee',
    80,
    18,
    'best',
    'published',
    'สกัดเย็น 18 ชั่วโมง',
    'Steeped cold for 18 hours',
  ],
  [
    'CF-11',
    'มะพร้าวลาเต้',
    'Coconut Latte',
    'coffee',
    90,
    30,
    'new',
    'draft',
    'น้ำมะพร้าวน้ำหอมกับเอสเปรสโซ่',
    'Fragrant coconut water with espresso',
  ],
  [
    'CF-12',
    'กาแฟเย็นโบราณ',
    'Thai Iced Coffee',
    'coffee',
    65,
    16,
    null,
    'published',
    'สูตรโบราณ นมข้นหวาน',
    'Old-style with condensed milk',
  ],
  [
    'TE-01',
    'ชาไทย',
    'Thai Tea',
    'tea',
    65,
    15,
    'best',
    'published',
    'ชาไทยแท้ หวานมัน',
    'Classic Thai tea',
  ],
  [
    'TE-02',
    'ชาเขียวมัทฉะลาเต้',
    'Matcha Latte',
    'tea',
    85,
    28,
    'best',
    'published',
    'มัทฉะเกรดพิธีชงจากอุจิ',
    'Ceremonial-grade Uji matcha',
  ],
  [
    'TE-03',
    'โฮจิฉะลาเต้',
    'Hojicha Latte',
    'tea',
    85,
    27,
    null,
    'published',
    'ชาเขียวคั่ว หอมกลิ่นไฟ',
    'Roasted green tea, toasty',
  ],
  [
    'TE-04',
    'ชามะนาว',
    'Lemon Tea',
    'tea',
    55,
    12,
    null,
    'published',
    'ชาดำเย็นกับมะนาวสด',
    'Iced black tea and fresh lemon',
  ],
  [
    'TE-05',
    'อู่หลงพีช',
    'Peach Oolong',
    'tea',
    80,
    22,
    'new',
    'published',
    'อู่หลงดอยแม่สลองกับพีช',
    'Mae Salong oolong with peach',
  ],
  [
    'NC-01',
    'โกโก้',
    'Cocoa',
    'non_coffee',
    65,
    18,
    null,
    'published',
    'โกโก้เข้มข้น หวานน้อยได้',
    'Rich cocoa, sweetness to taste',
  ],
  [
    'NC-02',
    'นมสดคาราเมล',
    'Caramel Milk',
    'non_coffee',
    60,
    16,
    null,
    'published',
    'นมสดกับซอสคาราเมลทำเอง',
    'Fresh milk, house caramel',
  ],
  [
    'NC-03',
    'นมชมพู',
    'Pink Milk',
    'non_coffee',
    55,
    12,
    null,
    'published',
    'นมเย็นน้ำแดง',
    'Iced milk with red syrup',
  ],
  [
    'NC-04',
    'น้ำผึ้งมะนาวโซดา',
    'Honey Lime Soda',
    'non_coffee',
    60,
    13,
    null,
    'draft',
    'ซ่า สดชื่น',
    'Fizzy and fresh',
  ],
  [
    'FR-01',
    'มอคค่าปั่น',
    'Mocha Frappé',
    'frappe',
    95,
    30,
    null,
    'published',
    'ปั่นละเอียด วิปครีมด้านบน',
    'Blended, whipped cream on top',
  ],
  [
    'FR-02',
    'ชาไทยปั่น',
    'Thai Tea Frappé',
    'frappe',
    85,
    24,
    null,
    'published',
    'ชาไทยปั่นเนื้อเนียน',
    'Smooth blended Thai tea',
  ],
  [
    'FR-03',
    'มัทฉะปั่น',
    'Matcha Frappé',
    'frappe',
    105,
    35,
    null,
    'published',
    'มัทฉะเข้มข้นปั่น',
    'Strong blended matcha',
  ],
  [
    'FR-04',
    'สตรอว์เบอร์รี่โยเกิร์ตปั่น',
    'Strawberry Yogurt Smoothie',
    'frappe',
    95,
    32,
    'new',
    'draft',
    'สตรอว์เบอร์รี่ดอยอ่างขาง',
    'Doi Ang Khang strawberries',
  ],
  [
    'BK-01',
    'ครัวซองต์เนยสด',
    'Butter Croissant',
    'bakery',
    75,
    25,
    'best',
    'published',
    'อบใหม่ทุกเช้า เนยฝรั่งเศส',
    'Baked every morning, French butter',
  ],
  [
    'BK-02',
    'ครัวซองต์อัลมอนด์',
    'Almond Croissant',
    'bakery',
    95,
    34,
    null,
    'published',
    'ไส้ครีมอัลมอนด์ โรยอัลมอนด์สไลซ์',
    'Almond cream, sliced almonds',
  ],
  [
    'BK-03',
    'บานาน่าเค้ก',
    'Banana Cake',
    'bakery',
    65,
    18,
    null,
    'published',
    'กล้วยหอมทอง หวานน้อย',
    'Hom thong bananas, lightly sweet',
  ],
  [
    'BK-04',
    'บราวนี่',
    'Fudge Brownie',
    'bakery',
    70,
    22,
    null,
    'published',
    'หนึบ เข้มข้น',
    'Fudgy and dense',
  ],
  [
    'BK-05',
    'ชีสเค้กหน้าไหม้',
    'Basque Cheesecake',
    'bakery',
    120,
    42,
    'signature',
    'published',
    'หน้าไหม้ เนื้อครีมมี่',
    'Burnt top, creamy centre',
  ],
  [
    'BK-06',
    'สโคนบลูเบอร์รี่',
    'Blueberry Scone',
    'bakery',
    70,
    21,
    null,
    'draft',
    'เสิร์ฟพร้อมแยมและครีม',
    'With jam and clotted cream',
  ],
  [
    'FD-01',
    'แซนด์วิชแฮมชีส',
    'Ham & Cheese Sandwich',
    'food',
    95,
    38,
    null,
    'published',
    'ขนมปังโฮลวีตปิ้ง',
    'On toasted wholewheat',
  ],
  [
    'FD-02',
    'ครัวซองต์ทูน่า',
    'Tuna Croissant',
    'food',
    110,
    42,
    null,
    'published',
    'ทูน่ามายองเนส ผักสด',
    'Tuna mayo and fresh greens',
  ],
  [
    'FD-03',
    'โยเกิร์ตกราโนล่า',
    'Yogurt Granola Bowl',
    'food',
    120,
    40,
    'new',
    'published',
    'กราโนล่าโฮมเมด ผลไม้ตามฤดู',
    'House granola, seasonal fruit',
  ],
]

// Menu thumbnails: an emoji on a soft tile, written to public/menu/<sku>.svg.
const EMOJI = {
  'CF-07': '🍯',
  'CF-08': '🍋',
  'CF-10': '🧊',
  'CF-11': '🥥',
  'CF-12': '🥤',
  'TE-01': '🧋',
  'TE-02': '🍵',
  'TE-03': '🍵',
  'TE-04': '🍋',
  'TE-05': '🍑',
  'NC-01': '🍫',
  'NC-02': '🥛',
  'NC-03': '🌸',
  'NC-04': '🍯',
  'FR-01': '🥤',
  'FR-02': '🧋',
  'FR-03': '🍵',
  'FR-04': '🍓',
  'BK-01': '🥐',
  'BK-02': '🥐',
  'BK-03': '🍌',
  'BK-04': '🍫',
  'BK-05': '🍰',
  'BK-06': '🫐',
  'FD-01': '🥪',
  'FD-02': '🥐',
  'FD-03': '🥣',
}
const TILE = {
  coffee: '#f1dfc9',
  tea: '#e3ecd5',
  non_coffee: '#f6dde0',
  frappe: '#e2e6f3',
  bakery: '#f6e7c8',
  food: '#e5efe8',
}
const publicMenu = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/menu')
fs.mkdirSync(publicMenu, { recursive: true })
const thumbnail = (sku, category) => {
  const file = `${sku.toLowerCase()}.svg`
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" fill="${TILE[category]}"/>` +
    `<text x="32" y="46" font-size="38" text-anchor="middle">${EMOJI[sku] ?? '☕'}</text></svg>\n`
  fs.writeFileSync(path.join(publicMenu, file), svg)
  return `/menu/${file}`
}

const menu = MENU.map(([sku, th, en, category, price, cost, tag, status, dth, den]) => {
  const sold = status === 'draft' ? 0 : int(tag === 'best' ? 260 : 40, tag === 'best' ? 520 : 240)
  return {
    ...stamps('menu:' + sku),
    sku,
    name_th: th,
    name_en: en,
    category,
    tag,
    price,
    cost,
    description_th: dth,
    description_en: den,
    image_url: thumbnail(sku, category),
    status,
    sold_7d: sold,
    revenue_7d: sold * price,
    rating: status === 'draft' ? 0 : Math.round((4 + rnd()) * 10) / 10,
  }
})

const categories = CATEGORIES.map(([slug, kind, emoji, th, en], i) => ({
  ...stamps('category:' + slug),
  slug,
  kind,
  order: i + 1,
  emoji,
  name_th: th,
  name_en: en,
  item_count: menu.filter((m) => m.category === slug).length,
}))

// ── Orders: the last 14 days, busier in the morning ─────────────────────

const HOURS = [
  [7, 6],
  [8, 12],
  [9, 10],
  [10, 7],
  [11, 5],
  [12, 8],
  [13, 6],
  [14, 5],
  [15, 6],
  [16, 4],
  [17, 3],
  [18, 2],
  [19, 1],
  [20, 1],
]
const openBranches = BRANCHES.filter((b) => BRANCH_WEIGHT[b[0]] > 0).map((b) => [
  b[0],
  BRANCH_WEIGHT[b[0]],
])
const sellable = menu.filter((m) => m.status === 'published')
const orders = []
const counters = {}
for (let d = 13; d >= 0; d--) {
  const n = d === 0 ? 34 : int(14, 22)
  for (let i = 0; i < n; i++) {
    const branch = weighted(openBranches)
    const channel = weighted([
      ['dine_in', 5],
      ['takeaway', 4],
      ['grab', 2],
      ['lineman', 2],
      ['line_order', 1],
    ])
    const items = weighted([
      [1, 5],
      [2, 4],
      [3, 2],
      [4, 1],
      [5, 1],
    ])
    let subtotal = 0
    for (let k = 0; k < items; k++) subtotal += pick(sellable).price
    const discount = rnd() < 0.18 ? Math.round(subtotal * pick([0.1, 0.15, 0.2])) : 0
    // Today: some orders are still in progress.
    const status =
      d === 0 && i >= n - 8
        ? weighted([
            ['pending', 3],
            ['preparing', 3],
            ['ready', 2],
          ])
        : weighted([
            ['completed', 19],
            ['cancelled', 1],
          ])
    const prefix = branch.slice(0, 3).toUpperCase()
    counters[prefix] = (counters[prefix] ?? 1000) + 1
    const isMember = rnd() < 0.55
    orders.push({
      ...stamps(`order:${d}:${i}`),
      code: `${prefix}-${counters[prefix]}`,
      branch,
      channel,
      status,
      customer_name: isMember || channel !== 'dine_in' ? person() : null,
      phone: channel === 'dine_in' && !isMember ? null : phone(),
      note:
        rnd() < 0.15
          ? pick(['หวานน้อย', 'ไม่ใส่น้ำแข็ง', 'นมโอ๊ต', 'แยกน้ำแข็ง', 'เพิ่มช็อต', 'ไม่รับหลอด'])
          : null,
      items,
      subtotal,
      discount,
      total: subtotal - discount,
      payment:
        channel === 'grab' || channel === 'lineman'
          ? 'wallet'
          : weighted([
              ['promptpay', 6],
              ['card', 2],
              ['cash', 2],
            ]),
      ordered_at:
        d === 0
          ? at(
              0,
              Math.min(NOW.getHours(), 7 + Math.floor((i / n) * Math.max(1, NOW.getHours() - 7))),
              int(0, 59),
            )
          : at(d, weighted(HOURS)),
    })
  }
}
orders.sort((a, b) => b.ordered_at.localeCompare(a.ordered_at))

// ── Members ─────────────────────────────────────────────────────────────

const members = Array.from({ length: 48 }, (_, i) => {
  const visits = weighted([
    [int(1, 5), 5],
    [int(6, 30), 4],
    [int(31, 120), 2],
  ])
  const spent = visits * int(90, 180)
  const tier = spent >= 8000 ? 'gold' : spent >= 3000 ? 'silver' : 'bronze'
  const name = person()
  const birthdayMonth = i % 9 === 0 ? NOW.getMonth() + 1 : int(1, 12)
  return {
    ...stamps('member:' + i),
    name,
    phone: phone(),
    email: rnd() < 0.6 ? `member${i + 1}@example.com` : null,
    avatar_url: null,
    tier,
    points: Math.floor(spent / 25) - int(0, Math.floor(spent / 60)),
    visits,
    total_spent: spent,
    favorite_menu: pick(sellable).name_th,
    birthday:
      rnd() < 0.8
        ? `${int(1975, 2005)}-${String(birthdayMonth).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`
        : null,
    joined_on: day(i < 6 ? int(0, 25) : int(30, 700)),
    last_visit_at: at(
      weighted([
        [0, 3],
        [int(1, 6), 4],
        [int(7, 30), 3],
        [int(31, 120), 2],
      ]),
      int(7, 19),
    ),
  }
})

// ── Staff ───────────────────────────────────────────────────────────────

const staff = []
for (const [slug, , , , , , , status] of BRANCHES) {
  if (status === 'soon') continue
  const roles = [
    'manager',
    'barista',
    'barista',
    'barista',
    'cashier',
    slug === 'thonglor' || slug === 'ari' ? 'baker' : 'barista',
  ]
  roles.forEach((role, i) => {
    staff.push({
      ...stamps(`staff:${slug}:${i}`),
      name: person(),
      nickname: pick(NICK),
      avatar_url: null,
      role,
      branch: slug,
      phone: phone(),
      shift: role === 'baker' ? 'morning' : pick(['morning', 'afternoon', 'evening']),
      hourly_rate: { manager: 120, barista: 65, cashier: 55, baker: 75 }[role] + int(0, 3) * 5,
      started_on: day(int(30, 1100)),
      status:
        status === 'closed'
          ? 'on_leave'
          : weighted([
              ['active', 12],
              ['on_leave', 1],
              ['resigned', 1],
            ]),
      hours_this_month: status === 'closed' ? 0 : int(60, 180),
    })
  })
}

const branches = BRANCHES.map(([slug, th, en, district, open, close, seats, status]) => {
  const todays = orders.filter((o) => o.branch === slug && o.ordered_at.slice(0, 10) === day(0))
  return {
    ...stamps('branch:' + slug),
    slug,
    name_th: th,
    name_en: en,
    district,
    phone: `02${String(int(1000000, 9999999))}`,
    opens_at: open,
    closes_at: close,
    seats,
    manager: staff.find((s) => s.branch === slug && s.role === 'manager')?.name ?? null,
    status,
    staff_count: staff.filter((s) => s.branch === slug && s.status !== 'resigned').length,
    today_orders: todays.length,
    today_revenue: todays.filter((o) => o.status !== 'cancelled').reduce((n, o) => n + o.total, 0),
    rating: status === 'soon' ? 0 : Math.round((4.2 + rnd() * 0.7) * 10) / 10,
  }
})

// ── Stock ───────────────────────────────────────────────────────────────

const STOCK = [
  [
    'BN-DC',
    'เมล็ดกาแฟดอยช้าง คั่วกลาง',
    'Doi Chang beans, medium roast',
    'beans',
    'kg',
    950,
    'ไร่ดอยช้าง',
    8,
    3,
  ],
  [
    'BN-DT',
    'เมล็ดกาแฟดอยตุง คั่วเข้ม',
    'Doi Tung beans, dark roast',
    'beans',
    'kg',
    880,
    'ดอยตุง',
    6,
    2,
  ],
  [
    'BN-ET',
    'เมล็ดเอธิโอเปีย คั่วอ่อน',
    'Ethiopia Yirgacheffe, light',
    'beans',
    'kg',
    1450,
    'Roast Lab',
    3,
    1,
  ],
  ['DY-FM', 'นมสด', 'Fresh milk', 'dairy', 'l', 52, 'แดรี่โฮม', 40, 15],
  ['DY-OM', 'นมโอ๊ต', 'Oat milk', 'dairy', 'l', 95, 'Oatside', 15, 6],
  ['DY-WC', 'วิปปิ้งครีม', 'Whipping cream', 'dairy', 'l', 210, 'Anchor', 6, 2],
  ['SY-CR', 'ไซรัปคาราเมล', 'Caramel syrup', 'syrup', 'pcs', 320, 'Monin', 6, 2],
  ['SY-HN', 'น้ำผึ้งป่า', 'Wild honey', 'syrup', 'kg', 380, 'สวนผึ้งสุภาพ', 4, 1],
  ['SY-CD', 'นมข้นหวาน', 'Condensed milk', 'syrup', 'pcs', 28, 'มะลิ', 30, 10],
  ['TE-TH', 'ใบชาไทย', 'Thai tea leaves', 'tea', 'kg', 260, 'ชาตรามือ', 5, 2],
  ['TE-MC', 'ผงมัทฉะ', 'Matcha powder', 'tea', 'kg', 2800, 'Uji Co.', 2, 1],
  ['TE-OL', 'ใบชาอู่หลง', 'Oolong tea leaves', 'tea', 'kg', 900, 'แม่สลอง', 2, 1],
  ['BK-BT', 'เนยสดจืด', 'Unsalted butter', 'bakery', 'kg', 420, 'Président', 10, 4],
  ['BK-FL', 'แป้งขนมปัง', 'Bread flour', 'bakery', 'kg', 45, 'ยูเอฟเอ็ม', 25, 10],
  ['BK-CC', 'ครีมชีส', 'Cream cheese', 'bakery', 'kg', 330, 'Philadelphia', 6, 3],
  ['PK-C12', 'แก้วพลาสติก 16 oz', 'Plastic cup 16 oz', 'packaging', 'pack', 180, 'แพ็คดี', 20, 8],
  ['PK-PP', 'แก้วกระดาษร้อน 8 oz', 'Hot paper cup 8 oz', 'packaging', 'pack', 150, 'แพ็คดี', 12, 5],
  ['PK-BG', 'ถุงหูหิ้วกระดาษ', 'Paper carry bag', 'packaging', 'pack', 95, 'แพ็คดี', 10, 4],
]
const stock = []
for (const branch of ['ari', 'thonglor', 'siam']) {
  for (const [sku, th, en, group, unit, cost, supplier, full, reorder] of STOCK) {
    // A few items are low or out, so the "reorder" cards have something to show.
    const state = weighted([
      ['ok', 14],
      ['low', 3],
      ['out', 1],
    ])
    const level =
      state === 'out'
        ? 0
        : state === 'low'
          ? Math.max(0.5, Math.round(reorder * rnd() * 10) / 10)
          : Math.round(reorder + rnd() * (full - reorder) * 1.2)
    stock.push({
      ...stamps(`stock:${branch}:${sku}`),
      sku: `${sku}-${branch.slice(0, 3).toUpperCase()}`,
      name_th: th,
      name_en: en,
      group,
      unit,
      branch,
      stock: level,
      reorder_level: reorder,
      cost_per_unit: cost,
      supplier,
      last_restock_on: day(int(0, 20)),
    })
  }
}

// ── Promotions ──────────────────────────────────────────────────────────

const PROMOS = [
  [
    'MORNING10',
    'เช้านี้ลด 10% ก่อน 9 โมง',
    'Early bird 10% off before 9am',
    'percent',
    10,
    0,
    -30,
    60,
    null,
    'published',
  ],
  [
    'LATTE2',
    'ลาเต้ซื้อ 1 แถม 1 ทุกวันพุธ',
    'Latte BOGO Wednesdays',
    'bogo',
    0,
    140,
    -14,
    45,
    500,
    'published',
  ],
  [
    'CROISSANT20',
    'ครัวซองต์ลด 20 บาท เมื่อซื้อคู่กาแฟ',
    '฿20 off a croissant with coffee',
    'amount',
    20,
    130,
    -7,
    21,
    null,
    'published',
  ],
  [
    'STUDENT15',
    'นักศึกษาลด 15%',
    'Students 15% off',
    'percent',
    15,
    0,
    -120,
    120,
    null,
    'published',
  ],
  ['RAINY25', 'ฝนตกลด 25 บาท', 'Rainy day ฿25 off', 'amount', 25, 200, -60, -5, 300, 'published'],
  [
    'BDAYFREE',
    'เครื่องดื่มฟรีเดือนเกิดสมาชิก',
    'Free drink in your birthday month',
    'amount',
    85,
    0,
    -200,
    165,
    null,
    'published',
  ],
  [
    'NEWYUZU',
    'เปิดตัวยูซุโทนิค ลด 20%',
    'Yuzu tonic launch 20% off',
    'percent',
    20,
    0,
    3,
    30,
    400,
    'draft',
  ],
  [
    'COCONUT',
    'มะพร้าวลาเต้ ซื้อ 1 แถม 1',
    'Coconut latte BOGO',
    'bogo',
    0,
    180,
    10,
    40,
    200,
    'draft',
  ],
  [
    'SONGKRAN',
    'สงกรานต์ ลด 30%',
    'Songkran 30% off',
    'percent',
    30,
    300,
    -190,
    -180,
    800,
    'published',
  ],
  [
    'GRAB50',
    'สั่งผ่าน Grab ลด 50 บาท',
    '฿50 off on Grab',
    'amount',
    50,
    350,
    -20,
    10,
    1000,
    'published',
  ],
]
const promotions = PROMOS.map(([code, th, en, kind, value, min, from, to, limit, status]) => {
  const started = from <= 0
  const span = Math.max(0, Math.min(to, 0) - from)
  return {
    ...stamps('promo:' + code),
    code,
    title_th: th,
    title_en: en,
    kind,
    value,
    min_spend: min,
    starts_on: day(-from),
    ends_on: day(-to),
    usage_limit: limit,
    used_count: started && status === 'published' ? Math.min(limit ?? 99999, span * int(2, 9)) : 0,
    status,
  }
})

// ── Reviews ─────────────────────────────────────────────────────────────

const GOOD = [
  'ลาเต้นมเนียนมาก บาริสต้าใจดี จะมาอีกแน่นอน',
  'ชีสเค้กหน้าไหม้อร่อยที่สุดในย่านนี้',
  'บรรยากาศดี นั่งทำงานได้ทั้งวัน ปลั๊กเยอะ',
  'กาแฟดำน้ำผึ้งมะนาวสดชื่นมาก เมนูห้ามพลาด',
  'ครัวซองต์อบใหม่ หอมเนย กรอบนอกนุ่มใน',
  'พนักงานจำเมนูประจำได้ ประทับใจ',
  'มัทฉะเข้มข้นของจริง ไม่หวานเกิน',
]
const MEH = [
  'กาแฟอร่อย แต่รอนานช่วงเช้า',
  'ที่นั่งน้อยไปหน่อยช่วงเที่ยง',
  'ราคาค่อนข้างสูง แต่คุณภาพโอเค',
]
const BAD = [
  'สั่งผ่านแอปแล้วได้ของไม่ครบ',
  'วันนี้กาแฟเปรี้ยวกว่าปกติ',
  'แอร์เย็นเกินไป นั่งนานไม่ไหว',
]
const reviews = Array.from({ length: 26 }, (_, i) => {
  const rating = weighted([
    [5, 10],
    [4, 6],
    [3, 3],
    [2, 1],
    [1, 1],
  ])
  const body = rating >= 4 ? pick(GOOD) : rating === 3 ? pick(MEH) : pick(BAD)
  const replied = rnd() < (rating <= 3 ? 0.5 : 0.6)
  return {
    ...stamps('review:' + i),
    name: `${pick(FIRST)} ${pick(LAST).slice(0, 1)}.`,
    branch: weighted(openBranches),
    rating,
    source: pick(['google', 'google', 'wongnai', 'line', 'instore']),
    body,
    reply: replied
      ? rating >= 4
        ? 'ขอบคุณมากครับ แล้วพบกันใหม่นะครับ ☕'
        : 'ขออภัยในประสบการณ์ที่ไม่ดีครับ ทีมงานรับเรื่องไปปรับปรุงแล้วครับ'
      : null,
    visibility: rating >= 3 ? 'shown' : 'hidden',
    reviewed_on: day(int(0, 60)),
  }
})
reviews.sort((a, b) => b.reviewed_on.localeCompare(a.reviewed_on))

// ── Daily stats: 120 days, slowly growing, busier on weekends ───────────

const dailystats = []
for (let d = 119; d >= 0; d--) {
  const date = new Date(NOW)
  date.setDate(date.getDate() - d)
  const weekend = [0, 6].includes(date.getDay())
  const trend = 1 + (119 - d) / 400
  const ordersN = Math.round((weekend ? 210 : 165) * trend * (0.85 + rnd() * 0.3))
  const ticket = int(108, 132)
  const delivery = Math.round(ordersN * (0.18 + rnd() * 0.08))
  const takeaway = Math.round(ordersN * (0.32 + rnd() * 0.06))
  const cups = Math.round(ordersN * 1.6)
  const hot = Math.round(cups * (0.22 + rnd() * 0.06))
  const blended = Math.round(cups * (0.1 + rnd() * 0.05))
  dailystats.push({
    ...stamps('day:' + d),
    date: date.toISOString().slice(0, 10),
    revenue: ordersN * ticket,
    orders: ordersN,
    customers: Math.round(ordersN * 1.25),
    new_members: int(weekend ? 4 : 1, weekend ? 12 : 7),
    dine_in: ordersN - delivery - takeaway,
    takeaway,
    delivery,
    cups_hot: hot,
    cups_iced: cups - hot - blended,
    cups_blended: blended,
    bakery_items: Math.round(ordersN * (0.35 + rnd() * 0.15)),
    promo_discount: Math.round(ordersN * ticket * (0.03 + rnd() * 0.03)),
    waste_cost: int(180, 900),
  })
}

// ── Accounts + settings ─────────────────────────────────────────────────

const PASSWORD = 'cafe1234'
const accounts = [
  ['admin', 'ดาว (เจ้าของร้าน)'],
  ['editor', 'Manager'],
  ['viewer', 'Viewer'],
].map(([role, name]) => ({
  password: PASSWORD,
  operator: {
    id: uuid('operator:' + role),
    email: `${role}@doidao.cafe`,
    display_name: name,
    role,
    avatar_url: null,
  },
}))

const settings = {
  store: {
    store_name: 'ดอยดาว คาเฟ่',
    tax_id: '0105567012345',
    phone: '021234567',
    email: 'hello@doidao.cafe',
    vat_percent: 7,
    service_charge_percent: 0,
    receipt_header: 'ดอยดาว คาเฟ่ · กาแฟจากดอยถึงเมือง',
    receipt_footer: 'ขอบคุณที่แวะมานะคะ แล้วพบกันใหม่ ☕',
    wifi_password: 'doidao2026',
  },
  loyalty: {
    baht_per_point: 25,
    point_expiry_months: 12,
    points_per_reward: 100,
    reward_value_baht: 65,
    silver_min_spend: 3000,
    gold_min_spend: 8000,
    birthday_points: 50,
  },
}

write('menu', menu)
write('categories', categories)
write('orders', orders)
write('promotions', promotions)
write('members', members)
write('reviews', reviews)
write('branches', branches)
write('staff', staff)
write('stock', stock)
write('dailystats', dailystats)
write('accounts', accounts)
write('settings', settings)
console.log(
  `mocks → ${out}: ${menu.length} menu, ${orders.length} orders, ${members.length} members, ${staff.length} staff, ${stock.length} stock, ${dailystats.length} days`,
)
