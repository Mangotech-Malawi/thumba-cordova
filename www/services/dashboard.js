import { apiClient } from "./api-client.js";
import { sharesOptions } from "../services/chartsOptions/shares.js";
import { returnsInvestmentsOptions } from "../services/chartsOptions/returns_and_investments.js"
import { myInvestmentOptions } from "../services/chartsOptions/my_investments.js"
import { returnsGrowthOptions } from "../services/chartsOptions/returns_growth.js"
import { formatCurrency, formatMonetaryDecimal } from "../utils/formaters.js"

let nf = new Intl.NumberFormat('en-US');
let dashboardData;
$(function () {
  $(document).on("click", "#sharesDonutLink", function () {
    populateSharesChart(dashboardData.investors);
  });
});

export function loanOfficer() {
  dashboardData = fetchLoanOfficerDashboardData();

  if (typeof dashboardData !== "undefined" && dashboardData !== null && dashboardData != '') {
    //populateClientsByProducts(dashb)
    loadProductsChart(dashboardData.products_client_count);
    $("#totalClients").text(nf.format(dashboardData.total_clients));
    $("#investorsCount").text(nf.format(dashboardData.clients_who_made_investments));
    $("#loanApplicantsCount").text(nf.format(dashboardData.clients_who_applied_loans));
    $("#loanApplicationsCount").text(nf.format(dashboardData.total_loan_applications));
    $("#totalLoans").text(nf.format(dashboardData.total_loans));
    $("#disbursementRate").text(`${dashboardData.disbursement_rate}%`);

  }
}

export function admin() {
  dashboardData = fetchAdminDashboardData();

  if (typeof dashboardData !== "undefined" && dashboardData !== null && dashboardData != '') {
    /* populateSharesChart(dashboardData.investors);
     populateReturnsGrowthChart(dashboardData.all_returns);
     $("#totalClients").text(nf.format(dashboardData.client_count));
     $("#totalUsers").text(nf.format(dashboardData.user_count));
     $("#totalRevenue").text(`MK${nf.format(dashboardData.total_revenue)}`);
     $("#totalIncome").text(`MK${nf.format(dashboardData.total_income)}`);
     $("#currentlyLoaned").text(`MK${nf.format(dashboardData.currently_loaned)}`);
     $("#totalProfits").text(`MK${nf.format(dashboardData.expected_profit)}`);
     $("#totalAvailable").text(`MK${nf.format(dashboardData.total_available)}`);
     $("#totalExpenses").text(`MK${nf.format(dashboardData.total_expenses)}`);*/
    $("#totalUsers").text(dashboardData.total_users);
    $("#totalBranches").text(dashboardData.total_branches);
    $("#totalInvitations").text(dashboardData.invitations.total_invitations);
    $("#totalInvitationsAccepted").text(dashboardData.invitations.accepted.yes);
    loadUserRolesChart(dashboardData.user_role_count);
    loadUserBranchesChart(dashboardData.user_branch_count);
  }

}

export function investor() {
  dashboardData = fetchInvestorDashboardData();

  // Check if dashboardData.total_investment_and_returns[0] is defined
  if (dashboardData.total_investment_and_returns && dashboardData.total_investment_and_returns.length > 0) {
    const totalInvestment = dashboardData.total_investment_and_returns[0].amount;
    const totalROI = dashboardData.total_investment_and_returns[0].roi;

    // Check if totalROI is defined
    if (typeof totalInvestment !== 'undefined' && typeof totalROI !== 'undefined') {
      populateReturnsInvestmentChart(dashboardData.return_on_investments);
      $("#totalInvestiments").text(`MK${nf.format(totalInvestment)}`);
      $("#totalReturns").text(`MK${nf.format(totalROI)}`);
      $("#totalPackages").text(`${nf.format(dashboardData.investment_packages_count)}`);
    } else {
      // Handle case where either totalInvestment or totalROI is undefined
      console.error('Total investment or ROI is undefined.');
    }
  } else {
    // Handle case where dashboardData.total_investment_and_returns[0] is undefined
    console.error('Total investment data is undefined.');
  }
}

