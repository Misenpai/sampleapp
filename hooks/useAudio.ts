import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { AudioRecording } from "../types/attendance";

export function useAudio() {
  const [audioPermission, setAudioPermission] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecording, setCurrentRecording] =
    useState<AudioRecording | null>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const audioPlayer = useAudioPlayer(currentRecording?.uri || "");

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      } else {
        setAudioPermission(status.granted);
      }
      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const startRecording = async () => {
    if (!audioPermission) {
      Alert.alert("Error", "Microphone permission not granted");
      return;
    }

    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      Alert.alert("Error", "Failed to start recording");
      console.error("Recording error:", error);
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        const recording = { uri };
        setCurrentRecording(recording);
        return recording;
      }
    } catch (error) {
      Alert.alert("Error", "Failed to stop recording");
      console.error("Recording error:", error);
    }
    return null;
  };

  const playAudio = async (recording: AudioRecording) => {
    if (recording && audioPlayer) {
      try {
        if (isPlaying) {
          audioPlayer.pause();
          setIsPlaying(false);
        } else {
          audioPlayer.play();
          setIsPlaying(true);

          audioPlayer.addListener("playbackStatusUpdate", (status) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        }
      } catch (error) {
        Alert.alert("Error", "Failed to play audio");
        console.error("Audio playback error:", error);
      }
    }
  };

  const deleteRecording = () => {
    return new Promise<void>((resolve) => {
      Alert.alert(
        "Delete Recording",
        "Are you sure you want to delete this audio recording?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setCurrentRecording(null);
              setIsPlaying(false);
              resolve();
            },
          },
        ]
      );
    });
  };

  return {
    audioPermission,
    recorderState,
    isPlaying,
    currentRecording,
    startRecording,
    stopRecording,
    playAudio,
    deleteRecording,
    setCurrentRecording,
  };
}
