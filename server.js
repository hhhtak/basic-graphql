const express = require("express")
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")

// スキーマ言語
const schema = buildSchema(`
    type Query {
        quoteOfTheDay: String
        random: Float!
        rollThreeDice: [Int]
        rollDice(numDice: Int!, numSides: Int): [Int]
    }`
)

// リゾルバ
const root = {
    quoteOfTheDay: () => {
        return Math.random() < 0.5 ? "take it easy" : "Salvation lies within"
    },
    random: () => {
        return Math.random()
    },
    rollThreeDice: () => {
        return [1, 2, 3].map((_) => 1 + Math.floor(Math.random() * 6));
    },
    rollDice: ({numDice, numSides}) => {
        let output = [];
        for (let i = 0; i < numDice; i++) {
          output.push(1 + Math.floor(Math.random() * (numSides || 6)));
        }
        return output;
      }
}

// expressサーバ
const app = express()
app.use("/graphql", graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}))
app.listen(4000)
console.log('Running a GraphQL API server at http://localhost:4000/graphql');