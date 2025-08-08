import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { GEOFENCE_LOCATIONS } from '@/constants/geofenceLocation';
import { dropdownStyles } from '@/constants/style';
import { useLocationStore } from '../../store/locationStore'; // Import Zustand store

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
  const { setLocationByLabel } = useLocationStore(); // Use Zustand store

  const dropdownOptions = [
    { id: 'all', label: 'Show All Departments', value: 'all' },
    ...GEOFENCE_LOCATIONS.map(location => ({
      id: location.id,
      label: location.label,
      value: location.label,
    }))
  ];

  const selectedOptionLabel = 
    dropdownOptions.find(option => option.value === selectedLocation)?.label || 
    'Show All Departments';

  const handleLocationSelect = (optionValue: string) => {
    setDropdownVisible(false);
    
    if (optionValue === selectedLocation) return;

    // Update profile location
    onLocationChange(optionValue);

    // Update the global location store (this will affect the map in AttendanceContainer)
    setLocationByLabel(optionValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Department</Text>
      
      <TouchableOpacity
        style={[
          dropdownStyles.selector,
          updating && styles.disabled
        ]}
        onPress={() => !updating && setDropdownVisible(true)}
        disabled={updating}
      >
        <Text style={dropdownStyles.selectorText} numberOfLines={1}>
          {selectedOptionLabel}
        </Text>
        {updating ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <FontAwesome6
            name={dropdownVisible ? "chevron-up" : "chevron-down"}
            size={14}
            color="#666"
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={dropdownStyles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={dropdownStyles.dropdownMenu}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {dropdownOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    dropdownStyles.option,
                    selectedLocation === option.value && dropdownStyles.selectedOption,
                  ]}
                  onPress={() => handleLocationSelect(option.value)}
                >
                  <Text
                    style={[
                      dropdownStyles.optionText,
                      selectedLocation === option.value && dropdownStyles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedLocation === option.value && (
                    <FontAwesome6 name="check" size={14} color="#007AFF" />
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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  updatingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  updatingText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
};