import PostSeeder from './PostSeeder'
import Seeder from './Seeder'
import UserSeeder from './UserSeeder'

export default [new UserSeeder(), new PostSeeder()] as Seeder[]
