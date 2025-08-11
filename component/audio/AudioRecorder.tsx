import { colors } from '@/constants/colors';
import { audioRecorderStyles } from '@/constants/style';
import { useAudio } from '@/hooks/useAudio';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  ReduceMotion,
  SlideInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { AudioRecording } from '../../types/attendance';

interface AudioRecorderProps {
  onBack: () => void;
  onRecordingComplete: (recording: AudioRecording) => void;
}

export function AudioRecorder({ onBack, onRecordingComplete }: AudioRecorderProps) {
  const audio = useAudio();
  const [waveformData, setWaveformData] = useState<number[]>([0]);
  const [hasRecording, setHasRecording] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  
  const waveformRef = useRef({ 
    data: [0], 
    isRecording: false, 
    originalData: [0], // Store original waveform for playback
    playbackStartTime: 0
  });
  const width = useSharedValue(10);
  const intervalRef = useRef<number | null>(null);
  const playbackIntervalRef = useRef<number | null>(null);

  const getFormattedDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'long' });
    
    const getDayWithSuffix = (day: number) => {
      if (day >= 11 && day <= 13) {
        return `${day}th`;
      }
      switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
      }
    };

    return `${getDayWithSuffix(day)} ${month}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const customEasing = (value: number) => {
    'worklet';
    return value;
  };

  const waveformStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(width.value, {
        duration: 100,
        easing: customEasing,
        reduceMotion: ReduceMotion.Never
      }),
    };
  });

  const startWaveformRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Simulate real-time waveform during recording
    intervalRef.current = setInterval(() => {
      if (waveformRef.current.isRecording) {
        // Simulate more realistic audio levels
        const baseLevel = 20;
        const randomVariation = Math.random() * 40;
        const randomValue = baseLevel + randomVariation;
        
        const newData = [...waveformRef.current.data, randomValue];
        waveformRef.current.data = newData;
        setWaveformData(newData);
        width.value = width.value + 12;
      }
    }, 100);
  }, [width]);

  const stopWaveformRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startWaveformPlayback = useCallback(() => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }

    // Reset waveform to show playback progress
    const originalData = waveformRef.current.originalData;
    const totalDuration = originalData.length * 100; // Assuming 100ms per sample
    waveformRef.current.playbackStartTime = Date.now();
    
    setPlaybackDuration(totalDuration / 1000); // Convert to seconds
    setWaveformData([0]);
    width.value = 10;

    // Animate waveform during playback to show progress
    playbackIntervalRef.current = setInterval(() => {
      if (audio.isPlaying) {
        const elapsed = Date.now() - waveformRef.current.playbackStartTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        const samplesToShow = Math.floor(progress * originalData.length);
        
        if (samplesToShow > 0) {
          const currentData = originalData.slice(0, samplesToShow);
          setWaveformData(currentData);
          width.value = 10 + (samplesToShow * 12);
        }
        
        setPlaybackProgress(progress);
        
        // Auto-stop when playback completes
        if (progress >= 1) {
          stopWaveformPlayback();
          setPlaybackProgress(0);
          // Reset to full waveform
          setTimeout(() => {
            setWaveformData(originalData);
            width.value = 10 + (originalData.length * 12);
          }, 200);
        }
      }
    }, 50); // More frequent updates for smoother playback visualization
  }, [audio.isPlaying, width]);

  const stopWaveformPlayback = useCallback(() => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  }, []);

  // Effect to handle recording state changes
  useEffect(() => {
    if (audio.recorderState.isRecording && !waveformRef.current.isRecording) {
      // Recording started
      waveformRef.current.isRecording = true;
      startWaveformRecording();
    } else if (!audio.recorderState.isRecording && waveformRef.current.isRecording) {
      // Recording stopped
      waveformRef.current.isRecording = false;
      stopWaveformRecording();
      if (audio.currentRecording) {
        setHasRecording(true);
        // Store the original waveform data for playback
        waveformRef.current.originalData = [...waveformRef.current.data];
      }
    }
  }, [audio.recorderState.isRecording, audio.currentRecording, startWaveformRecording, stopWaveformRecording]);

  // Effect to handle playback state changes
  useEffect(() => {
    if (audio.isPlaying && hasRecording) {
      startWaveformPlayback();
    } else {
      stopWaveformPlayback();
    }
  }, [audio.isPlaying, hasRecording, startWaveformPlayback, stopWaveformPlayback]);

  // Effect to track recording duration
  useEffect(() => {
    let durationInterval: number | null = null;
    
    if (audio.recorderState.isRecording) {
      const startTime = Date.now();
      durationInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setRecordingDuration(elapsed);
      }, 100);
    } else {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    }

    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, [audio.recorderState.isRecording]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      // Reset all states
      setWaveformData([0]);
      waveformRef.current.data = [0];
      waveformRef.current.originalData = [0];
      width.value = 10;
      setHasRecording(false);
      setRecordingDuration(0);
      setPlaybackProgress(0);

      await audio.startRecording();
    } catch (error) {
      console.log('Recording start error:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const recording = await audio.stopRecording();
      if (recording) {
        // Add duration to the recording
        const recordingWithDuration: AudioRecording = {
          ...recording,
          duration: Math.floor(recordingDuration) // Use the tracked duration
        };
        audio.setCurrentRecording(recordingWithDuration);
        // The recording state will be handled by the useEffect above
        return recordingWithDuration;
      }
    } catch (error) {
      console.log('Recording stop error:', error);
    }
    return null;
  };

  const handlePlayRecording = async () => {
    try {
      if (audio.currentRecording) {
        if (audio.isPlaying) {
          // Stop playback
          await audio.stopAudio();
        } else {
          // Start playback
          await audio.playAudio(audio.currentRecording);
        }
      }
    } catch (error) {
      console.log('Playback error:', error);
    }
  };

  const handleRetake = () => {
    setHasRecording(false);
    setWaveformData([0]);
    waveformRef.current.data = [0];
    waveformRef.current.originalData = [0];
    width.value = 10;
    setRecordingDuration(0);
    setPlaybackProgress(0);
    audio.setCurrentRecording(null);
    stopWaveformRecording();
    stopWaveformPlayback();
  };

  const handleComplete = () => {
    if (audio.currentRecording) {
      // Pass recording with duration
      const recordingWithDuration: AudioRecording = {
        ...audio.currentRecording,
        duration: Math.floor(recordingDuration)
      };
      onRecordingComplete(recordingWithDuration);
    }
  };

  return (
    <View style={audioRecorderStyles.container}>
      {/* Header */}
      <View style={audioRecorderStyles.header}>
        <Pressable 
          onPress={onBack} 
          style={{ 
            padding: 8, 
            borderRadius: 20, 
            backgroundColor: 'rgba(0,0,0,0.5)' 
          }}
        >
          <FontAwesome6 name="arrow-left" size={24} color="white" />
        </Pressable>
        <Text style={audioRecorderStyles.title}>Record Audio</Text>
      </View>

      {/* Date Prompt */}
      <View style={[audioRecorderStyles.datePrompt, { 
        paddingHorizontal: 20, 
        paddingVertical: 15,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 10,
        marginBottom: 20 
      }]}>
        <Text style={[audioRecorderStyles.dateText, {
          fontSize: 18,
          fontWeight: '600',
          textAlign: 'center',
          color: colors.white
        }]}>
          Read the Text &quot;Today is {getFormattedDate()}&quot;
        </Text>
      </View>

      <View style={audioRecorderStyles.content}>
        {/* Waveform Visualization */}
        <View style={{
          height: 120,
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: 15,
          marginVertical: 20,
          display: 'flex',
          flexDirection: 'row-reverse',
          alignItems: 'center',
          overflow: 'hidden',
          paddingHorizontal: 10
        }}>
          <Animated.View 
            entering={SlideInRight} 
            style={[{
              display: 'flex',
              flexDirection: 'row',
              overflow: 'hidden',
              gap: 3,
              alignItems: 'center',
              minWidth: 50
            }, waveformStyle]}
          >
            {waveformData.map((amplitude, index) => (
              <Animated.View
                key={index}
                entering={ZoomIn}
                style={{
                  height: Math.max(amplitude, 4),
                  width: 3,
                  borderRadius: 2,
                  backgroundColor: audio.recorderState.isRecording 
                    ? '#FF6B6B' 
                    : audio.isPlaying
                      ? '#FF9500' // Orange during playback
                      : hasRecording 
                        ? '#007AFF' 
                        : '#ccc',
                  opacity: audio.isPlaying ? 
                    (index / waveformData.length <= playbackProgress ? 1 : 0.3) : 1
                }}
              />
            ))}
          </Animated.View>
        </View>

        {/* Duration Display */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          marginBottom: 10
        }}>
          <Text style={{ color: colors.white, fontSize: 14 }}>
            {audio.isPlaying ? formatTime(playbackProgress * playbackDuration) : '0:00'}
          </Text>
          <Text style={{ color: colors.white, fontSize: 14 }}>
            {hasRecording ? formatTime(recordingDuration) : formatTime(recordingDuration)}
          </Text>
        </View>

        {/* Status Indicator */}
        <View style={audioRecorderStyles.recordingIndicator}>
          {audio.recorderState.isRecording && (
            <Animated.View 
              style={[audioRecorderStyles.recordingDot, {
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#FF6B6B',
                marginRight: 8
              }]} 
            />
          )}
          {audio.isPlaying && (
            <Animated.View 
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#FF9500',
                marginRight: 8
              }} 
            />
          )}
          <Text style={audioRecorderStyles.recordingText}>
            {audio.recorderState.isRecording 
              ? `Recording... ${formatTime(recordingDuration)}`
              : audio.isPlaying
                ? `Playing... ${formatTime(playbackProgress * playbackDuration)}`
                : hasRecording 
                  ? "Recording complete" 
                  : "Tap to record"
            }
          </Text>
        </View>

        {/* Recording Controls */}
        {!hasRecording ? (
          <Pressable
            onPress={
              audio.recorderState.isRecording
                ? handleStopRecording
                : handleStartRecording
            }
            style={[
              audioRecorderStyles.recordButton,
              {
                position: "absolute",
                bottom: 60,
                alignSelf: "center",
                backgroundColor: audio.recorderState.isRecording
                  ? "#FF6B6B"
                  : "#007AFF",
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <FontAwesome6
              name={audio.recorderState.isRecording ? "stop" : "microphone"}
              size={32}
              color="white"
            />
          </Pressable>
        ) : (
          /* Playback and Action Controls */
          <View
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              paddingHorizontal: 40,
            }}
          >
            {/* Play/Pause Button */}
            <Pressable
              onPress={handlePlayRecording}
              style={{
                backgroundColor: audio.isPlaying ? "#FF9500" : "#34C759",
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <FontAwesome6
                name={audio.isPlaying ? "pause" : "play"}
                size={24}
                color="white"
              />
            </Pressable>

            {/* Retake Button */}
            <Pressable
              onPress={handleRetake}
              style={{
                backgroundColor: "#FF6B6B",
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <FontAwesome6
                name="arrow-rotate-left"
                size={24}
                color="white"
              />
            </Pressable>

            {/* Complete Button */}
            <Pressable
              onPress={handleComplete}
              style={{
                backgroundColor: "#007AFF",
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <FontAwesome6
                name="check"
                size={24}
                color="white"
              />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}