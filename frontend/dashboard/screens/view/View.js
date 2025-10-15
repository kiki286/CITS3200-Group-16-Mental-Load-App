//CITS3200 project group 16 2025
//Display the analytics obtained from submitting surveys
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import COLORS from "../../../constants/colors";
import FONTS from "../../../constants/fonts";
import { useFocusEffect } from "@react-navigation/native";
import { Loading } from "../../../components/Messages";
import PillButton from '../../../components/Buttons/PillButton';
import { ChevronBackOutline } from "react-ionicons";

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

const PAGES = [
  { key: 'MentalLoad', label: 'Overall line' },
  { key: 'Burnout', label: 'Burnout line' },
  { key: 'StackedBarHome', label: 'Home stacked' },
  { key: 'StackedBarWork', label: 'Work stacked' },
  { key: 'PieChartHome', label: 'Home pie' },
  { key: 'PieChartWork', label: 'Work pie' },
];

const screenWidth = Dimensions.get('window').width;

const View_Tab = ({ navigation }) => {
  const [selectedIndex, setSelectedIndex] = useState(0); // Default selected chart index
  const [timestamps, setTimestamps] = useState(null);
  const [homeML, setHomeML] = useState(null);
  const [workML, setWorkML] = useState(null);
  const [workData, setWorkData] = useState(null);
  const [burnoutValues, setBurnoutValues] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollRef = React.useRef(null);

  // Using useFocusEffect to run fetchData when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true); // Set loading to true before fetching
        const res = await processResponses();
        setTimestamps(res.timestamps || []);
        setHomeML(res.homeML || []);
        setWorkML(res.workML || []);
        setWorkData(res.workData || []);
        setBurnoutValues(res.burnoutValues || []);
        setLoading(false); // Set loading to false after fetching
      };
      fetchData();
    }, [])
  );

  const goToIndex = (i) => {
    setSelectedIndex(i);
    if (scrollRef.current?.scrollTo) {
      scrollRef.current.scrollTo({ x: i * screenWidth, animated: true });
    }
  };

  const renderChartByKey = (k) => {
    switch (k) {
      case "PieChartWork":
        return <PieChartExampleWork workML={workML} />;
      case "PieChartHome":
        return <PieChartExampleHome homeML={homeML} />;
      case "StackedBarWork":
        return <StackedBarChartWorkML workML={workML} timestamps={timestamps} />;
      case "StackedBarHome":
        return <StackedBarChartHomeML homeML={homeML} timestamps={timestamps} />;
      case "Burnout":
        return (
          <BurnoutLineChart
            burnoutValues={burnoutValues}
            workData={workData}
            timestamps={timestamps}
          />
        );
      case "MentalLoad":
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

  let content = null;

  if (loading) {
    content = (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <ActivityIndicator size="large" color={COLORS.black} />
      </View>
    );
  } else if (!timestamps || timestamps.length === 0) {
    content = (
      <>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={styles.backHitbox}
          >
            <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
          </TouchableOpacity>
          <Text style={styles.title}> Analytics </Text>
        </View>

        {/* Empty State */}
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Do your first check in to see your stats!
            </Text>
          </View>
          <PillButton
            title="Back to Dashboard"
            variant="neutral"
            onPress={() => navigation.navigate('Dashboard')}
          />
        </View>
      </>
    );
  } else {
    content = (
      <>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={styles.backHitbox}
          >
            <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
          </TouchableOpacity>
          <Text style={styles.title}> Analytics </Text>
        </View>

        {/* Pager dots */}
        <View style={styles.dotsRow}>
          {PAGES.map((p, i) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.dot, i === selectedIndex ? styles.dotActive : styles.dotInactive]}
              onPress={() => goToIndex(i)}
            />
          ))}
        </View>

        {/* Horizontal ScrollView for charts */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            if (i !== selectedIndex) {
              setSelectedIndex(i);
            }
          }}
        >
          {PAGES.map((p) => (
            <View key={p.key} style={{ width: screenWidth }}>
              <View style={styles.chartWrap}>{renderChartByKey(p.key)}</View>
            </View>
          ))}
        </ScrollView>
      </>
    );
  }

  // --- Web wrapper: native div with overflow scrolling ---
  if (Platform.OS === 'web') {
    return (
      <div style={{
        height: '100dvh',
        width: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: COLORS.white,
        touchAction: 'pan-y',
      }}>
        <div style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 12,
          paddingBottom: 120,
          minHeight: '100dvh',
        }}>
          {content}
        </div>
      </div>
    );
  }

  // --- Native: vertical ScrollView wrapper ---
  return (
    <View style={styles.page}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        alwaysBounceVertical
      >
        {content}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    ...(Platform.OS === 'web' ? { touchAction: 'pan-y' } : null),
    backgroundColor: COLORS.white,
  },
  pageContent: {
    minHeight: Platform.OS === 'web' ? '100dvh' : '100%',
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backHitbox: { padding: 4, marginRight: 8 },
  title: {
    fontSize: 24,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
  },

  // Dots
  dotsRow: {
    display: "flex",
    justifySelf: "center",
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  dot: {
    width: 28,
    height: 6,
    borderRadius: 3,
  },
  dotInactive: { backgroundColor: COLORS.light_grey },
  dotActive: { backgroundColor: COLORS.light_blue4 },

  // Main content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
    justifyContent: 'space-between',
  },
  chartWrap: {
    paddingHorizontal: 10,
    paddingBottom: 12,
    paddingTop: 4,
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    textAlign: 'center',
  },
});

export default View_Tab;
