import _ from 'lodash'
import * as configuration from '../configuration'
import seeders from '../seeders'
import Seeder from '../seeders/Seeder'

if (configuration.app.isProduction) {
  throw new Error('You should not seed the database in other environment than the development one!')
}

/**
 * Seed the Database by walking through each seeders and execute their `clean` and `run` methods
 */
async function seed(): Promise<void> {
  const reducer = async (deferred: Promise<void>, seeder: Seeder) => {
    await deferred

    console.info(`Start seeding for ${seeder.constructor.name} …`)

    await seeder.clean()
    await seeder.run()

    console.info(`… done`)
  }

  await _.reduce(seeders, reducer, Promise.resolve())
}

/////
/////

seed()
