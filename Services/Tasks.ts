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

        public move(taskListId: string, taskId: string, previousTaskId: string, callback?: () => void) {
            this.prepareApi(() => {
                let request = gapi.client.tasks.tasks.move({ tasklist: taskListId, task: taskId, previous: previousTaskId });

                request.execute(resp => {
                    if (callback) callback();
                });
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