from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# In-memory database (temporary)
tasks = []

# Get all tasks
@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(tasks)

# Add new task
@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    new_task = {
        "id": str(uuid.uuid4()),
        "title": data.get("title"),
        "status": "todo",
        "due_date": data.get("due_date", "")
    }
    tasks.append(new_task)
    return jsonify(new_task)

# Update task (move between columns)
@app.route("/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.json
    for task in tasks:
        if task["id"] == task_id:
            task["status"] = data.get("status", task["status"])
            task["title"] = data.get("title", task["title"])
            task["due_date"] = data.get("due_date", task.get("due_date", ""))
            return jsonify(task)
    return jsonify({"error": "Task not found"}), 404

# Delete task
@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    global tasks
    tasks = [task for task in tasks if task["id"] != task_id]
    return jsonify({"message": "Task deleted"})

if __name__ == "__main__":
    app.run(debug=True)