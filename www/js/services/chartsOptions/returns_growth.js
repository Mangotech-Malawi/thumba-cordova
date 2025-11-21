export const returnsGrowthOptions = {
  series: [],
  chart: {
    height: 350,
    type: 'line'
  },
  forecastDataPoints: {
    count: 7
  },
  stroke: {
    width: 5,
    curve: 'smooth'
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'April', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    tickAmount: 10
  },
  title: {
    text: 'Returns Growth',
    align: 'left',
    style: {
      fontSize: '16px',
      color: '#666'
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      gradientToColors: ['#FDD835'],
      shadeIntensity: 1,
      type: 'horizontal',
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100, 100, 100]
    }
  },
  yaxis: {
    min: -10,
    max: 500000.00,
    forceNiceScale: true // Allow decimal values
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return `MK${Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2}).format(val)}`; // Display decimal places
      }
    }
  }
};

export default returnsGrowthOptions;
