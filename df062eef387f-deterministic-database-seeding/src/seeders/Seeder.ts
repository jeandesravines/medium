import Chance from 'chance'
import * as configuration from '../configuration'

export default abstract class Seeder {
  /**
   * The faker singleton
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

  /**
   * Returns true if the seed can be run
   */
  async shouldRun(): Promise<boolean> {
    return true
  }
}
