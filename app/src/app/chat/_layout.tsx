import { Stack } from "expo-router";
import { colors } from "../../constants/theme";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "600",
        },
        headerTintColor: colors.primary,
      }}
    />
  );
}
