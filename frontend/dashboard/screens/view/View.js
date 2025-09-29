import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import COLORS from "../../../constants/colors";
import FONTS from "../../../constants/fonts";
import { useFocusEffect } from "@react-navigation/native";
import { Loading } from "../../../components/Messages";
import Button from "../../../components/Buttons/Button";
import { ChevronBackOutline, LogOutOutline } from "react-ionicons";

// Chart imports
import {
  MentalLoadLineChart,
  BurnoutLineChart,
  StackedBarChartHomeML,
  StackedBarChartWorkML,
  PieChartExampleHome,
  PieChartExampleWork,
} from "../../../components/VisualisationComponent";
import { processResponses } from "../../../components/VisualisationPreProcessing";

const View_Tab = ({ navigation }) => {
  const [selectedChart, setSelectedChart] = useState("PieChartWork"); // Default selected chart
  const [timestamps, setTimestamps] = useState(null);
  const [homeML, setHomeML] = useState(null);
  const [workML, setWorkML] = useState(null);
  const [workData, setWorkData] = useState(null);
  const [burnoutValues, setBurnoutValues] = useState(null);
  const [loading, setLoading] = useState(true);

  // Using useFocusEffect to run fetchData when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true); // Set loading to true before fetching
        const { timestamps, homeML, workML, workData, burnoutValues } =
          await processResponses();
        setTimestamps(timestamps);
        setHomeML(homeML);
        setWorkML(workML);
        setWorkData(workData);
        setBurnoutValues(burnoutValues);
        setLoading(false); // Set loading to false after fetching
      };
      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (timestamps.length == 0) {
    return (
      <View style={styles.main_container}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronBackOutline
              color={COLORS.almost_white}
              height="28px"
              width="28px"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.title_container}>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <View style={styles.body_container}>
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              Do your first check in to see your stats!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Function to render the selected chart
  const renderChart = () => {
    switch (selectedChart) {
      case "PieChartWork":
        return <PieChartExampleWork workML={workML} />;
      case "PieChartHome":
        return <PieChartExampleHome homeML={homeML} />;
      case "StackedBarWork":
        return (
          <StackedBarChartWorkML workML={workML} timestamps={timestamps} />
        );
      case "StackedBarHome":
        return (
          <StackedBarChartHomeML homeML={homeML} timestamps={timestamps} />
        );
      case "Burnout":
        return (
          <BurnoutLineChart
            burnoutValues={burnoutValues}
            workData={workData}
            timestamps={timestamps}
          />
        );
      case "MentalLoad":
        return (
          <MentalLoadLineChart
            timestamps={timestamps}
            homeML={homeML}
            workML={workML}
          />
        );
      default:
        return (
          <MentalLoadLineChart
            timestamps={timestamps}
            homeML={homeML}
            workML={workML}
          />
        );
    }
  };

  return (
    <View style={styles.main_container}>
      <View style={styles.title_container}>
        <Text style={styles.title}>Analytics</Text>
      </View>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronBackOutline
            color={COLORS.almost_white}
            height="28px"
            width="28px"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.body_container}>
        {/* Buttons to switch charts in reverse order */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.dotButton,
              selectedChart === "MentalLoad" && styles.selectedButton,
            ]}
            onPress={() => setSelectedChart("MentalLoad")}
          />
          <TouchableOpacity
            style={[
              styles.dotButton,
              selectedChart === "Burnout" && styles.selectedButton,
            ]}
            onPress={() => setSelectedChart("Burnout")}
          />
          <TouchableOpacity
            style={[
              styles.dotButton,
              selectedChart === "StackedBarHome" && styles.selectedButton,
            ]}
            onPress={() => setSelectedChart("StackedBarHome")}
          />
          <TouchableOpacity
            style={[
              styles.dotButton,
              selectedChart === "StackedBarWork" && styles.selectedButton,
            ]}
            onPress={() => setSelectedChart("StackedBarWork")}
          />
          <TouchableOpacity
            style={[
              styles.dotButton,
              selectedChart === "PieChartHome" && styles.selectedButton,
            ]}
            onPress={() => setSelectedChart("PieChartHome")}
          />
          <TouchableOpacity
            style={[
              styles.dotButton,
              selectedChart === "PieChartWork" && styles.selectedButton,
            ]}
            onPress={() => setSelectedChart("PieChartWork")}
          />
        </View>

        {/* Render the selected chart */}
        <View style={{ flex: 0.8 }}>{renderChart()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  title_container: {
    position: "absolute",
    top: 20,
    left: 0, // Ensure the view takes the full width
    right: 0, // Ensure the view takes the full width
    alignItems: "center", // Center the text horizontally
    justifyContent: "center",
  },
  title: {
    fontSize: 50,
    fontFamily: FONTS.main_font_bold,
    color: COLORS.almost_white,
  },
  body_container: {
    flex: 1,
    marginTop: 100,
  },
  container: {
    flex: 0.1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  dotButton: {
    backgroundColor: COLORS.blue, // Default color for unselected dots
    width: 15, // Width of the dot
    height: 15, // Height of the dot
    borderRadius: 7.5, // Make it circular
    marginHorizontal: 5, // Space between dots
  },
  selectedButton: {
    backgroundColor: "white", // Color for the selected dot
  },
  emptyStateContainer: {
    flex: 0.7,
    paddingHorizontal: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 24,
    color: COLORS.almost_white,
    fontFamily: FONTS.main_font,
    textAlign: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
});

export default View_Tab;
