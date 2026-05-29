import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

let db = null;

if (Platform.OS !== "web") {
  db = SQLite.openDatabaseSync("financeiro.db");
}

export default db;