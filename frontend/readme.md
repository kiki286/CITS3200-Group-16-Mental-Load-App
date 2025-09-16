**Setup**

change .env to format of .env.example
change SurveyFetcher.js and ResponseSender.js to use address of Proxy server
run `npx expo start`

**Explanation**

Expo App Folder Structure:

- Hooks: all hooks which components would use
- Services: all api calls or utils used
- Context: API state management
- Firebase: firebase database config
- Components: reusable UI/UX components
- Screens : Different screens on the application
- Assets : For static assets e.g images and videos
- Dashboard: dashboard screen elements

**Sending back survey Response**

- Using the submit survey end point we formulate a response to the qualtrics API
- Field used in the response request is the **values** which takes in the the _question id_ of each question or sub question as the property and the _numerical value_ of the response

- **_Matrix_** sub question ids are formatted with the main question ID and the subquestion index "QID3_1" would be the first sub question of question 3

- Note: The **_slider_** question also takes this format for some reason, so to properly send the response to the slider we have to format the question id as "QIDX_1"

Sample Response:
`` bashrc
{
"values": {
// answers for matrix
"QID3_1": 6,
"QID3_2": 4,
"QID3_3": 6,
"QID3_4": 6,
"QID3_5": 6,

    //answers for mcq
    "QID7": 2,

    // answer for slider
    "QID13_1": 9,

    }

}
``
**Conditional Flow Explaination **

- Questions which conditional flow will contain DisplayLogic tag with an object indicating the condition it needs to be displayed
  Example of sample response for QID13 which depends on QID7 (QID7 does not have DisplayLogic Property)

` bashrc {
  "0": {
    "0": {
      "ChoiceLocator": "q://QID7/SelectableChoice/2",
      "Description": ...,
      "LeftOperand": "q://QID7/SelectableChoice/2",
      "LogicType": "Question",
      "Operator": "Selected",
      "QuestionID": "QID7",
      "QuestionIDFromLocator": "QID7",
      "Type": "Expression"
    },
    "Type": "If"
  },
  "Type": ...,
  "inPage": ..
}`

## Firebase Layout
/users/{uid}                // Private profile, always exists
   ├── fields:
   │    displayName
   │    avatarUrl
   │    notificationTime
   │    timezone
   │    isPublic: true|false
   │    latestScore (optional cache)
   │    latestScoreUpdatedAt
   │
   └── surveyResults/{resultId}      // One doc per completed survey
        ├── createdAt: timestamp
        └── scores:
             deciding:   { home: number, work: number }
             planning:   { home: number, work: number }
             monitoring: { home: number, work: number }
             knowing:    { home: number, work: number }

/publicProfiles/{uid}       // Optional public profile (only if user is searchable)
   ├── displayName
   ├── displayNameLower
   ├── avatarUrl
   ├── shareLatestScore: true|false
   ├── latestScore
   └── latestScoreUpdatedAt

/friendRequests/{id}        // Pending/declined/accepted requests
   ├── fromUid
   ├── toUid
   ├── status: "pending" | "accepted" | "declined"
   └── createdAt

/friendships/{id}           // Accepted two-way relationships
   ├── members: [uidA, uidB]
   └── since: timestamp
