import React, { useCallback, useState } from "react";
import {
  Alert, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { deleteTransaction, getSummary } from "./database/financeRepository";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Resumo({ navigation }) {
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState(null);

  const carregarResumo = useCallback(async () => {
    const next = await getSummary();
    setSummary(next);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const carregar = async () => {
        const next = await getSummary();
        if (isActive) setSummary(next);
      };
      carregar();
      return () => { isActive = false; };
    }, [])
  );

  const editarMovimentacao = (transaction) => {
    navigation.navigate(
      transaction.type === "income" ? "AddGanho" : "AddGasto",
      { transaction }
    );
  };

  const confirmarExclusao = (transaction) => {
    const mensagem = transaction.type === "income"
      ? "Deseja excluir esta renda extra?"
      : "Deseja excluir este gasto?";

    Alert.alert("Confirmar exclusão", mensagem, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(transaction.id);
            await carregarResumo();
          } catch {
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        },
      },
    ]);
  };

  const transactions = summary?.transactions || [];
  const expensesByCategory = Object.entries(summary?.expensesByCategory || {});
  const incomeByCategory = Object.entries(summary?.incomeByCategory || {});

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resumo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 96, 112) }]}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Saldo restante</Text>
          <Text style={styles.balance}>{formatMoney(summary?.balance)}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.smallCard}>
            <Text style={styles.label}>Ganhos</Text>
            <Text style={styles.income}>{formatMoney(summary?.totalIncome)}</Text>
          </View>
          <View style={styles.smallCard}>
            <Text style={styles.label}>Gastos</Text>
            <Text style={styles.expense}>{formatMoney(summary?.totalExpense)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gastos por categoria</Text>
        {expensesByCategory.length === 0 ? (
          <View style={styles.card}><Text style={styles.emptyText}>Nenhum gasto por categoria.</Text></View>
        ) : expensesByCategory.map(([cat, total]) => (
          <View key={cat} style={styles.categoryRow}>
            <Text style={styles.transactionTitle}>{cat}</Text>
            <Text style={styles.expense}>{formatMoney(total)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Rendas extras por categoria</Text>
        {incomeByCategory.length === 0 ? (
          <View style={styles.card}><Text style={styles.emptyText}>Nenhuma renda extra por categoria.</Text></View>
        ) : incomeByCategory.map(([cat, total]) => (
          <View key={cat} style={styles.categoryRow}>
            <Text style={styles.transactionTitle}>{cat}</Text>
            <Text style={styles.income}>{formatMoney(total)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Histórico</Text>
        {transactions.length === 0 ? (
          <View style={styles.card}><Text style={styles.emptyText}>Nenhuma movimentação cadastrada.</Text></View>
        ) : transactions.map((item) => (
          <View key={item.id} style={styles.transaction}>
            <View>
              <Text style={styles.transactionTitle}>
                {item.type === "income" ? item.category || "Renda extra" : item.category || "Gasto"}
              </Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
            <View style={styles.transactionActions}>
              <Text style={[styles.transactionValue, item.type === "income" ? styles.income : styles.expense]}>
                {item.type === "income" ? "+" : "-"} {formatMoney(item.amount)}
              </Text>
              <TouchableOpacity style={styles.editButton} onPress={() => editarMovimentacao(item)}>
                <Ionicons name="create-outline" size={18} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => confirmarExclusao(item)}>
                <Ionicons name="trash-outline" size={18} color="#E53935" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4CAF50" },
  body: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: "#4CAF50", padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomLeftRadius: 15, borderBottomRightRadius: 15 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  content: { padding: 16 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2, marginBottom: 16 },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  smallCard: { flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2 },
  label: { color: "#777", fontSize: 14, marginBottom: 6 },
  balance: { color: "#333", fontSize: 26, fontWeight: "bold" },
  income: { color: "#4CAF50", fontSize: 18, fontWeight: "bold" },
  expense: { color: "#E53935", fontSize: 18, fontWeight: "bold" },
  sectionTitle: { color: "#333", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  emptyText: { color: "#777" },
  transaction: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoryRow: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  transactionTitle: { color: "#333", fontWeight: "bold" },
  transactionDate: { color: "#777", marginTop: 4 },
  transactionValue: { fontSize: 16, fontWeight: "bold" },
  transactionActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  editButton: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: "#ddd", alignItems: "center", justifyContent: "center" },
  deleteButton: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: "#F5C2C0", alignItems: "center", justifyContent: "center" },
});
