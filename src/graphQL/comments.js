export const commentTypeDefs = /* GraphQL */ `
  type Query {
    comments: [Comment]
  }

  type Comment {
    _id: ID!
    email: String
    text: String
    user: User
  }
`

export const commentResolvers = {
  Query: {
    comments: async (obj, args, { mongo }) =>
      await mongo.comments.find().limit(20).toArray(),
  },

  Comment: {
    //obj here is the parent object whic is the comments so we can get the emial from comments object and use findOne function
    user: async ({ email }, args, { mongo }) =>
      await mongo.users.findOne({ email }),
  },
}
