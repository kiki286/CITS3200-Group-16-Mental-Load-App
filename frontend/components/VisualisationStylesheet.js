import { StyleSheet } from 'react-native';

// Styles used in all components
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#000',
    },
    bar_container: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#000',
        marginTop: -30,
    },
    pie_container: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#000',
        marginTop: -30,
        justifyContent: 'center',
    },
    linecontainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#000',
        marginTop: -30,
    },
    chart_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginRight: 30,
    },
    chartTitle: {
        fontSize: 22,
        color: 'white',
        marginBottom: 30,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    legend: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    legend_container: {
        alignItems: 'center',
    },
    legendContainerPie: {
        marginTop: -5, 
        alignItems: 'flex-start',
    },
    legendContainerStack: {
        alignItems: 'flex-start',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginTop: 3,
    },
    legendColorBox: {
        width: 15,
        height: 15,
        marginRight: 5,
    },
    legendText: {
        color: 'white',
        fontSize: 14,
    },
    stackedChartYAxisLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stackedChartXAxisLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center', // Center the X-axis label
    },
    lineGraphYAxisLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    y_axis_box: {
        flexDirection: 'column',
        justifyContent: 'center',
        transform: [{ rotate: '-90deg' }], // Rotate the label 90 degrees to the left
        marginHorizontal: -40,
    },
    lineGraphXAxisLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center', // Center the X-axis label
    },
    highestDimensionText: {
        fontSize: 20,
        color: 'white', 
        textAlign: 'center',
        fontWeight: 'bold'
    }
});

export default styles;