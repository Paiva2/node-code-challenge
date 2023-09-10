/* task model:

    id: 1,
    title: "Random Title",
    description: "Random desc",
    completed_at: "Date",
    created_at: "Date",
    updated_at: "Date"
 */

import Database from "./database.js"
import { buildRoutePath } from "./utils/buildRoutePath.js"

const database = new Database()

export const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { data } = req.body

      try {
        database.insert("tasks", data)

        return res.writeHead(200).end(JSON.stringify("New task created."))
      } catch (e) {
        console.log(e)
        return res
          .writeHead(500)
          .end(JSON.stringify("Failed to create new task, try again later."))
      }
    },
  },

  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      try {
        const tasks = database.select()

        return res.writeHead(200).end(JSON.stringify(tasks))
      } catch {
        return res
          .writeHead(404)
          .end(
            JSON.stringify(
              "Field doest not exist, start by creating a new task."
            )
          )
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
    handler: (req, res) => {},
  },

  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {},
  },
]
