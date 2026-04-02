import * as collections from "../services/collections.js";
import * as collectionsMetadata from "../services/collections-metada.js";
import * as contentLoader from "../actions/contentLoader.js";
import * as recoveryAttempts from "../offline/recovery-attempts.js";
import { notify } from "../services/utils.js";
import { isApiHealthy } from "../services/api-client.js";


$(function () {

  $(document).on("click", ".view-more-attempt", function (e) {
    e.preventDefault();
    const attemptData = $(this).data("attempt");
    showAttemptDetailsModal(attemptData);
  });

  $(document).on("click", ".view-attempts", async function (e) {
    e.preventDefault();

    const caseId = $(this).attr("data-case-id");

    $.when(contentLoader.loadIndividualRecordView("views/collections/recovery-attempts.html",
      "recovery_attempts")).done(async function () {
        collections.populateRecoveryAttempts(caseId);
      });
  });

  $(document).on("click", ".follow-up", function (e) {
    const recoveryCase = this.dataset;
    $.when(contentLoader.loadIndividualRecordView("views/forms/recovery.html",
      "recovery_form")).done(
        function () {
          $("#recoveryCaseId").val(recoveryCase.caseId);
          $("#clientId").val(recoveryCase.clientId)
          loadActionTypes();
          loadDefaultReasons();
          loadNotReachedReasons();
          loadNextActions();
          loadRefusalToPayReasons();
          loadCollectorAssessments();
          loadPaymentCommitments();
          loadRiskStatuses();
          loadPaymentMethods();
        }
      );
  });

  $(document).on('change', 'input[name="clientReached"]', function () {
    if ($(this).val() === 'yes') {
      $("#step2").addClass("d-none");
      $("#step3").removeClass("d-none");
      $("#step4").removeClass("d-none");
      $("#step8").removeClass("d-none");
      $("#step9").removeClass("d-none");
      $("#step10").removeClass("d-none");
    } else if ($(this).val() === 'no') {
      $("#step2").removeClass("d-none");
      $("#step3").addClass("d-none");
      $("#step4").addClass("d-none");
      $("#step8").addClass("d-none");
      $("#step10").addClass("d-none");
    }
  });

  $(document).on('change', 'input[name="willingToPay"]', function () {
    if ($(this).val() === 'yes') {
      $("#step5").removeClass("d-none");
      $("#step6").addClass("d-none");
      $("#step7").addClass("d-none");
    } else if ($(this).val() === 'no') {
      $("#step6").removeClass("d-none");
      $("#step5").addClass("d-none");
      $("#step7").addClass("d-none");
    } else if ($(this).val() === 'not_sure') {
      $("#step7").removeClass("d-none");
      $("#step5").addClass("d-none");
      $("#step6").addClass("d-none");
    }
  });

  $(document).on('change', 'input[name="paymentMade"]', function () {
    if ($(this).val() === 'yes') {
      $("#paymentDetailsContainer").removeClass("d-none");
    } else if ($(this).val() === 'no') {
      $("#paymentDetailsContainer").addClass("d-none");
    }
  });

  $(document).on("click", "#submitRecoveryBtn", async function () {
    const payload = buildRecoveryJSON();

    // Save to offline storage first
    try {
      const attemptId = await recoveryAttempts.saveRecoveryAttemptOffline(payload);
      notify("Recovery attempt saved successfully", "success");

      // Try to sync with API if online
      if (isApiHealthy()) {
        try {
          const response = await collections.addRecoveryCase(payload);
          if (response) {
            // Mark as synced in offline storage
            await recoveryAttempts.markRecoveryAttemptAsSynced(attemptId);
            notify("Recovery attempt synced to server", "success");
          }
        } catch (error) {
          console.warn("Could not sync to server, saved offline:", error);
          notify("Saved offline - will sync when connection is restored", "warning");
        }
      }

      // Reset form after successful submission
      setTimeout(() => {
        // Close the modal/form
        $("#recovery_form").closest(".modal").modal("hide");
      }, 1500);

    } catch (error) {
      console.error("Error saving recovery attempt:", error);
      notify("Failed to save recovery attempt", "danger");
    }
  });

})

function loadActionTypes() {
  $.when(collectionsMetadata.getActionTypes()).done(function (action_types) {

    const actionTypesArray = [];

    action_types.forEach(function (action_type, index) {
      actionTypesArray.push(
        '<option value ="',
        action_type.id,
        '">',
        `${action_type.code}`,
        "</option>"
      )
    });


    $("#actionType").html(actionTypesArray.join(""));

  });
}

