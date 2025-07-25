import { audioStyles } from "@/constants/style";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useAudio } from "../../hooks/useAudio";
import { AudioRecording } from "../../types/attendance";

interface AudioPlayerProps {
  audioRecording: AudioRecording;
}

export function AudioPlayer({ audioRecording }: AudioPlayerProps) {
  const audio = useAudio();

  const handlePlay = () => {
    audio.playAudio(audioRecording);
  };

  const handleDelete = async () => {
    await audio.deleteRecording();
  };

  return (
    <View style={audioStyles.preview}>
      <FontAwesome6 name="volume-high" size={24} color="#007AFF" />
      <Text style={audioStyles.previewText}>Audio recorded</Text>
      <View style={audioStyles.controls}>
        <Pressable onPress={handlePlay} style={audioStyles.playButton}>
          <FontAwesome6
            name={audio.isPlaying ? "pause" : "play"}
            size={16}
            color="white"
          />
        </Pressable>
        <Pressable onPress={handleDelete} style={audioStyles.deleteButton}>
          <FontAwesome6 name="trash" size={16} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