export function finance() {
  dashboardData = fetchFinanceDashboardData();
  if (!dashboardData) return;

  // Render KPIs
  $("#totalRevenue").text(`MK${formatCurrency(dashboardData.total_revenue)}`);
  $("#totalExpenses").text(`MK${formatCurrency(dashboardData.total_expenses)}`);
  $("#netProfit").text(`MK${formatCurrency(dashboardData.net_profit)}`);
  $("#loanPortfolioValue").text(`MK${formatCurrency(dashboardData.total_loan_portfolio)}`);
  $("#outstandingDebt").text(`MK${formatCurrency(dashboardData.outstanding_liabilities)}`);
  $("#capitalAdequacy").text(`${dashboardData.capital_adequacy_ratio}%`);

  // Optionally, set these if available in your data
  if (dashboardData.par_rate !== undefined) {
    $("#parRate").text(`${dashboardData.par_rate}%`);
  }
  if (dashboardData.operational_efficiency !== undefined) {
    $("#operationalEfficiency").text(`${dashboardData.operational_efficiency}%`);
  }

  // Render Monthly Revenue vs Expenses Chart
  renderRevenueExpensesChart(dashboardData.monthly_revenue_vs_expenses);

  // Render Expense Breakdown Chart
  renderExpenseBreakdownChart(dashboardData.expense_breakdown);
}

// Helper to render Monthly Revenue vs Expenses (Bar)
function renderRevenueExpensesChart(monthlyData) {
  if (!monthlyData) return;
  const months = Object.keys(monthlyData);
  const revenue = months.map(m => monthlyData[m].revenue);
  const expenses = months.map(m => monthlyData[m].expenses);

  const options = {
    chart: { type: "bar", height: 300 },
    series: [
      { name: "Revenue", data: revenue },
      { name: "Expenses", data: expenses }
    ],
    xaxis: { categories: months },
    title: { text: "Monthly Revenue vs Expenses", align: "center" },
    colors: ["#28a745", "#dc3545"],
    dataLabels: { enabled: true }
  };

  // Destroy previous chart instance if exists
  if (window.revenueExpensesChartInstance) {
    window.revenueExpensesChartInstance.destroy();
  }
  window.revenueExpensesChartInstance = new ApexCharts(
    document.querySelector("#revenueExpensesChart"),
    options
  );
  window.revenueExpensesChartInstance.render();
}

// Helper to render Expense Breakdown (Pie)
function renderExpenseBreakdownChart(breakdown) {
  // Defensive: check for valid array with at least one item and valid DOM node
  const chartEl = document.querySelector("#expenseBreakdownChart");
  // Remove any previous chart DOM children (ApexCharts sometimes leaves SVGs behind)
  if (chartEl) {
    while (chartEl.firstChild) chartEl.removeChild(chartEl.firstChild);
  }
  if (!Array.isArray(breakdown) || breakdown.length === 0 || !chartEl) {
    if (chartEl) chartEl.innerHTML = '<div class="text-muted text-center">No expense data available</div>';
    if (window.expenseBreakdownChartInstance) {
      try { window.expenseBreakdownChartInstance.destroy(); } catch(e) {}
      window.expenseBreakdownChartInstance = null;
    }
    return;
  }
  // Support both {amount} and {total} keys, and ensure numbers
  const labels = breakdown.map(item => item.category);
  const data = breakdown.map(item => {
    let val = item.amount !== undefined ? item.amount : item.total;
    if (typeof val === 'string') val = parseFloat(val);
    if (isNaN(val)) val = 0;
    return val;
  });

  const options = {
    chart: { type: "pie", height: 300 },
    series: data,
    labels: labels,
    title: { text: "Expense Breakdown", align: "center" },
    colors: ["#ffc107", "#007bff", "#e91e63", "#17a2b8"],
    dataLabels: { enabled: true }
  };

  // Destroy previous chart instance if exists
  if (window.expenseBreakdownChartInstance) {
    try { window.expenseBreakdownChartInstance.destroy(); } catch(e) {}
    window.expenseBreakdownChartInstance = null;
  }
  // Clear previous content again for safety
  chartEl.innerHTML = '';
  window.expenseBreakdownChartInstance = new ApexCharts(chartEl, options);
  setTimeout(() => {
    // Defensive: try/catch in case ApexCharts throws
    try {
      window.expenseBreakdownChartInstance.render();
    } catch (e) {
      chartEl.innerHTML = '<div class="text-danger text-center">Failed to render chart</div>';
    }
  }, 0);
}

