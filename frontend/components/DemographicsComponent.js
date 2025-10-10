//CITS3200 project group 23 2024
//Component that shows and handles demographics survey

//Imports
import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Text,
} from "react-native";
import TouchablePlatform from './TouchablePlatform';
import { SurveyContext } from "../context/SurveyContext";
import { Loading, Error } from "./Messages";
import { setDemographicsSubmit, readResponsesFromFile, clearResponsesFile } from "../services/StorageHandler";
import Button from "./Buttons/Button_Light_Blue";
import COLORS from "../constants/colors";
import FONTS from "../constants/fonts";
import RenderQuestionUI from './RenderQuestionUI';
import { useNavigation } from "@react-navigation/native";
import PillButton from './Buttons/PillButton';
import { ArrowForwardCircleOutline, ChevronBackOutline } from 'react-ionicons';

// Component which displays each question from demographics survey
const DemographicsComponent = ({ demoSubmit, backNavigate }) => {
  const { 
  qualSurvey, 
  loading, 
  error, 
  questionDetails,
  getNextQuestion,
  questionsID,
  allQuestionDetails,
  sendResponse, 
  fetchSurvey, 
  } = useContext(SurveyContext);

  // Fetches the demographics survey on mount
  useEffect(() => {
    fetchSurvey("demographics");
  }, []);

  // Store selected options as an object
  const [inputValues, setInputValues] = useState({}); //For textInputs
  const [selectedOptions, setSelectedOptions] = useState({});
  const [responses, setResponses] = useState({});
  const [qualResponses, setQualResponses] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sliderValues, setSliderValues] = useState({});
  const [allOrNotAll, setAllOrNotAll] = useState(0);
  
  // Ref to the scrollview component
  const scrollViewRef = useRef();
  // Navigation hook must be called at top level of component (hooks rule)
  const navigation = useNavigation();
  
  // List of colours to loop through for each question
  const colors_list = [COLORS.yellow, COLORS.pink, COLORS.blue,];
  const [colorIndex, setColorIndex] = useState(0);
  // Map to 
  const wordColorMap = {
    worker: COLORS.orange,
    home: COLORS.orange,
    work: COLORS.purple,
  };
  
  // Function to increment the color index
  const ColorButtonInc = () => {
    setColorIndex(prevIndex => (prevIndex + 1) % colors_list.length)
    return colors_list[colorIndex]
  }

  const noConsent = () => {
    navigation.navigate("Login");
  }
  
  // Reset selectedOptions when allQuestionDetails changes
  useEffect(() => {
    setSelectedOptions({});
  }, [allQuestionDetails]);

  // Log the responses object when it gets updated
  //useEffect(() => {
  //  console.log("Responses:", responses);
  //}, [responses]);
  //useEffect(() => {
  //  console.log("qualResponses:", qualResponses);
  //}, [qualResponses]);

  const handleClearResponses = async () => {
    await clearResponsesFile();
  };

  // Function to handle option selection by index
  const handleOptionPress = (questionID, optionIndex, allowMultipleSelection) => {
    
    setSelectedOptions((prev) => {
      // Check if current selections are an array, if not initialize as an empty array
      const currentSelections = Array.isArray(prev[questionID]) ? prev[questionID] : [];
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
            [questionID]: [...currentSelections, optionIndex],
          };
        }
      } else {
        // If multiple selections are not allowed, just store the single selected option
        return {
          ...prev,
          [questionID]: optionIndex,
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
    if (questionDetails && questionDetails["QuestionType"] === "Slider") {
      // Set initial slider value based on minimum value
      setSliderValue(questionDetails["MinValue"]);
    }
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
        if (operator == "GreaterThanOrEqual" && (responses["QID" + qid]) < value) {
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
  const handleNextQuestion = async () => {
    let newResponses = {};
    const questionID = questionDetails["QuestionID"];
    const QuestionType = questionDetails["QuestionType"];
    if (QuestionType !== 'DB' && QuestionType !== 'TE' ) {
      const allResponsesFilled =
        (questionDetails["QuestionType"] === "Matrix" &&
         questionDetails["SubQuestions"].every((_, subIndex) => {
           return selectedOptions[subIndex] !== undefined;
         })) ||
        (questionDetails["QuestionType"] === "Slider" && sliderValue !== undefined) ||
        (questionDetails["QuestionType"] !== "Matrix" &&
         selectedOptions[0] !== undefined || inputValues[questionID] !== undefined);
      if (!allResponsesFilled) {
        alert("Please answer all questions before proceeding.");
        return; // Stop execution if any response is undefined
      }
    }

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
        //console.log(`Storing ${questionID}. Type is: ${questionDetails["QuestionType"]}. selectedOptions is ${JSON.stringify(selectedOptions)}. sliderValue is ${sliderValue}`)
        // Non-matrix questions
        updatedResponses[questionID] = selectedOptions[0];
        newResponses=updatedResponses;
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
              const childrenValue = values[0];
              setAllOrNotAll(childrenValue);
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
          if (questionDetails["DataExportTag"] == "PIC" && selectedOptions[0] == 1) {
            noConsent()
          }
          updatedResponses[questionID] = selectedOptions[0] + 1
          newResponses = updatedResponses;
        }
      }

      return updatedResponses;
    });

    setSelectedOptions({});
    setInputValues({});
    setSliderValues({});
    // Calls function to display next question
    getNextQuestion();
    // Calls function to change the color value for next question
    ColorButtonInc();
    // Sets the scroll back to the top (cross-platform fallback)
    try {
      // React Native ScrollView (mobile / web through react-native-web)
      if (scrollViewRef.current && typeof scrollViewRef.current.scrollTo === 'function') {
        // try object signature first
        try {
          scrollViewRef.current.scrollTo({ y: 0, animated: false });
        } catch (e) {
          // try numeric signature
          try {
            scrollViewRef.current.scrollTo(0);
          } catch (e) {
            // noop
          }
        }
      } else if (scrollViewRef.current && scrollViewRef.current.scrollTop !== undefined) {
        // DOM element (web) fallback
        scrollViewRef.current.scrollTop = 0;
      }
    } catch (e) {
      // ignore any scroll errors
      console.warn('scrollTo fallback failed', e);
    }
  };
  
  // Handles the submit survey button
  const handleSubmitSurvey = async () => {
    const submitQualResponse = await sendResponse(qualResponses, "demographics");
    await setDemographicsSubmit();
    if (submitQualResponse.success) {
      setIsSubmitted(true);
    }
    if (backNavigate) backNavigate();
    else navigation.goBack();
  }
  
  //let choiceComponents = null;
  //let questionsUI = null;

  // Render the questionsUI in your return block
  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <TouchablePlatform
          onPress={() => (backNavigate ? backNavigate() : navigation.goBack())}
          accessibilityRole="button"
          style={styles.backButtonHitbox}
        >
          <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
        </TouchablePlatform>
        <Text style={styles.title}>Demographics</Text>
      </View>

      {/* Content */}
      {loading ? (
        <Loading />
      ) : error ? (
        <Error message={error} />
      ) : (
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <RenderQuestionUI
              questionDetails={questionDetails}
              questionsID={questionsID}
              sliderValues={sliderValues}
              setSliderValues={setSliderValues}
              handleTextInputChange={handleTextInputChange}
              selectedOptions={selectedOptions}
              handleOptionPress={handleOptionPress}
              wordColorMap={wordColorMap}
              colorIndex={colorIndex}
              colors_list={colors_list}
              inputValues={inputValues}
              AllornotAll={allOrNotAll}
            />

            {/* Action area */}
            {questionDetails ? (
              <View style={styles.actions}>
                <PillButton
                  title="Next"
                  variant="primary"
                  onPress={handleNextQuestion}
                  fullWidth
                />
              </View>
            ) : (
              <View style={styles.actions}>
                <PillButton
                  title="Submit"
                  variant="primary"
                  onPress={() => {
                    if (demoSubmit) demoSubmit();
                    else handleSubmitSurvey();
                  }}
                  fullWidth
                />
              </View>
            )}
            </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 8,
  },
  backButtonHitbox: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 30,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 540,
    alignself: 'center',
  },
  actions: {
    marginTop: 16,
    marginBottom: 8,
  },
});

export default DemographicsComponent;