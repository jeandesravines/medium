import _ from 'lodash'
import firebase from '../../services/firebase'
import { QueryObject, QueryObjectValue } from './types'

export default abstract class Model {
  /**
   * ID
   */
  id?: string

  /**
   * Creation date timestamp
   */
  createdAt?: number

  /**
   * Update date timestamp
   */
  updatedAt?: number

  /**
   * Base constructor
   */
  constructor(data: Model) {
    this.id = data.id
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  /**
   * The Firestore Collection name
   */
  protected static collectionName: string

  /**
   * Return the Firestore Collection for the Model
   */
  protected static get collection(): FirebaseFirestore.CollectionReference {
    return firebase.firestore().collection(this.collectionName).withConverter(this.converter)
  }

  /**
   * Create a FirestoreDataConverter
   */
  private static get converter() {
    return {
      fromFirestore: <T extends Model>(snapshot: FirebaseFirestore.QueryDocumentSnapshot): T => {
        return this.create<T>(this.transformFromFirestore(snapshot.data()) as T)
      },
      toFirestore: <T extends Model>(model: T): FirebaseFirestore.DocumentData => {
        return this.transformToFirestore(model)
      },
    }
  }

  /**
   * Convert data from Firestore to match the Model constructor.
   * This method can be overriden by a sub-class.
   * The sub-class' method has to call super.transformFromFirestore.
   */
  protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): Record<string, any> {
    return data
  }

  /**
   * Convert Model before be saved to Firestore.
   * This method can be overriden by a sub-class.
   */
  protected static transformToFirestore<T extends Model>(model: T): Record<string, any> {
    // Add timestamps
    const defaults = {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    return _.omit({ ...defaults, ...model }, ['id'])
  }

  /**
   * Create a new Model instance with the data as parameter
   */
  static create<T extends Model>(data: T): T {
    return Reflect.construct(this, data) as T
  }

  /**
   * Create a Firestore Query
   */
  static query(where?: QueryObject): FirebaseFirestore.Query {
    const reducer = (acc: FirebaseFirestore.Query, value: QueryObjectValue, path: string) => {
      const isObject = typeof value === 'object'
      const entries = isObject ? Object.entries(value) : ['==', value]

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
    const { collection } = this
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
