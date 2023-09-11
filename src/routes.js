/* task model:

    id: 1,
    title: "Random Title",
    description: "Random desc",
    completed_at: "Date",
    created_at: "Date",
    updated_at: "Date"
 */

import Database from "./database.js";
import { buildRoutePath } from "./utils/buildRoutePath.js";

const database = new Database();

export const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { data } = req.body;

      try {
        database.insert("tasks", data);

        return res.writeHead(200).end(JSON.stringify("New task created."));
      } catch (e) {
        console.log(e);
        return res
          .writeHead(500)
          .end(JSON.stringify("Failed to create new task, try again later."));
      }
    },
  },

  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title } = req.body ?? {};

      try {
        const tasks = database.select(title);

        return res.writeHead(200).end(JSON.stringify(tasks));
      } catch (e) {
        console.log(e);
        return res
          .writeHead(404)
          .end(
            JSON.stringify(
              "Field doest not exist, start by creating a new task."
            )
          );
      }
    },
  },

  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {},
  },

  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      try {
        database.delete(id);

        return res
          .writeHead(200)
          .end(JSON.stringify("Task deleted successfully."));
      } catch {
        return res
          .writeHead(404)
          .end(JSON.stringify("Task or field not found."));
      }
    },
  },

  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      try {
        database.makeComplete(id);

        return res
          .writeHead(200)
          .end(JSON.stringify("Task marked as complete."));
      } catch (e) {
        return res.writeHead(409).end(JSON.stringify(e.message));
      }
    },
  },
];
