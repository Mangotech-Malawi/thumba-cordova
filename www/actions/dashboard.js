import * as dashboard from "../services/dashboard.js";
import * as contentLoader from "../actions/contentLoader.js";

$(function () {
    
    const tabLoaders = {
        "loan-dashboard": () => {
            $.when(contentLoader.loadContent("loans-dashboard", "dashboard", "views/dashboards/loan-officer.html"))
                .done(() => dashboard.loanOfficer());
        },
        "finance-dashboard": () => {
            $.when(contentLoader.loadContent("finance-performance", "dashboard", "views/dashboards/finance.html"))
                .done(() => dashboard.finance());
        },
        "system-adminstration-dashboard": () => {
            $.when(contentLoader.loadContent("system-admin", "dashboard", "views/dashboards/admin.html"))
                .done(() => dashboard.admin());
        },
        "system-reports-tab": () => {
            $.when(contentLoader.loadContent("system-reports", "dashboard", "views/dashboards/superuser.html"))
                .done(() => console.log("Super user admin"));
        },
        "shares-dashboard": () => {
            $.when(contentLoader.loadContent("shares-performance", "dashboard", "views/dashboards/shares.html"))
                .done(() => dashboard.shares() );
        }
    };

    // Register clicks
    Object.entries(tabLoaders).forEach(([id, handler]) => {
        $(document).on("click", `#${id}`, handler);
    });

    // Auto-load from localStorage (in case Alpine sets it)
    const firstTabId = localStorage.getItem("dashboard_first_tab");
    if (firstTabId && tabLoaders[firstTabId] && localStorage.getItem("state") === "dashboard") {
        tabLoaders[firstTabId]();
    }
});