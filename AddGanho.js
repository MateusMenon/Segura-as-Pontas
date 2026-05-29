import React, { useCallback, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  addTransaction,
  getSettings,
  updateTransaction,
} from "./database/financeRepository";

export default function AddGanho({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const transaction = route?.params?.transaction;
  const isEditing = Boolean(transaction?.id);
  const [valor, setValor] = useState(
    transaction?.amount ? String(transaction.amount) : ""
  );
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState(
    transaction?.category || "Renda extra"
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const carregarCategorias = async () => {
        const settings = await getSettings();
        const nextCategories = settings.incomeCategories || ["Renda extra"];

        if (isActive) {
          setCategorias(nextCategories);
          setCategoria(
            transaction?.category || nextCategories[0] || "Renda extra"
          );
        }
      };

      carregarCategorias();

      return () => {
        isActive = false;
      };
    }, [transaction?.category])
  );

  const salvarGanho = async () => {
    if (!valor) {
      Alert.alert("Erro", "Digite um valor");
      return;
    }

    try {
      const payload = {
        type: "income",
        amount: valor,
        category: categoria,
        description: "Renda extra",
        id: transaction?.id,
        date: transaction?.date,
      };

      if (isEditing) {
        await updateTransaction(payload);
      } else {
        await addTransaction(payload);
      }

      Alert.alert(
        "Sucesso",
        isEditing ? "Renda atualizada" : `Renda de R$ ${valor} salva`
      );

      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEditing ? "Editar renda" : "Nova renda"}
        </Text>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 96, 112) },
        ]}
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
            {categorias.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoriaBotao,
                  categoria === item && styles.categoriaSelecionada,
                ]}
                onPress={() => setCategoria(item)}
              >
                <Text
                  style={[
                    styles.categoriaTexto,
                    categoria === item && styles.categoriaTextoSelecionado,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.botao} onPress={salvarGanho}>
          <Text style={styles.botaoTexto}>
            {isEditing ? "Atualizar renda" : "Salvar renda"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4CAF50",
  },
  body: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  categorias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoriaBotao: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoriaSelecionada: {
    backgroundColor: "#4CAF50",
  },
  categoriaTexto: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  categoriaTextoSelecionado: {
    color: "#fff",
  },
  botao: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});
