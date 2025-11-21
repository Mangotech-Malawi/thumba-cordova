import { validate } from "../utils/validations.js"

let formElements = []

export function validShareholderFormData() {
  formElements = []
  let validClientData = false;
  pushFormElements("identifier", "#identifier", true, "Person Identifier");
  pushFormElements("personName", "#firstname", true, "Firstname");
  pushFormElements("personName", "#lastname", true, "Lastname");
  pushFormElements("dateOfBirth", "#dateOfBirth", true, "Date Of Birth");
  pushFormElements("email", "#emailAddress", true, "Email Address");
  pushFormElements("phoneNumber", "#phoneNumber", true, "Phone Number");



  $.when(validate(formElements)).done(function (value) {
    validClientData = value
  });

  return validClientData;
}

export function validClientFormData() {
  formElements = []
  let validClientData = false;
  pushFormElements("identifier", "#identifier", true, "Person Identifier");
  pushFormElements("personName", "#firstname", true, "Firstname");
  pushFormElements("personName", "#lastname", true, "Lastname");
  pushFormElements("dateOfBirth", "#dateOfBirth", true, "Date Of Birth");
  pushFormElements("ta", "#homeTa", true, "Home TA");
  pushFormElements("village", "#homeVillage", true, "Home Village");
  pushFormElements("ta", "#currentTa", true, "Current TA");
  pushFormElements("village", "#currentVillage", true, "Current Village");

  $.when(validate(formElements)).done(function (value) {
    validClientData = value
  });

  return validClientData;
}

export function validOrgClientFormData() {
  formElements = []
  let validClientData = false;

  pushFormElements("description", "#name", true, "Organization Name");
  pushFormElements("startDate", "#busStartDate", true, "Start Date");
  pushFormElements("description", "#purpose", true, "Purpose");
  pushFormElements("email", "#emailAddress", true, "Email Address");
  pushFormElements("phoneNumber", "#phoneNumber", true, "Phone Number");
  pushFormElements("description", "#officeLocation", true, "Office Location");
  pushFormElements("description", "#postalAddress", true, "Postal Address");

  $.when(validate(formElements)).done(function (value) {
    validClientData = value
  });

  return validClientData;

}


export function validGroupClientFormData() {
  formElements = []
  let validClientData = false;

  pushFormElements("description", "#groupName", true, "Group Name");

  $.when(validate(formElements)).done(function (value) {
    validClientData = value
  });

  return validClientData;

}

export function validClientJobFormData() {
  formElements = []
  let validData = false;

  pushFormElements("description", "#title", true, "Job Title");
  pushFormElements("description", "#department", true, "Department");
  pushFormElements("description", "#employerName", true, "Employer Name");
  pushFormElements("startDate", "#dateStarted", true, "Date Started");
  pushFormElements("futureDate", "#contractDue", true, "Contract Due");
  pushFormElements("moneyAmount", "#netSalary", true, "Net Salary");
  pushFormElements("moneyAmount", "#grossSalary", true, "Gross Salary");
  pushFormElements("description", "#postalAddress", true, "Postal Address");
  pushFormElements("email", "#emailAddress", true, "Employer Email Address");
  pushFormElements("phoneNumber", "#phoneNumber", true, "Employer Phone Number");;

  $.when(validate(formElements)).done(function (value) {
    validData = value
  });

  return validData;
}

