import Chance from 'chance'
import * as configuration from '../configuration'

export default abstract class Seeder {
  /**
   * The Chance singleton
   */
  static readonly generator: Chance.Chance = new Chance(
    configuration.chance.key
  )

  /**
   * Clean the Collection
   */
  abstract async clean(): Promise<void>

  /**
   * Create Entities
   */
  abstract async run(): Promise<void>
}
