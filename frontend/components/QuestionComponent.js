//CITS3200 project group 23 2024
//Component that displays checkin survey

//Imports
import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
} from "react-native";
import TouchablePlatform from './TouchablePlatform';
import { SurveyContext } from "../context/SurveyContext";
import { Loading, Error } from "./Messages";
import {
  appendResponseToFile,
  getStoredData,
} from "../services/StorageHandler";
import { ResponseSender } from "../services/ResponseSender";
import COLORS from "../constants/colors";
import FONTS from "../constants/fonts";
import Button from "./Buttons/Button_Light_Blue";
import { ArrowForwardCircleOutline } from 'react-ionicons';
import RenderQuestionUI from "./RenderQuestionUI";
import { updateCurrentUser } from "firebase/auth";

//Component which displays each question
const QuestionComponent = ({ demoSubmit, backNavigate }) => {
  const {
    qualSurvey,
    loading,
    error,
    questionDetails,
    getNextQuestion,
    questionsID,
    questionNum,
    sendResponse,
    fetchSurvey,
  } = useContext(SurveyContext);

  //Fetch survey on component mount
  useEffect(() => {
    fetchSurvey("checkin");
  }, []);

  // Store selected options as an object, where keys are subquestion indices (or just the question itself for non-Matrix types)
  const [inputValues, setInputValues] = useState({}); //For textInputs
  const [selectedOptions, setSelectedOptions] = useState({});
  // stores responses for each question
  const [responses, setResponses] = useState({});
  const [qualResponses, setQualResponses] = useState({});

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sliderValues, setSliderValues] = useState({});

  // Ref to the scrollview component
  const scrollViewRef = useRef();

  // Animated value for fading effect
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // List of colours to loop through for each question
  const colors_list = [COLORS.yellow, COLORS.pink, COLORS.blue];
  const [colorIndex, setColorIndex] = useState(0);
  const wordColorMap = {
    worker: COLORS.purple,
    home: COLORS.orange,
    work: COLORS.purple,
  };

  // Function to increment the color index
  const ColorButtonInc = () => {
    setColorIndex((prevIndex) => (prevIndex + 1) % colors_list.length);
    return colors_list[colorIndex];
  };

  ///UNCOMMENT THIS WHEN DEPLOYING
  // Reset selectedOptionIndex when questionDetails changes (i.e., a new question is loaded)

  useEffect(() => {
    setSelectedOptions({});
    setSliderValues({});
  }, [questionDetails]);

  // Log the responses object when it gets updatede
  //useEffect(() => {
  //  console.log("Responses:", responses);
  //}, [responses]);
  //useEffect(() => {
  //  console.log("qualResponses:", qualResponses);
  //}, [qualResponses]);

  // Function to handle option selection by index
  const handleOptionPress = (subQuestionIndex, optionIndex, allowMultipleSelection) => {
    
    setSelectedOptions((prev) => {
      // Check if current selections are an array, if not initialize as an empty array
      const currentSelections = Array.isArray(prev[subQuestionIndex]) ? prev[subQuestionIndex] : [];
      // If multiple selection is allowed
      if (allowMultipleSelection) {
        optionIndex = `${optionIndex}`
        // If the option is already selected, remove it
        if (currentSelections.includes(optionIndex)) {
          return {
            ...prev,
            [questionID]: currentSelections.filter((index) => index !== optionIndex),
          };
        } else {
          // Add the option to the selected array
          return {
            ...prev,
            [subQuestionIndex]: [...currentSelections, optionIndex],
          };
        }
      } else {
        // If multiple selections are not allowed, just store the single selected option
        return {
          ...prev,
          [subQuestionIndex]: optionIndex,
        };
      }
    });
  };

  //Function for handling textInput changes
  const handleTextInputChange = (questionID, index, text, type) => {
    if (type == "RESET") {
      setSelectedOptions({})
      setInputValues(prev => ({
        ...prev,
        [questionDetails["QuestionID"]]: text, // Set text for the current questionID
      }));
    } else if (type == "SINGLE") {
      setInputValues(prev => ({
        ...prev,
        [questionDetails["QuestionID"]]: text, // Set text for the current questionID
      }));
    } else {
      setInputValues(prev => ({
      ...prev,
        [questionID]: {
          ...prev[questionID],//Preserve existing values
          [index]: text,
        },
      }));
    }
  };
  // For tracking the value of slider type question
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    // Clear selected options
    setSelectedOptions({});
    if (questionDetails && questionDetails["QuestionType"] === "Slider") {
      // Set initial slider value based on minimum value
      setSliderValue(questionDetails["MinValue"]);
    }
    // checking conditional flow in display logic
    if (questionDetails && questionDetails["DisplayLogic"]) {
      // str stores conditional flow of the questions
      const str = questionDetails["DisplayLogic"]["0"]["0"]["LeftOperand"];
      const operator = questionDetails["DisplayLogic"]["0"]["0"]["Operator"];

      const regex = /QID(\d+)\/(\w+)\/(\d+)/;
      // extracting the qid and value from the regex
      const match = str.match(regex);

      if (match) {
        const qid = match[1];
        const value = match[3];
        // checking if the value of previous question is equal to value needed to display this question
        if (operator == "GreaterThanOrEqual" && (qualResponses["QID" + qid]) < value) {
          getNextQuestion();
        }
        if (!(responses["QID" + qid] + 1 == value) && operator != "GreaterThanOrEqual") {
          //if not equal, then don't display this question and get next question
          getNextQuestion();
        }
      }
    }
  }, [questionDetails]);

  // Handles next question button. Stores values to responses, and calls getNextQuestion
  const handleNextQuestion = () => {
    const questionID = questionDetails["QuestionID"];
    const QuestionType = questionDetails["QuestionType"];
      let newResponses = {};

      if (QuestionType !== 'DB') {
          const allResponsesFilled =
              (questionDetails["QuestionType"] === "Matrix" &&
                  questionDetails["SubQuestions"].every((_, subIndex) => {
                      return selectedOptions[subIndex] !== undefined;
                  })) ||
              (questionDetails["QuestionType"] === "Slider" && sliderValue !== undefined) ||
              (questionDetails["QuestionType"] !== "Matrix" &&
                  selectedOptions[0] !== undefined || inputValues[questionID] !== undefined);

          if (!allResponsesFilled) {
              // Optionally, you can alert the user or show a message
              alert("Please answer all questions before proceeding.");
              return; // Stop execution if any response is undefined
          }
      }

    // To send to qual
    setResponses((prevResponses) => {
      let updatedResponses = { ...prevResponses };
      // to send to qual
      // If it's a Matrix question
      if (questionDetails["QuestionType"] === "Matrix") {
        const subResponses = {};
        questionDetails["SubQuestions"].forEach((_, subIndex) => {
          subResponses[subIndex] = selectedOptions[subIndex];
        });
        updatedResponses[questionID] = subResponses;
      } else if (questionDetails["QuestionType"] === "Slider") {
        //Retrieve just the value from the slider visual object
        const values = Object.values(sliderValues);
        if (values.length === 0) { // This is disgusting but it works. Handles sliders that haven't been interacted with
          updatedResponses[questionID] = questionDetails['MinValue']
        } else if (values.length === 1) {
          updatedResponses[questionID] = values[0]
        } else {
          //Store index number at the end of question ID if more than 1 slider in a question
          values.forEach((values, index) => {
            const updatedKey = `${questionID}_${index}`;
            updatedResponses[updatedKey] = values
          });
        }
      } else {
        // Non-matrix questions
        updatedResponses[questionID] = selectedOptions[0];
        newResponses = updatedResponses;
      }

      return updatedResponses;
    });
    setQualResponses((prevResponses) => {
      let updatedResponses = { ...prevResponses };
      // to send to qual
      // If its text entry (inputValues)
      if (Object.values(inputValues)[0] != undefined) {
        if ("undefined" in inputValues) { // multiple text edit options (children age)
        const entries = Object.entries(inputValues["undefined"]) //Couldn't get the questionID to append to the array so had to specify undefined
        entries.forEach(([index, answer]) => {
          index = +index + 1 //convert index to number from str
          const updatedIndex = `${questionID}_${index}`;
            updatedResponses[updatedIndex] = answer})
        } else { // single text edit option
          const choicesWithTextEntry = [];
          Object.keys(questionDetails["Choices"]).forEach((key) => {
            const choice = questionDetails["Choices"][key];
            if (choice.TextEntry == true) {
              choicesWithTextEntry.push(+key+1);
              updatedIndex = `${questionID}_${choicesWithTextEntry}_TEXT`;
              updatedResponses[updatedIndex] = Object.values(inputValues)[0]
              if (questionDetails["Selector"] != "MACOL") {
                updatedResponses[questionID] = choicesWithTextEntry[0]
              }
            }
        })}
      }
      // If it's a Matrix question
      if (selectedOptions["0"] !== undefined || questionDetails["QuestionType"] === "Slider") {
        if (questionDetails["QuestionType"] === "Matrix") {
          questionDetails["SubQuestions"].forEach((_, subIndex) => {
            if (selectedOptions[subIndex] !== undefined) {
              updatedResponses[`${questionID}_${subIndex + 1}`] =
                selectedOptions[subIndex] + 1;
            }
          });
        } else if (questionDetails["QuestionType"] === "Slider") {
          const values = Object.values(sliderValues);
          if (values.length === 0) {
            const updatedKey = `${questionID}_1`
            updatedResponses[updatedKey] = questionDetails["MinValue"]
          } else if (values.length === 1) {
            const updatedKey = `${questionID}_1`; // store a 1 index at the end of single slider questions
              updatedResponses[updatedKey] = values[0]
            if (questionDetails["DataExportTag"] === "NumOfChildren"){ //Used for the 'age of your children' question to control the number of options displayed depending on users answer to "how many children do you have"
              AllornotAll = values[0]
            }
          } else {
            //Store index number at the end of question ID if more than 1 slider in a question
            values.forEach((values, index) => {
              const updatedKey = `${questionID}_${+index+1}`;
              updatedResponses[updatedKey] = values
            });
          }

        } else if (questionDetails["Selector"] === "MACOL") {
          // Multi-selector question
          updatedResponses[questionID] = [];
          selectedOptions[0].forEach(option => {
            updatedResponses[questionID].push(`${+option + 1}`)})
          if (Object.values(inputValues)[0] != undefined) {
            const choicesWithTextEntry = [];
            Object.keys(questionDetails["Choices"]).forEach((key) => {
              const choice = questionDetails["Choices"][key];
              if (choice.TextEntry == true) {
                updatedResponses[questionID].push(`${+key+1}`);
            }})
          }
        } else {
          // Non-matrix questions
          updatedResponses[questionID] = selectedOptions[0] + 1
          newResponses = updatedResponses;
        }
      }


      return updatedResponses;
    });

    setSelectedOptions({});
    setInputValues({});
    setSliderValues({});
    // Function to get next question
    getNextQuestion();
    // Calls function to increment the color value
    ColorButtonInc();
    // Sets the scroll location to the top
    scrollViewRef.current.scrollTo({ y: 0, animated: false });
  };

  // Function to handle the fade effect
  const fadeInOut = (callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade in
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out
        duration: 1000,
        delay: 2000, // Delay before fade out
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback(); // Call the callback after fade-out
    });
  };

  // Handles the submit survey button. Saves the survey response to cache, and submits to Qualtrics
  const handleSubmitCheckin = async () => {
    await appendResponseToFile(responses, qualSurvey);

    setIsSubmitted(true);

    const submitQualResponse = await sendResponse(qualResponses, "checkin");

    // This conditional makes it so that navigation does not happen if the survey has submitted properly to Qualtrics
    // From a UX perspective, it makes more sense to not care and move forward as long as the responses have saved locally instead
    //if (submitQualResponse.success) {
    //  setIsSubmitted(true);
    //}
    fadeInOut(() => {
      backNavigate(); // Navigate to home after fade out
    });
  };

  //let choiceComponents = null;
  let questionsUI = null;

  // Render the questionsUI in your return block
  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        paddingBottom: 60,
        backgroundColor: COLORS.black,
        paddingTop: 30
      }}
    >
      {loading ? (
        <Loading />
      ) : error ? (
        <Error message={error} />
      ) : isSubmitted ? (
        // Static "Thanks for checking in!" message
        <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
          <Text style={{
              fontSize: 24,
              color: COLORS.white,
              fontFamily: FONTS.bold, // Assuming you have FONTS.bold defined
              textAlign: "center",
              marginTop: 50,
            }}>
            Thanks for checking in!
          </Text>
        </Animated.View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
        >
          <RenderQuestionUI
            questionDetails={questionDetails}
            questionID={questionsID[questionNum - 1]}
            sliderValues={sliderValues}
            setSliderValues={setSliderValues}
            handleTextInputChange={handleTextInputChange}
            selectedOptions={selectedOptions}
            handleOptionPress={handleOptionPress}
            wordColorMap={wordColorMap}
            colorIndex={colorIndex}
            colors_list={colors_list}
            inputValues={inputValues}
          />
          {questionDetails ? (
            <View style={{ paddingBottom: 20, paddingTop: 10 }}>
              <TouchablePlatform onPress={handleNextQuestion}>
                <ArrowForwardCircleOutline
                  color={COLORS.white}
                  height="80px"
                  width="80px"
                  style={{
                    top: 0,
                    alignSelf: "center",
                    backgroundColor: COLORS.black,
                  }}
                />
              </TouchablePlatform>
            </View>
          ) : (
            <View style={{ paddingBottom: 20, paddingTop: 10 }}>
              <Button
                title="Submit"
                onPress={() => {
                  if (demoSubmit) {
                    demoSubmit();
                  } else {
                    handleSubmitCheckin();
                  }
                }}
              />
            </View>
          )}
          {/* Button to clear responses */}
          {/* <Button title="Clear Responses" onPress={handleClearResponses} /> */}
        </ScrollView>
      )}
    </View>
  );
};

//Styling for the component
const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
});
export default QuestionComponent;
