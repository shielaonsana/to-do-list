document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input')
    const addTaskBtn = document.getElementById('add-task-btn')
    const taskList = document.getElementById('task-list')
    const emptyImage = document.querySelector('.empty-img')
    const todosContainer = document.querySelector('.todos-container')
    const progressBar = document.getElementById('progress')
    const progressNumbers = document.getElementById('numbers')

    // Initialize tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || []
    let nextId = parseInt(localStorage.getItem('nextTaskId') || '1')

    const toggleEmptyState = () => {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none'
        todosContainer.style.width = taskList.children.length > 0 ? '100%' : '50%'
    }

    const updateProgress = (checkCompletion = true) => {
        const totalTasks = taskList.children.length
        const completedTasks = taskList.querySelectorAll('.checkbox:checked').length

        progressBar.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%'
        progressNumbers.textContent = `${completedTasks} / ${totalTasks}`

        if(checkCompletion && totalTasks > 0 && completedTasks === totalTasks){
            Confetti()
        }
    }

    // Save tasks to localStorage 
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks))
        localStorage.setItem('nextTaskId', nextId.toString())
    }

    // Load tasks from localStorage
    const loadTasks = () => {
        // Clear existing tasks before loading
        taskList.innerHTML = ''
        
        tasks.forEach(task => {
            addTaskToDOM(task.text, task.completed, false, task.id)
        })
        
        toggleEmptyState()
        updateProgress()
    }

    const addTaskToDOM = (text, completed = false, checkCompletion = true, id) => {
        const li = document.createElement('li')
        li.dataset.id = id
        li.innerHTML = `
        <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''}/>
        <span>${text}</span>
        <div class="task-btns"> 
            <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
            <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
        </div>
        `

        const checkbox = li.querySelector('.checkbox')
        const editBtn = li.querySelector('.edit-btn')

        if (completed) {
            li.classList.add('completed')
            editBtn.disabled = true
            editBtn.style.opacity = '0.5'
            editBtn.style.pointerEvents = 'none'
        }

        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked
            li.classList.toggle('completed', isChecked)
            editBtn.disabled = isChecked
            editBtn.style.opacity = isChecked ? '0.05' : '1'
            editBtn.style.pointerEvents = isChecked ? 'none' : 'auto'
            
            // Update task in tasks array
            const taskId = parseInt(li.dataset.id)
            const taskIndex = tasks.findIndex(task => task.id === taskId)
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = isChecked
                saveTasks()
            }

            updateProgress()
        })

        editBtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                taskInput.value = li.querySelector('span').textContent
                
                // Remove task from tasks array
                const taskId = parseInt(li.dataset.id)
                tasks = tasks.filter(task => task.id !== taskId)
                saveTasks()

                li.remove()
                toggleEmptyState()
                updateProgress(false)
            }
        })

        li.querySelector('.delete-btn').addEventListener('click', () => {
            // Remove task from tasks array
            const taskId = parseInt(li.dataset.id)
            tasks = tasks.filter(task => task.id !== taskId)
            saveTasks()

            li.remove()
            toggleEmptyState()
            updateProgress()
        })

        taskList.appendChild(li)
        toggleEmptyState()
        updateProgress(checkCompletion)
    }

    const addTask = () => {
        const taskText = taskInput.value.trim()
        if (!taskText) {
            return
        }

        // Create new task object
        const newTask = {
            id: nextId++,
            text: taskText,
            completed: false
        }

        // Add to tasks array and save
        tasks.push(newTask)
        saveTasks()

        // Add to DOM
        addTaskToDOM(newTask.text, newTask.completed, true, newTask.id)
        
        // Clear input
        taskInput.value = ''
    }

    addTaskBtn.addEventListener('click', (e) => {
        e.preventDefault() // Prevent form submission
        addTask()
    })
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTask()
        }
    })

    // Load tasks on page load
    loadTasks()
})

// Confetti function remains the same
const Confetti = () => {
    const duration = 15 * 1000,
        animationEnd = Date.now() + duration,
        defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // since particles fall down, start a bit higher than random
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            })
        );
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            })
        );
    }, 250);
}