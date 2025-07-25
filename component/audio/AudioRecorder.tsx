import React from 'react';
import { View, Text, Pressable } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { AudioRecording } from '../../types/attendance';
import { audioRecorderStyles } from '@/constants/style';


interface AudioRecorderProps {
  audio: any; // Use the audio hook type
  onBack: () => void;
  onRecordingComplete: (recording: AudioRecording) => void;
}

export function AudioRecorder({ audio, onBack, onRecordingComplete }: AudioRecorderProps) {
  const handleStopRecording = async () => {
    const recording = await audio.stopRecording();
    if (recording) {
      onRecordingComplete(recording);
    }
  };

  return (
    <View style={audioRecorderStyles.container}>
      <View style={audioRecorderStyles.header}>
        <Pressable onPress={onBack} style={{ padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <FontAwesome6 name="arrow-left" size={24} color="white" />
        </Pressable>
        <Text style={audioRecorderStyles.title}>Record Audio</Text>
      </View>

      <View style={audioRecorderStyles.content}>
        <View style={audioRecorderStyles.recordingIndicator}>
          {audio.recorderState.isRecording && <View style={audioRecorderStyles.recordingDot} />}
          <Text style={audioRecorderStyles.recordingText}>
            {audio.recorderState.isRecording ? "Recording..." : "Tap to record"}
          </Text>
        </View>

        <Pressable
          onPress={audio.recorderState.isRecording ? handleStopRecording : audio.startRecording}
          style={[
            audioRecorderStyles.recordButton,
            {
              backgroundColor: audio.recorderState.isRecording ? "#FF6B6B" : "#007AFF",
            },
          ]}
        >
          <FontAwesome6
            name={audio.recorderState.isRecording ? "stop" : "microphone"}
            size={32}
            color="white"
          />
        </Pressable>
      </View>
    </View>
  );
}