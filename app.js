let jobs = [];
let editingJobId = null;

const jobForm = document.getElementById("job-form");
const jobList = document.getElementById("job-list");

const searchInput = document.getElementById("search-company");
let currentFilter = "all";

searchInput.addEventListener("input", () => {
  const term = searchInput.value;
  renderJobs(currentFilter, term);
});

const totalAllEl = document.getElementById("total-all");
const totalAppsEl = document.getElementById("total-apps");
const totalItwsEl = document.getElementById("total-itws");
const totalRejsEl = document.getElementById("total-rejs");
const totalOffersEl = document.getElementById("total-offers");

function formatText(text) {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createJobCard(job) {
  const jobCard = document.createElement("div");
  jobCard.classList.add("job-card");

  const companyEl = document.createElement("h3");
  companyEl.textContent = formatText(job.company);

  const roleEl = document.createElement("p");
  roleEl.textContent = `Role: ${formatText(job.role)}`;

  const statusClass = `status-${job.status.toLowerCase()}`;
  const statusEl = document.createElement("p");
  statusEl.classList.add("status", statusClass);
  statusEl.textContent =
    job.status.charAt(0).toUpperCase() + job.status.slice(1);

  const dateEl = document.createElement("p");
  dateEl.textContent = `Date: ${job.date}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {
    jobs = jobs.filter((j) => j.id !== job.id);
    syncUI();
  });

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("edit-btn");

  const submitBtn = jobForm.querySelector("button");

  editBtn.addEventListener("click", () => {
    document.getElementById("company").value = job.company;
    document.getElementById("role").value = job.role;
    document.getElementById("status").value = job.status;
    document.getElementById("date").value = job.date;

    editingJobId = job.id;

    document.getElementById("job-form").scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    jobForm.classList.add("editing");
    submitBtn.textContent = "Update Job";
    document.getElementById("company").focus();
  });

  submitBtn.textContent = "Add Job";

  jobCard.appendChild(companyEl);
  jobCard.appendChild(roleEl);
  jobCard.appendChild(statusEl);
  jobCard.appendChild(dateEl);
  jobCard.appendChild(deleteBtn);
  jobCard.appendChild(editBtn);

  return jobCard;
}

function renderJobs(filterStatus = "all", searchTerm = "") {
  jobList.innerHTML = "";

  let jobsToRender = jobs;
  if (filterStatus !== "all") {
    jobsToRender = jobs.filter((job) => job.status === filterStatus);
  }

  if (searchTerm.trim() !== "") {
    jobsToRender = jobsToRender.filter((job) =>
      job.company.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  if (jobsToRender.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.id = "empty-state";
    emptyState.textContent =
      jobs.length === 0
        ? "No jobs added yet"
        : "No results match your search/filter";
    jobList.appendChild(emptyState);
    return;
  }

  jobsToRender.forEach((job) => {
    const card = createJobCard(job);
    jobList.appendChild(card);
  });
}
function updateDashboard() {
  totalAllEl.textContent = jobs.length;
  totalAppsEl.textContent = jobs.filter(
    (job) => job.status === "applied",
  ).length;
  totalItwsEl.textContent = jobs.filter(
    (job) => job.status === "interview",
  ).length;
  totalRejsEl.textContent = jobs.filter(
    (job) => job.status === "rejected",
  ).length;
  totalOffersEl.textContent = jobs.filter(
    (job) => job.status === "offer",
  ).length;
}

function saveJobs() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

jobForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const company = document.getElementById("company").value;
  const role = document.getElementById("role").value;
  const status = document.getElementById("status").value;
  const date = document.getElementById("date").value;

  if (editingJobId) {
    jobs = jobs.map((j) =>
      j.id === editingJobId ? { ...j, company, role, status, date } : j,
    );

    editingJobId = null;

    jobForm.classList.remove("editing");
  } else {
    const newJob = { id: Date.now(), company, role, status, date };
    jobs.push(newJob);
  }

  syncUI();
  jobForm.reset();
});

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector('[data-status="all"]').classList.add("active");
  const savedJobs = JSON.parse(localStorage.getItem("jobs")) || [];
  if (savedJobs) {
    jobs.push(...savedJobs);
  }
  renderJobs();
  updateDashboard();
});

const filterButtons = document.querySelectorAll("#filter-buttons button");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    currentFilter = btn.getAttribute("data-status");
    renderJobs(currentFilter, searchInput.value);
  });
});

function syncUI() {
  renderJobs(currentFilter, searchInput.value);
  updateDashboard();
  saveJobs();
}
