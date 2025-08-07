import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileFieldProps {
  label: string;
  value: string;
  isReadOnly?: boolean;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({ 
  label, 
  value, 
  isReadOnly = true 
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, isReadOnly && styles.readOnlyInput]}>
        <Text style={[styles.text, isReadOnly && styles.readOnlyText]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 15,
  },
  readOnlyInput: {
    backgroundColor: '#f1f3f5',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  readOnlyText: {
    color: '#495057',
  },
});