export function shares() {
  dashboardData = fetchSharesDashboardData();

  $("#totalShareCapital").text(`MK${formatCurrency(dashboardData.total_share_capital)}`);
  $("#acceptedContributions").text(`MK${formatCurrency(dashboardData.accepted_contributions)}`);
  $("#rejectedContributions").text(`MK${formatCurrency(dashboardData.rejected_total_contributions)}`)
  $("#pendingApprovals").text(`MK${formatCurrency(dashboardData.pending_approvals)}`);
  $("#totalShareholders").text(dashboardData.total_shareholders);
  $("#totalShares").text(dashboardData.total_shares_issued);
  $("#shareClasses").text(dashboardData.total_share_class);
  $("#capitalizationRate").text(`${dashboardData.capitalization_rate}%`);

  // Render charts for shares
  renderSharesCharts(dashboardData);
}

export function renderSharesCharts(dashboardData) {
  // Share Capital by Class (Bar Chart)
  const capitalSeries = [{
    name: "Capital",
    data: dashboardData.share_capital_by_class.map(item => parseFloat(item.capital))
  }];
  const capitalCategories = dashboardData.share_capital_by_class.map(item => item.name);

  const capitalOptions = {
    chart: { type: "bar", height: 300 },
    series: capitalSeries,
    xaxis: { categories: capitalCategories },
    title: { text: "Share Capital by Class", align: "center" },
    colors: ["#3f51b5"],
    dataLabels: { enabled: true }
  };

  const capitalChart = new ApexCharts(
    document.querySelector("#shareCapitalByClassChart"),
    capitalOptions
  );
  capitalChart.render();

  // Share Class by Shareholder Count (Pie Chart)
  const shareholderSeries = dashboardData.share_class_by_shareholder_count.map(item => item.shareholder_count);
  const shareholderLabels = dashboardData.share_class_by_shareholder_count.map(item => item.share_class_name);

  const shareholderOptions = {
    chart: { type: "pie", height: 300 },
    series: shareholderSeries,
    labels: shareholderLabels,
    title: { text: "Share Class by Shareholder Count", align: "center" },
    colors: ["#009688", "#ffc107", "#e91e63", "#607d8b"],
    dataLabels: { enabled: true }
  };

  const shareholderChart = new ApexCharts(
    document.querySelector("#shareClassByShareholderCountChart"),
    shareholderOptions
  );
  shareholderChart.render();
}

function populateSharesChart(investors) {
  $("#sharesContributionTitle").text("Shares & Contributions Chart");
  sharesOptions.series = [];
  sharesOptions.labels = [];
  investors.forEach(function (investor, index) {
    sharesOptions.series.push(investor.total_contribution);
    sharesOptions.labels.push(`${investor.firstname}`);
  });

  sharesOptions.chart.events = {
    dataPointSelection: function (event, chartContext, config) {
      let investor = investors[config.dataPointIndex];

      $("#shareContribution").html(sharesContibutionTable());
      $("#sharesContributionTitle").text(
        `${investor.firstname} ${investor.lastname} contributions`
      );

      $.fn.DataTable.ext.pager.numbers_length = 5;

      loadInvestorContributionData(investor.incomes);
    },
  };

  $("#shareContribution").html(getPieChart());
  let sharesChart = new ApexCharts(
    document.querySelector("#shares-donut"),
    sharesOptions
  );

  sharesChart.render();
}

