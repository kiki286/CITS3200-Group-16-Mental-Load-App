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
  const subQuestionsComponents = questionDetails.SubQuestions.map((subquestion, subIndex) => {
    return (
      <View key={`sub_${subIndex}`} style={matrixStyles.subBlock}>
        <Text style={matrixStyles.subQuestionText}>
          {highlightTextWithColors(
            stripHtmlTags(subquestion["Display"]),
            wordColorMap
          )}
        </Text>
        <View style={matrixStyles.optionsContainer}>
          {questionDetails.Choices.map((option, optionIndex) => {
            // first / middle / last show a round “pill”; the rest rectangle
            const displayRound =
              optionIndex === 0 ||
              optionIndex === Math.floor(questionDetails.Choices.length / 2) ||
              optionIndex === questionDetails.Choices.length - 1;

            const isSelected = selectedOptions[subIndex] === optionIndex;

            return (
              <TouchablePlatform
                key={`option_${subIndex}_${optionIndex}`}
                accessibilityRole="button"
                style={[
                  displayRound ? matrixStyles.roundOptionButton : matrixStyles.rectOptionButton,
                  isSelected && matrixStyles.optionSelected,
                ]}
                onPress={() => handleOptionPress(subIndex, optionIndex)}
              >
                 {/* Only label first/middle/last*/}
                 {displayRound ? (
                  <Text style={matrixStyles.optionText}>{option.Display}</Text>
                ) : null}
                </TouchablePlatform>
            );
          })}
        </View>
      </View>
    );
  });
               

  // Groups SubQuestions if there are groups otherwise just displays sub questions
  DisplaySubQuestions = questionDetails["ChoiceGroups"]
    ? Object.keys(questionDetails["ChoiceGroups"]).map((groupKey, index) => {
        const group = questionDetails["ChoiceGroups"][groupKey];
        const subQuestions = group["ChoiceGroupOrder"].map((index) => subQuestionsComponents[index - 1]);

        return (
          <View key={`group_${groupKey}`} style={matrixStyles.groupBox}>
            {/* Renders group title and sub questions */}
            <View style={matrixStyles.groupHeaderContainer}>
              <Text style={matrixStyles.groupTitle}> {group["GroupLabel"]} </Text>

              {/* Renders the +/- button */}

              <TouchablePlatform
                accessibilityRole="button"
                accessibilityLabel={toggleGroups[groupKey] ? "Collapse group" : "Expand group"}
                onPress={() => 
                  setToggleGroups((prevToggleGroups) => ({ ...prevToggleGroups, [groupKey]: !prevToggleGroups[groupKey] }))
                }
                style={matrixStyles.chevronHitbox}
              >
                <Image
                  source={require("./../assets/chevronRight.png")}
                  style={[
                    matrixStyles.chevron,
                    toggleGroups[groupKey] ? { transform: [{ rotate: "90deg" }] } : null,
                  ]}
                />
              </TouchablePlatform>
            </View>

            {toggleGroups[groupKey] && subQuestions}
          </View>
        );
      })
    : subQuestionsComponents;

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
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    paddingVertical: 10,
    justifyContent: "space-between",
  },

  roundOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: COLORS.light_grey,
    backgroundColor: COLORS.white,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },

  rectOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.light_grey,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  optionSelected: {
    borderColor: COLORS.light_blue4, // selection highlight
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    textAlign: "center",
  },
  groupHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectionContainer: {
    width: "100%",
  },
  groupBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: COLORS.light_grey2,  
    borderWidth: 1,
    borderColor: COLORS.light_grey,
  },
  groupTitle: {
    fontSize: 22,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
  },
  chevronHitbox: { padding: 4 },
  chevron: { height: 24, width: 24 },

  // Each sub-question block
  subBlock: { marginBottom: 20 },
  subQuestionText: {
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    fontSize: 17,
    paddingVertical: 6,
  },
});