export function validDependantFormData() {
  formElements = []
  let validData = false;


  pushFormElements("alphabeticStringWithSpace", "#dependancy", true, "Dependancy");
  pushFormElements("moneyAmount", "#amount", true, "Amount");


  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validBusinessFormData() {
  formElements = []
  let validData = false;

  pushFormElements("description", "#busName", true, "Business Name");
  pushFormElements("startDate", "#busStartDate", true, "Business Start Date");
  pushFormElements("description", "#busLocation", true, "Business Location");
  pushFormElements("description", "#busShortDesc", true, "Business Short Description");
  pushFormElements("description", "#busDescription", true, "Business Description");


  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validAssetFormData() {
  formElements = []
  let validData = false;

  pushFormElements("description", "#identifier", true, "Asset Identifier");
  pushFormElements("description", "#assetName", true, "Asset Name");
  pushFormElements("moneyAmount", "#purchasePrice", true, "Asset Purchase Price");
  pushFormElements("startDate", "#purchaseDate", true, "Asset Purchase Date");
  pushFormElements("moneyAmount", "#marketValue", true, "Asset Market Value");
  pushFormElements("description", "#assetDescription", true, "Asset Description");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validOtherLoansFormData() {
  formElements = []
  let validData = false;

  pushFormElements("description", "#institution", true, "Instutition");
  pushFormElements("phoneNumber", "#phoneNumber", true, "Phone Number");
  pushFormElements("moneyAmount", "#amountLoaned", true, "Loaned Amount");
  pushFormElements("integer", "#loanPeriod", true, "Loan Period");
  pushFormElements("positiveDoubleNumber", "#loanRate", true, "Loan Interest Rate");
  pushFormElements("startDate", "#loanedDate", true, "Loaned Date");
  pushFormElements("moneyAmount", "#amountPaid", true, "Amount Paid");
  pushFormElements("description", "#otherLoanPurpose", true, "Loan Purpose");
  pushFormElements("description", "#reasonForStopping", false, "Reason for stopping taking loan");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validateLoanApplicationFormData() {
  formElements = []

  let validData = false;

  pushFormElements("moneyAmount", "#amount", true, "Loan Amount");
  pushFormElements("", "#interestsRates", true, "Interest Rate");
  pushFormElements("", "#corraterals", true, "Corraterals");
  pushFormElements("description", "#purpose", true, "Loan Purpose");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validateDumpLoanForm() {
  formElements = []

  let validData = false;
  pushFormElements("description", "#dumpingReason", true, "Dumping Reason");

  $.when(validate(formElements)).done(function (value) {
    validData = value
  });

  return validData;
}

export function validateLoanDisbursementForm() {
  formElements = []

  let validData = false;
  pushFormElements("moneyAmount", "#disbursedAmount", true, "Disbursed Amount");
  pushFormElements("startDate", "#disbursedDate", true, "Disbursed Date");
  pushFormElements("description", "#notes", true, "Disbursement Notes");

  $.when(validate(formElements)).done(function (value) {
    validData = value
  });

  return validData;
}

export function validateLoanPaymentForm() {
  formElements = []

  let validData = false;
  pushFormElements("moneyAmount", "#amount", true, "Payment Amount");
  pushFormElements("startDate", "#paymentDate", true, "Payment Date");

  $.when(validate(formElements)).done(function (value) {
    validData = value
  });

  return validData;
}

export function validateSeizeCollateralForm() {
  formElements = []

  let validData = false
  pushFormElements("", "#corraterals", true, "Corraterals");

  $.when(validate(formElements)).done(function (value) {
    validData = value
  });

  return validData;
}

export function validateInvestmentPackageForm() {
  formElements = []

  let validData = false

  pushFormElements("alphabeticStringWithSpace", "#packageName", true, "Package Name");
  pushFormElements("", "#packageType", true, "Package Type");
  pushFormElements("moneyAmount", "#minAmount", true, "Minimum Amount");
  pushFormElements("moneyAmount", "#maxAmount", true, "Maximum Amount");
  pushFormElements("positiveDoubleNumber", "#interestRate", true, "Interest Rate");
  pushFormElements("", "#interestRateFrequency", true, "Interest Rate Frequency");
  pushFormElements("integer", "#duration", true, "Investment Package Duration");
  pushFormElements("", "#currency", true, "Package Type");
  pushFormElements("description", "#requirements", true, "Requirements");
  pushFormElements("description", "#termsAndConditions", true, "Terms and Conditions");
  pushFormElements("description", "#payoutSchedule", true, "Payout Schedule");
  pushFormElements("", "#riskLevel", true, "Risk Level");


  $.when(validate(formElements)).done(function (value) {
    validData = value
  });

  return validData;
}

export function validateInvestmentForm() {
  formElements = []

  let validData = false;

  pushFormElements("", "#investmentPackageId", true, "Investment Package Category");
  pushFormElements("moneyAmount", "#amount", true, "Investment Amount");
  pushFormElements("startDate", "#investmentDate", true, "Investment Date");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validateExpenseForm() {
  formElements = []

  let validData = false;

  pushFormElements("moneyAmount", "#amount", true, "Expense Amount");
  pushFormElements("", "#category", true, "Expense Category");
  pushFormElements("description", "#description", true, "Description");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validateUserRegistrationForm() {
  formElements = []

  let validData = false;

  pushFormElements("nationalId", "#nationalId", true, "National ID");
  pushFormElements("personName", "#username", true, "Username");
  pushFormElements("personName", "#firstname", true, "Firstname");
  pushFormElements("personName", "#lastname", true, "Lastname");
  pushFormElements("email", "#email", true, "Email");
  pushFormElements("", "#role", true, "User Role");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}


export function validateUserInvitationForm() {
  formElements = []

  let validData = false;

  pushFormElements("email", "#email", true, "Email");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validateAnalysisScoreForm() {
  formElements = []

  let validData = false;

  pushFormElements("", "#scoreName", true, "Score Name");
  pushFormElements("positiveDoubleNumber", "#score", true, "Score");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}


export function validateAnalysisScoreNameForm() {
  formElements = []

  let validData = false;

  pushFormElements("alphabeticStringWithSpace", "#scoreCode", true, "Score Code");
  pushFormElements("", "#scoreType", true, "Score Type");
  pushFormElements("description", "#scoreDescription", true, "Description");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validateDTIRatioForm() {
  formElements = [];

  let validData = false;

  pushFormElements("", "#dtiScoreNames", true, "DTI Score Name");
  pushFormElements("positiveDoubleNumber", "#minRatio", true, "Minimum Ratio");
  pushFormElements("positiveDoubleNumber", "#maxRatio", true, "Maximum Ratio");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;

}

export function validateGradeForm() {
  formElements = []

  let validData = false;

  pushFormElements("alphabeticStringWithSpace", "#name", true, "Grade Name");
  pushFormElements("integer", "#minimum", true, "Minimum Grade");
  pushFormElements("integer", "#maximum", true, "Minimum Grade");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validateAccountSettingsForm() {
  formElements = []

  let validData = false

  pushFormElements("alphabeticStringWithSpace", "#accountName", true, "Account Name");
  pushFormElements("description", "#accountAddress", true, "Account Address");
  pushFormElements("email", "#accountEmail", true, "Account Email");
  pushFormElements("phoneNumber", "#accountPhoneNumber", true, "Account Phone Number");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;

}

export function validateBranchForm() {
  formElements = []

  let validData = false

  pushFormElements("alphabeticStringWithSpace", "#name", true, "Branch Name");
  pushFormElements("", "#branchType", true, "Branch Type");
  pushFormElements("description", "#location", true, "Location");
  pushFormElements("email", "#emailAddress", true, "Email Address");
  pushFormElements("phoneNumber", "#phoneNumber", true, "Branch Phone");
  pushFormElements("description", "#postalAddress", true, "Postal Address");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;

}

export function validateRoleFormData() {
  formElements = []

  let validData = false

  pushFormElements("alphabeticStringWithSpace", "#roleName", true, "Role Name");

  pushFormElements("", "#privileges", true, "Privileges");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validShareClassFormData() {
  formElements = []
  let validData = false;


  pushFormElements("alphabeticStringWithSpace", "#name", true, "Share Class Name");
  pushFormElements("alphabeticStringWithSpace", "#code", true, "Share Class Code");
  pushFormElements("moneyAmount", "#pricePerShare", true, "Price Per Share");
  pushFormElements("description", "#description", true, "Description");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

export function validCapitalContributionFormData() {
  formElements = []
  let validData = false;

  pushFormElements("startDate", "#contributedDate", true, "Contribution Date");
  pushFormElements("moneyAmount", "#amount", true, "Amount");

  $.when(validate(formElements)).done(function (value) {
    validData = value;
  });

  return validData;
}

function pushFormElements(type, id, isFilled, name) {
  formElements.push({
    type: type,
    id: id,
    checkIsFilled: isFilled,
    name: name
  });
}

