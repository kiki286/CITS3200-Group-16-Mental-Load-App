import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';
// Importing mock data arrays
//import { homeML, workML, timestamps, burnoutValues, workData } from './exampledata';
import styles from './VisualisationStylesheet';
import { getResponses } from '../services/StorageHandler';

const dimensionColors = {
    Deciding: '#FF6384', // Color for Deciding
    Planning: '#36A2EB', // Color for Planning
    Monitoring: '#FFCE56', // Color for Monitoring
    Knowing: '#4BC0C0', // Color for Knowing
};

// Calculating average mental load across all data
const calculateAverages = (data) => {
    const totals = { Deciding: 0, Planning: 0, Monitoring: 0, Knowing: 0 };

    data.forEach(entry => {
        totals.Deciding += entry.Deciding;
        totals.Planning += entry.Planning;
        totals.Monitoring += entry.Monitoring;
        totals.Knowing += entry.Knowing;
    });

    const averages = {
        Deciding: totals.Deciding / data.length,
        Planning: totals.Planning / data.length,
        Monitoring: totals.Monitoring / data.length,
        Knowing: totals.Knowing / data.length,
    };

    return averages;
};

// Preparing stack data for the chart
const prepareStackedBarData = (data, timestamps) => {
    return data.slice(-7).map((entry, index) => ({
        stacks: [
            { value: entry.Deciding, color: '#FF6384' },
            { value: entry.Planning, color: '#36A2EB', marginBottom: 2 }, 
            { value: entry.Monitoring, color: '#FFCE56', marginBottom: 2 }, 
            { value: entry.Knowing, color: '#4BC0C0', marginBottom: 2 }, 
        ],
        label: `${new Date(timestamps.slice(-7)[index]).getDate() + 1}/${new Date(timestamps.slice(-7)[index]).getMonth()}`, // Format date as MM/DD
    }));
};

