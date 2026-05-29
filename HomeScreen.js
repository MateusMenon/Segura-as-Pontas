import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  AppState,
  Alert,
  View,
  Text,
 Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getSummary } from "./database/financeRepository";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function HomeScreen({ navigation }) {

  const avisoLimiteRef = useRef("");
  const [saldo, setSaldo] = useState(0);
  const [limite, setLimite] = useState(0);
  const [gastoHoje, setGastoHoje] = useState(0);

  const carregarResumo = useCallback(async () => {
    const resumo = await getSummary();

    setSaldo(resumo.balance);
    setLimite(resumo.dailyLimit);
    setGastoHoje(resumo.spentToday);

    const todayKey = getTodayKey();

    if (resumo.dailyLimit > 0 && resumo.spentToday > resumo.dailyLimit) {
      if (avisoLimiteRef.current !== todayKey) {
        avisoLimiteRef.current = todayKey;
        Alert.alert(
          "Limite diário ultrapassado",
          `Você já gastou R$ ${formatMoney(resumo.spentToday)} hoje. Seu limite diário é R$ ${formatMoney(resumo.dailyLimit)}.`
        );
      }
    } else if (avisoLimiteRef.current === todayKey) {
      avisoLimiteRef.current = "";
    }
  }, []);

  useEffect(() => {
    carregarResumo();

    const intervalId = setInterval(carregarResumo, 60000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        carregarResumo();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [carregarResumo]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const carregarResumoAoFocar = async () => {
        if (isActive) {
          await carregarResumo();
        }
      };

      carregarResumoAoFocar();

      return () => {
        isActive = false;
      };
    }, [carregarResumo])
  );

  // 🔥 LÓGICA DO STATUS
  const porcentagem = gastoHoje / limite;

  let statusIcon = "checkmark-circle";
  let statusColor = "#4CAF50";

  if (porcentagem > 1) {
    statusIcon = "close-circle";
    statusColor = "#E53935";
  } else if (porcentagem >= 0.7) {
    statusIcon = "warning";
    statusColor = "#FBC02D";
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      {/* HEADER */}
      <View style={styles.header}>

        <Image
          source={require("./assets/Logo04.png")}
          style={styles.logo}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("Config")}
        >

          <Ionicons
            name="options-outline"
            size={22}
            color="#fff"
          />

        </TouchableOpacity>

      </View>

      <View style={styles.body}>

      {/* CARD SALDO */}
      <View style={styles.card}>

        <View style={styles.row}>

          <Ionicons
            name="wallet-outline"
            size={22}
            color="#4CAF50"
          />

          <Text style={styles.label}>
            Saldo restante
          </Text>

        </View>

        <Text style={styles.valor}>
          R$ {formatMoney(saldo)}
        </Text>

      </View>

      {/* CARD LIMITE */}
      <View style={styles.card}>

        <View style={styles.row}>

          <Ionicons
            name="calendar-outline"
            size={22}
            color="#4CAF50"
          />

          <Text style={styles.label}>
            Limite de hoje
          </Text>

        </View>

        <Text style={styles.valor}>
          R$ {formatMoney(limite)}
        </Text>

      </View>

      {/* CARD GASTO */}
      <View style={styles.card}>

        <View style={styles.row}>

          <Ionicons
            name="cart-outline"
            size={22}
            color="#4CAF50"
          />

          <Text style={styles.label}>
            Já gasto hoje
          </Text>

        </View>

        <View style={styles.valorComIcone}>

          <Text style={styles.valor}>
            R$ {formatMoney(gastoHoje)}
          </Text>

          <Ionicons
            name={statusIcon}
            size={42}
            color={statusColor}
          />

        </View>

      </View>

      {/* BOTÃO GASTO */}
      <TouchableOpacity
        style={styles.botaoOutlineVermelho}
        onPress={() => navigation.navigate("AddGasto")}
      >

        <Text style={styles.botaoTextoVermelho}>
          + Adicionar Gasto
        </Text>

      </TouchableOpacity>

      {/* BOTÃO GANHO */}
      <TouchableOpacity
        style={styles.botaoOutlineVerde}
        onPress={() => navigation.navigate("AddGanho")}
      >

        <Text style={styles.botaoTextoVerde}>
          + Adicionar renda extra
        </Text>

      </TouchableOpacity>

      {/* BOTÃO RESUMO */}
      <TouchableOpacity
        style={styles.botaoOutline}
        onPress={() => navigation.navigate("Resumo")}
      >

        <Text style={styles.botaoTexto}>
          Ver resumo
        </Text>

      </TouchableOpacity>

      </View>

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

  /* HEADER */
  header: {
    backgroundColor: "#4CAF50",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },

  /* LOGO */
  logo: {
    width: 360,
    height: 40,
    resizeMode: "contain",
  },

  /* CARD */
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 15,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  valorComIcone: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  label: {
    fontSize: 14,
    color: "#777",
  },

  valor: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },

  // 🔴 BOTÃO GASTO
  botaoOutlineVermelho: {
    borderWidth: 1.5,
    borderColor: "#E53935",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  // 🟢 BOTÃO GANHO
  botaoOutlineVerde: {
    borderWidth: 1.5,
    borderColor: "#4CAF50",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  // ⚪ BOTÃO RESUMO
  botaoOutline: {
    borderWidth: 1.5,
    borderColor: "#333",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  botaoTextoVerde: {
    color: "#4CAF50",
    fontWeight: "bold",
  },

  botaoTextoVermelho: {
    color: "#E53935",
    fontWeight: "bold",
  },

  botaoTexto: {
    color: "#333",
    fontWeight: "bold",
  },

});
