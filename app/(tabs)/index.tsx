import React from 'react';
import { View } from 'react-native';
import { globalStyles } from '@/constants/style';
import { AttendanceContainer } from '@/component/attendance/AttendanceContainer';


export default function AttendanceScreen() {
  return (
    <View style={globalStyles.container}>
      <AttendanceContainer />
    </View>
  );
}