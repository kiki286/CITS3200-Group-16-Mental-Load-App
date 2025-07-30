//CITS3200 project group 23 2024 2024
//View navigator handles navigations in the view tab

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View } from  './view'

const view_stack = createNativeStackNavigator();

const View_Navigator = () => {
  return (
    <view_stack.Navigator
        initialRouteName='View'
    >
      <view_stack.Screen
        name="View"
        component={View}
        options={{
          headerShown:false
        }}
      />
    </view_stack.Navigator>
  )
}

export default View_Navigator