import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set in environment");
}

const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MERCHANTS_BY_CATEGORY: Record<string, string[]> = {
  SALARY: ["Tech Corp Global", "Acme Enterprises", "Alphabet Inc", "Infosys Ltd"],
  FREELANCE: ["Upwork Client", "Fiverr Project", "Toptal Contract", "Direct Client Consulting"],
  OTHER_INCOME: ["Stock Dividend", "Mutual Fund Payout", "Cashback Reward", "Rental Income"],
  FOOD: ["Zomato", "Swiggy", "Blinkit", "Zepto", "Instamart", "Starbucks", "McDonald's", "Local Supermarket"],
  SHOPPING: ["Amazon India", "Flipkart", "Myntra", "Zara", "Apple Store", "Uniqlo", "Decathlon"],
  TRANSPORTATION: ["Uber", "Ola Cabs", "HPCL Petrol", "BPCL Fuel", "Metro Card Recharge", "Indian Railways"],
  ENTERTAINMENT: ["BookMyShow", "PVR Cinemas", "Netflix", "Spotify Premium", "Steam Games", "Sony PlayStation"],
  HEALTHCARE: ["Apollo Pharmacy", "Practo Doctor", "1mg Medicines", "Dental Clinic", "Max Healthcare"],
  UTILITIES: ["Adani Electricity", "Tata Power", "Airtel Broadband", "Jio Fiber", "Gas Pipeline Utility"],
  ELECTRICITY_BILL: ["State Electricity Board", "Bescom", "MSEDCL Bill"],
  HOUSING: ["Monthly House Rent", "Society Maintenance", "Home Repair & Painting"],
  EDUCATION: ["Udemy Courses", "Coursera Specialization", "Books & Stationery", "Masterclass"],
  TRAVEL: ["MakeMyTrip", "Indigo Airlines", "Airbnb Stay", "Booking.com", "Agoda Hotels"],
  INSURANCE: ["HDFC Ergo Health", "LIC Term Life", "Acko Auto Insurance"],
  EMI: ["HDFC Personal Loan EMI", "Car Loan EMI", "No-Cost EMI Amazon"],
  SUBSCRIPTION: ["ChatGPT Plus", "GitHub Copilot", "Google One Storage", "YouTube Premium", "Notion AI"],
  INVESTMENT: ["Zerodha Kite Equity", "Groww Mutual Funds", "Sovereign Gold Bonds", "PPF Deposit"],
  OTHER: ["ATM Cash Withdrawal", "Miscellaneous Purchase", "Courier Service"],
};

