import { GEOFENCE_LOCATIONS } from '@/constants/geofenceLocation';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocationStore } from '../../store/locationStore';

const { height: screenHeight } = Dimensions.get('window');

interface LocationDropdownProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  updating: boolean;
}

export const LocationDropdown: React.FC<LocationDropdownProps> = ({
  selectedLocation,
  onLocationChange,
  updating,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { setLocationByLabel } = useLocationStore();

  const dropdownOptions = GEOFENCE_LOCATIONS.map(location => ({
    id: location.id,
    label: location.label,
    value: location.label,
  }));

  const selectedOptionLabel = 
    dropdownOptions.find(option => option.value === selectedLocation)?.label || 
    'Select Department';

  const handleLocationSelect = (optionValue: string) => {
    setDropdownVisible(false);
    
    if (optionValue === selectedLocation) return;

    onLocationChange(optionValue);
    setLocationByLabel(optionValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Department</Text>
      
      <TouchableOpacity
        style={[
          styles.selector,
          updating && styles.disabled
        ]}
        onPress={() => !updating && setDropdownVisible(true)}
        disabled={updating}
      >
        <View style={styles.selectorContent}>
          <FontAwesome6 
            name="building" 
            size={16} 
            color="#64748b" 
            style={styles.icon}
          />
          <Text style={styles.selectorText} numberOfLines={1}>
            {selectedOptionLabel}
          </Text>
        </View>
        {updating ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <FontAwesome6
            name={dropdownVisible ? "chevron-up" : "chevron-down"}
            size={14}
            color="#64748b"
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Department</Text>
              <TouchableOpacity
                onPress={() => setDropdownVisible(false)}
                style={styles.closeButton}
              >
                <FontAwesome6 name="xmark" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.optionsContainer}
            >
              {dropdownOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    selectedLocation === option.value && styles.selectedOption,
                  ]}
                  onPress={() => handleLocationSelect(option.value)}
                >
                  <View style={styles.optionContent}>
                    <FontAwesome6 
                      name="building" 
                      size={14} 
                      color={selectedLocation === option.value ? "#007AFF" : "#64748b"} 
                    />
                    <Text
                      style={[
                        styles.optionText,
                        selectedLocation === option.value && styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {selectedLocation === option.value && (
                    <FontAwesome6 name="check" size={16} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {updating && (
        <View style={styles.updatingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.updatingText}>Updating location...</Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  selector: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  selectorContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  selectorText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.7, // Fixed: Use calculated number instead of string
  },
  dropdownHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    padding: 8,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 12,
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600' as const,
  },
  updatingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  updatingText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500' as const,
  },
};