
export const myInvestmentOptions = {
  series: [],
  chart: {
  height: 500,
  type: 'area'
},
dataLabels: {
  enabled: false
},
stroke: {
  curve: 'smooth'
},
xaxis: {
  categories:  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
  'Oct', 'Nov', 'Dec']
},
tooltip: {
  x: {
    format: 'dd/MM/yy HH:mm'
  },
},
};

export default myInvestmentOptions
