const API = "http://127.0.0.1:5000/tasks";

// Get search input safely
function getSearchText() {
    const el = document.getElementById("search");
    return el ? el.value.toLowerCase() : "";
}

// Load tasks
function loadTasks() {
    fetch(API)
    .then(res => res.json())
    .then(data => {

        const searchText = getSearchText();

        // Reset columns
        ["todo", "inprogress", "done"].forEach(col => {
            document.getElementById(col).innerHTML = `<h2>${col.toUpperCase()}</h2>`;
        });

        // Handle optional All Tasks section
        const allTasksDiv = document.getElementById("allTasks");
        if (allTasksDiv) allTasksDiv.innerHTML = "";

        let todo = 0, progress = 0, done = 0;

        // Filter + render
        data
        .filter(task => task.title.toLowerCase().includes(searchText))
        .forEach(task => {

            // Count stats
            if(task.status === "todo") todo++;
            if(task.status === "inprogress") progress++;
            if(task.status === "done") done++;

            const div = document.createElement("div");
            div.className = "task";
            div.draggable = true;
            div.id = task.id;

            div.innerHTML = `
                <strong>${task.title}</strong>
                <small>📅 ${task.due_date || "No date"}</small>
                <br>
                <button onclick="editTask('${task.id}')">✏️</button>
                <button onclick="deleteTask('${task.id}')">🗑️</button>
            `;

            div.ondragstart = drag;

            // Add to Kanban column
            document.getElementById(task.status).appendChild(div);

            // Add to All Tasks (if exists)
            if (allTasksDiv) {
                const clone = div.cloneNode(true);
                allTasksDiv.appendChild(clone);
            }
        });

        // Update stats (safe check)
        if (document.getElementById("total")) {
            document.getElementById("total").innerText = data.length;
            document.getElementById("todoCount").innerText = todo;
            document.getElementById("progressCount").innerText = progress;
            document.getElementById("doneCount").innerText = done;
        }
    });
}

// Add task
function addTask() {
    const title = document.getElementById("taskInput").value;
    const dueDate = document.getElementById("dueDate").value;

    if (!title) {
        alert("Please enter a task title");
        return;
    }

    fetch(API, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: title,
            due_date: dueDate
        })
    }).then(() => {
        document.getElementById("taskInput").value = "";
        document.getElementById("dueDate").value = "";
        loadTasks();
    });
}

// Edit task
function editTask(id) {
    const newTitle = prompt("Enter new title:");
    const newDate = prompt("Enter new due date (YYYY-MM-DD):");

    if (!newTitle) return;

    fetch(API + "/" + id, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: newTitle,
            due_date: newDate
        })
    }).then(() => loadTasks());
}

// Delete task
function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    fetch(API + "/" + id, {
        method: "DELETE"
    }).then(() => loadTasks());
}

// Drag functions
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

    fetch(API + "/" + id, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ status })
    }).then(() => loadTasks());
}

// Auto search trigger
const searchBox = document.getElementById("search");
if (searchBox) {
    searchBox.addEventListener("keyup", loadTasks);
}

// Initial load
loadTasks();