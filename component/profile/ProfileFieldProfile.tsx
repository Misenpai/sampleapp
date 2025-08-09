import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileFieldProps {
  label: string;
  value: string;
  isReadOnly?: boolean;
  icon?: string;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({ 
  label, 
  value, 
  isReadOnly = true,
  icon
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, isReadOnly && styles.readOnlyInput]}>
        <View style={styles.inputContent}>
          {icon && (
            <FontAwesome6 
              name={icon} 
              size={16} 
              color="#64748b" 
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, isReadOnly && styles.readOnlyText]}>
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  readOnlyInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  readOnlyText: {
    color: '#6b7280',
  },
});