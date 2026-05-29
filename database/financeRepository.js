import * as SQLite from "expo-sqlite";

const DEFAULT_SETTINGS = {
  id: 1,
  initialMoney: 1500,
  startDate: "",
  endDate: "",
  saveHistory: true,
  categories: ["Mercado", "Transporte", "Moradia", "Lazer", "Saude"],
  incomeCategories: ["Renda extra", "Freelance", "Bonus", "Venda"],
};

let sqliteDbPromise = null;

const parseMoney = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const rawValue = String(value || "").replace(/[^\d,.-]/g, "");
  const normalized = rawValue.includes(",")
    ? rawValue.replace(/\./g, "").replace(",", ".")
    : rawValue;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeDate = (date = new Date()) => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }

  return new Date(date).toISOString().slice(0, 10);
};

const toBoolean = (value) => value === true || value === 1;

const parseCategories = (value, fallback = DEFAULT_SETTINGS.categories) => {
  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const getSQLiteDb = async () => {
  if (!sqliteDbPromise) {
    sqliteDbPromise = SQLite.openDatabaseAsync("financeiro.db");
  }

  return sqliteDbPromise;
};

export const initDatabase = async () => {
  const db = await getSQLiteDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY NOT NULL,
      initialMoney REAL NOT NULL DEFAULT 0,
      startDate TEXT,
      endDate TEXT,
      saveHistory INTEGER NOT NULL DEFAULT 1,
      categoriesJson TEXT,
      incomeCategoriesJson TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      description TEXT,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  const settingsColumns = await db.getAllAsync("PRAGMA table_info(settings)");
  const transactionColumns = await db.getAllAsync("PRAGMA table_info(transactions)");

  if (!settingsColumns.some((column) => column.name === "categoriesJson")) {
    await db.execAsync("ALTER TABLE settings ADD COLUMN categoriesJson TEXT");
  }

  if (!settingsColumns.some((column) => column.name === "incomeCategoriesJson")) {
    await db.execAsync("ALTER TABLE settings ADD COLUMN incomeCategoriesJson TEXT");
  }

  if (!transactionColumns.some((column) => column.name === "category")) {
    await db.execAsync("ALTER TABLE transactions ADD COLUMN category TEXT");
  }

  await db.runAsync(
    `INSERT OR IGNORE INTO settings
      (id, initialMoney, startDate, endDate, saveHistory, categoriesJson, incomeCategoriesJson)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      DEFAULT_SETTINGS.id,
      DEFAULT_SETTINGS.initialMoney,
      DEFAULT_SETTINGS.startDate,
      DEFAULT_SETTINGS.endDate,
      DEFAULT_SETTINGS.saveHistory ? 1 : 0,
      JSON.stringify(DEFAULT_SETTINGS.categories),
      JSON.stringify(DEFAULT_SETTINGS.incomeCategories),
    ]
  );
};

export const getSettings = async () => {
  await initDatabase();

  const db = await getSQLiteDb();
  const settings = await db.getFirstAsync(
    "SELECT * FROM settings WHERE id = ?",
    [DEFAULT_SETTINGS.id]
  );

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    saveHistory: toBoolean(settings?.saveHistory),
    categories: parseCategories(settings?.categoriesJson, DEFAULT_SETTINGS.categories),
    incomeCategories: parseCategories(
      settings?.incomeCategoriesJson,
      DEFAULT_SETTINGS.incomeCategories
    ),
  };
};

export const saveSettings = async (settings) => {
  await initDatabase();

  const nextSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    id: DEFAULT_SETTINGS.id,
    initialMoney: parseMoney(settings.initialMoney),
    saveHistory: Boolean(settings.saveHistory),
    categories: parseCategories(settings.categories, DEFAULT_SETTINGS.categories),
    incomeCategories: parseCategories(
      settings.incomeCategories,
      DEFAULT_SETTINGS.incomeCategories
    ),
  };

  const db = await getSQLiteDb();
  await db.runAsync(
    `UPDATE settings
      SET initialMoney = ?, startDate = ?, endDate = ?, saveHistory = ?, categoriesJson = ?, incomeCategoriesJson = ?
      WHERE id = ?`,
    [
      nextSettings.initialMoney,
      nextSettings.startDate,
      nextSettings.endDate,
      nextSettings.saveHistory ? 1 : 0,
      JSON.stringify(nextSettings.categories),
      JSON.stringify(nextSettings.incomeCategories),
      DEFAULT_SETTINGS.id,
    ]
  );

  return nextSettings;
};

export const addTransaction = async ({
  type,
  amount,
  category = "Outros",
  description = "",
  date,
}) => {
  await initDatabase();

  const transaction = {
    type,
    amount: parseMoney(amount),
    category,
    description,
    date: normalizeDate(date),
    createdAt: new Date().toISOString(),
  };

  if (!["income", "expense"].includes(transaction.type)) {
    throw new Error("Tipo de transação inválido.");
  }

  if (transaction.amount <= 0) {
    throw new Error("Informe um valor maior que zero.");
  }

  const db = await getSQLiteDb();
  const result = await db.runAsync(
    `INSERT INTO transactions
      (type, amount, category, description, date, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)`,
    [
      transaction.type,
      transaction.amount,
      transaction.category,
      transaction.description,
      transaction.date,
      transaction.createdAt,
    ]
  );

  return { id: result.lastInsertRowId, ...transaction };
};

export const updateTransaction = async ({
  id,
  type,
  amount,
  category = "Outros",
  description = "",
  date,
}) => {
  await initDatabase();

  const transaction = {
    id,
    type,
    amount: parseMoney(amount),
    category,
    description,
    date: normalizeDate(date),
  };

  if (!transaction.id) {
    throw new Error("Movimentação inválida.");
  }

  if (!["income", "expense"].includes(transaction.type)) {
    throw new Error("Tipo de transação inválido.");
  }

  if (transaction.amount <= 0) {
    throw new Error("Informe um valor maior que zero.");
  }

  const db = await getSQLiteDb();
  await db.runAsync(
    `UPDATE transactions
      SET type = ?, amount = ?, category = ?, description = ?, date = ?
      WHERE id = ?`,
    [
      transaction.type,
      transaction.amount,
      transaction.category,
      transaction.description,
      transaction.date,
      transaction.id,
    ]
  );

  return transaction;
};

export const deleteTransaction = async (id) => {
  await initDatabase();

  if (!id) {
    throw new Error("Movimentação inválida.");
  }

  const db = await getSQLiteDb();
  await db.runAsync("DELETE FROM transactions WHERE id = ?", [id]);
};

export const getTransactions = async () => {
  await initDatabase();

  const db = await getSQLiteDb();
  return db.getAllAsync(
    "SELECT * FROM transactions ORDER BY datetime(createdAt) DESC"
  );
};

export const getSummary = async () => {
  await initDatabase();

  const settings = await getSettings();
  const transactions = await getTransactions();
  const today = normalizeDate();

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const spentToday = transactions
    .filter((item) => item.type === "expense" && item.date === today)
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const monthlyTotal = Number(settings.initialMoney || 0) + totalIncome;
  const dailyLimit = monthlyTotal / 30;
  const expensesByCategory = transactions
    .filter((item) => item.type === "expense")
    .reduce((totals, item) => {
      const category = item.category || "Outros";
      totals[category] = (totals[category] || 0) + Number(item.amount || 0);
      return totals;
    }, {});
  const incomeByCategory = transactions
    .filter((item) => item.type === "income")
    .reduce((totals, item) => {
      const category = item.category || "Renda extra";
      totals[category] = (totals[category] || 0) + Number(item.amount || 0);
      return totals;
    }, {});

  return {
    settings,
    transactions,
    totalIncome,
    totalExpense,
    spentToday,
    expensesByCategory,
    incomeByCategory,
    balance: Number(settings.initialMoney || 0) + totalIncome - totalExpense,
    dailyLimit,
  };
};

export const clearCurrentMonth = async ({ keepHistory = true } = {}) => {
  await initDatabase();

  if (keepHistory) {
    await saveSettings(DEFAULT_SETTINGS);
    return;
  }

  const db = await getSQLiteDb();
  await db.runAsync("DELETE FROM transactions");
  await saveSettings(DEFAULT_SETTINGS);
};
