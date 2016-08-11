import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import _ from 'lodash';
import bluebird from 'bluebird';
import config from '.';


mongoose.connect(config.mongo.uri, _.extend(config.mongo.options, {
  promiseLibrary: bluebird, // MongoDB Driver Promise
}));
mongoose.connection.on('connected', () => {
  console.log(`Running Mongoose Version ${mongoose.version}`);
}).on('error', err => {
  console.error(err);
}).on('disconnected', () => {
  // console.log('Mongoose Disconnected');
});

// Mongoose Promise
mongoose.Promise = bluebird;

autoIncrement.initialize(mongoose.connection);


export default mongoose;
export { autoIncrement };
