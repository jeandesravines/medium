import _ from 'lodash'
import * as configuration from '../configuration'
import seeders from '../seeders'
import Seeder from '../seeders/Seeder'

if (configuration.app.isProduction) {
  throw new Error('You should not seed the database in other environment than the development one!')
}

/**
 * Seed the Database
 */
async function main(): Promise<void> {
  await seed()
}

/**
 * Seed the Database by walking through each seeders and execute their `clean` and `run` methods
 * if their `shouldRun` method returns true
 */
async function seed(): Promise<void> {
  const reducer = async (deferred: Promise<void>, seeder: Seeder) => {
    await deferred

    const name = seeder.constructor.name
    const shouldRun = await seeder.shouldRun()

    console.info(`Start seeding for ${name} …`)
    console.info(`Should run: ${shouldRun}`)

    if (shouldRun) {
      await seeder.clean()
      await seeder.run()
    }

    console.info(`… done`)
  }

  await _.reduce(seeders, reducer, Promise.resolve())
}

/////
/////

main()