function loadDefaultReasons() {
  $.when(collectionsMetadata.getDefaultReasons()).done(function (default_reasons) {

    const defaultReasonsArray = [];

    default_reasons.forEach(function (default_reason, index) {
      defaultReasonsArray.push(
        '<option value ="',
        default_reason.id,
        '">',
        `${default_reason.code}`,
        "</option>"
      )
    });

    $("#defaultReason").html(defaultReasonsArray.join(""));
  });
}

function loadNotReachedReasons() {
  $.when(collectionsMetadata.getNotReachedReasons()).done(function (not_reached_reasons) {

    const notReachedReasonsArray = [];

    not_reached_reasons.forEach(function (not_reached_reason, index) {
      notReachedReasonsArray.push(
        '<option value ="',
        not_reached_reason.id,
        '">',
        `${not_reached_reason.code}`,
        "</option>"
      )
    });

    $("#notReachedReason").html(notReachedReasonsArray.join(""));
  });
}



function loadNextActions() {
  $.when(collectionsMetadata.getNextActions()).done(function (next_actions) {

    const nextActionsArray = [];

    next_actions.forEach(function (next_action, index) {
      nextActionsArray.push(
        '<option value ="',
        next_action.id,
        '">',
        `${next_action.code}`,
        "</option>"
      )
    });

    $(".nextAction").html(nextActionsArray.join(""));
  });
}



function loadCollectorAssessments() {
  $.when(collectionsMetadata.getCollectorAssessments()).done(function (collector_assessments) {

    const collectorAssessmentsArray = [];

    collector_assessments.forEach(function (collector_assessment, index) {
      collectorAssessmentsArray.push(
        '<option value ="',
        collector_assessment.id,
        '">',
        `${collector_assessment.code}`,
        "</option>"
      )
    });

    $("#collectorAssessment").html(collectorAssessmentsArray.join(""));
  });
}

function loadRefusalToPayReasons() {
  $.when(collectionsMetadata.getRefusalReasons()).done(function (refusal_reasons) {

    const refusalReasonsArray = [];

    refusal_reasons.forEach(function (refusal_reason, index) {
      refusalReasonsArray.push(
        '<option value ="',
        refusal_reason.id,
        '">',
        `${refusal_reason.code}`,
        "</option>"
      )
    });

    $("#refusalReason").html(refusalReasonsArray.join(""));
  });
}


function loadPaymentCommitments() {
  $.when(collectionsMetadata.getPaymentCommitments()).done(function (payment_commitments) {

    const paymentCommitmentsArray = [];

    payment_commitments.forEach(function (payment_commitment, index) {
      paymentCommitmentsArray.push(
        '<option value ="',
        payment_commitment.id,
        '">',
        payment_commitment.code,
        "</option>"
      )
    });

    $("#paymentWhen").html(paymentCommitmentsArray.join(""));
  });
}



function loadRiskStatuses() {
  $.when(collectionsMetadata.getClientRiskStatuses()).done(function (risk_statuses) {

    const riskStatusesArray = [];

    risk_statuses.forEach(function (risk_status, index) {
      riskStatusesArray.push(
        '<option value ="',
        risk_status.id,
        '">',
        risk_status.code,
        "</option>"
      )
    });

    $("#clientRiskStatus").html(riskStatusesArray.join(""));
  });
}

function loadPaymentMethods() {
  $.when(collectionsMetadata.getPaymentMethods()).done(function (payment_methods) {

    const paymentMethodsArray = [];

    payment_methods.forEach(function (payment_method, index) {
      paymentMethodsArray.push(
        '<option value ="',
        payment_method.id,
        '">',
        payment_method.name,
        "</option>"
      )
    });

    $("#paymentMethod").html(paymentMethodsArray.join(""));
  });
}



function stepIsVisible(stepNumber) {
  return !$(`#step${stepNumber}`).hasClass("d-none");
}

