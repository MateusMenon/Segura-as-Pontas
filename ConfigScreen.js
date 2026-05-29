import React, { useState } from "react";
import {
  Alert, ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ConfigScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [dinheiroInicial, setDinheiroInicial] = useState("1500");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [salvarHistorico, setSalvarHistorico] = useState(true);
  const [categorias, setCategorias] = useState(["Mercado", "Transporte", "Moradia", "Lazer", "Saude"]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [categoriasRenda, setCategoriasRenda] = useState(["Renda extra", "Freelance", "Bonus", "Venda"]);
  const [novaCategoriaRenda, setNovaCategoriaRenda] = useState("");

  const adicionarCategoria = () => {
    const nome = novaCategoria.trim();
    if (!nome || categorias.includes(nome)) return;
    setCategorias((a) => [...a, nome]);
    setNovaCategoria("");
  };

  const adicionarCategoriaRenda = () => {
    const nome = novaCategoriaRenda.trim();
    if (!nome || categoriasRenda.includes(nome)) return;
    setCategoriasRenda((a) => [...a, nome]);
    setNovaCategoriaRenda("");
  };

  const removerCategoria = (nome) => setCategorias((a) => a.filter((i) => i !== nome));
  const removerCategoriaRenda = (nome) => setCategoriasRenda((a) => a.filter((i) => i !== nome));

  const salvar = () => Alert.alert("Sucesso", "Configurações salvas com sucesso");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 96, 112) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Salário do mês</Text>
          <TextInput style={styles.input} placeholder="R$ 0,00" keyboardType="numeric" value={dinheiroInicial} onChangeText={setDinheiroInicial} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Prazo inicial</Text>
          <TextInput style={styles.input} placeholder="01/05/2026" value={dataInicial} onChangeText={setDataInicial} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Prazo final</Text>
          <TextInput style={styles.input} placeholder="31/05/2026" value={dataFinal} onChangeText={setDataFinal} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tipos de gasto</Text>
          <View style={styles.novaCategoriaLinha}>
            <TextInput style={[styles.input, styles.inputCategoria]} placeholder="Ex: Farmácia" value={novaCategoria} onChangeText={setNovaCategoria} />
            <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarCategoria}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.categorias}>
            {categorias.map((item) => (
              <TouchableOpacity key={item} style={styles.categoriaBotao} onPress={() => removerCategoria(item)}>
                <Text style={styles.categoriaTexto}>{item}</Text>
                <Ionicons name="close" size={16} color="#4CAF50" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tipos de renda extra</Text>
          <View style={styles.novaCategoriaLinha}>
            <TextInput style={[styles.input, styles.inputCategoria]} placeholder="Ex: Freelance" value={novaCategoriaRenda} onChangeText={setNovaCategoriaRenda} />
            <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarCategoriaRenda}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.categorias}>
            {categoriasRenda.map((item) => (
              <TouchableOpacity key={item} style={styles.categoriaBotao} onPress={() => removerCategoriaRenda(item)}>
                <Text style={styles.categoriaTexto}>{item}</Text>
                <Ionicons name="close" size={16} color="#4CAF50" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.cardLinha}>
          <View>
            <Text style={styles.labelMaior}>Salvar histórico</Text>
            <Text style={styles.subtexto}>Guardar gastos antigos</Text>
          </View>
          <Switch value={salvarHistorico} onValueChange={setSalvarHistorico} />
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvar}>
          <Text style={styles.botaoTexto}>Salvar configurações</Text>
        </TouchableOpacity>
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
  cardLinha: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 2, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 14, color: "#777", marginBottom: 10 },
  labelMaior: { fontSize: 16, fontWeight: "bold", color: "#333" },
  subtexto: { color: "#777", marginTop: 2 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: "#fff" },
  novaCategoriaLinha: { flexDirection: "row", gap: 10, marginBottom: 12 },
  inputCategoria: { flex: 1 },
  botaoAdicionar: { width: 48, borderRadius: 10, backgroundColor: "#4CAF50", alignItems: "center", justifyContent: "center" },
  categorias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoriaBotao: { borderWidth: 1, borderColor: "#4CAF50", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  categoriaTexto: { color: "#4CAF50", fontWeight: "bold" },
  botaoSalvar: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 12 },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
