import Database from "./database.js";
import axios from "axios";
import { buildRoutePath } from "./utils/buildRoutePath.js";
import { parse } from "csv-parse";
import fs from "node:fs";
const database = new Database();

const csvPath = new URL("./tasks-csv/tasks.csv", import.meta.url);
const csvReadStream = fs.createReadStream(csvPath);

export const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { data } = req.body;

      if (!data) {
        return res
          .writeHead(404)
          .end(JSON.stringify("Data not found on body requisition."));
      }

      try {
        database.insert(data);

        return res.writeHead(200).end(JSON.stringify("New task created."));
      } catch (e) {
        return res.writeHead(500).end(JSON.stringify(e.message));
      }
    },
  },

  {
    method: "POST",
    path: buildRoutePath("/tasks-csv"),
    handler: async (_, res) => {
      const parser = parse({
        delimiter: ",",
        skipEmptyLines: true,
        fromLine: 2,
      });

      const linesCsv = csvReadStream.pipe(parser);

      try {
        for await (const record of linesCsv) {
          const [title, description] = record;

          await axios.post(
            "http://localhost:3333/tasks",
            JSON.stringify({ data: { title, description } })
          );
        }
      } catch (e) {
        return res
          .writeHead(500)
          .end(
            JSON.stringify(
              "Some task with this title is already registered and not completed."
            )
          );
      }

      return res
        .writeHead(200)
        .end(JSON.stringify("New tasks created based on CSV."));
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
      } catch {
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
    handler: (req, res) => {
      const { id } = req.params;

      const { title, description } = req.body?.data ?? {};

      if (!title || !description) {
        return res
          .writeHead(404)
          .end(
            JSON.stringify(
              "Title and description is required to update an task."
            )
          );
      }

      try {
        database.updateTask(id, { title, description });

        return res
          .writeHead(200)
          .end(JSON.stringify("Task edited successfully."));
      } catch (e) {
        return res.writeHead(404).end(JSON.stringify(e.message));
      }
    },
  },

  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      if (!id)
        return res
          .writeHead(404)
          .end(JSON.stringify("ID not found on body requisition."));

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

      if (!id)
        return res
          .writeHead(404)
          .end(JSON.stringify("ID not found on body requisition."));

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
