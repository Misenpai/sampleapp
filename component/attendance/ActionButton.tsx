import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { CameraCapturedPicture } from 'expo-camera';
import { actionButtonStyles } from '@/constants/style';


interface ActionButtonsProps {
  photos: CameraCapturedPicture[];
  onTakePhotos: () => void;
  onRetakeAll: () => void;
  onUpload: () => void;
  uploading: boolean;
  totalPhotos: number;
}

export function ActionButtons({
  photos,
  onTakePhotos,
  onRetakeAll,
  onUpload,
  uploading,
  totalPhotos,
}: ActionButtonsProps) {
  return (
    <View style={actionButtonStyles.container}>
      {photos.length === 0 ? (
        <Pressable onPress={onTakePhotos} style={actionButtonStyles.primaryButton}>
          <Text style={actionButtonStyles.primaryButtonText}>Take Photos</Text>
        </Pressable>
      ) : (
        <View style={actionButtonStyles.row}>
          <Pressable
            onPress={onUpload}
            style={[
              actionButtonStyles.primaryButton,
              { opacity: photos.length < totalPhotos ? 0.5 : 1 },
            ]}
            disabled={photos.length < totalPhotos || uploading}
          >
            <Text style={actionButtonStyles.primaryButtonText}>Save</Text>
          </Pressable>
          <Pressable
            onPress={onRetakeAll}
            style={actionButtonStyles.secondaryButton}
          >
            <Text style={actionButtonStyles.secondaryButtonText}>Retake All</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}