// Stacked Bar Chart: mental load per dimension at home over last 7 days
const StackedBarChartWorkML = ({workML, timestamps}) => {
    const stackData = prepareStackedBarData(workML, timestamps); 

    return (
        <View style={styles.bar_container}>
            <Text style={styles.chartTitle}>Mental Load per Dimension at Work</Text>
            {/* Stacked Bar Chart */}
            <View style={styles.chart_container}>
                <View style={styles.y_axis_box}>
                    <Text style={styles.stackedChartYAxisLabel}>Mental Load</Text>
                </View>
                <View>
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
            {/* Legend */}
            <View style={styles.legendContainerStack}>
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

// Stacked Bar Chart: mental load per dimension at work over last 7 days
const StackedBarChartHomeML = ({homeML, timestamps}) => {
    const stackData = prepareStackedBarData(homeML, timestamps); // Prepare the stack data

    return (
        <View style={styles.bar_container}>
            <Text style={styles.chartTitle}>Mental Load per Dimension at Home</Text>
            
            
            {/* Stacked Bar Chart */}
            <View style={styles.chart_container}>
                <View style={styles.y_axis_box}>
                    <Text style={styles.stackedChartYAxisLabel}>Mental Load</Text>
                </View>
                <View>
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
            {/* Legend */}
            <View style={styles.legendContainerStack}>
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

// PieChart for Home ML (average % per dimension all time)
const PieChartExampleHome = ({homeML}) => {
    const averages = calculateAverages(homeML);

    const pieData = [
        { value: averages.Deciding, color: '#FF6384', text: `Deciding` },
        { value: averages.Planning, color: '#36A2EB', text: `Planning` },
        { value: averages.Monitoring, color: '#FFCE56', text: `Monitoring` },
        { value: averages.Knowing, color: '#4BC0C0', text: `Knowing` },
    ];

    // Determine which dimension has the highest average
    const maxDimension = Object.keys(averages).reduce((a, b) => averages[a] > averages[b] ? a : b);
    const maxValue = averages[maxDimension];

    return (
        <View style={styles.pie_container}>
            <View style={styles.chart_container2}>
                <PieChart
                    data={pieData}
                    donut={true}
                    radius={170}
                    innerRadius={95}
                    focusOnPress
                    isAnimated={true}
                    innerCircleColor={'black'}
                    innerCircleBorderWidth={2}
                    showTextBackground
                    centerLabelComponent={() => (
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold', textAlign: 'center'}}>
                            Home Mental Load Averages
                        </Text>
                    )}
                />
                <View style = {styles.legend_container}>
                    <View style={styles.legendContainerPie}>
                        {pieData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View
                                    style={[styles.legendColorBox, { backgroundColor: item.color }]}
                                />
                                <Text style={styles.legendText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.highestDimensionText}>
                        On average, your mental load is the highest when{' '}
                        <Text style={{ color: dimensionColors[maxDimension], fontWeight: 'bold' }}>
                            {maxDimension.charAt(0).toUpperCase() + maxDimension.slice(1)}
                        </Text>.
                    </Text>
                </View>
            </View>
        </View>
    );
};

// PieChart for Home ML (average % per dimension all time)
const PieChartExampleWork = ({workML}) => {
    const averages = calculateAverages(workML);

    const pieData = [
        { value: averages.Deciding, color: '#FF6384', text: `Deciding` },
        { value: averages.Planning, color: '#36A2EB', text: `Planning` },
        { value: averages.Monitoring, color: '#FFCE56', text: `Monitoring` },
        { value: averages.Knowing, color: '#4BC0C0', text: `Knowing` },
    ];

    // Determines dimension with highest average for insight
    const maxDimension = Object.keys(averages).reduce((a, b) => averages[a] > averages[b] ? a : b);
    const maxValue = averages[maxDimension];

    return (
        <View style={styles.pie_container}>
            <View style={styles.chart_container2}>
                <PieChart
                    data={pieData}
                    donut={true}
                    radius={170}
                    innerRadius={95}
                    focusOnPress
                    isAnimated={true}
                    innerCircleColor={'black'}
                    innerCircleBorderWidth={2}
                    showTextBackground
                    centerLabelComponent={() => (
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold', textAlign: 'center'}}>
                            Work Mental Load Averages
                        </Text>
                    )}
                />
                <View style = {styles.legend_container}>
                    <View style={styles.legendContainerPie}>
                        {pieData.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View
                                    style={[styles.legendColorBox, { backgroundColor: item.color }]}
                                />
                                <Text style={styles.legendText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
            <Text style={styles.highestDimensionText}>
                On average, your mental load is the highest when{' '}
                <Text style={{ color: dimensionColors[maxDimension], fontWeight: 'bold' }}>
                    {maxDimension.charAt(0).toUpperCase() + maxDimension.slice(1)}
                </Text>.
            </Text>
        </View>
    );
};


const BurnoutLineChart = ({burnoutValues, workData, timestamps}) => {
    
    const lastSevenDays = burnoutValues.slice(-7);
    const lastSevenWorkData = workData.slice(-7);

    const lineData = lastSevenDays.map((value, index) => ({
        value,
        label: formatDate(timestamps.slice(-7)[index]), // Format the last 7 timestamps
        didWork: lastSevenWorkData[index].DidWork // Check if the user worked that day
    }));

    // Calculate averages for worked and not worked days
    const workedDays = lineData.filter(item => item.didWork === 1).map(item => item.value);
    const notWorkedDays = lineData.filter(item => item.didWork === 0).map(item => item.value);

    const averageWorked = workedDays.length ? (workedDays.reduce((a, b) => a + b) / workedDays.length) : 0;
    const averageNotWorked = notWorkedDays.length ? (notWorkedDays.reduce((a, b) => a + b) / notWorkedDays.length) : 0;

    // Calculate percentage difference
    const percentageDifference = averageNotWorked > 0 ? ((averageWorked - averageNotWorked) / averageNotWorked) * 100 : 0;
    return (
        <View style={styles.linecontainer}>
            <Text style={styles.chartTitle}>Burnout Over Time</Text>

            
            
            
            <View style={styles.chart_container}>
              {/* Y-axis Label */}
              <View style={styles.y_axis_box}>
                <Text style={styles.lineGraphYAxisLabel}>Burnout Level</Text>
              </View>
              <View>
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
                      isAnimated={true}
                      adjustToWidth={true}
                      hideDataPoints={false}
                      thickness={3}
                      color="#FF6384"
                  />
                  {/* X-axis Label */}
                  <Text style={styles.lineGraphXAxisLabel}>Time</Text>
              </View>
            </View>

            <Text style={styles.highestDimensionText}>
                On average, burnout is <Text style={{ color: '#FF6384', fontWeight: 'bold' }}>{percentageDifference.toFixed(2)}%</Text> 
                {averageWorked > averageNotWorked ? ' higher' : ' lower'} on days worked compared to days not worked.
            </Text>
        </View>
    );
};


const calculateAverageMentalLoad = (data) => {
    const total = data.reduce((acc, entry) => {
        return acc + (entry.Deciding + entry.Planning + entry.Monitoring + entry.Knowing);
    }, 0);
    return total / data.length;
};


// Work vs Home Mental Load Line Chart (Last 7 days)
const MentalLoadLineChart = ({timestamps, homeML,workML}) => {
    const lastSevenEntries = timestamps.slice(-7); 
    const homeLastSeven = homeML.slice(-7); 
    const workLastSeven = workML.slice(-7); 

    const homeLineData = homeLastSeven.map((entry, index) => ({
        value: entry.Deciding + entry.Planning + entry.Monitoring + entry.Knowing,
        label: `${new Date(lastSevenEntries[index]).getMonth() + 1}/${new Date(lastSevenEntries[index]).getDate()}`, // Format date as MM/DD
    }));

    const workLineData = workLastSeven.map((entry, index) => ({
        value: entry.Deciding + entry.Planning + entry.Monitoring + entry.Knowing,
        label: `${new Date(lastSevenEntries[index]).getMonth() + 1}/${new Date(lastSevenEntries[index]).getDate()}`, // Format date as MM/DD
    }));

    // Calculate averages for work and home
    const averageHome = calculateAverageMentalLoad(homeLastSeven);
    const averageWork = calculateAverageMentalLoad(workLastSeven);
    const higherLoadLocation = averageHome > averageWork ? "Home" : "Work";

    return (
        <View style={styles.linecontainer}>
            <Text style={styles.chartTitle}>Mental Load Over Time (Work vs Home)</Text>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: 'orange' }]} />
                    <Text style={styles.legendText}>Home</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: 'purple' }]} />
                    <Text style={styles.legendText}>Work</Text>
                </View>
            </View>
            <View style={styles.chart_container}>
                <View style={styles.y_axis_box}>
                  <Text style={styles.lineGraphYAxisLabel}>Mental Load</Text>
                </View>
                <View>
                <LineChart
                    data={homeLineData} // Home mental load data
                    data2={workLineData} // Work mental load data
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
                    isAnimated={true} // 
                    adjustToWidth={true} 
                    hideDataPoints={false} 
                    showSecondaryLine={true} 
                    hideRules={false} 
                    showVerticalLines={false} 
                    yAxisThickness={1} 
                    xAxisThickness={1} 
                    showShadow={false} 
                />
                <Text style={styles.lineGraphXAxisLabel}>Time</Text>
                </View>
            </View>
            <Text style={styles.highestDimensionText}>
                On average, your mental load is higher at{' '}
                <Text style={{ color: higherLoadLocation === 'Home' ? 'orange' : 'purple', fontWeight: 'bold' }}>
                    {higherLoadLocation}
                </Text>.
            </Text>
            
        </View>
    );
};

// Format function for date
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`; // Format as MM/DD
};


// All components
export { StackedBarChartWorkML, StackedBarChartHomeML, PieChartExampleHome, PieChartExampleWork, BurnoutLineChart, MentalLoadLineChart };
