import fs from "node:fs/promises";
import crypto from "node:crypto";

const filePath = new URL("../db.json", import.meta.url);

export default class Database {
  #database = {};

  constructor() {
    fs.readFile(filePath)
      .then((infos) => {
        this.#database = JSON.parse(infos);
      })
      .catch(() => this.persist());
  }

  watch() {
    console.log(this.#database);
  }

  persist() {
    fs.writeFile(filePath, JSON.stringify(this.#database));
  }

  findTaskByIndex(idToFind) {
    const findTaskByIndex = this.#database.tasks.findIndex(
      (arr) => arr.id === idToFind
    );

    return findTaskByIndex;
  }

  insert(newData) {
    if (this.#database.tasks) {
      const taskAlreadyExists = this.#database.tasks.find((task) => {
        return task.title.includes(newData.title);
      });

      if (taskAlreadyExists?.completed_at === null) {
        throw new Error("Task with this title already exists.");
      }
    }

    const tasks = this.#database.tasks ?? [];

    const newTask = {
      id: crypto.randomUUID(),
      title: newData.title,
      description: newData.description,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    tasks.push(newTask);

    this.#database.tasks = tasks;

    this.persist();
  }

  select(queryParam) {
    if (!this.#database.tasks)
      throw new Error("Field doest not exist, start by creating a new task.");

    if (queryParam) {
      const formatQueryParam = queryParam?.replaceAll("%20", "");

      const getSearchedTask = this.#database.tasks.filter((task) => {
        const formatTitles = task?.title?.replaceAll(/ /g, "");

        return formatTitles
          ?.toLowerCase()
          .includes(formatQueryParam.toLowerCase());
      });

      return Boolean(getSearchedTask.length)
        ? getSearchedTask
        : "Task with this title not found.";
    }

    return this.#database.tasks;
  }

  updateTask(idToEdit, newData) {
    if (!this.#database.tasks) {
      throw new Error("Field doest not exist, start by creating a new task.");
    }

    const findTaskByIndex = this.findTaskByIndex(idToEdit);

    if (findTaskByIndex < 0) {
      throw new Error("Task to remove not found.");
    }

    if (this.#database.tasks[findTaskByIndex].completed_at !== null) {
      throw new Error("Can't edit a completed task.");
    }

    const editedTask = {
      ...this.#database.tasks[findTaskByIndex],
      title: newData.title,
      description: newData.description,
    };

    console.log(editedTask);

    this.#database.tasks.splice(findTaskByIndex, 1, editedTask);

    this.persist();

    return this.#database.tasks;
  }

  delete(idToRemove) {
    if (!this.#database.tasks) {
      throw new Error("Field doest not exist, start by creating a new task.");
    }

    const findTaskToRemove = this.findTaskByIndex(idToRemove);

    if (findTaskToRemove < 0) {
      throw new Error("Task to remove not found.");
    }

    this.#database.tasks.splice(findTaskToRemove, 1);

    this.persist();

    return this.#database.tasks;
  }

  makeComplete(idToComplete) {
    if (!this.#database.tasks) {
      throw new Error("Field doest not exist, start by creating a new task.");
    }

    const findTaskByIndex = this.findTaskByIndex(idToComplete);

    if (findTaskByIndex < 0) {
      throw new Error("Task to remove not found.");
    }

    if (this.#database.tasks[findTaskByIndex].completed_at !== null) {
      throw new Error(
        "Can't mark a task as completed if already is completed."
      );
    }

    const completedTask = {
      ...this.#database.tasks[findTaskByIndex],
      completed_at: new Date(),
      updated_at: new Date(),
    };

    this.#database.tasks.splice(findTaskByIndex, 1, completedTask);

    this.persist();

    return this.#database.tasks;
  }
}
