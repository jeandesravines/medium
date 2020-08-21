import Model from '../entities/Model/model'
import { PostType } from '../entities/Post/constants'
import Post from '../entities/Post/model'
import User from '../entities/User/model'
import Seeder from './Seeder'

export default class PostSeeder extends Seeder {
  /**
   * Clean the Collection
   */
  async clean(): Promise<void> {
    return Post.deleteManyBy()
  }

  /**
   * Create 4 Posts per Users. 1 of each type.
   */
  async run(): Promise<void> {
    const users: User[] = await User.findManyBy() as User[]
    const types: String[] = Object.values(PostType)

    const documents = users.flatMap((user: User) => {
      return types.map((type, i) => {
        return {
          type,
          author: user.id,
          title: Seeder.generator.sentence(),
          body: Seeder.generator.paragraph(),
          // Only 1 in 2 article will have a publication date
          publishedAt: i % 2 ? Seeder.generator.date({ year: 2000 }) : null,
        }
      })
    })

    await Post.saveMany(documents as Model[])
  }
}
