import Sequelize from "sequelize";
import mongoose from "mongoose";
import dataConfig from "../config/database";

import User from "../app/models/User";
import File from "../app/models/File";
import Meetup from "../app/models/Meetup";
import Subscription from "../app/models/Subscription";

const models = [User, File, Meetup, Subscription];

class Database {
  constructor() {
    this.init();
    this.mongo();
    this.associate();
  }

  init() {
    this.connection = new Sequelize(dataConfig);

    models.map(model => model.init(this.connection));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      process.env.MONGO_URL,
      {
        useNewUrlParser: true,
        useFindAndModify: true,
      }
    );
  }

  associate() {
    models.forEach(model => {
      if (model.associate) {
        model.associate(this.connection.models);
      }
    });
  }
}

export default new Database();
