//CITS3200 project group 23 2024
//Functions that handle fetching survey and parsing the question types

import React, { createContext, useState, useEffect } from "react";
import { fetchSurveyData } from "../services/SurveyFetcher";
import { ResponseSender } from "../services/ResponseSender";
import { auth } from "../firebase/Config";

// Create the context
export const SurveyContext = createContext();

// Create the provider component
export const SurveyProvider = ({ children }) => {
  //Hooks for storing survey details
  const [qualSurvey, setQualSurvey] = useState(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [questionsID, setQuestionsID] = useState([]); /// Ordered List of QID's
  const [questionDetails, setQuestionDetails] = useState("");
  const [allQuestionDetails, setAllQuestionDetails] = useState([]);
  const [uidQuestionId, setUidQuestionID] = useState(null);

  //Status hooks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Gets the survey from the BackEnd API and stores it in qualSurvey, also creates and array of question IDs and stores in questionsID
  const fetchSurvey = async (surveyType) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSurveyData(surveyType);

      if (!data || !data.result || !data.result.Questions) {
        throw new Error("Invalid survey data structure");
      }

      setQualSurvey(data);

      let ordered_QIDs = [];
      // Search for the "user_id" question directly in data.result.Questions
      Object.keys(data.result.Questions).forEach((questionID) => {
        const question = data.result.Questions[questionID];
        if (question.DataExportTag === "user_id") {
          setUidQuestionID(questionID);
        }
      });
      // Parse the survey flow to find which QIDs should be displayed
      data.result.SurveyFlow.Flow.forEach((flow) => {
        const block = data.result.Blocks[flow.ID];
        // Qualtrics doesn't accept responses for blocks not in the flow so we have to filter it out client-side
        if (block.Description !== "user_id") {
          block.BlockElements.forEach((question) => {
            if (question.QuestionID) {
              ordered_QIDs.push(question.QuestionID);
            }
          });
        }
      });
      const questions_ID = ordered_QIDs;

      if (questions_ID.length > 0) {
        setQuestionsID(questions_ID);
      } else {
        throw new Error("No questions found in the survey data");
      }
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred while fetching the survey"
      );
    } finally {
      setLoading(false);
    }
  };

  // Parsing Question details - Allowed question types: Matrix, Choices
  const parseQuestion = (currentQuestion) => {
    let parsedQuestionDetails = {}; // Initialize the object
    parsedQuestionDetails["QuestionText"] = currentQuestion["QuestionText"];
    parsedQuestionDetails["QuestionType"] = currentQuestion["QuestionType"];
    parsedQuestionDetails["QuestionID"] = currentQuestion["QuestionID"];
    parsedQuestionDetails["DataExportTag"] = currentQuestion["DataExportTag"];

    if (currentQuestion["DisplayLogic"]) {
      parsedQuestionDetails["DisplayLogic"] = currentQuestion["DisplayLogic"];
    }
    if (currentQuestion["ChoiceGroups"]) {
      parsedQuestionDetails["ChoiceGroups"] = currentQuestion["ChoiceGroups"];
    }

    // The new json format swaps things around for Matrix questions. Parsing them here means that front-end code works the same
    if (currentQuestion && currentQuestion["QuestionType"] === "Matrix") {
      // Get matrix answers (I.e. Always, Often, Sometimes, Not very Often, Never)
      if (currentQuestion["Answers"]) {
        parsedQuestionDetails["Choices"] = Object.keys(
          currentQuestion["Answers"]
        ).map((key) => currentQuestion["Answers"][key]);
      }
      // Get matrix answer order
      if (currentQuestion["AnswerOrder"]) {
        parsedQuestionDetails["ChoiceOrder"] = currentQuestion["AnswerOrder"];
      }
      // Get matrix subquestions (stored in Choices)
      if (currentQuestion["Choices"]) {
        parsedQuestionDetails["SubQuestions"] = Object.keys(
          currentQuestion["Choices"]
        ).map((key) => currentQuestion["Choices"][key]);
      }
      // Get matrix subquestion order (stored in ChoiceOrder)
      if (currentQuestion["ChoiceOrder"]) {
        parsedQuestionDetails["SubQuestionOrder"] =
          currentQuestion["ChoiceOrder"];
      }
    } else if (
      currentQuestion &&
      currentQuestion["QuestionType"] === "Slider"
    ) {
      // Get slider configuration details
      const config = currentQuestion["Configuration"];
      parsedQuestionDetails["MinValue"] = config["CSSliderMin"];
      parsedQuestionDetails["MaxValue"] = config["CSSliderMax"];
      parsedQuestionDetails["QuestionDescription"] =
        currentQuestion["QuestionDescription"];
      // Get subquestions (stored in Choices)

      if (currentQuestion["Choices"]) {
        parsedQuestionDetails["SubQuestions"] = Object.keys(
          currentQuestion["Choices"]
        ).map((key) => currentQuestion["Choices"][key]);
      }
      // Get subquestion order (stored in ChoiceOrder)
      if (currentQuestion["ChoiceOrder"]) {
        parsedQuestionDetails["SubQuestionOrder"] =
          currentQuestion["ChoiceOrder"];
      }
    } else {
      // For non-matrix type questions
      // Get question choices (answers)
      if (currentQuestion["Choices"]) {
        parsedQuestionDetails["Selector"] = currentQuestion["Selector"];
        //Initialize an array to hold the parsed choices
        const choicesArray = [];
        //Loops through each choice and assigns it a true if it is a text entry type - for displaying textinput in MC type Qs
        Object.keys(currentQuestion["Choices"]).forEach((key) => {
          const choice = currentQuestion["Choices"][key];
          const ImageLocation = choice.Image ? choice.Image.ImageLocation : "";
          if (choice.TextEntry === "true") {
            choicesArray.push({
              Display: choice.Display,
              TextEntry: true,
            });
          } else {
            choicesArray.push({
              Display: choice.Display,
              ImageLocation: ImageLocation,
              TextEntry: false,
            });
          }
        });
        // Assign the parsed choices to the parsedQuestionDetails object
        parsedQuestionDetails["Choices"] = choicesArray;
      }
      // Get question choice order
      if (currentQuestion["ChoiceOrder"]) {
        parsedQuestionDetails["ChoiceOrder"] = currentQuestion["ChoiceOrder"];
      }
    }

    return parsedQuestionDetails; // Return the parsed details
  };

  //Gets next question from the qualsurvey and incremements the current questoin number
  const getNextQuestion = () => {
    if (qualSurvey && questionNum < questionsID.length) {
      const nextQuestionDetails = parseQuestion(
        qualSurvey.result.Questions[questionsID[questionNum]]
      );

      setQuestionDetails(nextQuestionDetails);
      setQuestionNum((prev) => prev + 1);
    } else if (!qualSurvey) {
      setError("Survey data is not available.");
    } else {
      setQuestionDetails(null);
    }
  };

  //sending response to ResponseSender Service
  const sendResponse = async (qualResponse, surveyType) => {
    responseObj = {};
    responseObj["responses"] = {};
    const user = auth.currentUser;
    if (uidQuestionId && user) {
      responseObj["responses"][`${uidQuestionId}_TEXT`] = user.uid;
    }
    // Merge qualResponse['responses'] into responseObj['responses']. We can't just use = as this will overwrite the QID
    responseObj["responses"] = {
      ...responseObj["responses"], // Keep the existing properties in responseObj["responses"]
      ...qualResponse, // Add the properties from qualResponse["responses"]
    };
    // sending the response
    data = await ResponseSender(responseObj, surveyType);

    if (!data) {
      throw new Error(data.error.errorMessage);
    }

    return data;
  };

  const getAllQuestions = () => {
    if (qualSurvey) {

      const allDetails = questionsID.map((questionID) => {
        // Parse each question and store the details
        return parseQuestion(qualSurvey.result.Questions[questionID]);
      });
      // Update state with all question details
      setAllQuestionDetails(allDetails);
    } else {
      setError("Survey data is not available.");
    }
  };

  // Fetch survey on component mount
  //useEffect(() => {
  //  fetchSurvey(surveyType);
  //}, []);

  // Trigger getNextQuestion only after questionsID has been set
  useEffect(() => {
    if (questionsID.length > 0) {
      getNextQuestion();
      getAllQuestions();
    }
  }, [questionsID]);

  return (
    <SurveyContext.Provider
      value={{
        qualSurvey,
        loading,
        error,
        questionDetails,
        getNextQuestion,
        questionNum,
        questionsID,
        getAllQuestions,
        fetchSurvey,
        sendResponse,
        allQuestionDetails,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};
