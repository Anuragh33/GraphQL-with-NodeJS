import { createSchema } from 'graphql-yoga'
import { ObjectId } from 'mongodb'
import _ from 'lodash'
import { commentResolvers, commentTypeDefs } from './comments.js'

const typeDefs = /* GraphQL */ `
  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type User {
    id: ID!
    name: String
    email: String
  }

  input newUserInput {
    name: String!
    email: String!
  }

  input updateUserInput {
    name: String
    email: String
  }

  type Mutation {
    createUser(user: newUserInput!): User
    deleteUser(id: ID!): Boolean
    updateUser(id: ID!, updateUser: updateUserInput): User
  }
`

const resolvers = {
  Query: {
    users: async (obj, args, { mongo }) => {
      const users = await mongo.users.find().limit(20).toArray()
      return users
    },
    user: async (obj, args, { mongo }) => {
      const user = await mongo.users.findOne({
        _id: ObjectId.createFromHexString(args.id),
      })

      return user
    },
  },

  User: {
    id: (obj) => {
      return obj._id
    },
    name: (obj) => {
      return obj.name?.toUpperCase()
    },
  },

  Mutation: {
    createUser: async (_, { user }, { mongo }) => {
      const newUser = await mongo.users.insertOne(user)

      return {
        id: newUser.insertedId,
        ...user,
      }
    },
    deleteUser: async (obj, args, { mongo }) => {
      const deleteUser = await mongo.users.deleteOne({
        _id: ObjectId.createFromHexString(args.id),
      })
      return deleteUser.acknowledged
    },

    updateUser: async (obj, args, { mongo }) => {
      const updatedUser = await mongo.users.findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(args.id),
        },
        {
          $set: {
            name: args.updateUser.name,
            email: args.updateUser.email,
          },
        }
      )

      return await mongo.users.findOne({
        _id: ObjectId.createFromHexString(args.id),
      })
    },
  },
}

export const schema = createSchema({
  typeDefs: [typeDefs, commentTypeDefs],
  resolvers: _.merge(resolvers, commentResolvers),
})
