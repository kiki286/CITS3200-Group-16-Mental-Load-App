//CITS3200 project group 23 2024
//Function that renders questionUI

//Imports
import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import TouchablePlatform from './TouchablePlatform';
import Ionicons from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/colors";
import FONTS from "../constants/fonts";
import GroupedMatrixComponent from "./GroupedMatrixComponent";
import { Loading } from "./Messages";

// Lightweight cross-platform step slider implemented with RN primitives so it
// works on web and native without extra native dependencies.
const StepSlider = ({ minimumValue = 0, maximumValue = 1, step = 1, value = 0, onValueChange }) => {
  const steps = [];
  for (let i = minimumValue; i <= maximumValue; i += step) {
    steps.push(i);
  }
  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        {steps.map((s) => (
          <TouchablePlatform key={s} style={{ flex: 1, alignItems: "center" }} onPress={() => onValueChange && onValueChange(s)}>
            <View style={{
              width: s === value ? 18 : 8,
              height: s === value ? 18 : 8,
              borderRadius: 18 / 2,
              backgroundColor: s === value ? COLORS.blue : COLORS.light_grey,
              marginVertical: 12,
            }} />
          </TouchablePlatform>
        ))}
      </View>
    </View>
  );
};

const SliderComponent = StepSlider;

//Parameters used to render UI
const RenderQuestionUI = ({
  questionDetails,
  questionID,
  sliderValues,
  setSliderValues,
  handleTextInputChange,
  selectedOptions,
  handleOptionPress,
  wordColorMap,
  colorIndex,
  colors_list,
  inputValues,
  AllornotAll,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 480;
  const colWidth = isSmallScreen ? "100%" : "48%";
  const textOffsetStyle = React.useMemo(() => {
    if (screenWidth < 480) {
      return {
        transform: [{ translateX: 0 }],
        textAlign: 'left',
        width: '100%',
        alignSelf: 'flex-start',
      };
    }
    if (screenWidth < 1024) {
      return {
        transform: [{ translateX: screenWidth * 0.10 }],
        textAlign: 'left',
        width: Math.min(screenWidth * 0.6, 800),
        alignSelf: 'flex-start',
      };
    }
    return {
      transform: [{ translateX: screenWidth * 0.28 }],
      textAlign: 'left',
      width: Math.min(screenWidth * 0.5, 900),
      alignSelf: 'flex-start',
    };
  }, [screenWidth]);
  const responsiveRowStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: isSmallScreen ? "flex-start" : "space-between",
  };
  // State to track the loading status of images
  const [imageLoading, setImageLoading] = useState(true);
  // For removing html tags from text
  const stripHtmlTags = (text) => {
    const withBreaks = text
      .replace(/<br\s*\/?>/gi, "\n") // Replace <br> with newline
      .replace(/<\/div>|<\/p>/gi, "\n") // Replace closing divs and paragraphs with newline
      .replace(/<div.*?>|<p.*?>/gi, "") // Remove opening div and paragraph tags

      .replace(/&nbsp;/gi, "") // Remove &nbsp;
      .replace(/<br\s*\/?>/gi, "\n") // Replace <br> with newline
      .replace(/<\/div>|<\/p>/gi, "\n") // Replace closing divs and paragraphs with newline
      .replace(/<div.*?>|<p.*?>/gi, "") // Remove opening div and paragraph tags

      .replace(/&nbsp;/gi, ""); // Remove &nbsp;

    // Remove any other HTML tags
    const plainText = withBreaks.replace(/<[^>]+>/g, "");
    // Remove any other HTML tags

    // Remove extra newlines (optional)
    return plainText.replace(/\n{2,}/g, "\n\n").trim();
  };

  // Function that changes color of words in wordColorMap
  const highlightTextWithColors = (text, wordColorMap) => {
    const regex = new RegExp(`(${Object.keys(wordColorMap).join("|")})`, "gi");
    return text.split(regex).map((part, index) => {
      const lowerCasePart = part.toLowerCase();
      if (wordColorMap[lowerCasePart]) {
        return (
          <Text key={index} style={{ color: wordColorMap[lowerCasePart] }}>
            {part}
          </Text>
        );
      } else {
        return <Text key={index}>{part}</Text>;
      }
    });
  };

  // Function to handle image load completion
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Returns nothing if there are no more questions
  if (!questionDetails) return null;

  // Defines the QuestionType
  const QuestionType = questionDetails["QuestionType"];

  // Creates questionUI variable to store UI
  let questionsUI = null;

  
  // Checks if question is slider type
  if (QuestionType === "Slider") {
    questionsUI = (
      <View key={questionID} style={styles.questionContainer}>
        <Text style={[styles.questionText, textOffsetStyle]}>
          {highlightTextWithColors(
            stripHtmlTags(questionDetails["QuestionDescription"]),
            wordColorMap
          )}
        </Text>
        {questionDetails["SubQuestions"].map((subQuestion, index) => {
          const currentValue =
            sliderValues[`${questionID}_${index + 1}`] ||
            questionDetails["MinValue"];
        
          return (
            <View key={index} style={styles.subQuestionContainer}>
              <Text style={[styles.subQuestionText, textOffsetStyle, { fontSize: 20 }]}>
                {stripHtmlTags(subQuestion["Display"])}
              </Text>
              <SliderComponent
                minimumValue={questionDetails["MinValue"]}
                maximumValue={questionDetails["MaxValue"]}
                step={
                  questionDetails["NumDecimals"]
                    ? Math.pow(10, -questionDetails["NumDecimals"])
                    : 1
                }
                value={currentValue} // Set the initial value here
                onValueChange={(value) => {
                  setSliderValues((prev) => ({
                    ...prev,
                    [`${questionID}_${index + 1}`]: value,
                  }));
                }}
              />
              <Text style={[styles.sliderText, { textAlign: 'center' }]}>
                {currentValue} {/* Show current slider value */}
              </Text>
            </View>
          );
        })}
      </View>
    );

    // Checks if question is Text Entry type
  } else if (QuestionType === "TE") {
    // For "ChildrenAges" questions, use AllornotAll to control the number of text inputs
    if (questionDetails["DataExportTag"] === "ChildrenAges" && AllornotAll > 0) {
      questionsUI = (
        <View key={questionID} style={styles.optionsContainer}>
          <Text style={[styles.questionText, textOffsetStyle]}>
            {stripHtmlTags(questionDetails["QuestionText"])}
          </Text>
          <View style={[styles.optionsContainer, responsiveRowStyle]}>
            {questionDetails["Choices"].slice(0, AllornotAll).map((option, index) => (
              <View
                key={index}
                style={{
                  width: colWidth,
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontFamily: FONTS.survey_font_bold,
                    fontSize: 17,
                    marginRight: 10,  // Adds some space between text and input
                  }}
                >
                  {option["Display"]}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={inputValues[questionID]?.[index] || ""}
                  onChangeText={(text) => handleTextInputChange(questionID, index, text, "MULTI")}
                  placeholder={`Age of child ${index + 1}`} // Placeholder for child's age
                />
              </View>
            ))}
          </View>
        </View>
      );
    } else {
      // For non-ChildrenAges questions, display choices normally
      AllornotAll = questionDetails["Choices"].length;  // Controls the number of options displayed for non-ChildrenAges questions
      questionsUI = (
        <View key={questionID} style={styles.optionsContainer}>
          <Text style={[styles.questionText, textOffsetStyle]}>
            {stripHtmlTags(questionDetails["QuestionText"])}
          </Text>
          <View
            style={[
              styles.optionsContainer,
              responsiveRowStyle,
            ]}
          >
            {questionDetails["Choices"].slice(0, AllornotAll).map((option, index) => (
              <View
                key={index}
                style={{
                  width: colWidth,
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontFamily: FONTS.survey_font_bold,
                    fontSize: 17,
                  }}
                >
                  {option["Display"]}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={inputValues[questionID]?.[index] || ""}
                  onChangeText={(text) =>
                    handleTextInputChange(questionID, index, text)
                  }
                />
              </View>
            ))}
          </View>
        </View>
      );
    }
  } else if (QuestionType === "Matrix" && questionDetails["SubQuestions"]) {
    questionsUI = questionDetails["ChoiceGroups"] ? (
      <GroupedMatrixComponent
        questionDetails={questionDetails}
        selectedOptions={selectedOptions}
        handleOptionPress={handleOptionPress}
        wordColorMap={wordColorMap}
        stripHtmlTags={stripHtmlTags}
        highlightTextWithColors={highlightTextWithColors}
        colors_list={colors_list}
        styles={styles}
        sliderValues={sliderValues}
        setSliderValues={setSliderValues}
      />
    ) : (
      <View>
        <Text style={[styles.questionText, textOffsetStyle]}>
          {highlightTextWithColors(
            stripHtmlTags(questionDetails["QuestionText"]),
            wordColorMap
          )}
        </Text>
        {questionDetails["SubQuestions"].map((subquestion, subIndex) => (
          <View key={subIndex} style={styles.questionContainer}>
            <Text style={[styles.subQuestionText, textOffsetStyle]}>
              {highlightTextWithColors(
                stripHtmlTags(subquestion["Display"]),
                wordColorMap
              )}
            </Text>
            <View style={styles.optionsContainer}>
              {questionDetails["Choices"].map((option, optionIndex) => (
                <TouchablePlatform
                  key={optionIndex}
                  style={[
                    styles.optionButton,
                    selectedOptions[subIndex] === optionIndex && {
                      borderColor: colors_list[subIndex % colors_list.length],
                    },
                  ]}
                  onPress={() => handleOptionPress(subIndex, optionIndex)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOptions[subIndex] === optionIndex &&
                        styles.selectedText,
                    ]}
                  >
                    {option["Display"]}
                  </Text>
                </TouchablePlatform>
              ))}
            </View>
          </View>
        ))}
      </View>
    );

    // Checks if question is Choices type
  } else if (questionDetails["Choices"] && QuestionType !== "Matrix") {
    const allowMultipleSelection = questionDetails["Selector"] == "MACOL";
    questionsUI = (
      <View key={questionID} style={styles.questionContainer}>
        <Text style={[styles.questionText, textOffsetStyle]}>
          {highlightTextWithColors(
            stripHtmlTags(questionDetails["QuestionText"]),
            wordColorMap
          )}
        </Text>
        <View style={styles.optionsContainer}>
            {questionDetails["Choices"].map((option, index) => {
            const requiresTextInput = option?.TextEntry === true;
            const imageLocation = option.ImageLocation !== "";
            return (
              <View key={index}>
                {requiresTextInput ? (
                  <TextInput
                    style={styles.textInput}
                    placeholder={option["Display"]}
                    placeholderTextColor="white"
                    onChangeText={(text) =>{
                      if (!allowMultipleSelection) {
                        handleTextInputChange(questionID, index, text, "RESET");
                      } else {
                        handleTextInputChange(questionID, index, text, "SINGLE");
                      }
                    }}
                  />
                ) : (
                  <TouchablePlatform
                    key={index}
                    style={[
                      styles.optionButton,
                      imageLocation ? { backgroundColor: COLORS.white } : {}, // Set background to white if imageLocation exists
                      allowMultipleSelection &&
                      Array.isArray(selectedOptions[0]) &&
                      selectedOptions[0].length > 0
                        ? selectedOptions[0].includes(`${index}`) && {
                            borderColor: colors_list[colorIndex],
                          }
                        : selectedOptions[0] === index && {
                            borderColor: colors_list[colorIndex],
                          },

                      allowMultipleSelection &&
                      Array.isArray(selectedOptions[0]) &&
                      selectedOptions[0].length > 0
                        ? selectedOptions[0].includes(`${index}`) && {
                            borderColor: colors_list[colorIndex],
                          }
                        : selectedOptions[0] === index && {
                            borderColor: colors_list[colorIndex],
                          },
                    ]}
                    onPress={() =>
                      handleOptionPress(0, index, allowMultipleSelection)
                    }
                  >
                    {imageLocation && (
                      <View>
                      {imageLoading && (
                        <Loading />
                      )}
                      <Image
                        source={{ uri: `https://yul1.qualtrics.com/API/v3/ControlPanel/Graphic.php?IM=${option.ImageLocation}` }}
                        style={{
                          width: '100%',
                          maxWidth: 100,
                          maxHeight: 500,
                          height: undefined,
                          aspectRatio: 0.5,
                        }}
                        resizeMode="contain"
                        onLoad={handleImageLoad}
                      />
                    </View>
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        allowMultipleSelection &&
                        Array.isArray(selectedOptions[0]) &&
                        selectedOptions[0].length > 0
                          ? selectedOptions[0].includes(`${index}`) &&
                            styles.selectedText
                          : selectedOptions[0] === index && styles.selectedText,
                      ]}
                    >
                      {option["Display"]}
                    </Text>
                  </TouchablePlatform>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  } else if (QuestionType === "DB") {
    questionsUI = (
      <View>
        <Text style={[styles.questionText, textOffsetStyle]}>
          {stripHtmlTags(questionDetails["QuestionText"])}
        </Text>
      </View>
    );
  }

  return questionsUI;
};

//Styling for the questionUI
const styles = StyleSheet.create({
  button: {
    padding: 10, // Adjust the padding as needed
    backgroundColor: "#007BFF", // Customize the background color
    borderRadius: 5, // Optional: Rounded corners
    alignItems: "center", // Center the text horizontally
  },
  buttonText: {
    color: COLORS.black, // Text color
    fontSize: 16, // Font size
  },
  container: {
    paddingBottom: 40,
  },
  questionBox: {
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    fontFamily: FONTS.survey_font_bold,
    color: COLORS.white,
    paddingBottom: 20,
  },
  subQuestionText: {
    fontSize: 20,
    fontFamily: FONTS.survey_font_bold,
    paddingHorizontal: 0,
    paddingBottom: 10,
    color: COLORS.white,
  },
  questionContainer: {
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  optionButton: {
    padding: 4,
    margin: 2,
    borderWidth: 2,
    borderRadius: 20,
    minHeight: 70,
    minWidth: 110,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light_grey4,
  },
  optionText: {
    fontSize: 17,
    fontFamily: FONTS.survey_font_bold,
    color: COLORS.white,
  },
  selectedText: {
    fontSize: 17,
    fontFamily: FONTS.survey_font_bold,
    color: COLORS.white,
  },
  sliderText: {
    fontSize: 30,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: FONTS.survey_font_bold,
    color: COLORS.white,
  },
  textInput: {
    padding: 4,
    margin: 2,
    borderWidth: 2,
    borderRadius: 20,
    minHeight: 70,
    minWidth: 110,
    borderColor: "gray",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    color: COLORS.almost_white,
    fontSize: 17,
    fontFamily: FONTS.survey_font_bold,
    fontColor: COLORS.almost_white,
  },
});

export default RenderQuestionUI;
