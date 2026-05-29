import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function HomeScreen({ navigation }) {
  const [saldo] = useState(1500);
  const [limite] = useState(50);
  const [gastoHoje] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Image source={require("./assets/Logo04.png")} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.navigate("Config")}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="wallet-outline" size={22} color="#4CAF50" />
            <Text style={styles.label}>Saldo restante</Text>
          </View>
          <Text style={styles.valor}>R$ {formatMoney(saldo)}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={22} color="#4CAF50" />
            <Text style={styles.label}>Limite de hoje</Text>
          </View>
          <Text style={styles.valor}>R$ {formatMoney(limite)}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="cart-outline" size={22} color="#4CAF50" />
            <Text style={styles.label}>Já gasto hoje</Text>
          </View>
          <Text style={styles.valor}>R$ {formatMoney(gastoHoje)}</Text>
        </View>

        <TouchableOpacity style={styles.botaoOutlineVermelho} onPress={() => navigation.navigate("AddGasto")}>
          <Text style={styles.botaoTextoVermelho}>+ Adicionar Gasto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoOutlineVerde} onPress={() => navigation.navigate("AddGanho")}>
          <Text style={styles.botaoTextoVerde}>+ Adicionar renda extra</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4CAF50" },
  body: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#4CAF50", padding: 16,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", borderBottomLeftRadius: 15, borderBottomRightRadius: 15,
  },
  logo: { width: 360, height: 40, resizeMode: "contain" },
  card: { backgroundColor: "#fff", marginHorizontal: 16, marginTop: 15, padding: 16, borderRadius: 12, elevation: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 14, color: "#777" },
  valor: { fontSize: 22, fontWeight: "bold", color: "#333", marginTop: 8 },
  botaoOutlineVermelho: { borderWidth: 1.5, borderColor: "#E53935", marginHorizontal: 16, marginTop: 10, padding: 14, borderRadius: 10, alignItems: "center" },
  botaoOutlineVerde: { borderWidth: 1.5, borderColor: "#4CAF50", marginHorizontal: 16, marginTop: 10, padding: 14, borderRadius: 10, alignItems: "center" },
  botaoTextoVermelho: { color: "#E53935", fontWeight: "bold" },
  botaoTextoVerde: { color: "#4CAF50", fontWeight: "bold" },
});
