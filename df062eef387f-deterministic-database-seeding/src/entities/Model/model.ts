import _ from "lodash"
import firebase from "../../services/firebase"
import { QueryObject, QueryObjectValue } from "./types"

export default class Model {
  /**
   * Entity ID
   */
  id?: string

  /**
   * Base constructor
   */
  constructor(data: Model) {
    this.id = data.id
  }

  /**
   * The Firestore Collection name
   */
  protected static collectionName: string

  /**
   * Create a Firestore Collection converter
   */
  private static get converter() {
    return {
      fromFirestore: <T extends Model>(snapshot: FirebaseFirestore.QueryDocumentSnapshot): T => {
        return this.create<T>(snapshot.data() as T)
      },

      toFirestore: <T extends Model>(model: T): FirebaseFirestore.DocumentData => {
        const { id, ...data } = model
        const defaults = { createdAt: Date.now(), updatedAt: Date.now() }

        return { ...defaults, ...data }
      },
    }
  }

  /**
   * Return the Firestore Collection for the Model
   */
  protected static get collection() {
    return firebase.firestore().collection(this.collectionName).withConverter(this.converter)
  }
  
  /**
   * Create a new Model instance with the data as parameter
   */
  static create<T extends Model>(data: T): T {
    return Reflect.construct(this.constructor, [data])
  }

  /**
   * Create a Firestore Query
   */
  static query(where?: QueryObject) {
    const reducer = (acc: FirebaseFirestore.Query, value: QueryObjectValue, path: string) => {
      const isObject = typeof value === "object"
      const entries = isObject ? Object.entries(value) : ["==", value]

      return acc.where(path, entries[0], entries[1])
    }

    return _.reduce(where, reducer, this.collection)
  }

  /**
   * Apply a callback to all Documents targeted by the Query
   * and returns its result for each Documents
   */
  private static async mapBy(where: QueryObject, callback: (doc: FirebaseFirestore.QueryDocumentSnapshot) => any) {
    return this.query(where)
      .get()
      .then((querySnapshot) => {
        return Promise.all(querySnapshot.docs.map(callback))
      })
  }

  /**
   * Delete all Documents targeted by the Query
   */
  static async deleteManyBy(where?: QueryObject): Promise<void> {
    await this.mapBy(where as QueryObject, (doc) => {
      return doc.ref.delete()
    })
  }

  /**
   * Get all Entities targeted by the Query
   */
  static async findManyBy<T extends Model>(where?: QueryObject): Promise<T[]> {
    return this.mapBy(where as QueryObject, (doc) => {
      return doc.data()
    })
  }

  /**
   * Save or Update an Entity
   */
  static async save<T extends Model>(entity: T): Promise<T> {
    const collection = this.collection
    const doc = collection.doc(entity.id ?? collection.doc().id)
    const newEntity = this.create<T>({ ...entity, id: doc.id })

    await doc.set(newEntity)

    return newEntity
  }

  /**
   * Save or Update Entities
   */
  static async saveMany<T extends Model>(entities: T[]): Promise<T[]> {
    return Promise.all(
      entities.map((entity) => {
        return this.save(entity)
      })
    )
  }
}
