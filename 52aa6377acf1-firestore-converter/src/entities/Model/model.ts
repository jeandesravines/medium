import { firestore } from 'firebase-admin'
import _ from 'lodash'
import firebase from '../../services/firebase'
import { QueryObject, QueryObjectValue } from './types'

export default class Model {
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
   * Create a FirestoreCollectionReference for the current Model
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
        return this.create<T>(this.fromFirestore(snapshot) as T)
      },
      toFirestore: <T extends Model>(model: T): FirebaseFirestore.DocumentData => {
        return this.toFirestore(model)
      },
    }
  }

  /**
   * Convert the data from Firestore to match the Model constructor.
   */
  private static fromFirestore<T extends Model>(snapshot: FirebaseFirestore.DocumentSnapshot): T {
    const transformed = this.transformFromFirestore(snapshot.data() as FirebaseFirestore.DocumentSnapshot)
    const addons = {
      id: snapshot.id,
      createdAt: snapshot.createTime?.toMillis(),
      updatedAt: snapshot.updateTime?.toMillis(),
    }

    return {
      ...transformed,
      ...addons,
    } as T
  }

  /**
   * Convert the Model before be saved to Firestore.
   */
  private static toFirestore<T extends Model>(model: T): Record<string, any> {
    const transformed = this.transformToFirestore(model)
    const filtered = _.omit(transformed, ['id', 'createdAt', 'updatedAt'])

    return { ...filtered }
  }

  /**
   * Convert the data from Firestore to match the Model constructor.
   */
  protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): Record<string, any> {
    return data
  }

  /**
   * Convert the Model before be saved to Firestore.
   * This method can be overriden by a sub-class.
   */
  protected static transformToFirestore<T extends Model>(model: T): Record<string, any> {
    return model
  }

  /**
   * Create a new Model instance with the data as parameter
   */
  static create<T extends Model>(data: T): T {
    return Reflect.construct(this, [data]) as T
  }

  /**
   * Create a Firestore Query
   */
  static query(where?: QueryObject): FirebaseFirestore.Query | FirebaseFirestore.DocumentReference {
    // If the ID is queried,
    // then we by pass the process to target the document by key
    if (where?.id) {
      return this.collection.doc(where.id)
    }

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
    const snapshot = await this.query(where).get()

    if (snapshot instanceof firestore.DocumentSnapshot) {
      return [callback(snapshot as FirebaseFirestore.QueryDocumentSnapshot)]
    }

    return Promise.all(snapshot.docs.map(callback))
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
   * Get only one Entity from all the targeted by the Query
   */
  static async findOneBy<T extends Model>(where?: QueryObject): Promise<T> {
    return this.findManyBy<T>(where).then(([doc]) => doc)
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

    return this.findOneBy({ id: doc.id })
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
