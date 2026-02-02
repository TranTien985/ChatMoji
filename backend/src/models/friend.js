import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true },
);

// hàm này là middlewares để check id của 2 user
friendSchema.pre('save', function(next){
  const a = this.userA.toString();
  const b = this.userB.toString();

  //id nào nhỏ hơn sẽ là a còn id lớn hơn sẽ là b
  if(a > b){
    this.userA = new mongoose.Types.ObjectId(b);
    this.userB = new mongoose.Types.ObjectId(a);
  }

  next()
})

friendSchema.index({ userA: 1, userB: 1 }, { unique: true });

const Friend = mongoose.model("Friend", friendSchema);

export default Friend;
