import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';
// Importing mock data arrays
//import { homeML, workML, timestamps, burnoutValues, workData } from './exampledata';
import { getResponses } from '../services/StorageHandler';
import COLORS from '../constants/colors';
import FONTS from '../constants/fonts';

const dimensionColors = {
    Deciding: COLORS.red, // Color for Deciding
    Planning: COLORS.blue, // Color for Planning
    Monitoring: COLORS.yellow, // Color for Monitoring
    Knowing: COLORS.green, // Color for Knowing
};

const formatLabel = (ts) => {
  const d = new Date(ts);
  const mm = d.getMonth() + 1;     // months are 0-based
  const dd = d.getDate();          // NO +1 here
  return `${mm}/${dd}`;
};

// Calculating average mental load across all data
const calculateAverages = (data) => {
    if (!data?.length) return { Deciding: 0, Planning: 0, Monitoring: 0, Knowing: 0 };
    const totals = { Deciding: 0, Planning: 0, Monitoring: 0, Knowing: 0 };

    data.forEach(entry => {
        totals.Deciding += entry.Deciding || 0;
        totals.Planning += entry.Planning || 0;
        totals.Monitoring += entry.Monitoring || 0;
        totals.Knowing += entry.Knowing || 0;
    });

    return {
        Deciding: totals.Deciding / data.length,
        Planning: totals.Planning / data.length,
        Monitoring: totals.Monitoring / data.length,
        Knowing: totals.Knowing / data.length,
    };
};

// Preparing stack data for the chart
const prepareStackedBarData = (data = [], timestamps = []) => 
    data.slice(-7).map((entry, index) => ({
    stacks: [
        { value: entry.Deciding, color: dimensionColors.Deciding, marginBottom: 2 },
        { value: entry.Planning, color: dimensionColors.Planning, marginBottom: 2 },
        { value: entry.Monitoring, color: dimensionColors.Monitoring, marginBottom: 2 },
        { value: entry.Knowing, color: dimensionColors.Knowing, marginBottom: 2 },
    ],
    label: formatLabel(timestamps.slice(-7)[index]),
}));

/* ---------- components ---------- */
// Stacked Bar Chart: mental load per dimension at home over last 7 days
export const StackedBarChartWorkML = ({workML = [], timestamps = []}) => {
    const stackData = prepareStackedBarData(workML, timestamps); 

    return (
        <View style={styles.section}>
            <Text style={styles.chartTitle}>Mental Load per Dimension at Work</Text>
            {/* Stacked Bar Chart */}
            <View style={styles.chartRow}>
                <View style={[styles.yAxisBox, {height: 250}]}><Text style={styles.axisTitle}>Mental Load</Text></View>
                <View>
                    <BarChart
                        width={300}
                        height={250}
                        stackData={stackData}
                        barWidth={40}
                        spacing={20}
                        noOfSections={4}
                        yAxisTextStyle={styles.axisTick}
                        xAxisLabelTextStyle={styles.axisTick}
                        xAxisColor={COLORS.light_grey}
                        yAxisColor={COLORS.light_grey}
                        barBorderRadius={2}
                        isAnimated
                        animationDuration={500}
                    />
                    <Text style={styles.axisTitleX}>Time</Text>
                </View>
            </View>
            {/* Legend */}
            <View style={styles.legendRow}>
                {Object.entries(dimensionColors).map(([k, c]) => (
                    <View style={styles.legendItem} key={k}>
                        <View style={[styles.legendSwatch, { backgroundColor: c }]} />
                        <Text style={styles.legendText}>{k}</Text>
                    </View>
               ))}
            </View>
        </View>
    );
};

