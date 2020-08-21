import Model from '../entities/Model/model'
import User from '../entities/User/model'
import Seeder from './Seeder'

export default class UserSeeder extends Seeder {
  /**
   * Clean the Collection
   */
  async clean(): Promise<void> {
    return User.deleteManyBy()
  }

  /**
   * Create many Users
   */
  async run(): Promise<void> {
    const documents = Array.from({ length: 20 }, (v, i) => {
      // The usernames are 6 characters strings from "000001" to "000020".
      // It will allow us to log into the app knowing all the usernames and passwords
      const username = `${i + 1}`.padStart(6, '0')

      return {
        username,
        email: `${username}@myapp.com`,
        password: 'H3!!0Wor1D', // 😅(Never do that!)
        name: Seeder.generator.name(),
        description: Seeder.generator.sentence(),
        job: Seeder.generator.profession(),
      }
    })

    await User.saveMany(documents as Model[])
  }
}
