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
    <View style={{ width: '100%' }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
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
              backgroundColor: s === value ? COLORS.light_blue4 : COLORS.light_grey,
              marginVertical: 12,
            }}
          />
        </TouchablePlatform>
      ))}
      </View>
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
  const subQuestionsComponents = questionDetails["SubQuestions"].map((subquestion, subIndex) => {
    const qid = questionDetails["QuestionID"];
    const currentValue = sliderValues[`${qid}_${subIndex}`] ?? getInitialSliderValue();
    const currentLabel = sliderLabels[`${qid}_${subIndex}`] ?? questionDetails["Choices"][getInitialSliderValue()]?.["Display"];

    return (
      <View key={`${qid}_${subIndex}`} style={matrixStyles.sliderContainer}>
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
            onValueChange={(val) => {
              const label = questionDetails["Choices"][val]?.["Display"] ?? "Unknown";
              setSliderLabels((prev) => ({ ...prev, [`${qid}_${subIndex}`]: label }));
              setSliderValues((prev) => ({ ...prev, [`${qid}_${subIndex}`]: val }));
              handleOptionPress(subIndex, val); // keep your selection model in sync
            }}
        />
        {/* <View style={[matrixStyles.circleMarker, matrixStyles.rightCircle]} />*/}
      </View>

        {/* Labels row */}
        <View style={matrixStyles.labelsContainer}>
          <Text style={matrixStyles.firstLastLabel}>{questionDetails["Choices"][0]["Display"]}</Text>
          <Text style={matrixStyles.currentLabel}>{currentLabel}</Text>
          <Text style={matrixStyles.firstLastLabel}>
            {questionDetails["Choices"][questionDetails["Choices"].length - 1]["Display"]}
          </Text>
        </View>
      </View>
    );
  });

  // Groups SubQuestions if there are groups otherwise just displays sub questions
  DisplaySubQuestions = questionDetails["ChoiceGroups"]
    ? Object.keys(questionDetails["ChoiceGroups"]).map((groupKey, index) => {
        const group = questionDetails["ChoiceGroups"][groupKey];
        const subQuestions = group["ChoiceGroupOrder"].map((index) => subQuestionsComponents[index - 1]);

        // Group color array
        const groupColor = colorsArray[index % colorsArray.length];
        return (
          <View key={groupKey} style={matrixStyles.groupBox}>
            <View style={matrixStyles.groupHeaderContainer}>
              <Text style={matrixStyles.groupTitle}>{group["GroupLabel"]}</Text>

              {/* Renders the +/- button */}
              <TouchablePlatform
                accessibilityRole="button"
                accessibilityLabel={toggleGroups[groupKey] ? "Collapse group" : "Expand group"
                }
                onPress={() => 
                  setToggleGroups((prev) => ({...prev, [groupKey]: !prev[groupKey] }))
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

  roundOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 50,
    position: "relative",
    borderWidth: 1,
    borderColor: COLORS.light_grey,
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
    borderColor: COLORS.light_grey,
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
    fontFamily: FONTS.survey_font_bold,
    backgroundColor: COLORS.light_grey2,     // neutral card surface
    borderWidth: 1,
    borderColor: COLORS.light_grey,
  },
  subQuestionText: {
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    fontSize: 17,
    padding: 6,
  },
  groupTitle: {
    fontSize: 30,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
  },
  chevronHitbox: { padding: 4 },
  chevron: { height: 24, width: 24 },

  sliderContainer: {
    marginBottom: 24,
  },
  slider: {
    width: "100%",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  firstLastLabel: {
    fontSize: 12,
    color: COLORS.black,
  },
  currentLabel: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "bold",
    textAlign: "center",
  },
  sliderTrackContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    marginTop: 8,
  },
});
