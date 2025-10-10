//CITS3200 project group 23 2024
//Admin Navigator handles navigations in the admin area

import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AdminHome from './AdminHome'
import CampaignCreate from './CampaignCreate'
import SurveySettings from './SurveySettings'

const admin_stack = createStackNavigator();


//TODO useRole to check if user is admin to navigate to admin home

const Admin_Navigator = () => {
  return (
    <admin_stack.Navigator
      initialRouteName='Admin_Home'
    >
      <admin_stack.Screen
        name="Admin_Home"
        component={AdminHome}
        options={{
          headerShown:false
        }}
      />
      <admin_stack.Screen
        name="Campaign_Create"
        component={CampaignCreate}
        options={{
          headerShown:false
        }}
      />
      <admin_stack.Screen
        name="Survey_Settings"
        component={SurveySettings}
        options={{
          headerShown:false
        }}
      />
    </admin_stack.Navigator>
  )
}

export default Admin_Navigator


