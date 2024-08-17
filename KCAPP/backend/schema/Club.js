// models/Club.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: String,
  time: String
});

const scheduleSchema = new mongoose.Schema({
  Monday: [classSchema],
  Tuesday: [classSchema],
  Wednesday: [classSchema],
  Thursday: [classSchema],
  Friday: [classSchema],
  Saturday: [classSchema]
});

const clubSchema = new mongoose.Schema({
  clubName: String,
  clubAddress: String,
  clubPhoneNumber: String,
  clubProgManager: String,
  clubProgManagerPhone: String,
  schedule: scheduleSchema
});

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;
