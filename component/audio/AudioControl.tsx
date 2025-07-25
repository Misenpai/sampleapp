import { audioStyles } from "@/constants/style";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, View } from "react-native";

interface AudioControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
}

export function AudioControls({
  isPlaying,
  onPlay,
  onDelete,
}: AudioControlsProps) {
  return (
    <View style={audioStyles.controls}>
      <Pressable onPress={onPlay} style={audioStyles.playButton}>
        <FontAwesome6
          name={isPlaying ? "pause" : "play"}
          size={16}
          color="white"
        />
      </Pressable>
      <Pressable onPress={onDelete} style={audioStyles.deleteButton}>
        <FontAwesome6 name="trash" size={16} color="white" />
      </Pressable>
    </View>
  );
}
