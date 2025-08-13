import { loadingStyles } from "@/constants/style";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { colors } from "../../constants/colors";

interface LoadingScreenProps {
  text: string;
  subtext?: string;
}

export function LoadingScreen({ text, subtext }: LoadingScreenProps) {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color={colors.primary[500]} />
      <Text style={loadingStyles.text}>{text}</Text>
      {subtext && <Text style={loadingStyles.subtext}>{subtext}</Text>}
    </View>
  );
}
