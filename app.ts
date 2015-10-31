class App {
    private checkAuthCallback = (authorized: boolean) => {
        var authorizeButton = document.getElementById("authorize");
        if (authorized) {
            // Hide auth UI, then load client library.
            authorizeButton.style.display = "none";

            this.render();
        } else {
            // Show auth UI, allowing the user to initiate authorization by
            // clicking authorize button.
            authorizeButton.style.display = "inline";
        }
    }

    private render() {
        let tasksService = new Services.Tasks();

        tasksService.loadTaskLists(taskLists => {
            var board = new ViewModels.Board([], document.getElementById("app"));

            var columnCompleted = new ViewModels.Column("Abgeschlossen");

            // get in create order
            taskLists.reverse();
            taskLists.unshift(taskLists.pop());

            taskLists.forEach(taskList => {
                let column = new ViewModels.Column(taskList.title);
                board.columns.push(column);

                tasksService.loadTasks(taskList.id, tasks => {
                    tasks.forEach(task => {
                        let card = new ViewModels.Card(tasksService, taskList.id, task.id, task.title, task.notes, task.due);

                        card.onTitleChange = newValue => {
                            task.title = newValue;
                            tasksService.update(task, taskList.id, task.id);
                        }
                        card.onDescriptionChange = newValue => {
                            task.notes = newValue;
                            tasksService.update(task, taskList.id, task.id);
                        }

                        tasks.forEach(childTask => {
                            if (task.id === childTask.parent) {
                                card.tasks.push(new ViewModels.Task(typeof childTask.completed != "undefined", childTask.title));
                            }
                        });

                        if (!task.parent) {
                            if (!task.completed) {
                                if (!task.hidden) {
                                    column.cards.push(card);
                                    card.render(column.columnElement);
                                }
                            } else {
                                columnCompleted.cards.push(card);
                                card.render(columnCompleted.columnElement);
                            }
                        }
                    });
                });
            });

            board.columns.push(columnCompleted);
            board.render();
            board.columns[board.columns.length - 1].columnElement.className += " completed";
        });
    }

    public start() {
        let authService = new Services.Auth("1072354952697-l6ihrtohski9e023vtaub4o2f5hih88m.apps.googleusercontent.com");

        document.getElementById("authorize")
            .addEventListener("click", ev => {
                authService.auth(this.checkAuthCallback);
                return false;
            });

        authService.checkAuth(this.checkAuthCallback);
    }
}