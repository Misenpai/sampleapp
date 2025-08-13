import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../../constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const buttonStyle = variant === "primary" ? styles.primary : styles.secondary;
  const textStyle =
    variant === "primary" ? styles.primaryText : styles.secondaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[buttonStyle, { opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary[500],
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 0,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: colors.secondary[500],
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
  },
  primaryText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});