function buildRecoveryJSON() {
  return {
    recovery_case_id: getValue("#recoveryCaseId"),
    client_id: getValue("#clientId"),

    step1: {
      action_type: getValue("#actionType", 1),
      client_reached: getValue("input[name='clientReached']", 1, "radio"),
    },

    step2_not_reached: {
      reason: getValue("#notReachedReason", 2),
      other_reason: getValue("#otherReason", 2),
      next_step_planned: getValue("#nextStepPlanned", 2),
      notes: getValue("#notesClientNotReached", 2),
    },

    step3_default_reason: {
      reason: getValue("#defaultReason", 3),
      other_reason: getValue("#defaultReasonOther", 3),
    },

    step4_willingness: {
      willing_to_pay: getValue("input[name='willingToPay']", 4, "radio"),
    },

    step5_commitment: {
      payment_when: getValue("#paymentWhen", 5),
      custom_date: getValue("#customPaymentDate", 5),
      amount_promised: getValue("#amountPromised", 5),
    },

    step6_refusal: {
      refusal_reason: getValue("#refusalReason", 6),
      refusal_other: getValue("#refusalReasonOther", 6),
    },

    step7_assessment: {
      collector_assessment: getValue("#collectorAssessment", 7),
    },

    step8_payment: {
      payment_made: getValue("input[name='paymentMade']", 8, "radio"),
      amount_paid: getValue("#amountPaid", 8),
      payment_method: getValue("#paymentMethod", 8),
    },

    step9_risk: {
      risk_status: getValue("#clientRiskStatus", 9),
    },

    step10_next: {
      next_action: getValue("#nextAction", 10),
      notes: getValue("#generalNotes", 10),
    }
  };
}

function getValue(selector, stepNumber = null, type = "input") {
  if (stepNumber && !stepIsVisible(stepNumber)) return null;

  if (type === "radio") {
    const val = $(`${selector}:checked`).val();
    return val || null;
  }

  const el = $(selector);
  if (!el.length) return null;

  const value = el.val();
  return value === "" ? null : value;
}

