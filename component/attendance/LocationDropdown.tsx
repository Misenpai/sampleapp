import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { GEOFENCE_LOCATIONS } from "@/constants/geofenceLocation";
import { dropdownStyles } from "@/constants/style";

interface LocationDropdownProps {
  selectedGeofenceId: string | null;
  onSelectionChange: (geofenceId: string | null, label: string | null) => void;
}

export function LocationDropdown({ 
  selectedGeofenceId, 
  onSelectionChange 
}: LocationDropdownProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dropdownOptions = useMemo(() => {
    const opts = [{ id: "all", label: "Show All Departments" }];
    GEOFENCE_LOCATIONS.forEach((g) => opts.push({ id: g.id, label: g.label }));
    return opts;
  }, []);

  const selectedOptionLabel = useMemo(() => {
    if (!selectedGeofenceId) return "Show All Departments";
    return (
      dropdownOptions.find((o) => o.id === selectedGeofenceId)?.label ?? ""
    );
  }, [selectedGeofenceId, dropdownOptions]);

  const handleDropdownSelect = (optionId: string) => {
    if (optionId === "all") {
      onSelectionChange(null, null);
    } else {
      const option = dropdownOptions.find((o) => o.id === optionId)!;
      onSelectionChange(option.id, option.label);
    }
    setDropdownVisible(false);
  };

  return (
    <View style={dropdownStyles.container}>
      <TouchableOpacity
        style={dropdownStyles.selector}
        onPress={() => setDropdownVisible(true)}
      >
        <Text style={dropdownStyles.selectorText} numberOfLines={1}>
          {selectedOptionLabel}
        </Text>
        <FontAwesome6
          name={dropdownVisible ? "chevron-up" : "chevron-down"}
          size={14}
          color="#666"
        />
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
              {dropdownOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    dropdownStyles.option,
                    selectedGeofenceId === opt.id &&
                      dropdownStyles.selectedOption,
                  ]}
                  onPress={() => handleDropdownSelect(opt.id)}
                >
                  <Text
                    style={[
                      dropdownStyles.optionText,
                      selectedGeofenceId === opt.id &&
                        dropdownStyles.selectedOptionText,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {selectedGeofenceId === opt.id && (
                    <FontAwesome6 name="check" size={14} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}