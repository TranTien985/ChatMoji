import mongoose from 'mongoose'

const friendRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  message: {
    type: String,
    maxlength: 300,
  },
}, {timestamps: true})

friendRequestSchema.index({from: 1, to: 1}, {unique: true}); // lời mời là độc nhất 

friendRequestSchema.index({from: 1});

friendRequestSchema.index({to: 1});

const friendRequest= mongoose.model("friendRequest", friendRequestSchema);

export default friendRequest;