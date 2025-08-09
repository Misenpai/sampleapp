import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { audioStyles } from "@/constants/style";
import { AudioRecording } from "../../types/attendance";
import { AudioPlayer } from "../audio/AudioPlayer";

interface AudioSectionProps {
  audioRecording: AudioRecording | null;
  onRecordAudio: () => void;
}

export function AudioSection({
  audioRecording,
  onRecordAudio,
}: AudioSectionProps) {
  return (
    <View style={audioStyles.section}>
      <Text style={audioStyles.sectionTitle}>Audio Recording</Text>
      {audioRecording ? (
        <View style={audioStyles.previewContainer}>
          <AudioPlayer audioRecording={audioRecording} />
        </View>
      ) : (
        <Pressable onPress={onRecordAudio} style={audioStyles.recordButton}>
          <FontAwesome6 name="microphone" size={24} color="#007AFF" />
          <Text style={audioStyles.recordButtonText}>Record Audio</Text>
        </Pressable>
      )}
    </View>
  );
}
