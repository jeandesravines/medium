/* eslint-disable dot-notation */

import Model from '../../../src/entities/Model/model'

describe('toFirestore', () => {
  test('should not have additional fields', async () => {
    jest.spyOn(Model, 'transformToFirestore' as any)

    const data = {
      id: 'ID',
      name: 'Jean Desravines',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const result = Model['toFirestore'](data)

    expect(Model['transformToFirestore']).toHaveBeenCalledWith(data)
    expect(result).toEqual({
      name: 'Jean Desravines',
    })
  })
})

describe('fromFirestore', () => {
  test('should have additional fields', async () => {
    const data = {
      name: 'Jean Desravines',
    }

    const snapshot = {
      id: 'ID',
      createTime: { toMillis: () => 1234 },
      updateTime: { toMillis: () => 5678 },
      data: () => data as Record<string, any>,
    } as FirebaseFirestore.DocumentSnapshot

    // eslint-disable-next-line dot-notation
    const result = Model['fromFirestore'](snapshot)

    expect(result).toEqual({
      id: 'ID',
      name: 'Jean Desravines',
      createdAt: 1234,
      updatedAt: 5678,
    })
  })
})
