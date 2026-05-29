import React, { useState } from "react";
import {
  Alert, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIAS = ["Renda extra", "Freelance", "Bonus", "Venda"];

export default function AddGanho({ navigation }) {
  const insets = useSafeAreaInsets();
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Renda extra");

  const salvarGanho = () => {
    if (!valor) {
      Alert.alert("Erro", "Digite um valor");
      return;
    }
    Alert.alert("Sucesso", `Renda de R$ ${valor} salva`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova renda</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 96, 112) }]}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Valor da renda</Text>
          <TextInput
            style={styles.input}
            placeholder="R$ 0,00"
            keyboardType="numeric"
            value={valor}
            onChangeText={setValor}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tipo de renda</Text>
          <View style={styles.categorias}>
            {CATEGORIAS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.categoriaBotao, categoria === item && styles.categoriaSelecionada]}
                onPress={() => setCategoria(item)}
              >
                <Text style={[styles.categoriaTexto, categoria === item && styles.categoriaTextoSelecionado]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.botao} onPress={salvarGanho}>
          <Text style={styles.botaoTexto}>Salvar renda</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  content: { padding: 16, marginTop: 10 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2, marginBottom: 20 },
  label: { fontSize: 14, color: "#777", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 16 },
  categorias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoriaBotao: { borderWidth: 1, borderColor: "#4CAF50", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  categoriaSelecionada: { backgroundColor: "#4CAF50" },
  categoriaTexto: { color: "#4CAF50", fontWeight: "bold" },
  categoriaTextoSelecionado: { color: "#fff" },
  botao: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, alignItems: "center" },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
});
