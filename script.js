
/* =========================================
   APPLYTRACK - JOB APPLICATION TRACKER
   JAVASCRIPT
========================================= */


/* =========================================
   1. DOM ELEMENTS
========================================= */

const applicationForm = document.getElementById("applicationForm");
const applicationModalElement = document.getElementById("applicationModal");

const applicationModal = new bootstrap.Modal(applicationModalElement);
const toastElement = document.getElementById("appToast");
const appToast = new bootstrap.Toast(toastElement);

const applicationTableBody = document.getElementById("applicationTableBody");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const addApplicationBtn = document.getElementById("addApplicationBtn");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

const totalApplications = document.getElementById("totalApplications");
const totalInterviews = document.getElementById("totalInterviews");
const totalSelected = document.getElementById("totalSelected");
const totalPending = document.getElementById("totalPending");

const currentDate = document.getElementById("currentDate");

const applicationId = document.getElementById("applicationId");
const companyName = document.getElementById("companyName");
const jobRole = document.getElementById("jobRole");
const appliedDate = document.getElementById("appliedDate");
const applicationStatus = document.getElementById("applicationStatus");

const modalTitle = document.getElementById("modalTitle");
const toastMessage = document.getElementById("toastMessage");


/* =========================================
   2. APPLICATION DATA
========================================= */

let applications = JSON.parse(
    localStorage.getItem("applyTrackApplications")
) || [];

let applicationChart = null;


/* =========================================
   3. CURRENT DATE
========================================= */

