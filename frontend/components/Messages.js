import React from "react";
import { Text, View, ActivityIndicator } from "react-native";

export const Loading = () => (
  <View style={{ padding: 10 }}>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
);

export const Error = ({ message }) => (
  <View style={{ padding: 10 }}>
    <Text>Error: {message}</Text>
  </View>
);
