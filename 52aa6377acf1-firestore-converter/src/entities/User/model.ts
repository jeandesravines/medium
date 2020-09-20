import Model from '../Model/model'

export default class User extends Model {
  /**
   * The Firestore Collection name
   */
  protected static collectionName = 'users'

  username: string

  email: string

  password: string

  name: string

  description?: string | null

  job?: string | null

  constructor(data: User) {
    super(data)

    this.username = data.username
    this.email = data.email
    this.password = data.password
    this.name = data.name
    this.description = data.description
    this.job = data.job
  }

  protected static transformFromFirestore(data: FirebaseFirestore.DocumentData): User {
    return {
      username: String(data.username),
      email: String(data.email),
      password: String(data.password),
      name: String(data.name),
      description: data.description ? String(data.description) : null,
      job: data.job ? String(data.job) : null,
    }
  }
}
