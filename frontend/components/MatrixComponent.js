import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import TouchablePlatform from './TouchablePlatform';

import COLORS from "../constants/colors";
import FONTS from "../constants/fonts";

export default function MatrixComponent({
  questionDetails,
  selectedOptions,
  handleOptionPress,
  highlightTextWithColors,
  wordColorMap,
  stripHtmlTags,
  colors_list,
  styles,
}) {
  // hook used to toggle groups of sub questions
  const [toggleGroups, setToggleGroups] = useState({});
  const colorsArray = [
    COLORS.light_blue3, // First group color
    COLORS.light_green, // Second group color
    COLORS.dark_purple, // Third group color
    COLORS.pink2, // Third group color
    // Add more colors as needed
  ];

  //Setting initial Groups Toggle states
  useEffect(() => {
    if (questionDetails["ChoiceGroups"]) {
      const initialGroups = Object.keys(questionDetails["ChoiceGroups"]).reduce(
        (acc, groupKey) => {
          acc[groupKey] = false;
          return acc;
        },
        {}
      );
      setToggleGroups(initialGroups);
    }
  }, [questionDetails]);

  // Creating an array of sub question components
  subQuestionsComponents = questionDetails["SubQuestions"].map(
    (subquestion, subIndex) => {
      return (
        <View key={subIndex} style={matrixStyles.groupBox}>
          <Text style={matrixStyles.subQuestionText}>
            {highlightTextWithColors(
              stripHtmlTags(subquestion["Display"]),
              wordColorMap
            )}
          </Text>

          <View style={matrixStyles.optionsContainer}>
            {/* Displays options for each subquestion */}
            {/* Displays the line between the buttons unless first or last question */}

            <View style={matrixStyles.line} />

            {questionDetails["Choices"].map((option, optionIndex) => {
              //displaying the first, middle and last choice  with the title
              displayRound =
                optionIndex === 0 ||
                optionIndex ===
                  Math.floor(questionDetails["Choices"].length / 2) ||
                optionIndex === questionDetails["Choices"].length - 1;

              return (
                <View style={matrixStyles.optionButtonContainer}>
                  {/* Rendering buttons for choices for each subquestion */}
                  <TouchablePlatform
                    key={optionIndex}
                    style={[
                      // checks if it is the first, middle and last option and displays round or rectangle
                      displayRound
                        ? matrixStyles.roundOptionButton
                        : matrixStyles.rectOptionButton,
                      selectedOptions[subIndex] === optionIndex && {
                        backgroundColor:
                          colorsArray[subIndex % colors_list.length],
                      },
                    ]}
                    onPress={() => handleOptionPress(subIndex, optionIndex)}
                  >
                    {/* Displays the button text */}
                    <Text
                      style={[
                        matrixStyles.buttonText,
                        selectedOptions[subIndex] === optionIndex,
                      ]}
                    >
                      {/* only displays text if middle, last or first option*/}
                      {displayRound ? option["Display"] : null}
                    </Text>
                  </TouchablePlatform>
                </View>
              );
            })}
          </View>
        </View>
      );
    }
  );

  // Groups SubQuestions if there are groups otherwise just displays sub questions
  DisplaySubQuestions = questionDetails["ChoiceGroups"]
    ? Object.keys(questionDetails["ChoiceGroups"]).map((groupKey, index) => {
        group = questionDetails["ChoiceGroups"][groupKey];
        subQuestions = group["ChoiceGroupOrder"].map(
          (index) => subQuestionsComponents[index - 1]
        );

        // Group color array
        const groupColor = colorsArray[index % colorsArray.length];
        return (
          <View
            // Sets the group color
            style={[matrixStyles.groupBox, { backgroundColor: groupColor }]}
          >
            {/* Renders group title and sub questions */}
            <View style={matrixStyles.groupHeaderContainer}>
              <Text style={matrixStyles.groupTitle} key={groupKey}>
                {group["GroupLabel"]}
              </Text>

              {/* Renders the +/- button */}

              <TouchablePlatform
                key={`${groupKey}_button`}
                onPress={() => {
                  setToggleGroups((prevToggleGroups) => ({
                    ...prevToggleGroups,
                    [groupKey]: !prevToggleGroups[groupKey],
                  }));
                }}
              >
                <Text style={matrixStyles.toggleText}>
                  <Image
                    source={require("./../assets/chevronRight.png")}
                    style={{
                      height: 30,
                      width: 30,
                      transform: [
                        toggleGroups[groupKey]
                          ? { rotate: "90deg" }
                          : { rotate: "0deg" }, // Rotate if toggleGroups[groupKey] is true
                      ],
                    }}
                  />
                </Text>
              </TouchablePlatform>
            </View>

            {toggleGroups[groupKey] && subQuestions}
          </View>
        );
      })
    : /* Renders sub questions if there are no groups*/
      subQuestionsComponents;

  /*Checks if there are groups and renders them otherwise renders sub questions*/

  return (
    <View>
      {/* Renders question text */}
      <Text style={styles.questionText}>
        {highlightTextWithColors(
          stripHtmlTags(questionDetails["QuestionText"]),
          wordColorMap
        )}
      </Text>

      {/* Renders sub questions */}
      {DisplaySubQuestions}
    </View>
  );
}
const matrixStyles = StyleSheet.create({
  optionButtonContainer: {
    flexDirection: "row", // Keep the buttons in a row

    justifyContent: "flex-start",
  },
  optionsContainer: {
    flexDirection: "row",
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    color: COLORS.white,
    justifyContent: "space-between",
  },
  line: {
    width: "90%",
    height: 5,
    backgroundColor: COLORS.white,
    position: "absolute",
    top: "90%",
    left: 20,
    borderWidth: 1,
    borderColor: COLORS.dark_blue,
  },

  roundOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 50,
    position: "relative",
    borderWidth: 1,
    borderColor: COLORS.dark_blue,

    backgroundColor: COLORS.white,
  },
  rectOptionButton: {
    paddingVertical: 10,
    borderRadius: 5,
    paddingHorizontal: 4,
    marginHorizontal: 10,
    position: "relative",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.dark_blue,
    border: "3px solid black",
  },
  groupHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginBottom: 10,
  },
  selectionContainer: {
    width: "100%",
  },
  groupBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    fontFamily: FONTS.survey_font_bold,
  },
  toggleText: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: FONTS.survey_font_bold,
  },
  subQuestionText: {
    color: COLORS.white,
    fontFamily: FONTS.survey_font_bold,
    fontSize: 17,
    padding: 5,
  },
  groupTitle: {
    fontSize: 30,
    color: COLORS.white,
    fontFamily: FONTS.survey_font_bold,
  },
  buttonText: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: FONTS.survey_font_bold,
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    bottom: -25,
    left: -17,
  },
});
