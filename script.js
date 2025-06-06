
        document.addEventListener('DOMContentLoaded', function () {
            // DOM elements
            const taskInput = document.getElementById('taskInput');
            const addTaskBtn = document.getElementById('addTaskBtn');
            const tasksContainer = document.getElementById('tasksContainer');
            const filterButtons = document.querySelectorAll('.filter-btn');
            const totalCountEl = document.getElementById('totalCount');
            const completedCountEl = document.getElementById('completedCount');
            const streakCountEl = document.getElementById('streakCount');
            const productivityEl = document.getElementById('productivity');
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');

            // Motivational quotes
            const motivationalQuotes = [
                { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
                { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
                { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
                { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
                { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
                { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
                { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
                { text: "Your goals are the roadmaps that guide you and show you what is possible for your life.", author: "Les Brown" },
                { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
                { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
            ];

            let currentFilter = 'all';
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [
                { id: 1, text: 'Complete project proposal', completed: false },
                { id: 2, text: 'Morning workout routine', completed: true },
                { id: 3, text: 'Research new market opportunities', completed: false },
                { id: 4, text: 'Read 30 pages of business book', completed: true },
                { id: 5, text: 'Prepare for client meeting', completed: false }
            ];

            // Initialize the app
            function init() {
                renderTasks();
                updateStats();

                // Set up event listeners
                addTaskBtn.addEventListener('click', addTask);
                taskInput.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') addTask();
                });

                filterButtons.forEach(button => {
                    button.addEventListener('click', function () {
                        filterButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                        currentFilter = this.dataset.filter;
                        renderTasks();
                    });
                });

                // Set a random motivational quote
                setRandomQuote();
            }

            // Set a random motivational quote
            function setRandomQuote() {
                const quoteContainer = document.querySelector('.quote-container');
                if (!quoteContainer) return;

                const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
                quoteContainer.innerHTML = `
                    <div class="quote">"${randomQuote.text}"</div>
                    <div class="author">- ${randomQuote.author}</div>
                `;
            }

            // Add a new task
            function addTask() {
                const text = taskInput.value.trim();
                if (text === '') return;

                const newTask = {
                    id: Date.now(),
                    text: text,
                    completed: false
                };

                tasks.unshift(newTask);
                saveTasks();
                renderTasks();
                updateStats();

                // Clear input
                taskInput.value = '';
                taskInput.focus();
            }

            // Render tasks based on current filter
            function renderTasks() {
                // Filter tasks
                let filteredTasks = [];
                if (currentFilter === 'all') {
                    filteredTasks = tasks;
                } else if (currentFilter === 'active') {
                    filteredTasks = tasks.filter(task => !task.completed);
                } else if (currentFilter === 'completed') {
                    filteredTasks = tasks.filter(task => task.completed);
                }

                // Render tasks or empty state
                if (filteredTasks.length === 0) {
                    tasksContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas ${currentFilter === 'completed' ? 'fa-trophy' : 'fa-bullseye'}"></i>
                            <h3>${currentFilter === 'completed' ? 'No achievements yet!' : 'No goals here!'}</h3>
                            <p>${currentFilter === 'completed' ? 'Complete some tasks to see them here.' : 'Set some goals to get started.'}</p>
                        </div>
                    `;
                } else {
                    tasksContainer.innerHTML = '';
                    filteredTasks.forEach(task => {
                        const taskElement = document.createElement('div');
                        taskElement.className = `task-card ${task.completed ? 'completed' : ''}`;
                        taskElement.innerHTML = `
                            <div class="task-check" data-id="${task.id}">
                                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                            </div>
                            <div class="task-text">${task.text}</div>
                            <div class="task-actions">
                                <button class="task-btn delete-btn" data-id="${task.id}">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                        tasksContainer.appendChild(taskElement);
                    });

                    // Add event listeners to action buttons
                    document.querySelectorAll('.task-check').forEach(button => {
                        button.addEventListener('click', function () {
                            const taskId = parseInt(this.dataset.id);
                            toggleTaskStatus(taskId);
                        });
                    });

                    document.querySelectorAll('.delete-btn').forEach(button => {
                        button.addEventListener('click', function () {
                            const taskId = parseInt(this.dataset.id);
                            deleteTask(taskId);
                        });
                    });
                }
            }

            // Toggle task completion status
            function toggleTaskStatus(taskId) {
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = !task.completed;
                    saveTasks();
                    renderTasks();
                    updateStats();

                    if (task.completed) {
                        showCelebration();
                    }
                }
            }

            // Show celebration animation
            function showCelebration() {
                const celebration = document.createElement('div');
                celebration.className = 'completed-animation';
                celebration.innerHTML = '<i class="fas fa-firework" style="color:#FFD700;"></i>';
                document.body.appendChild(celebration);

                setTimeout(() => {
                    celebration.remove();
                }, 1000);
            }

            // Delete a task
            function deleteTask(taskId) {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
                updateStats();
            }

            // Update task statistics
            function updateStats() {
                const total = tasks.length;
                const completed = tasks.filter(task => task.completed).length;
                const pending = total - completed;
                const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

                totalCountEl.textContent = total;
                completedCountEl.textContent = completed;

                // Calculate streak - for demo purposes
                const streak = completed >= 3 ? 3 : completed;
                streakCountEl.textContent = streak;

                productivityEl.textContent = `${productivity}%`;

                // Update progress bar
                progressBar.style.width = `${productivity}%`;
                progressText.textContent = `${productivity}%`;

                // Change progress bar color based on productivity
                if (productivity < 30) {
                    progressBar.style.background = "#f44336";
                } else if (productivity < 70) {
                    progressBar.style.background = "#ff9800";
                } else {
                    progressBar.style.background = "#4ade80";
                }
            }

            // Save tasks to localStorage
            function saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }

            // Initialize the app
            init();
        });
