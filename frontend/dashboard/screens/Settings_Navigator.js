//CITS3200 project group 23 2024 2024
//Settings navigator handles navigations in the settings tab

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Settings, About } from  './settings'

const settings_stack = createNativeStackNavigator();

const Settings_Navigator = () => {
  return (
    <settings_stack.Navigator
        initialRouteName='Settings'
    >
      <settings_stack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown:false
        }}
      />
      <settings_stack.Screen
        name="About"
        component={About}
        options={{
          headerShown:false
        }}
      />
    </settings_stack.Navigator>
  )
}

export default Settings_Navigator