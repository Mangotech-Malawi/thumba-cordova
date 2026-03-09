import * as report from "../services/reports.js";
import * as contentLoader from "../actions/contentLoader.js";

$(function () {
  const tabLoaders = {
    "loan-reports": () => {
      $.when(contentLoader.loadContent("loan-reports", "reports", "views/reports/loans.html"))
        .done(function () { });
    },
    "finance-reports": () => {
      $.when(contentLoader.loadContent("finance-reports", "reports", "views/reports/finance.html"))
        .done(function () { });
    },
    "shares-reports": () => {
      $.when(contentLoader.loadContent("shares-reports", "reports", "views/reports/shares.html"))
        .done(function () { });
    },
    "admin-reports": () => {
      $.when(contentLoader.loadContent("admin-reports", "reports", "views/reports/admin.html"))
        .done(function () {

        });
    },
    "system-reports": () => {
      $.when(contentLoader.loadContent("system-reports", "reports", "views/reports/superuser.html"))
        .done(function () {

        });
    }
  };

  // Click registration
  Object.entries(tabLoaders).forEach(([id, handler]) => {
    $(document).on("click", `#${id}-tab`, handler);
  });

  // Auto-load previous active tab
  const savedTab = localStorage.getItem("reports_active_tab");
  if (savedTab && tabLoaders[savedTab]) {
    tabLoaders[savedTab]();
  }

  // Report file downloads
  $(document).on("click", ".users-report-btn", function (e) {
    e.preventDefault();
    const { documentType } = $(this).data();

    if (documentType === "csv") {
      downloadCSV();
    } else {
      $.when(report.users({ document_type: documentType })).done(downloadPDF);
    }
  });


  $(document).on("click", "#adminReportFilterBtn", function () {
    const startDate = $('#adminReportStartDate').val() || 'Start not set';
    const endDate = $('#adminReportEndDate').val() || 'End not set';

    // Display range 
    $('#adminReportDateRange').text(`${startDate} - ${endDate}`);

    $.when(report.admin({ start_date: startDate, end_date: endDate })).done(function (resp) {
      $("#totalUsers").text(resp.admin_report_stats.total_users);
      $("#totalBranches").text(resp.admin_report_stats.total_branches);
      $("#totalInvitations").text(resp.admin_report_stats.invitations.total_invitations);
      $("#acceptedYes").text(resp.admin_report_stats.invitations.accepted.yes);
      $("#acceptedNo").text(resp.admin_report_stats.invitations.accepted.no);

      // Reset role counts to 0 to avoid carryover
      $("#roleSysAdmin, #roleLoanOfficer, #roleBranchLoanOfficer, #roleCoOwner").text(0);

      // Loop through user roles
      resp.admin_report_stats.user_role_count.forEach(role => {
        switch (role.name) {
          case "System Administrator":
            $("#roleSysAdmin").text(role.number_of_users);
            break;
          case "Loan Officer":
            $("#roleLoanOfficer").text(role.number_of_users);
            break;
          case "Branch Loan Officer":
            $("#roleBranchLoanOfficer").text(role.number_of_users);
            break;
          case "Co-Owner":
            $("#roleCoOwner").text(role.number_of_users);
            break;
        }
      });

      // ✅ Display Branch Users Dynamically
      const branchData = resp.admin_report_stats.user_branch_count;
      let branchRowHtml = "";
      branchData.forEach(branch => {
        branchRowHtml += `
            <tr>
                <td>${branch.name}</td>
                <td>${branch.number_of_users}</td>
            </tr>
            `;
      });

      // Replace existing branch rows
      $("#branchUserRows").html(branchRowHtml);
    });
  });

  $(document).on("click", "#loanReportFilterBtn", function () {
    const startDate = $('#loanReportStartDate').val() || 'Start not set';
    const endDate = $('#loanReportStartDate').val() || 'End not set';

    //Display Range
    $('#loanReportDateRange').text(`${startDate} - ${endDate}`);

    $.when(report.loan({ start_date: startDate, end_date: endDate })).done(function (resp) {

      const data = resp.loan_report;

      // Populate Client Section
      $("#totalClients").text(data.total_clients || 0);
      $("#loanApplicantsCount").text(data.clients_who_applied_loans || 0);
      $("#investorsCount").text(data.clients_who_made_investments || 0);
      // Add other client classifications if provided in response
      // Example if your JSON has individual, group, institutional:
      const types = data.total_clients_by_client_type || [];
      $("#individualClients").text((types.find(t => t.name === 'individual')?.total_clients) || 0);
      $("#groupClients").text((types.find(t => t.name === 'group')?.total_clients) || 0);
      $("#institutionalClients").text((types.find(t => t.name === 'institution')?.total_clients) || 0);

      // Loan Applications
      $("#totalApplications").text(data.total_loan_applications || 0);
      $("#approvedApplications").text(data.statuses_count?.statuses?.DONE || 0);  // Assuming DONE = Approved

      // Loan Disbursements
      $("#totalDisbursed").text(data.total_loans || 0);
      $("#disbursementRate").text((data.disbursement_rate || 0) + "%");

      // Other metrics - Only if you have them in JSON:
      // $("#clientGrowthRate").text(data.client_growth_rate || 'N/A');
      // $("#avgLoanSize").text(data.avg_loan_size || 'N/A');

      // Products (if you want to display counts in summary)
      const loanProducts = data.products_client_count.loan_products || [];
      const investmentProducts = data.products_client_count.investment_products || [];


      populateProductTables(data);
    });

  });

  $(document).on("click", "#financeReportFilterBtn", function () {
    const startDate = $('#financeReportStartDate').val() || 'Start not set';
    const endDate = $('#financeReportEndDate').val() || 'End not set';
    $('#financeReportDateRange').text(`${startDate} - ${endDate}`);

    $.when(report.finance({ start_date: startDate, end_date: endDate })).done(function (resp) {
      const stats = resp.finance_report_stats;

      $('#totalRevenue').html(`<span class="positive-value">${formatCurrency(stats.total_revenue)}</span>`);
      $('#totalExpenses').html(`<span class="negative-value">${formatCurrency(stats.total_expenses)}</span>`);
      $('#netProfit').html(`<span class="${getValueClass(stats.net_profit)}">${formatCurrency(stats.net_profit)}</span>`);
      $('#totalLoanPortfolio').html(`<span class="positive-value">${formatCurrency(stats.total_loan_portfolio)}</span>`);
      $('#outstandingLiabilities').html(`<span class="negative-value">${formatCurrency(stats.outstanding_liabilities)}</span>`);
      $('#capitalAdequacyRatio').html(`<span class="positive-value">${stats.capital_adequacy_ratio.toFixed(1)}%</span>`);

      // Populate Monthly Revenue vs Expenses
      const monthlyData = stats.monthly_revenue_vs_expenses;
      const monthlyTableBody = $('#monthlyRevenueExpensesTable tbody');

      Object.keys(monthlyData).sort().forEach(month => {
        const data = monthlyData[month];
        const net = data.revenue - data.expenses;
        const row = `
            <tr>
              <td>${moment(month).format('MMMM YYYY')}</td>
              <td><span class="positive-value">${formatCurrency(data.revenue)}</span></td>
              <td><span class="negative-value">${formatCurrency(data.expenses)}</span></td>
              <td><span class="${getValueClass(net)}">${formatCurrency(net)}</span></td>
            </tr>
          `;
        monthlyTableBody.append(row);
      });

      // Populate Expense Breakdown
      const expenseBreakdownBody = $('#expenseBreakdownTable tbody');
      const totalExpenseBreakdown = stats.expense_breakdown.reduce((sum, item) => sum + parseFloat(item.total), 0);

      stats.expense_breakdown.forEach(item => {
        const amount = parseFloat(item.total);
        const percentage = ((amount / totalExpenseBreakdown) * 100).toFixed(1);
        const row = `
            <tr>
              <td style="text-transform: capitalize;">${item.category}</td>
              <td><span class="negative-value">${formatCurrency(amount)}</span></td>
              <td>${percentage}%</td>
            </tr>
          `;
        expenseBreakdownBody.append(row);
      });

      // Add total row to expense breakdown
      expenseBreakdownBody.append(`
          <tr class="table-secondary fw-bold">
            <td>Total</td>
            <td><span class="negative-value">${formatCurrency(totalExpenseBreakdown)}</span></td>
            <td>100.0%</td>
          </tr>
        `);
    });

  });

  $(document).on("click", "#sharesReportFilterBtn", function () {
    const startDate = $('#sharesReportStartDate').val() || 'Start not set';
    const endDate = $('#sharesReportEndDate').val() || 'End not set';
    $('#sharesReportDateRange').text(`${startDate} - ${endDate}`);

    $.when(report.shares({ start_date: startDate, end_date: endDate })).done(function (resp) {

      const stats = resp.shares_report_stats;
      console.log(stats)

      $('#totalShareCapital').text(formatCurrency(stats.total_share_capital));
      $('#acceptedContributions').text(formatCurrency(stats.accepted_contributions));
      $('#rejectedContributions').text(formatCurrency(stats.rejected_total_contributions));
      $('#pendingApprovals').text(formatCurrency(stats.pending_approvals));
      $('#totalShareholders').text(formatNumber(stats.total_shareholders));
      $('#totalSharesIssued').text(formatNumber(stats.total_shares_issued));
      $('#totalShareClass').text(formatNumber(stats.total_share_class));
      $('#capitalizationRate').text(`${stats.capitalization_rate.toFixed(1)}%`);

      // Populate Share Capital by Class
      const shareCapitalByClassBody = $('#shareCapitalByClassTable tbody');
      const totalCapital = parseFloat(stats.total_share_capital);

      stats.share_capital_by_class.forEach(item => {
        const capital = parseFloat(item.capital);
        const percentage = ((capital / totalCapital) * 100).toFixed(1);
        const row = `
            <tr>
              <td>${item.share_class_id}</td>
              <td>${item.name}</td>
              <td>${formatCurrency(item.capital)}</td>
              <td>${percentage}%</td>
            </tr>
          `;
        shareCapitalByClassBody.append(row);
      });

      // Add total row to share capital by class
      shareCapitalByClassBody.append(`
          <tr class="table-secondary fw-bold">
            <td colspan="2">Total</td>
            <td>${formatCurrency(totalCapital)}</td>
            <td>100.0%</td>
          </tr>
        `);

      // Populate Shareholders by Class
      const shareholdersByClassBody = $('#shareholdersByClassTable tbody');
      let totalShareholders = 0;

      stats.share_class_by_shareholder_count.forEach(item => {
        totalShareholders += item.shareholder_count;
        const row = `
            <tr>
              <td>${item.share_class_id}</td>
              <td>${item.share_class_name}</td>
              <td>${formatNumber(item.shareholder_count)}</td>
            </tr>
          `;
        shareholdersByClassBody.append(row);
      });

      // Add total row to shareholders by class
      shareholdersByClassBody.append(`
          <tr class="table-secondary fw-bold">
            <td colspan="2">Total Shareholders</td>
            <td>${formatNumber(totalShareholders)}</td>
          </tr>
        `);


    });
  });

  $(document).on("click", "#exportSharesReportToPDF", function () {
    const startDate = $('#sharesReportStartDate').val();
    const endDate = $('#sharesReportEndDate').val();

    $.when(report.getSharesReportPDF(startDate, endDate)).done(function (pdfBlob) {
      if (pdfBlob) {
        getPDF(pdfBlob, "shares_report");
      } else {
        console.error("PDF generation failed or returned empty result.");
      }
    });
  });


  $(document).on("click", "#exportFinanceReportToPDF", function (e) {
    const startDate = $('#financeReportStartDate').val();
    const endDate = $('#financeReportEndDate').val();

    $.when(report.getFinanceReportPDF(startDate, endDate)).done(function (pdfBlob) {
      if (pdfBlob) {
        getPDF(pdfBlob, "finance_report");
      } else {
        console.error("PDF generation failed or returned empty result.");
      }
    });
  });

  $(document).on("click", "#exportLoanReportToPDF", function (e) {
    const startDate = $('#loanReportStartDate').val();
    const endDate = $('#loanReportStartDate').val();

    $.when(report.getLoanReportPDF(startDate, endDate)).done(function (pdfBlob) {
      if (pdfBlob) {
        getPDF(pdfBlob, "loan_report");
      } else {
        console.error("PDF generation failed or returned empty result.");
      }
    });
  });


  $(document).on("click", "#exportAdminReportToPDF", function (e) {
    const startDate = $('#adminReportStartDate').val();
    const endDate = $('#adminReportEndDate').val();

    $.when(report.getAdminReportPDF(startDate, endDate)).done(function (pdfBlob) {
      if (pdfBlob) {
        getPDF(pdfBlob, "admin_report");
      } else {
        console.error("PDF generation failed or returned empty result.");
      }
    });
  });


});



