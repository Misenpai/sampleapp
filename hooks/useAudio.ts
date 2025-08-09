import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
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
  
  // Create a new audio player instance when currentRecording changes
  const audioPlayer = useAudioPlayer(currentRecording?.uri || "");
  const playerStatus = useAudioPlayerStatus(audioPlayer);

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

  // Listen to audio player status changes
  useEffect(() => {
    if (playerStatus) {
      if (playerStatus.isLoaded) {
        setIsPlaying(playerStatus.playing || false);
        
        // Handle playback completion
        if (playerStatus.didJustFinish) {
          setIsPlaying(false);
          // Reset player position to beginning for next playback
          audioPlayer.seekTo(0);
        }
      }
    }
  }, [playerStatus, audioPlayer]);

  const startRecording = async () => {
    if (!audioPermission) {
      Alert.alert("Error", "Microphone permission not granted");
      return;
    }

    try {
      // Stop any playing audio before recording
      if (audioPlayer && isPlaying) {
        audioPlayer.pause();
        setIsPlaying(false);
      }

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
    if (!recording?.uri) {
      Alert.alert("Error", "No valid recording found");
      return;
    }

    try {
      // Ensure we have the latest recording set
      if (currentRecording?.uri !== recording.uri) {
        setCurrentRecording(recording);
        // Wait a bit for the audio player to initialize with new URI
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (audioPlayer) {
        // If already playing, pause
        if (isPlaying) {
          audioPlayer.pause();
          setIsPlaying(false);
        } else {
          // Before playing, check if we're at the end and reset if needed
          if (playerStatus?.isLoaded && playerStatus.currentTime >= (playerStatus.duration || 0)) {
            audioPlayer.seekTo(0);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Start playback
          await audioPlayer.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to play audio");
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    }
  };

  const stopAudio = async () => {
    try {
      if (audioPlayer && isPlaying) {
        audioPlayer.pause();
        // Reset to beginning
        audioPlayer.seekTo(0);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Stop audio error:", error);
      setIsPlaying(false);
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
            onPress: async () => {
              // Stop playback if active
              if (isPlaying) {
                await stopAudio();
              }
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
    stopAudio, // Add this missing method
    deleteRecording,
    setCurrentRecording,
  };
}