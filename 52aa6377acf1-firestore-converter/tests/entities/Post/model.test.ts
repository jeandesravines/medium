import { PostType } from '../../../src/entities/Post/constants'
import Post from '../../../src/entities/Post/model'
import User from '../../../src/entities/User/model'

describe('save', () => {
  test('should transformData', async () => {
    jest.spyOn(Post, 'transformFromFirestore' as any)
    jest.spyOn(Post, 'transformToFirestore' as any)

    const savedUser = await User.save(
      new User({
        email: 'hi@jeandesravines.com',
        username: 'jean.desravines',
        password: '<password>',
        name: 'Jean Desravines',
      })
    )

    const savedPost = await Post.save(
      new Post({
        title: 'Data Transformation using Cloud Firestore Converters',
        body: 'Protect your app by using typed class Models in your Firestore projects',
        type: PostType.TUTORIAL,
        author: savedUser.id,
      })
    )

    // eslint-disable-next-line dot-notation
    expect(Post['transformToFirestore']).toHaveBeenCalledWith({
      id: savedPost.id,
      title: 'Data Transformation using Cloud Firestore Converters',
      body: 'Protect your app by using typed class Models in your Firestore projects',
      type: PostType.TUTORIAL,
      author: savedUser.id,
    })

    // eslint-disable-next-line dot-notation
    expect(Post['transformFromFirestore']).toHaveBeenCalledWith({
      title: 'Data Transformation using Cloud Firestore Converters',
      body: 'Protect your app by using typed class Models in your Firestore projects',
      type: PostType.TUTORIAL,
      author: savedUser.id,
    })

    expect(typeof savedPost.id).toBe('string')
    expect(typeof savedPost.createdAt).toBe('number')
    expect(typeof savedPost.updatedAt).toBe('number')
    expect(savedPost.publishedAt).toBe(null)
  })
})
