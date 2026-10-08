import type { LucideIcon } from "lucide-react";
import {
    Award,
    Briefcase,
    Car,
    CircleDollarSign,
    Clapperboard,
    CreditCard as CreditCardIcon,
    Droplet,
    Gift,
    GraduationCap,
    HeartPulse,
    Home,
    Landmark,
    Laptop,
    Plane,
    Repeat,
    ShieldCheck,
    ShoppingBag,
    TrendingUp,
    Utensils,
    Wallet,
    WalletCards,
    Zap,
    Coffee,
    Cigarette,
    ShoppingCart,
    Smartphone,
    Tv,
    Package,
} from "lucide-react";

// Mirrors the Prisma enums 1:1
export type AccountType = "BANK" | "CASH" | "CREDIT_CARD" | "WALLET" | "OTHER";
export type TransactionType = "CREDIT" | "DEBIT";
export type TransactionCategory =
    | "SALARY"
    | "INCENTIVE_BONUS"
    | "FREELANCE"
    | "OTHER_INCOME"
    | "FOOD"
    | "SNACKS_TEA"
    | "PERSONAL_HABITS"
    | "GROCERIES"
    | "ONLINE_SHOPPING"
    | "SHOPPING"
    | "MOBILE_RECHARGE"
    | "STREAMING_OTT"
    | "SUBSCRIPTION"
    | "TRANSPORTATION"
    | "ENTERTAINMENT"
    | "HEALTHCARE"
    | "UTILITIES"
    | "ELECTRICITY_BILL"
    | "HOUSING"
    | "EDUCATION"
    | "TRAVEL"
    | "INSURANCE"
    | "EMI"
    | "INVESTMENT"
    | "OTHER";

export interface Account {
    id: number;
    name: string;
    type: AccountType;
    balance: number;
    accountNumber?: string | null;
    ifsc?: string | null;
    branch?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Transaction {
    id: number;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    merchant: string | null;
    description: string | null;
    emoji: string | null;
    occurredAt: string;
    accountId: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Budget {
    id: number;
    name: string | null;
    category: TransactionCategory;
    amount: number;
    month: number;
    year: number;
}

export interface FinancialGoal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string | null;
}

const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    lime: "bg-lime-50 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    pink: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
    yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    teal: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    slate: "bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
    red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    green: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400",
    warm: "bg-amber-100 text-amber-800 dark:bg-amber-600/15 dark:text-amber-300",
    smoke: "bg-zinc-100 text-zinc-800 dark:bg-zinc-600/15 dark:text-zinc-300",
    emeraldDark: "bg-emerald-100 text-emerald-800 dark:bg-emerald-600/15 dark:text-emerald-300",
    fuchsia: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
} as const;

export const categoryMeta: Record<
    TransactionCategory,
    { label: string; icon: LucideIcon; className: string }
> = {
    // 1. Incomes
    SALARY: { label: "Fixed Salary", icon: Briefcase, className: colorClasses.emerald },
    INCENTIVE_BONUS: { label: "Incentive, Bonus & Commission", icon: Award, className: colorClasses.lime },
    FREELANCE: { label: "Freelance & Consulting", icon: Laptop, className: colorClasses.amber },
    OTHER_INCOME: { label: "Other income", icon: Gift, className: colorClasses.lime },
    
    // 2. Food, Drinks & Quick Commerce
    FOOD: { label: "Food & Dining (Swiggy/Zomato)", icon: Utensils, className: colorClasses.orange },
    SNACKS_TEA: { label: "Tea, Coffee & Snacks", icon: Coffee, className: colorClasses.warm },
    PERSONAL_HABITS: { label: "Smoking & Personal Habits", icon: Cigarette, className: colorClasses.smoke },
    GROCERIES: { label: "Groceries (Zepto/Blinkit/DMart)", icon: ShoppingCart, className: colorClasses.emeraldDark },
    
    // 3. E-Commerce & Retail
    ONLINE_SHOPPING: { label: "Online Shopping (Amazon/Flipkart/Meesho)", icon: Package, className: colorClasses.pink },
    SHOPPING: { label: "Retail & In-Store Shopping", icon: ShoppingBag, className: colorClasses.pink },
    
    // 4. Bills, Recharges & OTT
    MOBILE_RECHARGE: { label: "Mobile & DTH Recharge (Jio/Airtel)", icon: Smartphone, className: colorClasses.cyan },
    STREAMING_OTT: { label: "Streaming OTT (Netflix/Prime/Hotstar)", icon: Tv, className: colorClasses.fuchsia },
    SUBSCRIPTION: { label: "Digital Subscriptions (Spotify/iCloud)", icon: Repeat, className: colorClasses.violet },
    ELECTRICITY_BILL: { label: "Electricity Bill", icon: Zap, className: colorClasses.yellow },
    UTILITIES: { label: "Utilities (Water/Gas/WiFi)", icon: Droplet, className: colorClasses.blue },

    // 5. Living & Commitments
    HOUSING: { label: "Housing & Rent", icon: Home, className: colorClasses.indigo },
    TRANSPORTATION: { label: "Transportation (Uber/Fuel)", icon: Car, className: colorClasses.blue },
    EMI: { label: "Loan & EMI Payments", icon: Landmark, className: colorClasses.red },
    INSURANCE: { label: "Insurance", icon: ShieldCheck, className: colorClasses.slate },
    HEALTHCARE: { label: "Healthcare & Pharmacy", icon: HeartPulse, className: colorClasses.rose },
    EDUCATION: { label: "Education & Courses", icon: GraduationCap, className: colorClasses.teal },
    ENTERTAINMENT: { label: "Entertainment & Movies", icon: Clapperboard, className: colorClasses.purple },
    TRAVEL: { label: "Travel & Vacations", icon: Plane, className: colorClasses.sky },
    INVESTMENT: { label: "Investment & SIP", icon: TrendingUp, className: colorClasses.green },
    OTHER: { label: "Other", icon: CircleDollarSign, className: colorClasses.gray },
};

// Single source of truth for validation — derived from categoryMeta so it can't drift from the UI
export const TRANSACTION_CATEGORIES = Object.keys(categoryMeta) as [
    TransactionCategory,
    ...TransactionCategory[],
];

const INCOME_ONLY: TransactionCategory[] = ["SALARY", "INCENTIVE_BONUS", "FREELANCE", "OTHER_INCOME"];
// Valid as either money in or money out (e.g. investment redemption vs. SIP)
const EITHER: TransactionCategory[] = ["INVESTMENT", "OTHER"];

export function categoriesForType(type: TransactionType): TransactionCategory[] {
    return TRANSACTION_CATEGORIES.filter((c) =>
        type === "CREDIT"
            ? INCOME_ONLY.includes(c) || EITHER.includes(c)
            : !INCOME_ONLY.includes(c),
    );
}

export function isCategoryValidForType(category: TransactionCategory, type: TransactionType) {
    return categoriesForType(type).includes(category);
}

export function defaultCategoryForType(type: TransactionType): TransactionCategory {
    return type === "CREDIT" ? "SALARY" : "FOOD";
}

export const accountTypeLabel: Record<AccountType, string> = {
    BANK: "Bank Account",
    CREDIT_CARD: "Credit Card",
    WALLET: "Digital Wallet",
    CASH: "Cash Account",
    OTHER: "Other Account",
};

export const accountTypeIcon: Record<AccountType, LucideIcon> = {
    BANK: Landmark,
    CREDIT_CARD: CreditCardIcon,
    WALLET: WalletCards,
    CASH: Wallet,
    OTHER: CircleDollarSign,
};