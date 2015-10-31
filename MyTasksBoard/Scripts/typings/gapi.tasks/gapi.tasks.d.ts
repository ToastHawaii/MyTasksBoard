// Type definitions for Google Translate API
// Project: https://developers.google.com/translate/
// Definitions by: Markus Peloso <https://github.com/ToastHawaii>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../gapi/gapi.d.ts" />

declare module gapi.client {
    var tasks: TasksApi;

    export interface TasksApi {
        tasklists: {
            /**
             * Returns all the authenticated user's task lists.
             */
            list(object: {
                /**
                * Maximum number of task lists returned on one page. The default is 100.
                */
                maxResults?: number;

                /**
                *Token specifying the result page to return.
                */
                pageToken?: string;
            }): HttpRequest<GoogleApiTasksTaskListsListResponse>;
        }
        tasks: {
            /**
             * Returns all tasks in the specified task list.
             */
            list(object: {
                /*
                 * Task list identifier.
                 */
                tasklist: string;
                /*
                 * Upper bound for a task's completion date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by completion date.
                 */
                completedMax?: string;
                /*
                            * Lower bound for a task's completion date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by completion date.
                */
                completedMin?: string;
                /*
                            * Upper bound for a task's due date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by due date.
                */
                dueMax?: string;
                /*
                            * Lower bound for a task's due date (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by due date.
                */
                dueMin?: string;
                /*
                            * Maximum number of task lists returned on one page.Optional.The default is 100.
                */
                maxResults?: number;
                /*
                            * Token specifying the result page to return. Optional.
                */
                pageToken?: string;
                /*
                            * Flag indicating whether completed tasks are returned in the result.Optional.The default is True.
                */
                showCompleted?: boolean;
                /*
                            * Flag indicating whether deleted tasks are returned in the result.Optional.The default is False.
                */
                showDeleted?: boolean;
                /*
                            * Flag indicating whether hidden tasks are returned in the result.Optional.The default is False.
                */
                showHidden?: boolean;
                /*
                            * Lower bound for a task's last modification time (as a RFC 3339 timestamp) to filter by. Optional. The default is not to filter by last modification time.
                */
                updatedMin?: string;
            }): HttpRequest<GoogleApiTasksTasksListResponse>;

            update(object: { tasklist: string, task: string }, task: Task): HttpRequest<Task>;
            move(object: { tasklist: string, task: string, parent?: string, previous?: string }): HttpRequest<Task>;
        }
    }

    interface GoogleApiTasksTaskListsListResponse {
        /**
         * Type of the resource.This is always "tasks#taskLists".
         */
        kind: string;

        /**
         * ETag of the resource.
         */
        etag: string;

        /**
        * Token that can be used to request the next page of this result.
        */
        nextPageToken: string;

        /**
        * Collection of task lists.
        */
        items: TaskList[];
    }

    interface GoogleApiTasksTasksListResponse {
        /*
         * Type of the resource. This is always "tasks#tasks".
         */
        kind: string;

        /*
         * ETag of the resource.
         */
        etag: string;

        /*
         * Token used to access the next page of this result.
         */
        nextPageToken: string;

        /*
         * Collection of tasks.
         */
        items: Task[];
    }

    export interface TaskList {
        /**
        * Type of the resource. This is always "tasks#taskList".
        */
        kind: string;

        /**
         * Task list identifier.
         */
        id: string;

        /**
         * ETag of the resource.
         */
        etag: string;

        /**
         * Title of the task list.
         */
        title: string;

        /**
         * URL pointing to this task list. Used to retrieve, update, or delete this task list.
         */
        updated: string;

        /**
         * Last modification time of the task list (as a RFC 3339 timestamp).
         */
        selfLink: string;
    }

    export interface Task {
        /*
         *Type of the resource. This is always "tasks#task".
        */
        kind: string;

        /*
         *Task identifier.
        */
        id: string;

        /*
         *ETag of the resource.
        */
        etag: string;

        /*
         * 	Title of the task.
        */
        title: string;

        /*
         * Last modification time of the task (as a RFC 3339 timestamp).
        */
        updated: string;

        /*
         * URL pointing to this task. Used to retrieve, update, or delete this task.
        */
        selfLink: string;

        /*
         *Parent task identifier. This field is omitted if it is a top-level task. This field is read-only. Use the "move" method to move the task under a different parent or to the top level.
        */
        parent: string;

        /*
         * String indicating the position of the task among its sibling tasks under the same parent task or at the top level. If this string is greater than another task's corresponding position string according to lexicographical ordering, the task is positioned after the other task under the same parent task (or at the top level). This field is read-only. Use the "move" method to move the task to another position.
        */
        position: string;

        /*
         *Notes describing the task.
        */
        notes?: string;

        /*
         *Status of the task. This is either "needsAction" or "completed".
        */
        status: string;

        /*
         *Due date of the task (as a RFC 3339 timestamp).
        */
        due?: string;

        /*
         * 	Completion date of the task (as a RFC 3339 timestamp). This field is omitted if the task has not been completed.
        */
        completed: string;

        /*
         *Flag indicating whether the task has been deleted. The default if False.
        */
        deleted: boolean;

        /*
         *Flag indicating whether the task is hidden. This is the case if the task had been marked completed when the task list was last cleared. The default is False. This field is read-only.
        */
        hidden: boolean;

        /*
         * 	Collection of links. This collection is read-only.
        */
        links: Link[]
    }

    export interface Link {
        /*
         * Type of the link, e.g. "email".
        */
        type: string;

        /*
         * The description. In HTML speak: Everything between <a> and </a>.
        */
        description: string;

        /*
         * The URL.
        */
        link: string
    }
}