function populateReturnsGrowthChart(all_returns) {

  returnsGrowthOptions.series = all_returns.packages_returns;
  returnsGrowthOptions.yaxis.min = all_returns.max_min.min_rio;
  returnsGrowthOptions.yaxis.max = all_returns.max_min.max_rio;

  let myInvestmentChart = new ApexCharts(
    document.querySelector("#returns-growth"),
    returnsGrowthOptions
  );

  myInvestmentChart.render();
}

function loadInvestorContributionData(investorIncomes) {
  $("#investorContributionTable").DataTable({
    destroy: true,
    responsive: true,
    lengthChange: true,
    autoWidth: false,
    paging: true,
    searching: false,
    ordering: true,
    data: investorIncomes,
    columns: [{ data: "id" }, { data: "amount" }, { data: "created_at" }],
  });
}

function getPieChart() {
  return `<div id="shares-donut"></div>`;
}

function sharesContibutionTable() {
  return `<div class="Scroll p-3"><table id="investorContributionTable" class="table table-bordered table-striped ">
          <thead>
            <tr>
            <th>Id</th>
              <th>Amount(MWK)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody></tbody>
          <tfoot>
            <tr>
            <th>Id</th>
            <th>Amount(MWK)</th>
            <th>Date</th>
            </tr>
          </tfoot>
        </table></div>`;
}

function populateReturnsInvestmentChart(returns_investments) {
  returnsInvestmentsOptions.series = [];
  myInvestmentOptions.series = [];

  returns_investments.forEach(function (return_investment, index) {
    returnsInvestmentsOptions.series.push({
      name: `${return_investment.name} Returns`,
      data: return_investment.rois
    })

    myInvestmentOptions.series.push({
      name: `${return_investment.name} Investments`,
      data: return_investment.total_investment_amounts
    });
  })


  let sharesChart = new ApexCharts(
    document.querySelector("#returnsAndInvestments"),
    returnsInvestmentsOptions
  );

  sharesChart.render();

  let myInvestmentChart = new ApexCharts(
    document.querySelector("#myInvestmentsChart"),
    myInvestmentOptions
  );

  myInvestmentChart.render();
}

function fetchAdminDashboardData() {
  let data = apiClient("/api/v1/dashboard/admin", "GET", "json", false, false, {});
  if (data != null) {
    return data;
  }
}

function fetchLoanOfficerDashboardData() {
  let data = apiClient("/api/v1/dashboard/loan_officer", "GET", "json", false, false, {});
  if (data != null) {
    return data;
  }
};

function fetchInvestorDashboardData() {
  let data = apiClient("/api/v1/dashboard/investor", "GET", "json", false, false, {});
  if (data != null) {
    return data;
  }
}

function fetchFinanceDashboardData() {
  let data = apiClient("/api/v1/dashboard/finance", "GET", "json", false, false, {});
  if (data != null) {
    return data;
  }
}

function fetchSharesDashboardData() {
  let data = apiClient("/api/v1/dashboard/shares", "GET", "json", false, false, {});
  if (data != null) {
    return data;
  }
}

