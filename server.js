const express = require("express")
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")

// スキーマ言語
const schema = buildSchema(`
    type RandomDie {
        numSides: Int!
        rollOnce: Int!
        roll(numRolls: Int!): [Int]
    }

    type Query {
        quoteOfTheDay: String
        random: Float!
        rollThreeDice: [Int]
        rollDice(numDice: Int!, numSides: Int): [Int]
        getDie(numSides: Int): RandomDie
    }

    input MessageInput {
      content: String
      author: String
    }
    
    type Message {
        id:ID!
        content: String
        author: String
    }
    
    type Query2 {
        getMessage(id: ID!): Message
    }
    
    type Mutation {
        createMessage(input: MessageInput): Message
        updateMessage(id: ID!, input: MessageInput): Message
    }
`)

class Message {
  constructor(id, {content, author}) {
    this.id = id;
    this.content = content;
    this.author = author
  }
}

//リゾルバ関数内の処理はクラス化できる
class RandomDie {
    constructor(numSides) {
      this.numSides = numSides;
    }
  
    rollOnce() {
      return 1 + Math.floor(Math.random() * this.numSides);
    }
  
    roll({numRolls}) {
      let output = [];
      for (var i = 0; i < numRolls; i++) {
        output.push(this.rollOnce());
      }
      return output;
    }
  }

// データの入れ物
let fakeDatabase = {}

// リゾルバ
const root = {
    getMessage: ({id}) => {
      if (!fakeDatabase[id]) {
        throw new Error('no message exists with id ' + id);
      }
      return new Message(id, fakeDatabase[id])
    },
    createMessage: ({input}) => {
      // ランダムなIdを生成
      var id = require('crypto').randomBytes(10).toString('hex');
  
      fakeDatabase[id] = input;
      return new Message(id, input);
    },
    updateMesssage: ({id, input}) => {
      if(!fakeDatabase[id]) {
        throw new Error('no message exists with id ' + id);
      }
      // 古いデータの書き換え
      fakeDatabase[id] = input;
      return new Message(id, input)
    },
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
    },
    getDie: ({numSides}) => {
        return new RandomDie(numSides || 6);
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