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
  description?: string
  job?: string

  constructor(data: User) {
    super(data)

    this.username = data.username
    this.email = data.email
    this.password = data.password
    this.name = data.name
    this.description = data.description
    this.job = data.job
  }
}
