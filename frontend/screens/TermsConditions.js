//CITS3200 project group 23 2024
//Component that displays terms and conditions

// TermsConditions.js
import React from "react";
import { View, ScrollView, Text, } from "react-native";
import { useRoute } from '@react-navigation/native';
import COLORS from "../constants/colors"; 
import Button from "../components/Buttons/Button_Green";

const TermsConditions = () => {
  const route = useRoute();
  const { onAgree } = route.params || {};
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.black}}>
    <ScrollView style={{ padding: 10 }}>
      <Text style={{ 
      fontSize: 20,
      margin: 18,
      color: COLORS.white }}>
        <Text style={{fontWeight: 'bold'}}>
        Emma Stephenson{"\n"}
        School of Psychological Science{"\n"}
        The University of Western Australia{"\n"}
        35 Stirling Highway, Crawley WA 6009{"\n"}
        Tel: 0427775419{"\n"}
        Email: emma.stephenson@uwa.edu.au{"\n"}
        </Text>
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Participant Information Form{"\n"}
        </Text>
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Project title:{"\n"} 
        </Text>
        Employee Experiences at Home and Work{"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Name of Researchers:{"\n"}
        </Text> 
        Emma Stephenson, 
        Professor Gillian Yeo, Associate Professor Serena Wee & Dr Laura Fruhen {"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Invitation:{"\n"}
        </Text>
        You are invited to participate in a study on employee wellbeing at home and work. 
        This study is being undertaken by Emma Stephenson under the supervision of 
        Professor Gillian Yeo, and Drs Laura Fruhen and Serena Wee at the University of Western Australia. {"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Aim of the Study (What is the project about?){"\n"}
        </Text>
        This study aims to investigate employee experiences at home and work that influence 
        wellbeing and other work-related outcomes.{"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        What does participation involve?{"\n"}
        </Text>
        If you decide to participate, you will be asked to complete a survey about your 
        experiences at home and work. You will also be asked to reflect on your level of 
        wellbeing and other work-related outcomes. To take part, you have to be over 18 
        years of age and engage in some form of paid work per week.{"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Voluntary Participation and Withdrawal from the Study{"\n"}
        </Text>
        Participation is voluntary. Your decision whether or not to participate will not 
        prejudice your future relations with The University of Western Australia. 
        Completion of the questionnaire is considered evidence of consent to participate 
        in the study. Participants can withdraw from the study at any time, without 
        giving an explanation. Please note that because your response to the survey 
        is not identifiable (see below), you will not be able to withdraw your data 
        after submitting the survey. Your participation in this study does not prejudice 
        any right to compensation, which you may have under statute or common law.{"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Your privacy{"\n"}
        </Text>
        The data will be collected and analyzed without regard to your identity 
        (i.e., you will not be required to provide information that can identify you). 
        Your responses will be linked using your Prolific ID. If the results from this 
        study are published, only high-level trends will be reported, and individual 
        responses will not be identifiable. The data will be kept in a de-identified 
        format, in a secure server for a minimum of seven years. {"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Possible Benefits{"\n"}
        </Text>
        Your responses will contribute to building knowledge in this area and your 
        contribution is greatly appreciated by the researchers.{"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Reimbursement{"\n"}
        </Text>
        For participating in this study, you will receive the rate specified on Prolific.{"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Possible Risks and Risk Management Plan{"\n"}
        </Text>
        Please note that this survey will ask you to reflect on your current 
        level of wellbeing and psychological distress. Although unlikely, 
        we acknowledge that some may find this confronting and/or upsetting. 
        If this is the case, you are free to withdraw at any time by exiting 
        the survey and encourage you to seek professional assistance. Additionally, 
        you can visit Beyond Blue at www.beyondblue.org.au or for crisis support, call Lifeline on 13 11 14.{"\n"}
        {"\n"}
        <Text style={{fontWeight: 'bold'}}>
        Contacts{"\n"}
        </Text>
        A summary of project results will be available in late 2023. 
        If you would like to receive a summary or discuss any aspect of this study, 
        please feel free to email emma.stephenson@uwa.edu.au
        Approval to conduct this research has been provided by the 
        University of Western Australia, in accordance with its ethics 
        review and approval procedures. Any person considering participation 
        in this research project, or agreeing to participate, may raise any 
        questions or issues with the researchers at any time. In addition, 
        any person not satisfied with the response of researchers may raise ethics 
        issues or concerns, and may make any complaints about this research project 
        by contacting the Human Ethics office at UWA on (08) 6488 3703 or by emailing 
        to humanethics@uwa.edu.au. All research participants are entitled to retain a 
        copy of any Participant Information Form and/or Participant Consent Form 
        relating to this research project.
      </Text>
      <View style={{ marginVertical: 20}}>
        <Button 
        title="Agree" 
        style = {{ marginBottom: 4}}
        onPress={() => {
          if (onAgree) {
            onAgree(); // Call the onAgree function if defined
          } else {
            console.log("onAgree function is not defined");
          }
        }}
        />
      </View>
    </ScrollView>
  </View>
  );
};

export default TermsConditions;
