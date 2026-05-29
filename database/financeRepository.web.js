const DEFAULT_SETTINGS = {
  id: 1,
  initialMoney: 1500,
  startDate: "",
  endDate: "",
  saveHistory: true,
  categories: ["Mercado", "Transporte", "Moradia", "Lazer", "Saude"],
  incomeCategories: ["Renda extra", "Freelance", "Bonus", "Venda"],
};

let dbPromise = null;

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

const parseCategories = (value, fallback) =>
  Array.isArray(value) && value.length > 0 ? value : fallback;

const requestToPromise = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const getIndexedDb = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("financeiro", 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("transactions")) {
          const store = db.createObjectStore("transactions", {
            keyPath: "id",
            autoIncrement: true,
          });

          store.createIndex("createdAt", "createdAt");
          store.createIndex("date", "date");
          store.createIndex("type", "type");
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return dbPromise;
};

const getStore = async (storeName, mode = "readonly") => {
  const db = await getIndexedDb();
  return db.transaction(storeName, mode).objectStore(storeName);
};

export const initDatabase = async () => {
  const store = await getStore("settings");
  const existingSettings = await requestToPromise(
    store.get(DEFAULT_SETTINGS.id)
  );

  if (!existingSettings) {
    const writeStore = await getStore("settings", "readwrite");
    await requestToPromise(writeStore.put(DEFAULT_SETTINGS));
  }
};

export const getSettings = async () => {
  await initDatabase();

  const store = await getStore("settings");
  const settings = await requestToPromise(store.get(DEFAULT_SETTINGS.id));
  return { ...DEFAULT_SETTINGS, ...settings };
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

  const store = await getStore("settings", "readwrite");
  await requestToPromise(store.put(nextSettings));
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

  const store = await getStore("transactions", "readwrite");
  const id = await requestToPromise(store.add(transaction));
  return { id, ...transaction };
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

  const store = await getStore("transactions", "readwrite");
  const current = await requestToPromise(store.get(transaction.id));

  await requestToPromise(
    store.put({
      ...current,
      ...transaction,
      createdAt: current?.createdAt || new Date().toISOString(),
    })
  );

  return transaction;
};

export const deleteTransaction = async (id) => {
  await initDatabase();

  if (!id) {
    throw new Error("Movimentação inválida.");
  }

  const store = await getStore("transactions", "readwrite");
  await requestToPromise(store.delete(id));
};

export const getTransactions = async () => {
  await initDatabase();

  const store = await getStore("transactions");
  const transactions = await requestToPromise(store.getAll());

  return transactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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

  if (!keepHistory) {
    const transactionsStore = await getStore("transactions", "readwrite");
    await requestToPromise(transactionsStore.clear());
  }

  const settingsStore = await getStore("settings", "readwrite");
  await requestToPromise(settingsStore.put(DEFAULT_SETTINGS));
};
