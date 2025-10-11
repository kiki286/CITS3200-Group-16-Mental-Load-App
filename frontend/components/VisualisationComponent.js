import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';
// Importing mock data arrays
//import { homeML, workML, timestamps, burnoutValues, workData } from './exampledata';
import styles from './VisualisationStylesheet';
import { getResponses } from '../services/StorageHandler';

const dimensionColors = {
  Deciding: '#FF6384',
  Planning: '#36A2EB',
  Monitoring: '#FFCE56',
  Knowing: '#4BC0C0',
};

/** ====== Extra: helper to center content ====== */
const CENTER = { alignItems: 'center', justifyContent: 'center', alignSelf: 'center', width: '100%' };

const calculateAverages = (data) => {
  const totals = { Deciding: 0, Planning: 0, Monitoring: 0, Knowing: 0 };
  data.forEach((entry) => {
    totals.Deciding += entry.Deciding;
    totals.Planning += entry.Planning;
    totals.Monitoring += entry.Monitoring;
    totals.Knowing += entry.Knowing;
  });
  return {
    Deciding: totals.Deciding / data.length,
    Planning: totals.Planning / data.length,
    Monitoring: totals.Monitoring / data.length,
    Knowing: totals.Knowing / data.length,
  };
};

const prepareStackedBarData = (data, timestamps) => {
  return data.slice(-7).map((entry, index) => ({
    stacks: [
      { value: entry.Deciding, color: '#FF6384' },
      { value: entry.Planning, color: '#36A2EB', marginBottom: 2 },
      { value: entry.Monitoring, color: '#FFCE56', marginBottom: 2 },
      { value: entry.Knowing, color: '#4BC0C0', marginBottom: 2 },
    ],
    label: `${new Date(timestamps.slice(-7)[index]).getDate() + 1}/${new Date(
      timestamps.slice(-7)[index],
    ).getMonth()}`,
  }));
};

