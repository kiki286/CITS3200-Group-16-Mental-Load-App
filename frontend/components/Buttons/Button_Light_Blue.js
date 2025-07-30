//CITS3200 project group 23 2024 2024
//Dark blue coloured button with custom style

import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import COLORS from '../../constants/colors'
import FONTS from '../../constants/fonts'
import { TouchableOpacity } from 'react-native'

const Button = (props) => {
  return (
    <TouchableOpacity
      style={{
        ...styles.button_container,
        ...props.style
      }}
      onPress={props.onPress}
    >
      <Text style={styles.button_text}>{props.title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button_container:{
    paddingBottom: 10,
    paddingVertical: 7,
    borderColor: COLORS.dark_grey,
    borderWidth: 3,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light_blue3
  },
  
  button_text:{
    fontSize: 24,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
  }
})

export default Button