function showAttemptDetailsModal(attemptData) {
  const formatBadge = (v) => {
    if (!v && v !== 0) return '<span class="text-muted">-</span>';
    if (v === true || v === 'yes') return '<span class="badge badge-success">Yes</span>';
    if (v === false || v === 'no') return '<span class="badge badge-danger">No</span>';
    if (v === 'not_sure') return '<span class="badge badge-warning">Not Sure</span>';
    return `<span>${v}</span>`;
  };

  const fmt = (value) => {
    if (!value && value !== 0) return '<span class="text-muted">-</span>';
    return String(value);
  };

  // Helper to prefer text/name/code fields if present
  const pick = (obj, ...keys) => {
    for (const k of keys) {
      if (obj && (obj[k] !== undefined) && (obj[k] !== null) && obj[k] !== '') return obj[k];
    }
    return null;
  };

const modalContent = `
<div class="modal fade" id="attemptDetailsModal" tabindex="-1">
  <div class="modal-dialog modal-xl modal-dialog-scrollable">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title">Recovery Attempt Details</h5>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>

      <div class="modal-body">

        <table class="table table-borderless">

          <!-- General -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-3">
              General Information
            </td>
          </tr>
          <tr>
            <td class="text-muted small">Created</td>
            <td><strong>${fmt(new Date(attemptData.created_at).toLocaleString())}</strong></td>
            <td class="text-muted small">Sync Status</td>
            <td><strong>${attemptData.synced ? 'Synced' : 'Pending'}</strong></td>
          </tr>
          <tr class="border-bottom">
            <td class="text-muted small">Recovery Case ID</td>
            <td><strong>${fmt(attemptData.recovery_case_id)}</strong></td>
            <td class="text-muted small">Client ID</td>
            <td><strong>${fmt(attemptData.client_id)}</strong></td>
          </tr>

          <!-- Initial Contact -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-4">
              Initial Contact
            </td>
          </tr>
          <tr class="border-bottom">
            <td class="text-muted small">Action Type</td>
            <td><strong>${fmt(pick(attemptData,'action_type_text','action_type_name','action_type_code','action_type'))}</strong></td>
            <td class="text-muted small">Client Reached</td>
            <td><strong>${fmt(attemptData.client_reached)}</strong></td>
          </tr>

          ${attemptData.client_reached === 'no' ? `
          <!-- Not Reached -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-4">
              Client Not Reached
            </td>
          </tr>
          <tr>
            <td class="text-muted small">Reason</td>
            <td colspan="3"><strong>${fmt(pick(attemptData,'not_reached_reason_text','not_reached_reason_code','not_reached_reason'))}</strong></td>
          </tr>
          <tr>
            <td class="text-muted small">Next Step</td>
            <td colspan="3"><strong>${fmt(pick(attemptData,'next_step_planned_text','next_step_planned_code','next_step_planned'))}</strong></td>
          </tr>
          ${attemptData.not_reached_other_reason ? `
          <tr>
            <td class="text-muted small">Other Reason</td>
            <td colspan="3"><strong>${fmt(attemptData.not_reached_other_reason)}</strong></td>
          </tr>` : ''}
          <tr class="border-bottom">
            <td class="text-muted small">Notes</td>
            <td colspan="3"><strong>${attemptData.notes_client_not_reached || '—'}</strong></td>
          </tr>
          ` : ''}

          ${attemptData.client_reached === 'yes' ? `
          <!-- Default -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-4">
              Default Details
            </td>
          </tr>
          <tr>
            <td class="text-muted small">Reason</td>
            <td><strong>${fmt(pick(attemptData,'default_reason_text','default_reason_code','default_reason'))}</strong></td>
            <td class="text-muted small">Willing to Pay</td>
            <td><strong>${fmt(pick(attemptData,'willing_to_pay'))}</strong></td>
          </tr>
          ${attemptData.default_reason_other ? `
          <tr class="border-bottom">
            <td class="text-muted small">Other Reason</td>
            <td colspan="3"><strong>${fmt(attemptData.default_reason_other)}</strong></td>
          </tr>` : '<tr class="border-bottom"></tr>'}

          ${attemptData.willing_to_pay === 'yes' ? `
          <!-- Commitment -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-4">
              Payment Commitment
            </td>
          </tr>
          <tr>
            <td class="text-muted small">When</td>
            <td><strong>${fmt(pick(attemptData,'payment_when_text','payment_when_code','payment_when'))}</strong></td>
            <td class="text-muted small">Amount</td>
            <td><strong>${attemptData.amount_promised ? 'MWK ' + parseFloat(attemptData.amount_promised).toFixed(2) : '—'}</strong></td>
          </tr>
          ${attemptData.custom_payment_date ? `
          <tr class="border-bottom">
            <td class="text-muted small">Custom Date</td>
            <td colspan="3"><strong>${fmt(attemptData.custom_payment_date)}</strong></td>
          </tr>` : '<tr class="border-bottom"></tr>'}
          ` : ''}

          ${attemptData.willing_to_pay === 'no' ? `
          <!-- Refusal -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-4">
              Refusal to Pay
            </td>
          </tr>
          <tr class="border-bottom">
            <td class="text-muted small">Reason</td>
            <td colspan="3"><strong>${fmt(pick(attemptData,'refusal_reason_text','refusal_reason_code','refusal_reason'))}</strong></td>
          </tr>
          ` : ''}

          ${attemptData.willing_to_pay === 'not_sure' ? `
          <!-- Assessment -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-4">
              Collector Assessment
            </td>
          </tr>
          <tr class="border-bottom">
            <td class="text-muted small">Assessment</td>
            <td colspan="3"><strong>${fmt(pick(attemptData,'collector_assessment_text','collector_assessment_code','collector_assessment'))}</strong></td>
          </tr>
          ` : ''}

          ` : ''}

          <!-- Payment -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-4">
              Payment During Visit
            </td>
          </tr>
          <tr>
            <td class="text-muted small">Payment Made</td>
            <td><strong>${fmt(attemptData.payment_made)}</strong></td>
            <td class="text-muted small">Amount Paid</td>
            <td><strong>${attemptData.amount_paid ? 'MWK ' + parseFloat(attemptData.amount_paid).toFixed(2) : '—'}</strong></td>
          </tr>
          ${attemptData.payment_made === 'yes' ? `
          <tr class="border-bottom">
            <td class="text-muted small">Method</td>
            <td colspan="3"><strong>${fmt(pick(attemptData,'payment_method_text','payment_method_name','payment_method'))}</strong></td>
          </tr>` : '<tr class="border-bottom"></tr>'}

          <!-- Risk -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-4">
              Risk Assessment
            </td>
          </tr>
          <tr class="border-bottom">
            <td class="text-muted small">Risk Status</td>
            <td><strong>${fmt(pick(attemptData,'client_risk_status_text','client_risk_status_code','client_risk_status'))}</strong></td>
            <td class="text-muted small">Collector</td>
            <td><strong>${fmt(attemptData.assigned_to_user_id)}</strong></td>
          </tr>

          <!-- Next Action -->
          <tr>
            <td colspan="4" class="text-uppercase text-muted small font-weight-bold pt-4">
              Next Action
            </td>
          </tr>
          <tr>
            <td class="text-muted small">Next Action</td>
            <td><strong>${fmt(pick(attemptData,'next_action_text','next_action_code','next_action'))}</strong></td>
            <td class="text-muted small">Notes</td>
            <td><strong>${attemptData.general_notes || '—'}</strong></td>
          </tr>

        </table>

      </div>

      <div class="modal-footer">
        <button class="btn btn-light btn-sm" data-dismiss="modal">Close</button>
      </div>

    </div>
  </div>
</div>
`;
  $("#attemptDetailsModal").remove();
  $("body").append(modalContent);
  $("#attemptDetailsModal").modal("show");
}