/* ========== WORK STACKED BAR ========== */
const StackedBarChartWorkML = ({ workML, timestamps }) => {
  const stackData = prepareStackedBarData(workML, timestamps);
  return (
    <View style={[styles.bar_container, CENTER]}>
      <Text style={styles.chartTitle}>Mental Load per Dimension at Work</Text>

      <View style={[styles.chart_container, { alignSelf: 'center' }]}>
        <View style={styles.y_axis_box}>
          <Text style={styles.stackedChartYAxisLabel}>Mental Load</Text>
        </View>

        {/* center the chart holder */}
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <BarChart
            width={300}
            height={250}
            noOfSections={4}
            stackData={stackData}
            barWidth={40}
            spacing={20}
            yAxisTextStyle={{ color: 'white' }}
            xAxisLabelTextStyle={{ color: 'white', fontSize: 12 }}
            barBorderRadius={2}
            isAnimated={true}
            animationDuration={500}
          />
          <Text style={styles.stackedChartXAxisLabel}>Time</Text>
        </View>
      </View>

      <View style={[styles.legendContainerStack, { alignSelf: 'center' }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#FF6384' }]} />
          <Text style={styles.legendText}>Deciding</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#36A2EB' }]} />
          <Text style={styles.legendText}>Planning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#FFCE56' }]} />
          <Text style={styles.legendText}>Monitoring</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#4BC0C0' }]} />
          <Text style={styles.legendText}>Knowing</Text>
        </View>
      </View>
    </View>
  );
};

/* ========== HOME STACKED BAR ========== */
const StackedBarChartHomeML = ({ homeML, timestamps }) => {
  const stackData = prepareStackedBarData(homeML, timestamps);
  return (
    <View style={[styles.bar_container, CENTER]}>
      <Text style={styles.chartTitle}>Mental Load per Dimension at Home</Text>

      <View style={[styles.chart_container, { alignSelf: 'center' }]}>
        <View style={styles.y_axis_box}>
          <Text style={styles.stackedChartYAxisLabel}>Mental Load</Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <BarChart
            width={300}
            height={250}
            noOfSections={4}
            stackData={stackData}
            barWidth={40}
            spacing={20}
            yAxisTextStyle={{ color: 'white' }}
            xAxisLabelTextStyle={{ color: 'white', fontSize: 12 }}
            barBorderRadius={2}
            isAnimated={true}
            animationDuration={500}
          />
          <Text style={styles.stackedChartXAxisLabel}>Time</Text>
        </View>
      </View>

      <View style={[styles.legendContainerStack, { alignSelf: 'center' }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#FF6384' }]} />
          <Text style={styles.legendText}>Deciding</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#36A2EB' }]} />
          <Text style={styles.legendText}>Planning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#FFCE56' }]} />
          <Text style={styles.legendText}>Monitoring</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#4BC0C0' }]} />
          <Text style={styles.legendText}>Knowing</Text>
        </View>
      </View>
    </View>
  );
};

/* ========== PIE HOME ========== */
const PieChartExampleHome = ({ homeML }) => {
  const averages = calculateAverages(homeML);
  const pieData = [
    { value: averages.Deciding, color: '#FF6384', text: 'Deciding' },
    { value: averages.Planning, color: '#36A2EB', text: 'Planning' },
    { value: averages.Monitoring, color: '#FFCE56', text: 'Monitoring' },
    { value: averages.Knowing, color: '#4BC0C0', text: 'Knowing' },
  ];
  const maxDimension = Object.keys(averages).reduce((a, b) => (averages[a] > averages[b] ? a : b));

  return (
    <View style={[styles.pie_container, CENTER]}>
      <View style={[styles.chart_container2, CENTER]}>
        <PieChart
          data={pieData}
          donut
          radius={170}
          innerRadius={95}
          focusOnPress
          isAnimated
          innerCircleColor={'black'}
          innerCircleBorderWidth={2}
          showTextBackground
          centerLabelComponent={() => (
            <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
              Home Mental Load Averages
            </Text>
          )}
        />

        <View style={[styles.legend_container, { alignItems: 'center' }]}>
          <View style={[styles.legendContainerPie, { alignSelf: 'center' }]}>
            {pieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.text}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.highestDimensionText, { textAlign: 'center' }]}>
            On average, your mental load is the highest when{' '}
            <Text style={{ color: dimensionColors[maxDimension], fontWeight: 'bold' }}>
              {maxDimension.charAt(0).toUpperCase() + maxDimension.slice(1)}
            </Text>
            .
          </Text>
        </View>
      </View>
    </View>
  );
};

/* ========== PIE WORK ========== */
const PieChartExampleWork = ({ workML }) => {
  const averages = calculateAverages(workML);
  const pieData = [
    { value: averages.Deciding, color: '#FF6384', text: 'Deciding' },
    { value: averages.Planning, color: '#36A2EB', text: 'Planning' },
    { value: averages.Monitoring, color: '#FFCE56', text: 'Monitoring' },
    { value: averages.Knowing, color: '#4BC0C0', text: 'Knowing' },
  ];
  const maxDimension = Object.keys(averages).reduce((a, b) => (averages[a] > averages[b] ? a : b));

  return (
    <View style={[styles.pie_container, CENTER]}>
      <View style={[styles.chart_container2, CENTER]}>
        <PieChart
          data={pieData}
          donut
          radius={170}
          innerRadius={95}
          focusOnPress
          isAnimated
          innerCircleColor={'black'}
          innerCircleBorderWidth={2}
          showTextBackground
          centerLabelComponent={() => (
            <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
              Work Mental Load Averages
            </Text>
          )}
        />

        <View style={[styles.legend_container, { alignItems: 'center' }]}>
          <View style={[styles.legendContainerPie, { alignSelf: 'center' }]}>
            {pieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={[styles.highestDimensionText, { textAlign: 'center' }]}>
        On average, your mental load is the highest when{' '}
        <Text style={{ color: dimensionColors[maxDimension], fontWeight: 'bold' }}>
          {maxDimension.charAt(0).toUpperCase() + maxDimension.slice(1)}
        </Text>
        .
      </Text>
    </View>
  );
};

/* ========== BURNOUT LINE ========== */
const BurnoutLineChart = ({ burnoutValues, workData, timestamps }) => {
  const lastSevenDays = burnoutValues.slice(-7);
  const lastSevenWorkData = workData.slice(-7);

  const lineData = lastSevenDays.map((value, index) => ({
    value,
    label: formatDate(timestamps.slice(-7)[index]),
    didWork: lastSevenWorkData[index].DidWork,
  }));

  const workedDays = lineData.filter((i) => i.didWork === 1).map((i) => i.value);
  const notWorkedDays = lineData.filter((i) => i.didWork === 0).map((i) => i.value);
  const averageWorked = workedDays.length ? workedDays.reduce((a, b) => a + b) / workedDays.length : 0;
  const averageNotWorked = notWorkedDays.length
    ? notWorkedDays.reduce((a, b) => a + b) / notWorkedDays.length
    : 0;
  const percentageDifference = averageNotWorked > 0 ? ((averageWorked - averageNotWorked) / averageNotWorked) * 100 : 0;

  return (
    <View style={[styles.linecontainer, CENTER]}>
      <Text style={styles.chartTitle}>Burnout Over Time</Text>

      <View style={[styles.chart_container, { alignSelf: 'center' }]}>
        <View style={styles.y_axis_box}>
          <Text style={styles.lineGraphYAxisLabel}>Burnout Level</Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <LineChart
            areaChart
            startFillColor="#FF6384"
            startOpacity={0.8}
            endFillColor="rgb(203, 241, 250)"
            endOpacity={0.3}
            data={lineData}
            width={300}
            height={280}
            xAxisColor="white"
            yAxisColor="white"
            xAxisLabelTextStyle={{ color: 'white', fontSize: 10 }}
            yAxisLabelTextStyle={{ color: 'white', fontSize: 10 }}
            dataPointsColor="white"
            isAnimated
            adjustToWidth
            hideDataPoints={false}
            thickness={3}
            color="#FF6384"
          />
          <Text style={styles.lineGraphXAxisLabel}>Time</Text>
        </View>
      </View>

      <Text style={[styles.highestDimensionText, { textAlign: 'center' }]}>
        On average, burnout is{' '}
        <Text style={{ color: '#FF6384', fontWeight: 'bold' }}>{percentageDifference.toFixed(2)}%</Text>
        {averageWorked > averageNotWorked ? ' higher' : ' lower'} on days worked compared to days not worked.
      </Text>
    </View>
  );
};

/* ========== MENTAL LOAD LINE (WORK vs HOME) ========== */
const calculateAverageMentalLoad = (data) => {
  const total = data.reduce((acc, entry) => acc + (entry.Deciding + entry.Planning + entry.Monitoring + entry.Knowing), 0);
  return total / data.length;
};

const MentalLoadLineChart = ({ timestamps, homeML, workML }) => {
  const lastSevenEntries = timestamps.slice(-7);
  const homeLastSeven = homeML.slice(-7);
  const workLastSeven = workML.slice(-7);

  const homeLineData = homeLastSeven.map((entry, index) => ({
    value: entry.Deciding + entry.Planning + entry.Monitoring + entry.Knowing,
    label: `${new Date(lastSevenEntries[index]).getMonth() + 1}/${new Date(lastSevenEntries[index]).getDate()}`,
  }));

  const workLineData = workLastSeven.map((entry, index) => ({
    value: entry.Deciding + entry.Planning + entry.Monitoring + entry.Knowing,
    label: `${new Date(lastSevenEntries[index]).getMonth() + 1}/${new Date(lastSevenEntries[index]).getDate()}`,
  }));

  const averageHome = calculateAverageMentalLoad(homeLastSeven);
  const averageWork = calculateAverageMentalLoad(workLastSeven);
  const higherLoadLocation = averageHome > averageWork ? 'Home' : 'Work';

  return (
    <View style={[styles.linecontainer, CENTER]}>
      <Text style={styles.chartTitle}>Mental Load Over Time (Work vs Home)</Text>

      <View style={[styles.legend, { alignSelf: 'center' }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: 'orange' }]} />
          <Text style={styles.legendText}>Home</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: 'purple' }]} />
          <Text style={styles.legendText}>Work</Text>
        </View>
      </View>

      <View style={[styles.chart_container, { alignSelf: 'center' }]}>
        <View style={styles.y_axis_box}>
          <Text style={styles.lineGraphYAxisLabel}>Mental Load</Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <LineChart
            data={homeLineData}
            data2={workLineData}
            width={300}
            height={250}
            thickness={4}
            thickness2={4}
            color="orange"
            color2="purple"
            dataPointsColor="white"
            dataPointsColor2="white"
            xAxisColor="white"
            yAxisColor="white"
            xAxisLabelTextStyle={{ color: 'white', fontSize: 10 }}
            yAxisLabelTextStyle={{ color: 'transparent', fontSize: 10 }}
            isAnimated
            adjustToWidth
            hideDataPoints={false}
            showSecondaryLine
            hideRules={false}
            showVerticalLines={false}
            yAxisThickness={1}
            xAxisThickness={1}
            showShadow={false}
          />
          <Text style={styles.lineGraphXAxisLabel}>Time</Text>
        </View>
      </View>

      <Text style={[styles.highestDimensionText, { textAlign: 'center' }]}>
        On average, your mental load is higher at{' '}
        <Text style={{ color: higherLoadLocation === 'Home' ? 'orange' : 'purple', fontWeight: 'bold' }}>
          {higherLoadLocation}
        </Text>
        .
      </Text>
    </View>
  );
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export {
  StackedBarChartWorkML,
  StackedBarChartHomeML,
  PieChartExampleHome,
  PieChartExampleWork,
  BurnoutLineChart,
  MentalLoadLineChart,
};