// Stacked Bar Chart: mental load per dimension at work over last 7 days
export const StackedBarChartHomeML = ({homeML = [], timestamps = []}) => {
    const stackData = prepareStackedBarData(homeML, timestamps); // Prepare the stack data

    return (
        <View style={styles.section}>
            <Text style={styles.chartTitle}>Mental Load per Dimension at Home</Text>
            
            
            {/* Stacked Bar Chart */}
            <View style={styles.chartRow}>
                <View style={[styles.yAxisBox, {height: 250}]}>
                    <Text style={styles.axisTitle}>Mental Load</Text>
                </View>
                <View>
                    <BarChart
                        width={300}
                        height={250}
                        stackData={stackData}
                        barWidth={40}
                        spacing={20}
                        noOfSections={4}
                        yAxisTextStyle={styles.axisTick}
                        xAxisLabelTextStyle={styles.axisTick}
                        xAxisColor={COLORS.light_grey}
                        yAxisColor={COLORS.light_grey}
                        barBorderRadius={2}
                        isAnimated
                        animationDuration={500}

                    />
                    <Text style={styles.axisTitleX}>Time</Text>
                </View>
            </View>
            {/* Legend */}
            <View style={styles.legendRow}>
                {Object.entries(dimensionColors).map(([k, c]) => (
                    <View style={styles.legendItem} key={k}>
                        <View style={[styles.legendSwatch, { backgroundColor: c }]} />
                        <Text style={styles.legendText}>{k}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

// PieChart for Home ML (average % per dimension all time)
export const PieChartExampleHome = ({homeML = []}) => {
    const averages = calculateAverages(homeML);

    const pieData = Object.keys(dimensionColors).map((k) => ({
        value: averages[k],
        color: dimensionColors[k],
        text: k,
    }));

    // Determine which dimension has the highest average
    const maxDimension = Object.keys(averages).reduce((a, b) => (averages[a] > averages[b] ? a : b));

    return (
        <View style={styles.section}>
            <View style={styles.pieRow}>
                <PieChart
                    data={pieData}
                    donut={true}
                    radius={170}
                    innerRadius={95}
                    focusOnPress
                    isAnimated={true}
                    innerCircleColor={COLORS.white}
                    innerCircleBorderWidth={1}
                    centerLabelComponent={() => (
                        <Text style={styles.pieCenter}>
                            Home Mental Load Averages
                        </Text>
                    )}
                />
                <View style = {styles.pieLegendCol}>
                    {pieData.map((item, i)=> (
                        <View key={i} style={styles.legendItem}>
                            <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
                            <Text style={styles.legendText}>{item.text}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <Text style={styles.insight}>
                On average, your mental load is the highest when{' '}
                <Text style={{ color: dimensionColors[maxDimension], fontFamily: FONTS.main_font_bold }}>
                    {maxDimension}
                </Text>
                .
            </Text>
        </View>

    );
};

// PieChart for Home ML (average % per dimension all time)
export const PieChartExampleWork = ({workML = []}) => {
    const averages = calculateAverages(workML);

    const pieData =  Object.keys(dimensionColors).map((k) => ({
        value: averages[k],
        color: dimensionColors[k],
        text: k,
    }));
    // Determines dimension with highest average for insight
    const maxDimension = Object.keys(averages).reduce((a, b) => (averages[a] > averages[b] ? a : b));
    const maxValue = averages[maxDimension];

    return (
        <View style={styles.section}>
            <View style={styles.pieRow}>
                <PieChart
                    data={pieData}
                    donut={true}
                    radius={170}
                    innerRadius={95}
                    focusOnPress
                    isAnimated={true}
                    innerCircleColor={COLORS.white}
                    innerCircleBorderWidth={1}
                    showTextBackground
                    centerLabelComponent={() => (
                        <Text style={styles.pieCenter}>
                            Work Mental Load Averages
                        </Text>
                    )}
                />
                <View style={styles.pieLegendCol}>
                    {pieData.map((item, i) => (
                        <View key={i} style={styles.legendItem}>
                            <View
                                style={[styles.legendSwatch, { backgroundColor: item.color }]}
                            />
                            <Text style={styles.legendText}>{item.text}</Text>
                        </View>
                ))}
                </View>
            </View>
            <Text style={styles.insight}>
                On average, your mental load is the highest when{' '}
                <Text style={{ color: dimensionColors[maxDimension], fontFamily: FONTS.main_font_bold }}>
                    {maxDimension}
                </Text>
                .
            </Text>
        </View>
    );
};


export const BurnoutLineChart = ({burnoutValues, workData, timestamps}) => {
    
    const lastSevenDays = burnoutValues.slice(-7);
    const lastSevenWorkData = workData.slice(-7);

    const lineData = lastSevenDays.map((value, index) => ({
        value,
        label: formatLabel(timestamps.slice(-7)[index]), // Format the last 7 timestamps
        didWork: lastSevenWorkData[index]?.DidWork, // Check if the user worked that day
    }));

    // Calculate averages for worked and not worked days
    const workedDays = lineData.filter(item => item.didWork === 1).map(item => item.value);
    const notWorkedDays = lineData.filter(item => item.didWork === 0).map(item => item.value);

    const averageWorked = workedDays.length ? (workedDays.reduce((a, b) => a + b) / workedDays.length) : 0;
    const averageNotWorked = notWorkedDays.length ? (notWorkedDays.reduce((a, b) => a + b) / notWorkedDays.length) : 0;

    // Calculate percentage difference
    const percentageDifference = averageNotWorked > 0 ? ((averageWorked - averageNotWorked) / averageNotWorked) * 100 : 0;
    return (
        <View style={styles.section}>
            <Text style={styles.chartTitle}>Burnout Over Time</Text>
            <View style={styles.chartRow}>
              {/* Y-axis Label */}
              <View style={[styles.yAxisBox, {height: 280}]}>
                <Text style={styles.axisTitle}>Burnout Level</Text>
              </View>
              <View>
                  <LineChart
                      areaChart 
                      startFillColor={COLORS.red}
                      startOpacity={0.8}
                      endFillColor="rgb(203, 241, 250)"
                      endOpacity={0.3}
                      data={lineData}
                      width={300}
                      height={280}
                      thickness={3}
                      color={COLORS.red}
                      xAxisColor={COLORS.light_grey}
                      yAxisColor={COLORS.light_grey}
                      xAxisLabelTextStyle={styles.axisTick}
                      yAxisLabelTextStyle={styles.axisTick}
                      dataPointsColor={COLORS.red}
                      isAnimated={true}
                      adjustToWidth={true}
                      hideDataPoints={false}
                  />
                  {/* X-axis Label */}
                  <Text style={styles.axisTitleX}>Time</Text>
              </View>
            </View>

            <Text style={styles.insight}>
                On average, burnout is <Text style={{ color: COLORS.red, fontFamily: FONTS.main_font_bold }}>{percentageDifference.toFixed(2)}%</Text>{' '}
                {averageWorked > averageNotWorked ? ' higher' : ' lower'} on days worked compared to days not worked.
            </Text>
        </View>
    );
};

const totalML = (e) => (e.Deciding + e.Planning + e.Monitoring + e.Knowing);

// Work vs Home Mental Load Line Chart (Last 7 days)
export const MentalLoadLineChart = ({timestamps = [], homeML = [], workML = []}) => {
    const lastSevenEntries = timestamps.slice(-7); 
    const homeLastSeven = homeML.slice(-7); 
    const workLastSeven = workML.slice(-7); 
    const homeData = homeLastSeven.map((e, i) => ({ value: totalML(e), label: formatLabel(lastSevenEntries[i]) }));
    const workData = workLastSeven.map((e, i) => ({ value: totalML(e), label: formatLabel(lastSevenEntries[i]) }));

    // Calculate averages for work and home
    const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const avgHome = avg(homeLastSeven.map(totalML));
    const avgWork = avg(workLastSeven.map(totalML));
    const higher = avgHome > avgWork ? 'Home' : 'Work';

    return (
        <View style={styles.section}>
            <Text style={styles.chartTitle}>Mental Load Over Time (Work vs Home)</Text>
            <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: COLORS.orange }]} />
                    <Text style={styles.legendText}>Home</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: COLORS.purple }]} />
                    <Text style={styles.legendText}>Work</Text>
                </View>
            </View>
            <View style={styles.chartRow}>
                <View style={[styles.yAxisBox, {height: 250}]}>
                  <Text style={styles.axisTitle}>Mental Load</Text>
                </View>
                <View>
                <LineChart
                    data={homeData} // Home mental load data
                    data2={workData} // Work mental load data
                    width={300} 
                    height={250} 
                    thickness={3.5} 
                    thickness2={3.5} 
                    color={COLORS.orange}
                    color2={COLORS.purple}
                    dataPointsColor={COLORS.orange}
                    dataPointsColor2={COLORS.purple}
                    xAxisColor={COLORS.light_grey} 
                    yAxisColor={COLORS.light_grey}
                    xAxisLabelTextStyle={styles.axisTick} 
                    yAxisLabelTextStyle={styles.axisTick} 
                    isAnimated={true} 
                    adjustToWidth={true} 
                    hideDataPoints={false} 
                    showSecondaryLine={true} 
                    hideRules={false} 
                    showVerticalLines={false} 
                    yAxisThickness={1} 
                    xAxisThickness={1} 
                    showShadow={false} 
                />
                <Text style={styles.axisTitleX}>Time</Text>
                </View>
            </View>
            <Text style={styles.insight}>
                On average, your mental load is higher at{' '}
                <Text style={{ color: higher === 'Home' ? COLORS.orange : COLORS.purple, fontFamily: FONTS.main_font_bold }}>
                    {higher}
                </Text>
                .
            </Text>
        </View>
    );
};


/* ---------- styles (light theme) ---------- */
const styles = StyleSheet.create({
  section: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    marginBottom: 8,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  yAxisBox: {
    width: 28,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  axisTitle: {
    transform: [{ rotate: '-90deg' }],
    fontSize: 12,
    color: COLORS.black,
    fontFamily: FONTS.main_font_bold,
    width: 120,
    textAlign: 'center',
  },
  axisTitleX: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.black,
    fontFamily: FONTS.main_font_bold,
    textAlign: 'center',
  },
  axisTick: {
    color: COLORS.black,
    fontSize: 10,
    fontFamily: FONTS.main_font,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieLegendCol: {
    marginLeft: 16,
  },
  pieCenter: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: FONTS.main_font_bold,
    textAlign: 'center',
    width: 120,
  },
  insight: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
  },
});
