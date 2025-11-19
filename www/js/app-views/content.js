export const content_view = [
  //Clients
  {
    title: "Dashboard",
    state: "dashboard",
    link: "views/dashboard.html",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Individuals",
    link: "views/clients/individuals.html",
    modals: ["views/modals/client.html",
      "views/modals/user.html",
      "views/modals/group_client.html"],
    state: "individual",
  },
  {
    title: "groups",
    link: "views/clients/groups.html",
    modals: ["views/modals/client.html",
      "views/modals/user.html",
      "views/modals/group_client.html"],
    state: "group",
  },
  {
    title: "Group Record ",
    link: "views/clients/groupRecord.html",
    modals: ["views/modals/client.html",
      "views/modals/user.html",
      "views/modals/group_client.html"],
    state: "group_rcords",
  },
  {
    title: "Client Form",
    link: "views/forms/client.html",
    state: "client_form",
    modals: ["views/modals/client.html", "views/modals/investment.html"],
  },
  {
    title: "Client Organization Form",
    link: "views/forms/organization.html",
    state: "client_organization_form",
    modals: ["views/modals/client.html", "views/modals/investment.html"],
  },
  {
    title: "Organizations",
    link: "views/clients/organizations.html",
    modals: ["views/modals/user.html", "views/modals/client.html"],
    state: "organization",
  },
  {
    title: "Client Record",
    link: "views/clients/individualRecord.html",
    state: "individual_records",
  },
  {
    title: "Organization Record",
    link: "views/clients/organizationRecord.html",
    state: "organization_records",
  },
  {
    title: "Interests",
    link: "views/interests.html",
    modals: ["views/modals/user.html",
      "views/modals/interest.html"],
    state: "interests",
  },
  {
    title: "Applications",
    link: "views/loans/applications.html",
    state: "applications",
    modals: ["views/modals/user.html", "views/modals/loans.html"]
  },
  {
    title: "Applications",
    link: "views/settings/risk_calculator.html",
    modals: [],
    state: "risk_calculator",
  },
  {
    title: "Loan Payments",
    link: "views/loans/loan_payments.html",
    modals: ["views/modals/user.html", "views/modals/loan_payments.html"],
    state: "loan_payments",
  },
  {
    title: "Loan Disbursements",
    link: "views/loans/loan_disbursement.html",
    modals: ["views/modals/user.html"],
    state: "loan_disbursement",
  },
  {
    title: "Loans",
    link: "views/loans/loans.html",
    modals: ["views/modals/user.html", "views/modals/loan_payments.html"],
    state: "loans",
  },
  {
    title: "Seized Collaterals",
    link: "views/loans/seized_collaterals.html",
    modals: ["views/modals/user.html",
      "views/modals/seized_collaterals.html"],
    state: "seized_collaterals",
  },
  {
    title: "Collaterals Sales",
    link: "views/loans/collateral_sales.html",
    modals: ["views/modals/user.html", "views/modals/seized_collaterals.html"],
    state: "collateral_sales",
  },
  {
    title: "Investors",
    link: "views/investors.html",
    state: "investors",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Income",
    link: "views/incomes.html",
    modals: ["views/modals/user.html",
      "views/modals/income.html"],
    state: "income",
  },
  {
    title: "Users",
    link: "views/users.html",
    modals: ["views/modals/user.html"],
    state: "users",
  },
  {
    title: "Users Invitations",
    link: "views/user_invitations.html",
    modals: ["views/modals/user.html"],
    state: "user_invitations",
  },
  {
    title: "Users Invitations",
    link: "views/roles.html",
    modals: ["views/modals/user.html"],
    state: "user_roles",
  },
  {
    title: "Loan Analysis Scores Settings",
    link: "views/settings/scores.html",
    modals: ["views/modals/user.html", "views/modals/settings.html"],
    state: "scores",
  },
  {
    title: "Loan Analysis DTI Ratios",
    link: "views/settings/DTI-ratios.html",
    modals: ["views/modals/user.html", "views/modals/settings.html"],
    state: "dti_ratios",
  },
  {
    title: "Loan Analysis Scores Names",
    link: "views/settings/score-names.html",
    modals: ["views/modals/user.html", "views/modals/settings.html"],
    state: "score_names",
  },
  {
    title: "Loan Analysis Grades Settings",
    link: "views/settings/grades.html",
    modals: ["views/modals/user.html", "views/modals/settings.html"],
    state: "grades",
  },
  {
    title: "Completed Applications",
    link: "views/loans/new.html",
    state: "new_applications",
    modals: ["views/modals/user.html", "views/modals/loans.html"]
  },
  {
    title: "Completed Applications",
    link: "views/loans/waiting.html",
    state: "waiting_applications",
    modals: ["views/modals/user.html", "views/modals/loans.html"]
  },
  {
    title: "Completed Applications",
    link: "views/loans/done.html",
    state: "completed_applications",
    modals: ["views/modals/user.html", "views/modals/loans.html"]
  },
  {
    title: "Dumped Applications",
    link: "views/loans/dumped.html",
    state: "dumped_applications",
    modals: ["views/modals/user.html", "views/modals/loans.html"]
  },
  {
    title: "Client Subscription",
    link: "views/clients/investmentsSubscription.html",
    state: "client_investments",
    modals: ["views/modals/client.html", "views/modals/investment.html"],
  },
  {
    title: "Investment Overview",
    link: "views/clients/investment_overview.html",
    state: "investment_overview",
    modals: [],
  },
  {
    title: "Investment Details",
    link: "views/clients/investment_details.html",
    state: "investment_details",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Client Demographics",
    link: "views/forms/investment.html",
    state: "add_investment",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Client Demographics",
    link: "views/clients/demographics.html",
    state: "demographics",
    modals: ["views/modals/client.html", "views/modals/user.html"],
  },
  {
    title: "Client Jobs",
    link: "views/clients/jobs.html",
    state: "jobs",
    modals: ["views/modals/client.html", "views/modals/user.html"]
  },
  {
    title: "Client Job Form",
    link: "views/forms/job.html",
    state: "job_form",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Client Dependants",
    link: "views/clients/dependants.html",
    state: "dependants",
    modals: ["views/modals/client.html", "views/modals/user.html"],
  },
  {
    title: "Client Job Form",
    link: "views/forms/dependant.html",
    state: "dependant_form",
    modals: [],
  },
  {
    title: "Client Businesses",
    link: "views/clients/businesses.html",
    state: "businesses",
    modals: ["views/modals/client.html", "views/modals/user.html"],
  },
  {
    title: "Client Businesses",
    link: "views/forms/business.html",
    state: "business_form",
    modals: ["views/modals/client.html", "views/modals/user.html"],
  },
  {
    title: "Client Assets",
    link: "views/clients/assets.html",
    state: "assets",
    modals: ["views/modals/assets.html", "views/modals/user.html"],
  },
  {
    title: "Client Asset Form",
    link: "views/forms/asset.html",
    state: "asset_form",
    modals: ["views/modals/assets.html", "views/modals/user.html"],
  },
  {
    title: "Client Otheloans",
    link: "views/clients/otherLoans.html",
    state: "other_loans",
    modals: ["views/modals/client.html", "views/modals/user.html"],
  },
  {
    title: "Otherloan Form",
    link: "views/forms/otherloan.html",
    state: "otherloan_form",
    modals: ["views/modals/client.html", "views/modals/user.html"],
  },
  {
    title: "Client Applications",
    link: "views/clients/applications.html",
    state: "client_applications",
    modals: ["views/modals/client.html", "views/modals/user.html"],
  },
  {
    title: "Investment Packages",
    link: "views/investments/investmentPackages.html",
    state: "investment_packages",
    modals: ["views/modals/investment_package.html", "views/modals/user.html"]
  },
  {
    title: "Investments",
    link: "views/investments/investments.html",
    state: "investments",
    modals: ["views/modals/investment.html", "views/modals/user.html"]
  },
  {
    title: "Return On Investments",
    link: "views/investments/rois.html",
    state: "return_on_investments",
    modals: ["views/modals/investment.html", "views/modals/user.html"]
  },
  {
    title: "My Investments",
    link: "views/investments/my-investments.html",
    state: "my_investments",
    modals: ["views/modals/user.html",]
  },
  {
    title: "My Returns On Investments",
    link: "views/investments/my-rois.html",
    state: "my_return_on_investments",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Expenses",
    link: "views/accounts/expenses.html",
    state: "expenses",
    modals: ["views/modals/expense.html", "views/modals/user.html"]
  },
  {
    title: "Email Subscription",
    link: "views/subscriptions/email-subscriptions.html",
    state: "email_subscriptions",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Accounts",
    link: "views/accounts/accounts.html",
    state: "accounts",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Account Settings",
    link: "views/settings/account.html",
    state: "account_settings",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Branches",
    link: "views/settings/branches.html",
    state: "branches",
    modals: ["views/modals/user.html"]
  },
  {
    title: "Share Classes",
    link: "views/share_management/share_classes.html",
    state: "share_classes",
    modals: ["views/modals/user.html", "views/modals/shares_management.html"]
  },
  {
    title: "Shareholders",
    link: "views/share_management/shareholders.html",
    state: "shareholders",
    modals: ["views/modals/user.html", "views/modals/shares_management.html"]
  },
  {
    title: "Capital Contributions",
    link: "views/share_management/capital_contributions.html",
    state: "capital_contribution",
    modals: ["views/modals/user.html", "views/modals/shares_management.html"]
  },
  {
    title: "Shares",
    link: "views/share_management/shares.html",
    state: "shares",
    modals: ["views/modals/user.html", "views/modals/shares_management.html"]
  },
   {
    title: "Shareholder Form",
    link: "views/forms/shareholder.html",
    state: "shareholder_form",
    modals: ["views/modals/user.html", "views/modals/shares_management.html"]
  }
];
