const API_URL = 'http://localhost:5000/api/tasks';
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const todoList = document.getElementById('todoList');
const errorMessage = document.getElementById('errorMessage');

window.addEventListener('DOMContentLoaded', fetchTasks);

taskForm.addEventListener('submit', async event => {
    event.preventDefault();
    const text = taskInput.value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    if (!text) return;
    await createTask(text, desc);
    taskInput.value = '';
    document.getElementById('taskDesc').value = '';
    taskInput.focus();
});

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Could not load tasks.');
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        showError(error.message);
    }
}

async function createTask(title, description = '') {
    try {
        clearError();
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, completed: false }),
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Unable to add task.');
        }
        const task = await response.json();
        addTaskItem(task);
    } catch (error) {
        showError(error.message);
    }
}

async function updateTask(taskId, updates) {
    try {
        clearError();
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Unable to update task.');
        }
        return response.json();
    } catch (error) {
        showError(error.message);
        throw error;
    }
}

async function deleteTask(taskId, element) {
    try {
        clearError();
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Unable to delete task.');
        }
        element.remove();
        if (todoList.children.length === 0) showEmptyState();
    } catch (error) {
        showError(error.message);
    }
}

function renderTasks(tasks) {
    todoList.innerHTML = '';
    if (!tasks.length) {
        showEmptyState();
        return;
    }
    tasks.forEach(addTaskItem);
}

function addTaskItem(task) {
    const emptyNotice = todoList.querySelector('.empty-state');
    if (emptyNotice) emptyNotice.remove();

    const item = document.createElement('li');
    item.className = 'todo-item';
    item.dataset.id = task._id;

    const label = document.createElement('span');
    label.textContent = task.title;
    if (task.completed) {
        label.style.textDecoration = 'line-through';
        label.style.color = '#6b7280';
    }

    const content = document.createElement('div');
    content.style.flex = '1';
    content.style.display = 'block';
    content.style.minHeight = '20px';

    const desc = document.createElement('p');
    desc.style.margin = '6px 0 0 0';
    desc.style.fontSize = '0.875rem';
    desc.style.color = '#6b7280';

    const updateContent = () => {
        content.innerHTML = '';
        content.appendChild(label);
        if (task.description) {
            desc.textContent = task.description;
            content.appendChild(desc);
        }
    };

    updateContent();

    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '10px';

    const descButton = document.createElement('button');
    descButton.type = 'button';
    descButton.textContent = 'Description';
    descButton.addEventListener('click', () => {
        const currentDesc = task.description || '';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentDesc;
        input.placeholder = 'Enter task description';
        input.style.flex = '1';
        input.style.padding = '10px 12px';
        input.style.border = '1px solid #3B82F6';
        input.style.borderRadius = '8px';
        input.style.fontSize = '0.875rem';
        input.style.outline = 'none';

        const saveDesc = document.createElement('button');
        saveDesc.type = 'button';
        saveDesc.textContent = 'Save';
        saveDesc.style.padding = '8px 12px';
        saveDesc.style.backgroundColor = '#10b981';
        saveDesc.style.color = '#fff';
        saveDesc.style.border = 'none';
        saveDesc.style.borderRadius = '8px';
        saveDesc.style.cursor = 'pointer';
        saveDesc.style.fontSize = '0.875rem';

        const cancelDesc = document.createElement('button');
        cancelDesc.type = 'button';
        cancelDesc.textContent = 'Cancel';
        cancelDesc.style.padding = '8px 12px';
        cancelDesc.style.backgroundColor = '#6b7280';
        cancelDesc.style.color = '#fff';
        cancelDesc.style.border = 'none';
        cancelDesc.style.borderRadius = '8px';
        cancelDesc.style.cursor = 'pointer';
        cancelDesc.style.fontSize = '0.875rem';

        const descButtonsDiv = document.createElement('div');
        descButtonsDiv.style.display = 'flex';
        descButtonsDiv.style.gap = '8px';
        descButtonsDiv.appendChild(saveDesc);
        descButtonsDiv.appendChild(cancelDesc);

        // Replace item with edit mode
        item.innerHTML = '';
        item.appendChild(input);
        item.appendChild(descButtonsDiv);
        input.focus();

        const finishDescEdit = async () => {
            const newDesc = input.value.trim();
            if (newDesc !== currentDesc) {
                await updateTask(task._id, { description: newDesc });
                task.description = newDesc;
            }
            updateContent();
            item.innerHTML = '';
            item.appendChild(content);
            item.appendChild(buttons);
        };

        saveDesc.addEventListener('click', finishDescEdit);
        cancelDesc.addEventListener('click', () => {
            item.innerHTML = '';
            item.appendChild(content);
            item.appendChild(buttons);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') finishDescEdit();
            if (e.key === 'Escape') {
                item.innerHTML = '';
                item.appendChild(content);
                item.appendChild(buttons);
            }
        });
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Remove';
    deleteButton.addEventListener('click', () => deleteTask(task._id, item));

    buttons.appendChild(descButton);
    buttons.appendChild(deleteButton);

    item.appendChild(content);
    item.appendChild(buttons);
    todoList.appendChild(item);
}

function showEmptyState() {
    todoList.innerHTML = '';
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks yet. Add your first task above.';
    todoList.appendChild(empty);
}

function showError(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.className = 'error-message';
}

function clearError() {
    if (!errorMessage) return;
    errorMessage.textContent = '';
    errorMessage.className = '';
}