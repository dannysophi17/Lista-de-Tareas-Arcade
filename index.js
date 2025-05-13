document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const searchInput = document.getElementById("searchInput");
  const taskList = document.getElementById("taskList");
  const completedCount = document.getElementById("completedCount");

  let tasks = [];

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    const saved = localStorage.getItem("tasks");
    tasks = saved ? JSON.parse(saved) : [];
    renderTasks(tasks);
  }

  function renderTasks(taskArray) {
    taskList.innerHTML = "";
    let completed = 0;

    taskArray.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = `task-card ${task.completed ? "completed" : ""}`;

      const container = document.createElement("div");
      container.className = "task-container-vertical";

      const screen = document.createElement("div");
      screen.className = "task-text-wrapper";

      const text = document.createElement("span");
      text.className = "task-text";
      text.innerHTML = highlight(task.text);
      screen.appendChild(text);

      const controls = document.createElement("div");
      controls.className = "task-controls";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.dataset.index = index;
      checkbox.className = "task-checkbox";
      checkbox.addEventListener("change", () => toggleCompleted(index));

      const toggleMenu = document.createElement("button");
      toggleMenu.className = "menu-toggle bi bi-gear-fill";
      toggleMenu.title = "Opciones";
      toggleMenu.addEventListener("click", () => {
         if (task.completed) return;
        li.classList.toggle("menu-open");
        menu.classList.toggle("show-menu");
      });

      controls.appendChild(checkbox);
      controls.appendChild(toggleMenu);

      const menu = document.createElement("div");
      menu.className = "task-menu";
      menu.innerHTML = `
        <button class="menu-edit" data-index="${index}" title="Editar"><i class="bi bi-pencil"></i></button>
        <button class="menu-delete" data-index="${index}" title="Eliminar"><i class="bi bi-trash"></i></button>
        <button class="menu-copy" data-index="${index}" title="Copiar"><i class="bi bi-clipboard"></i></button>
      `;

      container.appendChild(screen);
      container.appendChild(controls);
      li.appendChild(container);
      li.appendChild(menu);

      if (task.completed) {
  const wrapper = document.createElement("div");
  wrapper.className = "arcade-delete-wrapper";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "arcade-delete-btn";
  deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
  deleteBtn.title = "Eliminar tarea completada";
  deleteBtn.onclick = () => deleteTask(index);

  wrapper.appendChild(deleteBtn);
  li.appendChild(wrapper);
}

      taskList.appendChild(li);
      if (task.completed) completed++;
    });

    if (completed === taskArray.length && taskArray.length > 0) {
      completedCount.innerHTML = `<span class="completed-counter all-done">★★ ¡TODAS LAS TAREAS COMPLETADAS! ★★</span>`;
    } else {
      completedCount.innerHTML = `<span class="completed-counter">★ TAREAS COMPLETADAS ${completed} / ${taskArray.length} ★</span>`;
    }
  }

  function highlight(text) {
    const term = searchInput.value.trim().toLowerCase();
    if (!term) return text;
    return text.replace(new RegExp(`(${term})`, "gi"), "<mark class='highlighted'>$1</mark>");
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    tasks.push({ text, completed: false });
    saveTasks();
    taskInput.value = "";
    renderTasks(tasks);
  }

  function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks(tasks);
  }

  function editTask(index) {
    const li = taskList.children[index];
    li.classList.add("edit-mode");

    const input = document.createElement("textarea");
    input.className = "edit-field";
    input.value = tasks[index].text;
    input.rows = 1;
    input.oninput = () => {
      input.style.height = "auto";
      input.style.height = input.scrollHeight + "px";
    };


    const confirm = document.createElement("button");
    confirm.innerHTML = "✔";
    confirm.className = "myButton confirm-btn";

    const cancel = document.createElement("button");
    cancel.innerHTML = "✖";
    cancel.className = "myButton cancel-btn";

    li.innerHTML = "";
    li.appendChild(input);

    const btnWrapper = document.createElement("div");
    btnWrapper.className = "edit-buttons-wrapper";
    btnWrapper.appendChild(confirm);
    btnWrapper.appendChild(cancel);

  li.appendChild(btnWrapper);


    confirm.onclick = () => {
      if (input.value.trim()) {
        tasks[index].text = input.value.trim();
        saveTasks();
        renderTasks(tasks);
      }
    };

    cancel.onclick = () => renderTasks(tasks);
  }

  function copyTask(index) {
  navigator.clipboard.writeText(tasks[index].text).then(() => {
    showCopyNotification("Tarea copiada al portapapeles");
  });
}

  function showCopyNotification(message) {
  const container = document.querySelector(".task-area-box");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = "copy-toast-overlay";
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("visible");
  }, 50);

  setTimeout(() => {
    notification.classList.remove("visible");
    setTimeout(() => notification.remove(), 600); 
  }, 2000);
}

  function toggleCompleted(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks(tasks);
  }

  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    const filtered = tasks.filter(t => t.text.toLowerCase().includes(term));
    renderTasks(filtered);
  });

  taskList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const index = parseInt(btn.dataset.index);

    if (btn.classList.contains("menu-delete")) deleteTask(index);
    else if (btn.classList.contains("menu-edit")) editTask(index);
    else if (btn.classList.contains("menu-copy")) copyTask(index);
  });

  loadTasks();
});
