(function() {
  const workspace = document.getElementById('workspace');
  
  // State
  let stickers = [];
  let zIndexCounter = 10;
  let selectedColor = '#f4d03f'; // default color
  
  // UI Elements
  const addBtn = document.getElementById('addStickerBtn');
  const clearBtn = document.getElementById('clearAllBtn');
  const colorDots = document.querySelectorAll('.color-dot');
  const customColorPicker = document.getElementById('customColorPicker');

  // Save to localStorage
  function saveToStorage() {
    const data = stickers.map(s => ({
      id: s.id,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
      color: s.color,
      title: s.title,
      tasks: s.tasks,
      zIndex: s.zIndex
    }));
    localStorage.setItem('sticky-board-data', JSON.stringify(data));
  }

  // Load from localStorage
  function loadFromStorage() {
    const raw = localStorage.getItem('sticky-board-data');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  // Create sticker DOM element
  function createStickerElement(stickerData) {
    const stickerDiv = document.createElement('div');
    stickerDiv.className = 'sticker';
    stickerDiv.setAttribute('data-id', stickerData.id);
    stickerDiv.style.left = stickerData.x + 'px';
    stickerDiv.style.top = stickerData.y + 'px';
    stickerDiv.style.width = stickerData.width + 'px';
    stickerDiv.style.height = stickerData.height + 'px';
    stickerDiv.style.background = stickerData.color;
    stickerDiv.style.zIndex = stickerData.zIndex || 10;

    // Header
    const header = document.createElement('div');
    header.className = 'sticker-header';
    const titleInput = document.createElement('input');
    titleInput.className = 'sticker-title';
    titleInput.value = stickerData.title || 'Note';
    titleInput.addEventListener('input', (e) => {
      const id = stickerData.id;
      const st = stickers.find(s => s.id === id);
      if (st) {
        st.title = e.target.value;
        saveToStorage();
      }
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '✕';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSticker(stickerData.id);
    });

    header.appendChild(titleInput);
    header.appendChild(delBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'sticker-body';
    const taskList = document.createElement('ul');
    taskList.className = 'task-list';

    // Render tasks
    function renderTasks() {
      taskList.innerHTML = '';
      stickerData.tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('draggable', 'true');
        li.dataset.index = index;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.done;
        checkbox.addEventListener('change', (e) => {
          task.done = e.target.checked;
          saveToStorage();
        });

        const textSpan = document.createElement('input');
        textSpan.className = 'task-text';
        textSpan.value = task.text;
        textSpan.addEventListener('input', (e) => {
          task.text = e.target.value;
          saveToStorage();
        });

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        
        // Drag & Drop tasks within sticker
        li.addEventListener('dragstart', handleTaskDragStart);
        li.addEventListener('dragover', handleTaskDragOver);
        li.addEventListener('drop', handleTaskDrop);
        li.addEventListener('dragend', handleTaskDragEnd);
        
        taskList.appendChild(li);
      });
    }

    renderTasks();

    // Add task input
    const addRow = document.createElement('div');
    addRow.className = 'add-task-row';
    const addInput = document.createElement('input');
    addInput.className = 'add-task-input';
    addInput.placeholder = 'New task...';
    const addTaskBtn = document.createElement('button');
    addTaskBtn.className = 'add-task-btn';
    addTaskBtn.textContent = '+';
    addTaskBtn.addEventListener('click', () => {
      if (addInput.value.trim() !== '') {
        stickerData.tasks.push({ text: addInput.value.trim(), done: false });
        addInput.value = '';
        renderTasks();
        saveToStorage();
      }
    });
    addInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTaskBtn.click();
      }
    });
    addRow.appendChild(addInput);
    addRow.appendChild(addTaskBtn);

    body.appendChild(taskList);
    body.appendChild(addRow);

    // Resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.innerHTML = '⤢';

    stickerDiv.appendChild(header);
    stickerDiv.appendChild(body);
    stickerDiv.appendChild(resizeHandle);

    // --- Sticker drag and drop ---
    let offsetX, offsetY, isDragging = false;
    let startX, startY;

    function onMouseDown(e) {
      if (e.target.classList.contains('delete-btn') || 
          e.target.classList.contains('resize-handle') ||
          e.target.tagName === 'INPUT' || 
          e.target.tagName === 'BUTTON' ||
          e.target.type === 'checkbox') return;
      
      e.preventDefault();
      isDragging = true;
      stickerDiv.classList.add('dragging');
      
      const rect = stickerDiv.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      stickerData.zIndex = ++zIndexCounter;
      stickerDiv.style.zIndex = stickerData.zIndex;
      
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      stickerDiv.style.left = x + 'px';
      stickerDiv.style.top = y + 'px';
    }

    function onMouseUp(e) {
      if (!isDragging) return;
      isDragging = false;
      stickerDiv.classList.remove('dragging');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      const left = parseInt(stickerDiv.style.left, 10);
      const top = parseInt(stickerDiv.style.top, 10);
      stickerData.x = left;
      stickerData.y = top;
      saveToStorage();
    }

    stickerDiv.addEventListener('mousedown', onMouseDown);

    // --- Resize sticker ---
    let isResizing = false;
    let startWidth, startHeight, startResizeX, startResizeY;

    resizeHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isResizing = true;
      startWidth = parseInt(document.defaultView.getComputedStyle(stickerDiv).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(stickerDiv).height, 10);
      startResizeX = e.clientX;
      startResizeY = e.clientY;
      
      window.addEventListener('mousemove', onResizeMove);
      window.addEventListener('mouseup', onResizeUp);
    });

    function onResizeMove(e) {
      if (!isResizing) return;
      const newWidth = Math.max(180, startWidth + e.clientX - startResizeX);
      const newHeight = Math.max(160, startHeight + e.clientY - startResizeY);
      stickerDiv.style.width = newWidth + 'px';
      stickerDiv.style.height = newHeight + 'px';
    }

    function onResizeUp() {
      if (!isResizing) return;
      isResizing = false;
      window.removeEventListener('mousemove', onResizeMove);
      window.removeEventListener('mouseup', onResizeUp);
      stickerData.width = parseInt(stickerDiv.style.width, 10);
      stickerData.height = parseInt(stickerDiv.style.height, 10);
      saveToStorage();
    }

    // Drag & Drop tasks
    let draggedTaskIndex = null;

    function handleTaskDragStart(e) {
      draggedTaskIndex = parseInt(e.currentTarget.dataset.index, 10);
      e.dataTransfer.effectAllowed = 'move';
      e.currentTarget.style.opacity = '0.5';
    }

    function handleTaskDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }

    function handleTaskDrop(e) {
      e.preventDefault();
      const targetIndex = parseInt(e.currentTarget.dataset.index, 10);
      if (draggedTaskIndex !== null && draggedTaskIndex !== targetIndex) {
        const tasks = stickerData.tasks;
        const movedTask = tasks.splice(draggedTaskIndex, 1)[0];
        tasks.splice(targetIndex, 0, movedTask);
        renderTasks();
        saveToStorage();
      }
      draggedTaskIndex = null;
    }

    function handleTaskDragEnd(e) {
      e.currentTarget.style.opacity = '1';
    }

    return stickerDiv;
  }

  // Delete sticker
  function deleteSticker(id) {
    stickers = stickers.filter(s => s.id !== id);
    const el = document.querySelector(`.sticker[data-id="${id}"]`);
    if (el) el.remove();
    saveToStorage();
  }

  // Add new sticker
  function addSticker(x = 150 + Math.random() * 200, y = 100 + Math.random() * 200) {
    const id = 'sticker_' + Date.now() + Math.random().toString(36);
    const newSticker = {
      id,
      x,
      y,
      width: 260,
      height: 240,
      color: selectedColor,
      title: 'New Note',
      tasks: [
        { text: 'Example task', done: false }
      ],
      zIndex: ++zIndexCounter
    };
    stickers.push(newSticker);
    const el = createStickerElement(newSticker);
    workspace.appendChild(el);
    saveToStorage();
    return newSticker;
  }

  // Initialize board
  function initBoard() {
    const saved = loadFromStorage();
    workspace.innerHTML = '';
    stickers = [];
    saved.forEach(data => {
      stickers.push(data);
      const el = createStickerElement(data);
      workspace.appendChild(el);
    });
    if (stickers.length === 0) {
      addSticker(200, 150);
    }
  }

  // Color selection
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      selectedColor = dot.dataset.color;
      customColorPicker.value = selectedColor;
    });
  });

  customColorPicker.addEventListener('input', (e) => {
    selectedColor = e.target.value;
  });

  // Change color of selected sticker
  workspace.addEventListener('dblclick', (e) => {
    const stickerEl = e.target.closest('.sticker');
    if (!stickerEl) return;
    const id = stickerEl.dataset.id;
    const sticker = stickers.find(s => s.id === id);
    if (sticker) {
      sticker.color = selectedColor;
      stickerEl.style.background = selectedColor;
      saveToStorage();
    }
  });

  // Buttons
  addBtn.addEventListener('click', () => addSticker());
  clearBtn.addEventListener('click', () => {
    if (confirm('Delete all notes?')) {
      stickers = [];
      workspace.innerHTML = '';
      saveToStorage();
    }
  });

  // Initialize
  initBoard();
})();
