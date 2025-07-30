//CITS3200 project group 23 2024
//Welcome screen

import { View, Text, Image } from 'react-native';
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';
import Button from '../components/Buttons/Button'
import { Ionicons } from '@expo/vector-icons'
import FONTS from '../constants/fonts';


const Welcome = ({ navigation }) => {
  return (
    <View style={{
      paddingHorizontal: 26,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1, 
      backgroundColor: COLORS.black,
    }}>
      <Text style={{
        fontSize: 30,
        color: COLORS.almost_white,
        fontFamily: FONTS.main_font,
        marginTop: -60,
      }}>TAKE A MOMENT TO</Text>
      <Text style={{
        fontSize: 30,
        color: COLORS.almost_white,
        fontFamily: FONTS.main_font
      }}>REFLECT ON YOUR</Text>
      <Text style={{
        fontSize: 30,
        color: COLORS.light_green,
        fontFamily: FONTS.main_font
      }}>MENTAL LABOUR</Text>
      <Image
        source={require('./../assets/mental_labour_venn.png')}
        style={{
          height: 400,
          width: 400,
          marginTop: -30,
        }}
      />
      <Text style={{
        fontSize: 35,
        color: COLORS.almost_white,
        fontFamily: FONTS.main_font,
        marginTop: -60,
      }}>MENTAL LOAD</Text>
      <Text style={{
        fontSize: 35,
        color: COLORS.almost_white,
        fontFamily: FONTS.main_font,
      }}>TRACKER</Text>
      <Button
        title="Login"
        onPress={()=>navigation.navigate("Login")}
        style={{
          width: "100%",
          marginTop: 10,
        }}
      />
      <Button
        title="Sign Up"
        onPress={()=>navigation.navigate("Signup")}
        style={{
          marginTop: 16,
          width: "100%",
        }}
      />
    </View>
  )
}

export default Welcome