function displayCurrentDate() {
    const today = new Date();

    currentDate.textContent = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


/* =========================================
   4. SAVE DATA
========================================= */

function saveApplications() {
    localStorage.setItem(
        "applyTrackApplications",
        JSON.stringify(applications)
    );
}


/* =========================================
   5. SHOW TOAST MESSAGE
========================================= */

function showToast(message) {
    toastMessage.textContent = message;
    appToast.show();
}


/* =========================================
   6. STATUS CLASS
========================================= */

function getStatusClass(status) {
    const statusClasses = {
        Applied: "status-applied",
        Interview: "status-interview",
        Selected: "status-selected",
        Rejected: "status-rejected"
    };

    return statusClasses[status] || "status-applied";
}


/* =========================================
   7. RENDER APPLICATIONS
========================================= */

function renderApplications() {

    const searchValue = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredApplications = applications.filter(app => {

        const matchesSearch =
            app.company.toLowerCase().includes(searchValue) ||
            app.role.toLowerCase().includes(searchValue);

        const matchesStatus =
            selectedStatus === "all" ||
            app.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    applicationTableBody.innerHTML = "";

    if (filteredApplications.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    filteredApplications.forEach(app => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong>${escapeHTML(app.company)}</strong>
            </td>

            <td>${escapeHTML(app.role)}</td>

            <td>${formatDate(app.date)}</td>

            <td>
                <span class="status-badge ${getStatusClass(app.status)}">
                    ${escapeHTML(app.status)}
                </span>
            </td>

            <td>
                <button class="action-btn edit-btn"
                    data-id="${app.id}"
                    title="Edit Application">
                    <i class="bi bi-pencil"></i>
                </button>

                <button class="action-btn delete-btn"
                    data-id="${app.id}"
                    title="Delete Application">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        applicationTableBody.appendChild(row);
    });
}


/* =========================================
   8. SAFE HTML TEXT
========================================= */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


/* =========================================
   9. FORMAT DATE
========================================= */

function formatDate(date) {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
}


/* =========================================
   10. DASHBOARD STATISTICS
========================================= */

function updateStatistics() {

    const total = applications.length;

    const interviews = applications.filter(
        app => app.status === "Interview"
    ).length;

    const selected = applications.filter(
        app => app.status === "Selected"
    ).length;

    const pending = applications.filter(
        app => app.status === "Applied"
    ).length;

    totalApplications.textContent = total;
    totalInterviews.textContent = interviews;
    totalSelected.textContent = selected;
    totalPending.textContent = pending;
}


/* =========================================
   11. ADD APPLICATION
========================================= */

addApplicationBtn.addEventListener("click", () => {

    applicationForm.reset();

    applicationId.value = "";

    modalTitle.textContent = "Add New Application";

    applicationStatus.value = "Applied";

    appliedDate.value = new Date().toISOString().split("T")[0];

    applicationModal.show();
});


/* =========================================
   12. FORM SUBMISSION
========================================= */

applicationForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const company = companyName.value.trim();
    const role = jobRole.value.trim();
    const date = appliedDate.value;
    const status = applicationStatus.value;

    if (!company || !role || !date || !status) {
        showToast("Please fill in all fields.");
        return;
    }

    if (applicationId.value) {

        const existingApplication = applications.find(
            app => app.id === applicationId.value
        );

        if (existingApplication) {
            existingApplication.company = company;
            existingApplication.role = role;
            existingApplication.date = date;
            existingApplication.status = status;
        }

        showToast("Application updated successfully!");

    } else {

        const newApplication = {
            id: Date.now().toString(),
            company,
            role,
            date,
            status
        };

        applications.unshift(newApplication);

        showToast("Application added successfully!");
    }

    saveApplications();
    renderApplications();
    updateStatistics();
    updateChart();

    applicationModal.hide();
});


/* =========================================
   13. EDIT APPLICATION
========================================= */

applicationTableBody.addEventListener("click", function(event) {

    const editButton = event.target.closest(".edit-btn");
    const deleteButton = event.target.closest(".delete-btn");

    if (editButton) {

        const id = editButton.dataset.id;

        const app = applications.find(item => item.id === id);

        if (!app) return;

        applicationId.value = app.id;
        companyName.value = app.company;
        jobRole.value = app.role;
        appliedDate.value = app.date;
        applicationStatus.value = app.status;

        modalTitle.textContent = "Edit Application";

        applicationModal.show();
    }

    if (deleteButton) {

        const id = deleteButton.dataset.id;

        const confirmed = confirm(
            "Are you sure you want to delete this application?"
        );

        if (!confirmed) return;

        applications = applications.filter(
            app => app.id !== id
        );

        saveApplications();
        renderApplications();
        updateStatistics();
        updateChart();

        showToast("Application deleted successfully!");
    }
});


/* =========================================
   14. SEARCH APPLICATIONS
========================================= */

searchInput.addEventListener("input", renderApplications);


/* =========================================
   15. FILTER APPLICATIONS
========================================= */

statusFilter.addEventListener("change", renderApplications);


/* =========================================
   16. APPLICATION ANALYTICS CHART
========================================= */

function updateChart() {

    const statusCounts = {
        Applied: applications.filter(app => app.status === "Applied").length,
        Interview: applications.filter(app => app.status === "Interview").length,
        Selected: applications.filter(app => app.status === "Selected").length,
        Rejected: applications.filter(app => app.status === "Rejected").length
    };

    const chartCanvas = document.getElementById("applicationChart");

    if (applicationChart) {
        applicationChart.destroy();
    }

    applicationChart = new Chart(chartCanvas, {

        type: "doughnut",

        data: {
            labels: ["Applied", "Interview", "Selected", "Rejected"],

            datasets: [{
                data: [
                    statusCounts.Applied,
                    statusCounts.Interview,
                    statusCounts.Selected,
                    statusCounts.Rejected
                ],

                backgroundColor: [
                    "#635bff",
                    "#e9a23b",
                    "#16a36a",
                    "#e05252"
                ],

                borderWidth: 0,
                hoverOffset: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom",

                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: "DM Sans",
                            size: 12
                        }
                    }
                }
            },

            cutout: "70%"
        }
    });
}


/* =========================================
   17. MOBILE SIDEBAR
========================================= */

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});


/* =========================================
   18. SIDEBAR NAVIGATION
========================================= */

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", function() {

        document.querySelectorAll(".nav-link").forEach(navLink => {
            navLink.classList.remove("active");
        });

        this.classList.add("active");

        sidebar.classList.remove("active");
    });
});


/* =========================================
   19. INITIALIZE APPLICATION
========================================= */

function initializeApp() {

    displayCurrentDate();

    renderApplications();

    updateStatistics();

    updateChart();
}

initializeApp();
