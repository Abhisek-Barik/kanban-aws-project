// ================= CONFIG =================
const BASE_URL = "http://18.61.87.118:5000";

// ================= UTIL =================
function getSearchText() {
    const el = document.getElementById("search");
    return el ? el.value.toLowerCase() : "";
}

// ================= LOAD TASKS =================
function loadTasks() {
    fetch(`${BASE_URL}/tasks`)
    .then(res => res.json())
    .then(data => {

        const searchText = getSearchText();

        // Reset columns
        ["todo", "inprogress", "done"].forEach(col => {
            const colDiv = document.getElementById(col);
            if (colDiv) {
                colDiv.innerHTML = `<h2>${col.toUpperCase()}</h2>`;
            }
        });

        // Optional all tasks section
        const allTasksDiv = document.getElementById("allTasks");
        if (allTasksDiv) allTasksDiv.innerHTML = "";

        let todo = 0, progress = 0, done = 0;

        data
        .filter(task => task.title.toLowerCase().includes(searchText))
        .forEach(task => {

            // Stats
            if(task.status === "todo") todo++;
            if(task.status === "inprogress") progress++;
            if(task.status === "done") done++;

            // Task card
            const div = document.createElement("div");
            div.className = "task";
            div.draggable = true;
            div.id = task.id;

            div.innerHTML = `
                <strong>${task.title}</strong>
                <small>📅 ${task.due_date || "No date"}</small>
                <br><br>
                <button onclick="editTask('${task.id}')">✏️ Edit</button>
                <button onclick="deleteTask('${task.id}')">🗑️ Delete</button>
            `;

            div.ondragstart = drag;

            // Append to column
            const colDiv = document.getElementById(task.status);
            if (colDiv) colDiv.appendChild(div);

            // All tasks view
            if (allTasksDiv) {
                const clone = div.cloneNode(true);
                allTasksDiv.appendChild(clone);
            }
        });

        // Stats update
        if (document.getElementById("total")) {
            document.getElementById("total").innerText = data.length;
            document.getElementById("todoCount").innerText = todo;
            document.getElementById("progressCount").innerText = progress;
            document.getElementById("doneCount").innerText = done;
        }
    })
    .catch(err => console.error("Error loading tasks:", err));
}

// ================= ADD TASK =================
function addTask() {
    const title = document.getElementById("taskInput").value;
    const dueDate = document.getElementById("dueDate").value;

    if (!title) {
        alert("Please enter a task title");
        return;
    }

    fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: title,
            due_date: dueDate
        })
    })
    .then(() => {
        document.getElementById("taskInput").value = "";
        document.getElementById("dueDate").value = "";
        loadTasks();
    });
}

// ================= EDIT TASK =================
function editTask(id) {
    const newTitle = prompt("Enter new title:");
    const newDate = prompt("Enter new due date (YYYY-MM-DD):");

    if (!newTitle) return;

    fetch(`${BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: newTitle,
            due_date: newDate
        })
    })
    .then(() => loadTasks());
}

// ================= DELETE TASK =================
function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    fetch(`${BASE_URL}/tasks/${id}`, {
        method: "DELETE"
    })
    .then(() => loadTasks());
}

// ================= DRAG & DROP =================
function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    e.dataTransfer.setData("text", e.target.id);
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text");
    const status = e.currentTarget.id;

    fetch(`${BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ status })
    })
    .then(() => loadTasks());
}

// ================= SEARCH =================
const searchBox = document.getElementById("search");
if (searchBox) {
    searchBox.addEventListener("keyup", loadTasks);
}

// ================= INITIAL LOAD =================
loadTasks();