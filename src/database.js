import fs from "node:fs/promises"
import crypto from "node:crypto"

const filePath = new URL("../db.json", import.meta.url)

export default class Database {
  #database = {}

  constructor() {
    fs.readFile(filePath)
      .then((infos) => {
        this.#database = JSON.parse(infos)
      })
      .catch(() => this.persist())
  }

  watch() {
    console.log(this.#database)
  }

  persist() {
    fs.writeFile(filePath, JSON.stringify(this.#database))
  }

  insert(newData) {
    const tasks = this.#database.tasks ?? []

    const newTask = {
      id: crypto.randomUUID(),
      title: newData.title,
      description: newData.description,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    tasks.push(newTask)

    this.#database.tasks = tasks

    this.persist()
  }

  select(queryParam) {
    if (!this.#database.tasks)
      throw new Error("Field doest not exist, start by creating a new task.")

    if (queryParam) {
      const formatQueryParam = queryParam?.replaceAll("%20", "")

      const getSearchedTask = this.#database.tasks.filter((task) => {
        const formatTitles = task?.title?.replaceAll(/ /g, "")

        return formatTitles
          ?.toLowerCase()
          .includes(formatQueryParam.toLowerCase())
      })

      return Boolean(getSearchedTask.length)
        ? getSearchedTask
        : "Task with this title not found."
    }

    return this.#database.tasks
  }

  update(fieldName, idToEdit, newData) {}

  delete(idToRemove) {
    if (!this.#database.tasks) {
      throw new Error("Field doest not exist, start by creating a new task.")
    }

    const findTaskToRemove = this.#database.tasks.findIndex(
      (arr) => arr.id === idToRemove
    )

    if (findTaskToRemove < 0) {
      throw new Error("Task to remove not found.")
    }

    this.#database.tasks.splice(findTaskToRemove, 1)

    return this.#database.tasks
  }

  makeComplete(fieldName, idToComplete) {}
}
