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
        <div class="modal fade" id="attemptDetailsModal" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
    <div class="modal-content border-0 shadow">

      <div class="modal-header bg-white border-bottom px-4 py-3">
        <div class="d-flex align-items-center">
          <div class="bg-primary rounded p-2 mr-3" style="line-height:1">
            <i class="fas fa-file-alt text-white fa-sm"></i>
          </div>
          <h6 class="modal-title font-weight-bold text-dark mb-0">Recovery Attempt Details</h6>
        </div>
        <button type="button" class="btn btn-light ml-3" data-dismiss="modal" aria-label="Close">
          <i class="fas fa-times fa-sm"></i>
        </button>
      </div>

      <div class="row no-gutters border-bottom bg-light">
        <div class="col-6 col-md-3 px-4 py-2 border-right">
          <div class="text-uppercase text-muted mb-1 text-nowrap" style="font-size:10px;letter-spacing:.06em;font-weight:600">Created</div>
          <div class="font-weight-medium text-dark text-nowrap">${fmt(new Date(attemptData.created_at).toLocaleString())}</div>
        </div>
        <div class="col-6 col-md-3 px-4 py-2 border-right">
          <div class="text-uppercase text-muted mb-1 text-nowrap" style="font-size:10px;letter-spacing:.06em;font-weight:600">Sync Status</div>
          <div>${attemptData.synced ? '<span class="badge badge-success"><i class="fas fa-check-circle mr-1"></i>Synced</span>' : '<span class="badge badge-warning"><i class="fas fa-clock mr-1"></i>Pending</span>'}</div>
        </div>
        <div class="col-6 col-md-3 px-4 py-2 border-right">
          <div class="text-uppercase text-muted mb-1 text-nowrap" style="font-size:10px;letter-spacing:.06em;font-weight:600">Recovery Case ID</div>
          <code>${fmt(attemptData.recovery_case_id)}</code>
        </div>
        <div class="col-6 col-md-3 px-4 py-2">
          <div class="text-uppercase text-muted mb-1 text-nowrap" style="font-size:10px;letter-spacing:.06em;font-weight:600">Client ID</div>
          <code>${fmt(attemptData.client_id)}</code>
        </div>
      </div>

      <div class="modal-body px-4 py-3">

        <!-- Step 1 -->
        <div class="card border mb-3">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center">
            <span class="badge badge-primary rounded-circle mr-2" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:10px">1</span>
            <span class="text-uppercase text-muted text-nowrap" style="font-size:10px;letter-spacing:.07em;font-weight:700"><i class="fas fa-user mr-1"></i> Initial Contact</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex flex-column flex-md-row no-gutters">
              <div class="d-flex border-bottom border-md-bottom-0 flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="font-weight-bold text-muted text-nowrap">Action Type</span></div>
                <div class="px-3 py-2 flex-grow-1 border-right"><span class="text-dark">${fmt(pick(attemptData, 'action_type_text', 'action_type_name', 'action_type_code', 'action_type'))}</span></div>
              </div>
              <div class="d-flex flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="font-weight-bold text-muted text-nowrap">Client Reached</span></div>
                <div class="px-3 py-2 flex-grow-1">${formatBadge(pick(attemptData, 'client_reached'))}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2 — Client Not Reached -->
        ${attemptData.client_reached === 'no' ? `
        <div class="card border mb-3">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center">
            <span class="badge badge-secondary rounded-circle mr-2" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:10px">2</span>
            <span class="text-uppercase text-muted text-nowrap" style="font-size:10px;letter-spacing:.07em;font-weight:700"><i class="fas fa-ban mr-1"></i> Client Not Reached</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex flex-column flex-md-row border-bottom">
              <div class="d-flex border-bottom border-md-bottom-0 flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Reason</span></div>
                <div class="px-3 py-2 flex-grow-1 border-right"><span class="small text-dark">${fmt(pick(attemptData, 'not_reached_reason_text', 'not_reached_reason_code', 'not_reached_reason'))}</span></div>
              </div>
              <div class="d-flex flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Next Step</span></div>
                <div class="px-3 py-2 flex-grow-1"><span class="small text-dark">${fmt(pick(attemptData, 'next_step_planned_text', 'next_step_planned_code', 'next_step_planned'))}</span></div>
              </div>
            </div>
            ${attemptData.not_reached_other_reason ? `
            <div class="d-flex border-bottom">
              <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Other Reason</span></div>
              <div class="px-3 py-2 flex-grow-1"><span class="small text-dark">${fmt(attemptData.not_reached_other_reason)}</span></div>
            </div>` : ''}
            <div class="d-flex">
              <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Notes</span></div>
              <div class="px-3 py-2 flex-grow-1"><span class="small text-muted">${attemptData.notes_client_not_reached || '—'}</span></div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Step 3 + conditional steps — Client Reached -->
        ${attemptData.client_reached === 'yes' ? `
        <div class="card border mb-3">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center">
            <span class="badge badge-primary rounded-circle mr-2" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:10px">3</span>
            <span class="text-uppercase text-muted text-nowrap" style="font-size:10px;letter-spacing:.07em;font-weight:700"><i class="fas fa-credit-card mr-1"></i> Default Reason</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex flex-column flex-md-row ${attemptData.default_reason_other ? 'border-bottom' : ''}">
              <div class="d-flex border-bottom border-md-bottom-0 flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Reason</span></div>
                <div class="px-3 py-2 flex-grow-1 border-right"><span class="small text-dark">${fmt(pick(attemptData, 'default_reason_text', 'default_reason_code', 'default_reason'))}</span></div>
              </div>
              <div class="d-flex flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Willing to Pay</span></div>
                <div class="px-3 py-2 flex-grow-1">${formatBadge(pick(attemptData, 'willing_to_pay', 'willing_to_pay_code'))}</div>
              </div>
            </div>
            ${attemptData.default_reason_other ? `
            <div class="d-flex">
              <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Other Reason</span></div>
              <div class="px-3 py-2 flex-grow-1"><span class="small text-dark">${fmt(attemptData.default_reason_other)}</span></div>
            </div>` : ''}
          </div>
        </div>

        ${attemptData.willing_to_pay === 'yes' ? `
        <div class="card border mb-3">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center">
            <span class="badge badge-success rounded-circle mr-2" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:10px">5</span>
            <span class="text-uppercase text-muted text-nowrap" style="font-size:10px;letter-spacing:.07em;font-weight:700"><i class="fas fa-dollar-sign mr-1"></i> Payment Commitment</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex flex-column flex-md-row ${attemptData.custom_payment_date ? 'border-bottom' : ''}">
              <div class="d-flex border-bottom border-md-bottom-0 flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">When</span></div>
                <div class="px-3 py-2 flex-grow-1 border-right"><span class="small text-dark">${fmt(pick(attemptData, 'payment_when_text', 'payment_when_code', 'payment_when'))}</span></div>
              </div>
              <div class="d-flex flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Amount Promised</span></div>
                <div class="px-3 py-2 flex-grow-1">${attemptData.amount_promised ? `<strong class="small">MWK ${parseFloat(attemptData.amount_promised).toFixed(2)}</strong>` : '<span class="text-muted small">—</span>'}</div>
              </div>
            </div>
            ${attemptData.custom_payment_date ? `
            <div class="d-flex">
              <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Custom Date</span></div>
              <div class="px-3 py-2 flex-grow-1"><span class="small text-dark">${fmt(attemptData.custom_payment_date)}</span></div>
            </div>` : ''}
          </div>
        </div>
        ` : ''}

        ${attemptData.willing_to_pay === 'no' ? `
        <div class="card border mb-3">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center">
            <span class="badge badge-danger rounded-circle mr-2" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:10px">6</span>
            <span class="text-uppercase text-muted text-nowrap" style="font-size:10px;letter-spacing:.07em;font-weight:700"><i class="fas fa-hand-paper mr-1"></i> Refusal to Pay</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex ${attemptData.refusal_other_reason ? 'border-bottom' : ''}">
              <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Reason</span></div>
              <div class="px-3 py-2 flex-grow-1"><span class="small text-dark">${fmt(pick(attemptData, 'refusal_reason_text', 'refusal_reason_code', 'refusal_reason'))}</span></div>
            </div>
            ${attemptData.refusal_other_reason ? `
            <div class="d-flex">
              <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Other Reason</span></div>
              <div class="px-3 py-2 flex-grow-1"><span class="small text-dark">${fmt(attemptData.refusal_other_reason)}</span></div>
            </div>` : ''}
          </div>
        </div>
        ` : ''}

        ${attemptData.willing_to_pay === 'not_sure' ? `
        <div class="card border mb-3">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center">
            <span class="badge badge-warning rounded-circle mr-2" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:10px">7</span>
            <span class="text-uppercase text-muted text-nowrap" style="font-size:10px;letter-spacing:.07em;font-weight:700"><i class="fas fa-user-tie mr-1"></i> Collector Assessment</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex">
              <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Assessment</span></div>
              <div class="px-3 py-2 flex-grow-1"><span class="small text-dark">${fmt(pick(attemptData, 'collector_assessment_text', 'collector_assessment_code', 'collector_assessment'))}</span></div>
            </div>
          </div>
        </div>
        ` : ''}
        ` : ''}

        <!-- Step 8 — Payment During Visit -->
        <div class="card border mb-3">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center">
            <span class="badge badge-primary rounded-circle mr-2" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:10px">8</span>
            <span class="text-uppercase text-muted text-nowrap" style="font-size:10px;letter-spacing:.07em;font-weight:700"><i class="fas fa-credit-card mr-1"></i> Payment During Visit</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex flex-column flex-md-row ${attemptData.payment_made === 'yes' ? 'border-bottom' : ''}">
              <div class="d-flex border-bottom border-md-bottom-0 flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Payment Made</span></div>
                <div class="px-3 py-2 flex-grow-1 border-right">${formatBadge(pick(attemptData, 'payment_made'))}</div>
              </div>
              <div class="d-flex flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Amount Paid</span></div>
                <div class="px-3 py-2 flex-grow-1">${attemptData.payment_made === 'yes' && attemptData.amount_paid ? `<strong class="small">MWK ${parseFloat(attemptData.amount_paid).toFixed(2)}</strong>` : '<span class="text-muted small">—</span>'}</div>
              </div>
            </div>
            ${attemptData.payment_made === 'yes' ? `
            <div class="d-flex flex-column flex-md-row">
              <div class="d-flex border-bottom border-md-bottom-0 flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Payment Method</span></div>
                <div class="px-3 py-2 flex-grow-1 border-right"><span class="small text-dark">${fmt(pick(attemptData, 'payment_method_text', 'payment_method_name', 'payment_method'))}</span></div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Step 9 — Risk Assessment -->
        <div class="card border mb-3">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center">
            <span class="badge badge-primary rounded-circle mr-2" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:10px">9</span>
            <span class="text-uppercase text-muted text-nowrap" style="font-size:10px;letter-spacing:.07em;font-weight:700"><i class="fas fa-shield-alt mr-1"></i> Risk Assessment</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex flex-column flex-md-row">
              <div class="d-flex border-bottom border-md-bottom-0 flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Risk Status</span></div>
                <div class="px-3 py-2 flex-grow-1 border-right"><span class="small text-dark">${fmt(pick(attemptData, 'client_risk_status_text', 'client_risk_status_code', 'client_risk_status'))}</span></div>
              </div>
              <div class="d-flex flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Collector</span></div>
                <div class="px-3 py-2 flex-grow-1"><span class="small text-dark">${fmt(pick(attemptData, 'assigned_to_user_id'))}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 10 — Next Action -->
        <div class="card border mb-0">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center">
            <span class="badge badge-primary rounded-circle mr-2" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:10px">10</span>
            <span class="text-uppercase text-muted text-nowrap" style="font-size:10px;letter-spacing:.07em;font-weight:700"><i class="fas fa-arrow-right mr-1"></i> Next Action</span>
          </div>
          <div class="card-body p-0">
            <div class="d-flex flex-column flex-md-row">
              <div class="d-flex border-bottom border-md-bottom-0 flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Next Action</span></div>
                <div class="px-3 py-2 flex-grow-1 border-right"><span class="small text-dark">${fmt(pick(attemptData, 'next_action_text', 'next_action_code', 'next_action'))}</span></div>
              </div>
              <div class="d-flex flex-grow-1">
                <div class="px-3 py-2 text-right border-right bg-light" style="min-width:140px"><span class="small font-weight-bold text-muted text-nowrap">Notes</span></div>
                <div class="px-3 py-2 flex-grow-1"><span class="small text-muted">${attemptData.general_notes || '—'}</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="modal-footer bg-light border-top py-2 px-4">
        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
      </div>

    </div>
  </div>
</div>
    `;

    $("#attemptDetailsModal").remove();
    $("body").append(modalContent);
    $("#attemptDetailsModal").modal("show");
}

