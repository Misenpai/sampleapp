import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { loadingStyles } from "@/constants/style";
import { colors } from "../../constants/colors";

interface LoadingScreenProps {
  text: string;
  subtext?: string;
}

export function LoadingScreen({ text, subtext }: LoadingScreenProps) {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={loadingStyles.text}>{text}</Text>
      {subtext && <Text style={loadingStyles.subtext}>{subtext}</Text>}
    </View>
  );
}
