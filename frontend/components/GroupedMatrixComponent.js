import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Platform
} from "react-native";
import TouchablePlatform from './TouchablePlatform';

import COLORS from "../constants/colors";
import FONTS from "../constants/fonts";

// A small dependency-free slider built with React Native primitives so the
// component works on web and native without @react-native-community/slider.
const StepSlider = ({ minimumValue = 0, maximumValue = 1, step = 1, value = 0, onValueChange }) => {
  const steps = [];
  for (let i = minimumValue; i <= maximumValue; i += step) {
    steps.push(i);
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      {steps.map((s) => (
        <TouchablePlatform
          key={s}
          onPress={() => onValueChange && onValueChange(s)}
          style={{ alignItems: "center", flex: 1 }}
        >
          <View
            style={{
              width: s === value ? 16 : 8,
              height: s === value ? 16 : 8,
              borderRadius: 16 / 2,
              backgroundColor: s === value ? COLORS.green : COLORS.dark_blue,
              marginVertical: 12,
            }}
          />
        </TouchablePlatform>
      ))}
    </View>
  );
};

// Use the StepSlider component for all platforms (it is pure RN primitives)
const SliderComponent = StepSlider;

export default function GroupedMatrixComponent({
  questionDetails,
  selectedOptions,
  handleOptionPress,
  highlightTextWithColors,
  wordColorMap,
  stripHtmlTags,
  colors_list,
  styles,
  sliderValues,
  setSliderValues
}) {
  const getInitialSliderValue = () => {
    const totalOptions = questionDetails["Choices"].length;
    return Math.floor((totalOptions - 1) / 2);
  };
  const [sliderLabels, setSliderLabels] = useState({});

  // hook used to toggle groups of sub questions
  const [toggleGroups, setToggleGroups] = useState({});
  const colorsArray = [
    COLORS.light_blue3, // First group color
    COLORS.light_green, // Second group color
    COLORS.dark_purple, // Third group color
    COLORS.pink2, // Third group color
    // Add more colors as needed
  ];

  const StepMarker = ({ stepMarked }) => {
    return (
      <View
        style={{
          width: 8,               // Width of the rectangle
          height: 8,              // Height of the rectangle (1:4 ratio)
          backgroundColor: stepMarked ? COLORS.green : COLORS.dark_blue, // Color changes if the thumb is at this step
          marginTop: 10,          // Adjust positioning to center it correctly on the slider
          borderRadius: 5,
          bottom: '140%',
        }}
      >
      </View>
    );
  };

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

  useEffect(() => {
    if (questionDetails) {
      const initialSliderValues = {};
      const initialSliderLabels = {};
  
      questionDetails["SubQuestions"].forEach((_, subIndex) => {
        const initialValue = getInitialSliderValue();
        initialSliderValues[`${questionDetails["QuestionID"]}_${subIndex}`] = initialValue;
  
        // Set the initial label to the default choice
        initialSliderLabels[`${questionDetails["QuestionID"]}_${subIndex}`] = "Select an option"
      });
  
      // Set initial slider values and labels
      setSliderValues(initialSliderValues);
      setSliderLabels(initialSliderLabels);
    }
  }, [questionDetails]);

  // Creating an array of sub question components
  const subQuestionsComponents = questionDetails["SubQuestions"].map(
    (subquestion, subIndex) => {
      const currentSliderValue =
        sliderValues[`${questionDetails["QuestionID"]}_${subIndex}`] ||
        getInitialSliderValue();

      const currentLabel = sliderLabels[`${questionDetails["QuestionID"]}_${subIndex}`] || 
        questionDetails["Choices"][getInitialSliderValue()]["Display"];

      return (
        <View style={matrixStyles.sliderContainer}>
          <Text style={matrixStyles.subQuestionText}>
            {highlightTextWithColors(
              stripHtmlTags(subquestion["Display"]),
              wordColorMap
            )}
          </Text>

        {/* Custom slider with snap points */}
        <View style={matrixStyles.sliderTrackContainer}>
          {/* Circles on the ends */}
          {/* <View style={[matrixStyles.circleMarker, matrixStyles.leftCircle]} /> */}
          <SliderComponent
            minimumValue={0}
            maximumValue={questionDetails["Choices"].length - 1}
            step={1}
            value={currentSliderValue}
            onValueChange={(value) => {
              const label = questionDetails["Choices"][value]
                ? questionDetails["Choices"][value]["Display"]
                : "Unknown";
              setSliderLabels((prev) => ({
                ...prev,
                [`${questionDetails["QuestionID"]}_${subIndex}`]: label,
              }));
              setSliderValues((prev) => ({
                ...prev,
                [`${questionDetails["QuestionID"]}_${subIndex}`]: value,
              }));
              handleOptionPress(subIndex, value); // Treat the step tap like a selection
            }}
          />
          {/* <View style={[matrixStyles.circleMarker, matrixStyles.rightCircle]} />*/}
        </View>
          <View style={matrixStyles.labelsContainer}>
            {/* First option label */}
            <Text style={matrixStyles.firstLastLabel}>
              {questionDetails["Choices"][0]["Display"]}
            </Text>
            {/* Current selected value label */}
            <Text style={matrixStyles.currentLabel}>
              {currentLabel}
            </Text>
            {/* Last option label */}
            <Text style={matrixStyles.firstLastLabel}>
              {
                questionDetails["Choices"][
                  questionDetails["Choices"].length - 1
                ]["Display"]
              }
            </Text>
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
  sliderContainer: {
    marginBottom: 30,
  },
  slider: {
    width: "100%",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  firstLastLabel: {
    fontSize: 10,
    color: COLORS.white,
    marginTop: -25,
  },
  currentLabel: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "bold",
    textAlign: "center",
  },
  sliderTrackContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    marginTop: 15,
  },
  circleMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.dark_blue,
    position: "absolute",
    zIndex: -1,
  },
  leftCircle: {
    left: 4, // Position it at the start of the slider
  },
  rightCircle: {
    right: 4, // Position it at the end of the slider
  },
});
