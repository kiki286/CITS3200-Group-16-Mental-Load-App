import { getResponses } from '../services/StorageHandler';
//import testdata from './SampleStoredData'; // now stored in object unlike just the file before

export const processResponses = async () => {
  data = await getResponses()
  //data = await testdata;
  const timestamps = [];
  const homeML = [];
  const workML = [];
  const workData = [];
  const burnoutValues = [];

  // Loop over each response in the data
  Object.entries(data).forEach(([key, entry]) => {
    // Extract the timestamp
    timestamps.push(entry.timestamp);

    // Extract Home_ML data
    homeML.push({
      Deciding: entry.response.Home_ML.Deciding,
      Planning: entry.response.Home_ML.Planning,
      Monitoring: entry.response.Home_ML.Monitoring,
      Knowing: entry.response.Home_ML.Knowing,
    });

    // Extract Work_ML data
    workML.push({
      Deciding: entry.response.Work_ML.Deciding,
      Planning: entry.response.Work_ML.Planning,
      Monitoring: entry.response.Work_ML.Monitoring,
      Knowing: entry.response.Work_ML.Knowing,
    });

    // Extract Work data
    workData.push({
      DidWork: entry.response.Work.DidWork,
      HoursWorked: entry.response.Work.HoursWorked,
    });

    // Extract Burnout data
    burnoutValues.push(entry.response.burnout);
  });

  // Return the processed data
  return { timestamps, homeML, workML, workData, burnoutValues };
};
