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

  insert(fieldName, newData) {
    const tasks = this.#database[fieldName] ?? []

    const newTask = {
      id: crypto.randomUUID(),
      title: newData.title,
      description: newData.description,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    tasks.push(newTask)

    this.#database[fieldName] = tasks

    this.persist()
  }

  select(fieldToPick, queryParam) {}

  update(fieldName, idToEdit, newData) {}

  remove(fieldName, idToRemove) {}

  makeComplete(fieldName, idToComplete) {}
}