function downloadCSV() {
  const token = sessionStorage.getItem("token");
  fetch("http://127.0.0.1:3000/api/v1/report/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify({ document_type: "csv" }),
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((err) => console.error("CSV download error:", err));
}

function downloadPDF(htmlContent) {
  if (!htmlContent) return console.error("Empty PDF content.");
  const win = window.open("", "", "");
  win.document.write(htmlContent.html);
  win.document.close();
  win.print();
}

// Populate Loan & Investment Products
function populateProductTables(data) {
  const loanProducts = data.products_client_count.loan_products || [];
  const investmentProducts = data.products_client_count.investment_products || [];

  const $loanTableBody = $("#loanProductsTable tbody");
  const $investmentTableBody = $("#investmentProductsTable tbody");

  $loanTableBody.empty(); // clear previous data
  $investmentTableBody.empty();

  // Load Loan Products
  loanProducts.forEach(product => {
    $loanTableBody.append(`
            <tr>
                <td>${product.name || 'N/A'}</td>
                <td>${product.total_loans || 0}</td>
            </tr>
        `);
  });

  // Load Investment Products
  investmentProducts.forEach(product => {
    $investmentTableBody.append(`
            <tr>
                <td>${product.package_name || 'N/A'}</td>
                <td>${product.subscriptions || 0}</td>
            </tr>
        `);
  });
}

// Helper function to format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MWK',
    minimumFractionDigits: 2
  }).format(value);
}


// Helper function to format number
function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

// Helper function to get value class
function getValueClass(value) {
  if (value > 0) return 'positive-value';
  if (value < 0) return 'negative-value';
  return 'neutral-value';
}

function getPDF(pdfBlob, pdf_name) {
  const url = window.URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${pdf_name}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}