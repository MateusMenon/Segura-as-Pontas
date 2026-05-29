import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./HomeScreen";
import ConfigScreen from "./ConfigScreen";
import AddGasto from "./AddGasto";
import AddGanho from "./AddGanho";
import Resumo from "./Resumo";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4CAF50"
        translucent={false}
      />

      <NavigationContainer>

        <Stack.Navigator screenOptions={{ headerShown: false }}>

          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />

          <Stack.Screen
            name="Config"
            component={ConfigScreen}
          />

          <Stack.Screen
            name="AddGasto"
            component={AddGasto}
          />

          <Stack.Screen
            name="AddGanho"
            component={AddGanho}
          />

          <Stack.Screen
            name="Resumo"
            component={Resumo}
          />

        </Stack.Navigator>

      </NavigationContainer>

    </SafeAreaProvider>
  );
}
