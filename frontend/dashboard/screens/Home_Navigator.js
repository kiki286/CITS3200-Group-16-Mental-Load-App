//CITS3200 project group 23 2024 2024
//Home navigator handles navigations in the home tab

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Home, Survey_Navigator } from  './home'
import Survey_Repeated from "./home/Survey_Repeated";

const home_stack = createNativeStackNavigator();

const Home_Navigator = () => {
  return (
    <home_stack.Navigator
        initialRouteName='Home'
    >
      <home_stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown:false
        }}
      />
      <home_stack.Screen
        name="Survey_Repeated"
        component={Survey_Repeated}
        options={{
          headerShown:false
        }}
      />
    </home_stack.Navigator>
  )
}

export default Home_Navigator