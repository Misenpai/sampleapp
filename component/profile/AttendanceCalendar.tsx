// component/profile/AttendanceCalendar.tsx
import { colors } from '@/constants/colors';
import {
    AttendanceDate,
    AttendanceStatistics,
    getAttendanceCalendar,
    getMarkedDates
} from '@/services/attendanceCalendarService';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface AttendanceCalendarProps {
  empId: string;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ empId }) => {
  const [loading, setLoading] = useState(true);
  const [attendanceDates, setAttendanceDates] = useState<AttendanceDate[]>([]);
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedYear, selectedMonth]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await getAttendanceCalendar(empId, selectedYear, selectedMonth);
      
      if (response.success && response.data) {
        setAttendanceDates(response.data.dates);
        setStatistics(response.data.statistics);
        setMarkedDates(getMarkedDates(response.data.dates));
      } else {
        Alert.alert('Error', response.error || 'Failed to load attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      Alert.alert('Error', 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const onMonthChange = (month: any) => {
    setSelectedMonth(month.month);
    setSelectedYear(month.year);
  };

  const renderStatisticsCard = () => {
    if (!statistics) return null;

    return (
      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={styles.statisticsCard}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.statisticsTitle}>Attendance Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <FontAwesome6 name="calendar-check" size={24} color={colors.white} />
              </View>
              <Text style={styles.statValue}>{statistics.totalDays}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <FontAwesome6 name="fire" size={24} color={colors.white} />
              </View>
              <Text style={styles.statValue}>{statistics.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <FontAwesome6 name="trophy" size={24} color={colors.white} />
              </View>
              <Text style={styles.statValue}>{statistics.longestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>

          {statistics.lastAttendance && (
            <View style={styles.lastAttendanceContainer}>
              <FontAwesome6 name="clock" size={14} color={colors.gray[200]} />
              <Text style={styles.lastAttendanceText}>
                Last attendance: {new Date(statistics.lastAttendance).toLocaleDateString()}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderSelectedDateInfo = () => {
    if (!selectedDate) return null;

    const attendance = attendanceDates.find(
      a => a.date.split('T')[0] === selectedDate
    );

    if (!attendance) {
      return (
        <Animated.View 
          entering={FadeInUp.duration(300)}
          style={styles.selectedDateCard}
        >
          <Text style={styles.selectedDateTitle}>{selectedDate}</Text>
          <View style={styles.noAttendanceContainer}>
            <FontAwesome6 name="calendar-xmark" size={32} color={colors.gray[400]} />
            <Text style={styles.noAttendanceText}>No attendance marked</Text>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View 
        entering={FadeInUp.duration(300)}
        style={styles.selectedDateCard}
      >
        <Text style={styles.selectedDateTitle}>
          {new Date(attendance.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        
        <View style={styles.attendanceDetailsContainer}>
          <View style={styles.attendanceDetailRow}>
            <FontAwesome6 name="location-dot" size={16} color={colors.primary[500]} />
            <Text style={styles.attendanceDetailLabel}>Location:</Text>
            <Text style={styles.attendanceDetailValue}>
              {attendance.attendance.takenLocation || 'Not specified'}
            </Text>
          </View>
          
          <View style={styles.attendanceDetailRow}>
            <FontAwesome6 name="clock" size={16} color={colors.primary[500]} />
            <Text style={styles.attendanceDetailLabel}>Check-in:</Text>
            <Text style={styles.attendanceDetailValue}>
              {new Date(attendance.attendance.checkInTime).toLocaleTimeString()}
            </Text>
          </View>

          {attendance.attendance.checkOutTime && (
            <View style={styles.attendanceDetailRow}>
              <FontAwesome6 name="right-from-bracket" size={16} color={colors.primary[500]} />
              <Text style={styles.attendanceDetailLabel}>Check-out:</Text>
              <Text style={styles.attendanceDetailValue}>
                {new Date(attendance.attendance.checkOutTime).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderStatisticsCard()}
      
      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>Attendance Calendar</Text>
        
        <Calendar
          current={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`}
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: colors.primary[500]
            }
          }}
          theme={{
            backgroundColor: colors.white,
            calendarBackground: colors.white,
            textSectionTitleColor: colors.gray[600],
            selectedDayBackgroundColor: colors.primary[500],
            selectedDayTextColor: colors.white,
            todayTextColor: colors.primary[500],
            dayTextColor: colors.gray[800],
            textDisabledColor: colors.gray[300],
            dotColor: colors.success,
            selectedDotColor: colors.white,
            arrowColor: colors.primary[500],
            monthTextColor: colors.gray[800],
            indicatorColor: colors.primary[500],
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
          style={styles.calendar}
        />
      </View>

      {renderSelectedDateInfo()}

      <View style={styles.legendCard}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.gray[300] }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary[500] }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.gray[600],
  },
  statisticsCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientContainer: {
    padding: 20,
  },
  statisticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[200],
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  lastAttendanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  lastAttendanceText: {
    fontSize: 14,
    color: colors.gray[200],
    marginLeft: 8,
  },
  calendarCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: 16,
  },
  calendar: {
    borderRadius: 12,
  },
  selectedDateCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 16,
  },
  noAttendanceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAttendanceText: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 12,
  },
  attendanceDetailsContainer: {
    gap: 12,
  },
  attendanceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceDetailLabel: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  attendanceDetailValue: {
    fontSize: 14,
    color: colors.gray[800],
    flex: 1,
  },
  legendCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: colors.gray[600],
  },
});