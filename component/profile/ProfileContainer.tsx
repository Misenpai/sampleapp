import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useProfile } from '../../hooks/useProfile';
import { LocationDropdown } from './LocationDropdown';
import { LogoutButton } from './LogoutButton';
import { ProfileField } from './ProfileFieldProfile';

export const ProfileContainer: React.FC = () => {
  const { profile, updating, updateLocation } = useProfile();
  const [selectedLocation, setSelectedLocation] = useState(profile?.location || 'all');

  React.useEffect(() => {
    if (profile?.location) {
      setSelectedLocation(profile.location);
    }
  }, [profile?.location]);

  const handleLocationChange = async (newLocation: string) => {
    const success = await updateLocation(newLocation);
    if (!success) {
      setSelectedLocation(profile?.location || 'all');
    } else {
      setSelectedLocation(newLocation);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ProfileField 
        label="Username" 
        value={profile.username} 
        isReadOnly 
      />
      
      <ProfileField 
        label="Email" 
        value={profile.email} 
        isReadOnly 
      />
      
      <LocationDropdown
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        updating={updating}
      />
      
      <ProfileField 
        label="Employee ID" 
        value={profile.empId} 
        isReadOnly 
      />
      
      <LogoutButton disabled={updating} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});