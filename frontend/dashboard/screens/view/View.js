// CITS3200 project group 16 2025
// Display the analytics obtained from submitting surveys (no user scrolling)
// This screen shows multiple analytics charts in a horizontal "pager".
// User scrolling is disabled: navigation happens via pager dots only.

import React, { useState } from "react";
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
import PillButton from "../../../components/Buttons/PillButton";
import { ChevronBackOutline } from "react-ionicons";

// Chart imports (each chart is wrapped later with `styles.chartCenter` to keep it centered)
import {
  MentalLoadLineChart,
  BurnoutLineChart,
  StackedBarChartHomeML,
  StackedBarChartWorkML,
  PieChartExampleHome,
  PieChartExampleWork,
} from "../../../components/VisualisationComponent";
import { processResponses } from "../../../components/VisualisationPreProcessing";

// Order of pages displayed in the horizontal pager
const PAGES = [
  { key: "MentalLoad", label: "Overall line" },
  { key: "Burnout", label: "Burnout line" },
  { key: "StackedBarHome", label: "Home stacked" },
  { key: "StackedBarWork", label: "Work stacked" },
  { key: "PieChartHome", label: "Home pie" },
  { key: "PieChartWork", label: "Work pie" },
];

// Used to calculate the x-offset when programmatically scrolling pages
const screenWidth = Dimensions.get("window").width;

