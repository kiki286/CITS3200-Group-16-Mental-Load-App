//CITS3200 project group 23 2024
//Dashboard page which controls navigation on the dashboard

import { View, Text } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";
import React from 'react';
import { Profile_Navigator, View_Navigator, Settings_Navigator, Home_Navigator, Admin_Navigator } from './screens';
import Dashboard from './Dashboard';
import Welcome from "../screens/Welcome";
import About from './screens/settings/About';
import COLORS from '../constants/colors';
import FONTS from '../constants/fonts';
import { LinearGradient } from 'expo-linear-gradient';

const dashboard_stack = createStackNavigator();

const Dashboard_Navigator = (props) => {
  const { isAdmin } = props;
  return (
    <dashboard_stack.Navigator 
      initialRouteName={"Dashboard"}
    >
      <dashboard_stack.Screen 
        name="Dashboard" 
        options={{
          headerShown:false
        }}
      >
        {(screenProps) => <Dashboard {...screenProps} isAdmin={isAdmin} />}
      </dashboard_stack.Screen>
      <dashboard_stack.Screen 
        name="Home_Navigator" 
        component={Home_Navigator}
        options={{
          headerShown:false
        }}
      />
      <dashboard_stack.Screen 
        name="Profile_Navigator" 
        component={Profile_Navigator}
        options={{
          headerShown:false
        }}
      />
      <dashboard_stack.Screen 
        name="View_Navigator" 
        component={View_Navigator}
        options={{
          headerShown:false
        }}
      />
      <dashboard_stack.Screen 
        name="Settings_Navigator" 
        component={Settings_Navigator}
        options={{
          headerShown:false
        }}
      />
      {isAdmin && (
        <dashboard_stack.Screen 
          name="Admin_Navigator" 
          component={Admin_Navigator}
          options={{
            headerShown:false
          }}
        />
      )}
      <dashboard_stack.Screen 
        name="About" 
        component={About}
        options={{
          headerShown:false
        }}
      />
    </dashboard_stack.Navigator>
  )
}

export default Dashboard_Navigator