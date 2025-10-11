//CITS3200 project group 23 2024
//Welcome screen

import { View, Text, Image } from 'react-native';
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';
import Button from '../components/Buttons/Button'
import FONTS from '../constants/fonts';


const Welcome = ({ navigation }) => {
  return (
    <View style={{
      paddingHorizontal: 26,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1, 
      backgroundColor: COLORS.white,
    }}>
      <Image
        source={require('./../assets/mental_labour_venn.png')}
        style={{
          height: 400,
          width: 400,
          marginTop: -30,
          marginBottom: 20
        }}
      />
      
      <Text style={{
        fontSize: 35,
        color: COLORS.black,
        fontFamily: FONTS.main_font,
        marginTop: -60,
      }}>MENTAL LOAD</Text>

      <Text style={{
        fontSize: 35,
        color: COLORS.black,
        fontFamily: FONTS.main_font,
      }}>TRACKER</Text>

      <Text style={{
        fontSize: 16,
        color: COLORS.light_blue3,
        fontFamily: FONTS.main_font,
        fontStyle: 'italic',
        marginBottom: 40,
      }}>take a moment to reflect</Text>

      <Button
        title="Login"
        onPress={()=>navigation.navigate("Login")}
        style={{
          width: "100%",
          marginBottom: 20,
        }}/>

      <Button
        title="Sign Up"
        onPress={()=>navigation.navigate("Signup")}
        style={{
          width: "100%",
          marginBottom: 32,
        }}/>
    </View>
  )
}

export default Welcome