const View_Tab = ({ navigation }) => {
  // --- View state ---
  const [selectedIndex, setSelectedIndex] = useState(0);   // current page index
  const [timestamps, setTimestamps] = useState(null);      // x-axis labels / dates
  const [homeML, setHomeML] = useState(null);              // home mental-load data
  const [workML, setWorkML] = useState(null);              // work mental-load data
  const [workData, setWorkData] = useState(null);          // work day flags / metadata
  const [burnoutValues, setBurnoutValues] = useState(null);// burnout chart values
  const [loading, setLoading] = useState(true);            // spinner while loading

  // Ref to control horizontal pager via code (since user scrolling is disabled)
  const scrollRef = React.useRef(null);

  // --- Load data whenever this screen gets focus ---
  // Using useFocusEffect ensures fresh data when coming back to this screen.
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        const res = await processResponses();

        // Fallback to empty arrays to avoid undefined errors in charts
        setTimestamps(res.timestamps || []);
        setHomeML(res.homeML || []);
        setWorkML(res.workML || []);
        setWorkData(res.workData || []);
        setBurnoutValues(res.burnoutValues || []);
        setLoading(false);
      };
      fetchData();
    }, [])
  );

  // --- Jump to a specific pager index (triggered by tapping a dot) ---
  // We programmatically scroll the horizontal ScrollView even though user scroll is disabled.
  const goToIndex = (i) => {
    setSelectedIndex(i);
    if (scrollRef.current?.scrollTo) {
      scrollRef.current.scrollTo({ x: i * screenWidth, animated: true });
    }
  };

  // --- Render the chart component for a given page key ---
  // Each chart is wrapped with `styles.chartCenter` to keep it centered and constrained on large screens.
  const renderChartByKey = (k) => {
    switch (k) {
      case "PieChartWork":
        return (
          <View style={styles.chartCenter}>
            <PieChartExampleWork workML={workML} />
          </View>
        );
      case "PieChartHome":
        return (
          <View style={styles.chartCenter}>
            <PieChartExampleHome homeML={homeML} />
          </View>
        );
      case "StackedBarWork":
        return (
          <View style={styles.chartCenter}>
            <StackedBarChartWorkML workML={workML} timestamps={timestamps} />
          </View>
        );
      case "StackedBarHome":
        return (
          <View style={styles.chartCenter}>
            <StackedBarChartHomeML homeML={homeML} timestamps={timestamps} />
          </View>
        );
      case "Burnout":
        return (
          <View style={styles.chartCenter}>
            <BurnoutLineChart
              burnoutValues={burnoutValues}
              workData={workData}
              timestamps={timestamps}
            />
          </View>
        );
      case "MentalLoad":
      default:
        return (
          <View style={styles.chartCenter}>
            <MentalLoadLineChart
              timestamps={timestamps}
              homeML={homeML}
              workML={workML}
            />
          </View>
        );
    }
  };

  // --- Build content based on loading & data presence ---
  let content = null;

  // 1) Loading state
  if (loading) {
    content = (
      <View style={styles.centerFill}>
        <ActivityIndicator size="large" color={COLORS.black} />
      </View>
    );
  }
  // 2) Empty state (no check-in yet)
  else if (!timestamps || timestamps.length === 0) {
    content = (
      <>
        {/* Header with back button and title */}
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

        {/* Empty state body (non-scroll) */}
        <View style={styles.contentNoScroll}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Do your first check in to see your stats!
            </Text>
          </View>
          <PillButton
            title="Back to Dashboard"
            variant="neutral"
            onPress={() => navigation.navigate("Dashboard")}
          />
        </View>
      </>
    );
  }
  // 3) Normal state with data
  else {
    content = (
      <>
        {/* Header with back button and title */}
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

        {/* Pager dots — centered; used to navigate between pages (no user scrolling) */}
        <View style={[styles.dotsRow, { justifyContent: 'center', alignItems: 'center' }]}>
          {PAGES.map((p, i) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.dot,
                i === selectedIndex ? styles.dotActive : styles.dotInactive,
              ]}
              onPress={() => goToIndex(i)}
            />
          ))}
        </View>

        {/* Horizontal pager:
            - horizontal + pagingEnabled gives page snapping
            - scrollEnabled={false} disables USER swiping
            - we still control position via scrollRef.scrollTo() (see goToIndex)
            - indicator hidden for a cleaner look */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}               // <— disable user scroll
          showsHorizontalScrollIndicator={false}
          // If you later re-enable user scroll, this keeps state in sync with swipes:
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            if (i !== selectedIndex) setSelectedIndex(i);
          }}
        >
          {PAGES.map((p) => (
            <View key={p.key} style={styles.pageSlide}>
              {/* Per-page container: keeps content centered */}
              <View style={styles.slideInner}>
                {/* Chart wrapper (adds padding and centers the chart block) */}
                <View style={styles.chartWrap}>{renderChartByKey(p.key)}</View>
                {/* Optional page label under each chart */}
                <Text style={styles.pageLabel}>{p.label}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </>
    );
  }

  // --- Web: Non-scrollable wrapper ---
  // overflow: 'hidden' prevents scrolling and hides scrollbars.
  // touchAction: 'none' stops touch panning on touch devices/browsers.
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          height: "100dvh",
          width: "100%",
          overflow: "hidden",        // disable scroll + hide scrollbar
          WebkitOverflowScrolling: "auto",
          backgroundColor: COLORS.white,
          touchAction: "none",       // prevent pan/scroll gestures
        }}
      >
        <div
          style={{
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 12,
            paddingBottom: 24,       // slightly smaller bottom padding to fit
            minHeight: "100dvh",
            maxWidth: 1200,          // prevent overly wide lines on desktop
            margin: "0 auto",        // center the column
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  // --- Native: Non-scrollable vertical container ---
  // Replace outer ScrollView with a regular View so the user cannot scroll vertically.
  return (
    <View style={styles.page}>
      <View style={styles.pageContentNoScroll}>
        {content}
      </View>
    </View>
  );
};

/* ----------------------------- Styles ----------------------------- */
const styles = StyleSheet.create({
  // Root page container (native)
  page: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Non-scroll content wrapper (fills the screen; no vertical scroll)
  pageContentNoScroll: {
    flex: 1,
    minHeight: Platform.OS === "web" ? "100dvh" : "100%",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },

  // Centered filler used for the loading state
  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // Header (back button + title)
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backHitbox: { padding: 4, marginRight: 8 },
  title: {
    fontSize: 24,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
  },

  // Pager dots row (full width so we can center it on all screen sizes)
  dotsRow: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
    gap: 8, // if your RN version lacks 'gap', use marginHorizontal in `.dot`
  },
  dot: {
    width: 28,
    height: 6,
    borderRadius: 3,
  },
  dotInactive: { backgroundColor: COLORS.light_grey },
  dotActive:   { backgroundColor: COLORS.light_blue4 },

  // Each horizontal page must be exactly screen width for paging to snap correctly
  pageSlide: {
    width: screenWidth,
    paddingHorizontal: 0,
  },

  // Inner page content; keeps the chart and label centered
  slideInner: {
    width: "100%",
    minHeight: 320,
    paddingVertical: 8,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Non-scroll empty state layout
  contentNoScroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
    justifyContent: "space-between",
  },

  // Chart container with consistent padding; centers the chart block
  chartWrap: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 4,
    alignItems: "center",
  },

  // Limits chart width on large displays and keeps it centered
  chartCenter: {
    width: "100%",
    maxWidth: 900,
    alignItems: "center",
    justifyContent: "center",
  },

  // Optional small label under each chart page
  pageLabel: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.grey || "#888",
    fontFamily: FONTS.main_font,
    textAlign: "center",
  },

  // Empty state text
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    textAlign: "center",
  },
});

export default View_Tab;
