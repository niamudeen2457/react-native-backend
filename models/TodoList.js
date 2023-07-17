const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  list: [
    {
      value: { type: String },
      isEdit: { type: Boolean, default: false }
    }
  ],
  userId:{ type: String }
});

const TodoList = mongoose.model('todolist', ListSchema);

module.exports = TodoList;
