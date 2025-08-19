import  {AttendanceContainer}  from '@/component/attendance/AttendanceContainer';
import { globalStyles } from '@/constants/style';
import React from 'react';
import { View } from 'react-native';


export default function AttendanceScreen() {
  return (
    <View style={globalStyles.container}>
      <AttendanceContainer />
    </View>
  );
}