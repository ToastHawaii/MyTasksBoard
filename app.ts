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
            let board = new ViewModels.Board([], document.getElementById("app"));

            let columnCompleted = new ViewModels.Column(tasksService, { title: "Abgeschlossen", etag: "", id: "", kind: "", selfLink: "", updated: "" });

            // get in create order
            taskLists.reverse();
            taskLists.unshift(taskLists.pop());

            let first = true;
            taskLists.forEach(taskList => {
                let column = new ViewModels.Column(tasksService, taskList, first);
                first = false;
                board.columns.push(column);

                tasksService.loadTasks(taskList.id, tasks => {
                    tasks.forEach(task => {
                        let card = new ViewModels.Card(tasksService, taskList, task);

                        tasks.forEach(childTask => {
                            if (task.id === childTask.parent) {
                                let taskViewModel = new ViewModels.Task(tasksService, taskList, childTask);
                                card.tasks.push(taskViewModel);
                            }
                        });

                        if (!task.parent) {
                            if (!task.completed) {
                                if (!task.hidden) {
                                    column.cards.push(card);
                                    card.render(column);
                                }
                            } else {
                                columnCompleted.cards.push(card);
                                card.render(columnCompleted);
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