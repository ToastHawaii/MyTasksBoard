namespace Services {
    export class Tasks {
        private prepareApi(callback: () => void) {
            if (!gapi.client.tasks) {
                // Load Google Tasks API client library.
                gapi.client.load("tasks", "v1", () => {
                    callback();
                });
            } else {
                callback();
            }
        }

        public loadTaskLists(callback: (taskList: gapi.client.TaskList[]) => void) {
            this.prepareApi(() => {
                let request = gapi.client.tasks.tasklists.list({
                    maxResults: 10
                });

                request.execute(resp => {
                    callback(resp.items || []);
                });
            });
        }

        public loadTasks(taskListName: string, callback: (tasks: gapi.client.Task[]) => void) {
            this.prepareApi(() => {
                let request = gapi.client.tasks.tasks.list({
                    tasklist: taskListName,
                    showCompleted: true,
                    showHidden: true
                });

                request.execute(resp => {
                    callback(resp.items || []);
                });
            });
        }

        public update(task: gapi.client.Task, taskListId: string, taskId: string, callback?: () => void) {
            this.prepareApi(() => {
                let request = gapi.client.tasks.tasks.update({ tasklist: taskListId, task: taskId }, task);

                request.execute(resp => {
                    if (callback) callback();
                });
            });
        }

        public moveBefore(fromTaskListId: string, toTaskListId: string, taskId: string, followTaskId: string, callback?: (task?: gapi.client.Task, childTasks?: gapi.client.Task[]) => void) {
            this.moveAfter(fromTaskListId, toTaskListId, taskId, followTaskId, task => {
                this.moveAfter(toTaskListId, toTaskListId, followTaskId, task ? task.id : taskId, callback);
            });
        }

        public moveAfter(fromTaskListId: string, toTaskListId: string, taskId: string, previousTaskId: string, callback?: (task?: gapi.client.Task, childTasks?: gapi.client.Task[]) => void) {
            this.prepareApi(() => {
                if (fromTaskListId === toTaskListId) {
                    // same list
                    let request = gapi.client.tasks.tasks.move({ tasklist: fromTaskListId, task: taskId, previous: previousTaskId });
                    request.execute(resp => {
                        if (callback) callback();
                    });
                } else {
                    // move to other list

                    // load task
                    let request = gapi.client.tasks.tasks.list({ tasklist: fromTaskListId });
                    request.execute(tasks => {
                        tasks.items.forEach(currentTask => {
                            if (currentTask.id === taskId) {
                                // create new task in the other list
                                delete currentTask.id;
                                delete currentTask.selfLink;
                                delete currentTask.parent;
                                delete currentTask.position;
                                delete currentTask.hidden;
                                delete currentTask.links;
                                let request = gapi.client.tasks.tasks.insert({ tasklist: toTaskListId, previous: previousTaskId }, currentTask);
                                request.execute(newTask => {
                                    let newChildTasks: gapi.client.Task[] = [];

                                    let oldChildTasks = tasks.items.filter(t => t.parent === taskId);
                                    let index = 0;

                                    let moveChild = () => {
                                        let childTask = oldChildTasks[index];
                                        // create new child task in the other list
                                        let oldChildTaskId = childTask.id;
                                        delete childTask.id;
                                        delete childTask.selfLink;
                                        delete childTask.parent;
                                        delete childTask.position;
                                        delete childTask.hidden;
                                        delete childTask.links;
                                        let request = gapi.client.tasks.tasks.insert({ tasklist: toTaskListId, parent: newTask.id }, childTask);
                                        request.execute(childTask => {
                                            let request = gapi.client.tasks.tasks.delete({ tasklist: fromTaskListId, task: oldChildTaskId }).execute(() => { });
                                            newChildTasks.unshift(childTask);
                                            if (index + 1 === oldChildTasks.length) {
                                                // delete old task
                                                let request = gapi.client.tasks.tasks.delete({ tasklist: fromTaskListId, task: taskId });
                                                request.execute(empty => {
                                                    if (callback) callback(newTask, newChildTasks);
                                                });
                                            } else {
                                                index++;
                                                moveChild();
                                            }
                                        });
                                    };
                                    moveChild();
                                });
                            }
                        });
                    });
                }
            });
        }

        public new(taskListId: string, parentTaskId?: string, callback?: (task: gapi.client.Task) => void) {
            this.prepareApi(() => {
                let request = gapi.client.tasks.tasks.insert({ tasklist: taskListId, parent: parentTaskId });

                request.execute(resp => {
                    if (callback) callback(resp);
                });
            });
        }
    }
}