const CATEGORIES = Object.keys(MERCHANTS_BY_CATEGORY);

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Cleaning database for large-scale stress test...");

  await prisma.transaction.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.financialGoal.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleared.");

  // 1. Create single primary user (linked to Supabase Auth by email on first sign-in)
  const user = await prisma.user.create({
    data: {
      name: "Aasif ALi",
      email: "aasifdemand@gmail.com",
    },
  });
  console.log(`User created: ${user.name} (${user.email})`);

  // 2. Create 6 diverse accounts
  const accountsData = [
    { name: "HDFC Salary Account", type: "BANK" as const, balance: new Prisma.Decimal(285000) },
    { name: "ICICI Wealth Account", type: "BANK" as const, balance: new Prisma.Decimal(175000) },
    { name: "SBI Emergency Reserve", type: "BANK" as const, balance: new Prisma.Decimal(450000) },
    { name: "Physical Cash Wallet", type: "CASH" as const, balance: new Prisma.Decimal(12500) },
    { name: "Axis Neo Credit Card", type: "CREDIT_CARD" as const, balance: new Prisma.Decimal(45000) },
    { name: "HDFC Regalia Gold Card", type: "CREDIT_CARD" as const, balance: new Prisma.Decimal(82000) },
  ];

  const createdAccounts = [];
  for (const acc of accountsData) {
    const a = await prisma.account.create({
      data: { ...acc, userId: user.id },
    });
    createdAccounts.push(a);
  }
  console.log(`Created ${createdAccounts.length} accounts.`);

  // 3. Create Budgets for 12 months (past 6 months + next 6 months)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const budgetCategories = ["FOOD", "SHOPPING", "TRANSPORTATION", "ENTERTAINMENT", "UTILITIES", "HEALTHCARE", "TRAVEL"];
  const budgetsToInsert = [];

  for (let m = 1; m <= 12; m++) {
    for (const cat of budgetCategories) {
      budgetsToInsert.push({
        name: `${cat} Budget`,
        category: cat as any,
        amount: new Prisma.Decimal(getRandomNumber(4000, 25000)),
        month: m,
        year: currentYear,
        userId: user.id,
      });
    }
  }

  await prisma.budget.createMany({ data: budgetsToInsert });
  console.log(`Created ${budgetsToInsert.length} budget items across months.`);

  // 4. Create 10 Financial Goals
  const goalsData = [
    { name: "Emergency Fund (12 Months)", target: 500000, current: 320000, daysAhead: 180 },
    { name: "New MacBook Pro M3 Max", target: 250000, current: 180000, daysAhead: 60 },
    { name: "Europe Vacation Fund", target: 400000, current: 120000, daysAhead: 300 },
    { name: "New Electric Car Downpayment", target: 600000, current: 250000, daysAhead: 400 },
    { name: "Stock Portfolio 10L Milestone", target: 1000000, current: 680000, daysAhead: 365 },
    { name: "Home Interior Upgrade", target: 350000, current: 95000, daysAhead: 210 },
    { name: "Luxury Watch Collection", target: 150000, current: 150000, daysAhead: -30 },
    { name: "Real Estate Token Fund", target: 800000, current: 210000, daysAhead: 500 },
    { name: "Parents Health Contingency", target: 300000, current: 280000, daysAhead: 90 },
    { name: "Higher Learning & Certifications", target: 120000, current: 85000, daysAhead: 120 },
  ];

  await prisma.financialGoal.createMany({
    data: goalsData.map((g) => ({
      name: g.name,
      targetAmount: new Prisma.Decimal(g.target),
      currentAmount: new Prisma.Decimal(g.current),
      targetDate: new Date(Date.now() + g.daysAhead * 86400000),
      userId: user.id,
    })),
  });
  console.log(`Created ${goalsData.length} financial goals.`);

  // 5. Generate 3,500 Transactions spanning across the past 2 years (730 days)
  console.log("Generating 3,500 realistic scalable transactions...");

  const TOTAL_TRANSACTIONS = 3500;
  const transactionsData = [];
  const twoYearsAgoMs = 730 * 24 * 60 * 60 * 1000;
  const startTimestamp = Date.now() - twoYearsAgoMs;

  for (let i = 0; i < TOTAL_TRANSACTIONS; i++) {
    // Distribute randomly across the last 2 years with more weight on recent months
    const randomTime = startTimestamp + Math.random() * twoYearsAgoMs;
    const occurredAt = new Date(randomTime);

    // 15% income (CREDIT), 85% expenses (DEBIT)
    const isIncome = Math.random() < 0.15;
    const type = isIncome ? ("CREDIT" as const) : ("DEBIT" as const);

    let category: string;
    let amount: number;

    if (isIncome) {
      category = getRandomElement(["SALARY", "FREELANCE", "OTHER_INCOME", "INVESTMENT"]);
      amount = category === "SALARY" ? getRandomNumber(85000, 150000) : getRandomNumber(5000, 45000);
    } else {
      category = getRandomElement(CATEGORIES.filter((c) => !["SALARY", "FREELANCE"].includes(c)));
      if (["HOUSING", "EMI", "TRAVEL"].includes(category)) {
        amount = getRandomNumber(8000, 45000);
      } else if (["FOOD", "TRANSPORTATION", "ENTERTAINMENT"].includes(category)) {
        amount = getRandomNumber(120, 2800);
      } else {
        amount = getRandomNumber(300, 12000);
      }
    }

    const merchantList = MERCHANTS_BY_CATEGORY[category] || ["Merchant"];
    const merchant = getRandomElement(merchantList);
    const account = getRandomElement(createdAccounts);

    transactionsData.push({
      amount: new Prisma.Decimal(amount),
      type,
      category: category as any,
      merchant,
      description: isIncome ? `${category} credit payment` : `${merchant} payment for ${category.toLowerCase()}`,
      emoji: null,
      occurredAt,
      accountId: account.id,
      userId: user.id,
    });
  }

  // Insert in batches of 500 for optimal Neon DB ingestion speed
  const BATCH_SIZE = 500;
  for (let b = 0; b < transactionsData.length; b += BATCH_SIZE) {
    const chunk = transactionsData.slice(b, b + BATCH_SIZE);
    await prisma.transaction.createMany({ data: chunk });
    console.log(`Inserted batch ${b + chunk.length} / ${TOTAL_TRANSACTIONS} transactions...`);
  }

  console.log("\n========================================================");
  console.log("Scalability Dataset Successfully Seeded!");
  console.log(`Total Transactions Seeded: ${TOTAL_TRANSACTIONS}`);
  console.log(`Total Budgets Seeded:      ${budgetsToInsert.length}`);
  console.log(`Total Goals Seeded:        ${goalsData.length}`);
  console.log(`Total Accounts Seeded:     ${createdAccounts.length}`);
  console.log("--------------------------------------------------------");
  console.log("Login credentials:");
  console.log("Email:    aasifdemand@gmail.com");
  console.log("Password: Aasif@12345");
  console.log("Name:     Aasif ALi");
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("Scale seeder failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });