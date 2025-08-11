// component/profile/ProfileContainer.tsx
import { colors } from '@/constants/colors';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useProfile } from '../../hooks/useProfile';
import { AttendanceCalendar } from './AttendanceCalendar';
import { LocationDropdown } from './LocationDropdown';
import { LogoutButton } from './LogoutButton';
import { ProfileField } from './ProfileFieldProfile';

export const ProfileContainer: React.FC = () => {
  const { profile, updating, updateLocation } = useProfile();
  const [selectedLocation, setSelectedLocation] = useState(profile?.location || 'all');
  const [showCalendar, setShowCalendar] = useState(false);

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.username.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.usernameText}>{profile.username}</Text>
        </View>

        {/* Quick Stats Card */}
        <TouchableOpacity 
          style={styles.attendanceCard}
          onPress={() => setShowCalendar(!showCalendar)}
          activeOpacity={0.7}
        >
          <View style={styles.attendanceCardHeader}>
            <View style={styles.attendanceCardLeft}>
              <FontAwesome6 name="calendar-days" size={24} color={colors.primary[500]} />
              <View style={styles.attendanceCardTextContainer}>
                <Text style={styles.attendanceCardTitle}>Attendance Tracker</Text>
                <Text style={styles.attendanceCardSubtitle}>
                  Tap to {showCalendar ? 'hide' : 'view'} your attendance history
                </Text>
              </View>
            </View>
            <FontAwesome6 
              name={showCalendar ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={colors.gray[500]} 
            />
          </View>
        </TouchableOpacity>

        {/* Attendance Calendar Section */}
        {showCalendar && (
          <View style={styles.calendarSection}>
            <AttendanceCalendar empId={profile.empId} />
          </View>
        )}

        {/* Profile Fields Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          
          <ProfileField 
            label="Username" 
            value={profile.username} 
            isReadOnly 
            icon="user"
          />
          
          <ProfileField 
            label="Email" 
            value={profile.email} 
            isReadOnly 
            icon="envelope"
          />
          
          <ProfileField 
            label="Employee ID" 
            value={profile.empId} 
            isReadOnly 
            icon="id-card"
          />
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Department Settings</Text>
          <LocationDropdown
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
            updating={updating}
          />
        </View>
        
        <LogoutButton disabled={updating} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  avatarContainer: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  attendanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  attendanceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attendanceCardTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  attendanceCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  attendanceCardSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  calendarSection: {
    marginTop: -10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
});