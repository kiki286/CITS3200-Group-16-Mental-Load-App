//CITS3200 project group 23 2024 2024
//Profile Navigator handles navigations in the profile tab

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Profile } from  './profile'
import { Survey_Demographics } from './profile'

const profile_stack = createNativeStackNavigator();

const Profile_Navigator = () => {
  return (
    <profile_stack.Navigator
        initialRouteName='Profile'
    >
      <profile_stack.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown:false
        }}
      />
      <profile_stack.Screen
        name="Survey_Demographics"
        component={Survey_Demographics}
        options={{
          headerShown:false
        }}
      />
    </profile_stack.Navigator>
  )
}

export default Profile_Navigator