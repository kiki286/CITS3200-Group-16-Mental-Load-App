// Light blue custom button

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
    paddingBottom: 12,
    paddingVertical: 12,
    backgroundColor: "#79aefd",
    borderRadius: 25,
    borderWidth: 1.8,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  button_text:{
    fontSize: 18,
    color: COLORS.white,
    fontFamily: FONTS.main_font,
    fontWeight: '600',
  }
})

export default Button