// Render Charts Here 
function loadProductsChart(products_client_count) {

  const data = products_client_count;

  const isDarkMode = document.body.classList.contains("dark-mode");

  // Common chart options
  const commonOptions = {
    chart: {
      type: "bar",
      height: 350,
      background: "#f4f4f4", // Light gray background for better visibility
      toolbar: {
        show: true,
        tools: {
          download: true, // Enable download
        },
      },
    },
    toolbar: {
      theme: "dark",
    },
    tooltip: {
      theme: "dark", // Tooltip theme remains light
    },
    dataLabels: {
      style: {
        fontSize: "14px",
        colors: ["#000000"], // Black for data labels
      },
    },
    xaxis: {
      labels: {
        style: {
          fontSize: "12px", // Increased font size for X-axis labels
          colors: "#000000", // Black for X-axis labels
        },
      },
      title: {
        style: {
          fontSize: "20px", // Increased font size for X-axis title
          color: "#000000", // Black for X-axis title
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "18px", // Increased font size for Y-axis labels
          colors: "#000000", // Black for Y-axis labels
        },
      },
      title: {
        style: {
          fontSize: "20px", // Increased font size for Y-axis title
          color: "#000000", // Black for Y-axis title
        },
      },
    },
  };

  // Investment Products Chart
  const investmentOptions = {
    ...commonOptions,
    series: [
      {
        name: "Subscriptions",
        data: data.investment_products.map(
          (product) => product.subscriptions
        ),
      },
    ],
    xaxis: {
      ...commonOptions.xaxis,
      categories: data.investment_products.map(
        (product) => product.package_name
      ),
    },
    colors: ["#17A2B8", "#28A745", "#FFC107"], // Warm colors
    title: {
      text: "Investment Products by Subscriptions",
      align: "center",
      style: {
        fontSize: "14px", // Increased font size for chart title
        color: "#000000", // Black for chart title
      },
    },
  };

  const investmentChart = new ApexCharts(
    document.querySelector("#investmentProductsChart"),
    investmentOptions
  );
  investmentChart.render();

  // Loan Products Chart
  const loanOptions = {
    ...commonOptions,
    series: [
      {
        name: "Total Loans",
        data: data.loan_products.map(
          (product) => product.total_loans
        ),
      },
    ],
    xaxis: {
      ...commonOptions.xaxis,
      categories: data.loan_products.map(
        (product) => product.name
      ),
    },
    colors: ["#DC3545", "#6C757D", "#007BFF"], // Warm green colors
    title: {
      text: "Loan Products by Loans",
      align: "center",
      style: {
        fontSize: "14px", // Increased font size for chart title
        color: "#000000", // Black for chart title
      },
    },
  };

  const loanChart = new ApexCharts(
    document.querySelector("#loanProductsChart"),
    loanOptions
  );
  loanChart.render();

}

function loadUserRolesChart(user_role_count) {
  const number_of_users = user_role_count.map(item => item.number_of_users);
  const roles = user_role_count.map(item => item.name);

  var options = {
    series: number_of_users,
    labels: roles,
    chart: {
      type: 'donut',
    },
    responsive: [{
      breakpoint: 200,
      options: {
        chart: {
          width: 100,
          height: 350
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  var chart = new ApexCharts(document.querySelector("#userRolesChart"), options);
  chart.render();
}

function loadUserBranchesChart(user_branch_count) {

  const number_of_users = user_branch_count.map(item => item.number_of_users);
  const branch_names = user_branch_count.map(item => item.name);

  var options = {
    series: [{
      data: number_of_users
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    annotations: {
      xaxis: [{
        x: 500,
        borderColor: '#00E396',
        label: {
          borderColor: '#00E396',
          style: {
            color: '#fff',
            background: '#00E396',
          },
          text: 'X annotation',
        }
      }],
      yaxis: [{
        y: 'July',
        y2: 'September',
        label: {
          text: 'Y annotation'
        }
      }]
    },
    plotOptions: {
      bar: {
        horizontal: true,
      }
    },
    dataLabels: {
      enabled: true
    },
    xaxis: {
      categories: branch_names,
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    yaxis: {
      reversed: true,
      axisTicks: {
        show: true
      }
    }
  };

  var chart = new ApexCharts(document.querySelector("#userBranchesChart"), options);
  chart.render();

}


