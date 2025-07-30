//CITS3200 project group 23 2024
//Functions to handle creating response object and submitting to Qualtrics

import * as FileSystem from 'expo-file-system';
import { ResponseSender } from "./ResponseSender";

//Sample file:
//{
//  {"demographics":{},"responses":{"2024-09-13T04:41:02.538Z":{"timestamp":"2024-09-12T04:41:02.538Z","response":{"Home_ML":{"Deciding":21,"Planning":12,"Monitoring":10,"Knowing":14},"Work_ML":{"Deciding":3,"Planning":6,"Monitoring":9,"Knowing":12},"Work":{"DidWork":0,"HoursWorked":0},"burnout":2}},"2024-09-13T04:41:07.872Z":{"timestamp":"2024-09-13T04:41:07.872Z","response":{"Home_ML":{"Deciding":19,"Planning":13,"Monitoring":5,"Knowing":14},"Work_ML":{"Deciding":3,"Planning":19,"Monitoring":9,"Knowing":13},"Work":{"DidWork":1,"HoursWorked":5},"burnout":3}}}}
//}

// Path to store the responses file
const fileUri = FileSystem.documentDirectory + 'userData.json';

// Default data structure
const defaultData = {
  demographics: {
    demographicsSubmitted: false
  },
  responses: {},
};

// Function to check if the file exists, and if not, create it with default values
const ensureFileExists = async () => {
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  
  if (!fileInfo.exists) {
    // File doesn't exist, so create it with default data
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(defaultData, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });
    console.log('File created with default values');
  }
};

export const setDemographicsSubmit = async () => {
  try {
    await ensureFileExists();

    let userData = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    }); 
    userData = JSON.parse(userData);

    userData.demographics.demographicsSubmitted = true;

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(userData, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch (error) {
    console.error('Error setting demo flag:', error);
  }
};

// Function to append a new survey response
export const appendResponseToFile = async (newResponse, qualSurvey) => {
  try {
    await ensureFileExists();
    // Read the existing data from the file (if it exists)
    let fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    }); 

    let userData = JSON.parse(fileContent);

    // Initialize processedResponse with default values
    processedResponse = {
      "Home_ML": {
        "Deciding": 0,
        "Planning": 0,
        "Monitoring": 0,
        "Knowing": 0
      },
      "Work_ML": {
        "Deciding": 0,
        "Planning": 0,
        "Monitoring": 0,
        "Knowing": 0
      },
      "Work": {
        "DidWork": 0,
        "HoursWorked": 0
      },
      "burnout": 0
    };
    for (const key in newResponse) {
      const questionData = getQuestionData(key, qualSurvey);
      if (!questionData) {
        continue
      }
      //This is dealing with pulling out the values that we need for storage
      switch (questionData.DataExportTag) {
        case "Home_ML":
          // We add 3 to this as the scale is 1-7 instead of 0-6
          processedResponse["Home_ML"]["Deciding"] = Number(newResponse[key]["0"]) + Number(newResponse[key]["1"]) + Number(newResponse[key]["2"]) + 3;
          processedResponse["Home_ML"]["Planning"] = Number(newResponse[key]["3"]) + Number(newResponse[key]["4"]) + Number(newResponse[key]["5"]) + 3;
          processedResponse["Home_ML"]["Monitoring"] = Number(newResponse[key]["6"]) + Number(newResponse[key]["7"]) + Number(newResponse[key]["8"]) + 3;
          processedResponse["Home_ML"]["Knowing"] = Number(newResponse[key]["9"]) + Number(newResponse[key]["10"]) + Number(newResponse[key]["11"]) + 3;
          break;
        case "Work_ML":
          // We add 3 to this as the scale is 1-7 instead of 0-6
          processedResponse["Work_ML"]["Deciding"] = Number(newResponse[key]["0"]) + Number(newResponse[key]["1"]) + Number(newResponse[key]["2"]) + 3;
          processedResponse["Work_ML"]["Planning"] = Number(newResponse[key]["3"]) + Number(newResponse[key]["4"]) + Number(newResponse[key]["5"]) + 3;
          processedResponse["Work_ML"]["Monitoring"] = Number(newResponse[key]["6"]) + Number(newResponse[key]["7"]) + Number(newResponse[key]["8"]) + 3;
          processedResponse["Work_ML"]["Knowing"] = Number(newResponse[key]["9"]) + Number(newResponse[key]["10"]) + Number(newResponse[key]["11"]) + 3;
          break;
        case "Work":

          // 0 is no, 1 is yes
          processedResponse["Work"]["DidWork"] = newResponse[key];
          break;
        case "Work_Hours":
          // Sets HoursWorked to response, or 0 if null/undefined
          processedResponse["Work"]["HoursWorked"] = newResponse[key] ?? 0;
          break;
        case "Burnout" :
          processedResponse["burnout"] = newResponse[key];
          break;
      }
    }

    // Get the current timestamp
    const timestamp = new Date().toISOString();

    // Add the new response under the timestamp
    userData.responses[timestamp] = {
      timestamp: timestamp,
      response: processedResponse
    };

    // Save the updated data back to the file
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(userData, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log('Response appended to file:', fileUri);
  } catch (error) {
    console.error('Error appending response:', error);
  }
};

export const getQuestionData = (questionID, qualSurvey) => {
  return qualSurvey.result.Questions[questionID];
}

// Function to read the responses from the local file
export const getStoredData = async () => {
  try {
    await ensureFileExists();
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Parse the content into a JSON object
    const responses = JSON.parse(fileContent);
    //console.log('Running getStoredData. Responses read from file:', JSON.stringify(responses));
    return responses;
  } catch (error) {
    console.error('Error reading responses:', error);
    return null;
  }
};

export const getDemographicsSubmitted = async () => {
  try {
    await ensureFileExists();
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Parse the content into a JSON object
    const userData = JSON.parse(fileContent);
    return userData.demographics.demographicsSubmitted ?? false;
  } catch (error) {
    console.error('Error reading demographicsSubmitted:', error);
    return false; // Return false if an error occurs
  }
}

// Function to return the most recent response
export const getLastResponse = async () => {
  try {
    await ensureFileExists();
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Parse the content into a JSON object
    const responses = JSON.parse(fileContent);
    //console.log('Running getLastResponse. Responses read from file:', JSON.stringify(responses));
    // Get the keys (timestamps) and sort them to find the latest one
    const responseKeys = Object.keys(responses.responses);
    const latestResponseKey = responseKeys.sort().pop();
    const latestResponse = responses.responses[latestResponseKey];

    return latestResponse;
  } catch (error) {
    console.error('Error reading responses:', error);
    return null;
  }
}

// Function to read the responses from the local file (Does not include demographics field)
export const getResponses = async () => {
  try {
    await ensureFileExists();
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Parse the content into a JSON object
    const responses = JSON.parse(fileContent);
    //console.log('Running getResponses. Responses read from file:', JSON.stringify(responses));
    return responses.responses;
  } catch (error) {
    console.error('Error reading responses:', error);
    return null;
  }
};

// Function to clear the saved responses
export const clearResponsesFile = async () => {
  try {
    await ensureFileExists();
    const clearedFileData = defaultData;
    clearedFileData.demographics.demographicsSubmitted = true;
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(clearedFileData, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log('Responses file cleared.');
  } catch (error) {
    console.error('Error clearing responses:', error);
  }
};
