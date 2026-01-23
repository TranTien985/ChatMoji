import mongoose from 'mongoose'

export const  connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB)
    console.log("ket noi thanh cong");
    
  } catch (error) {
    console.log("ket noi khong thanh cong",  error);
    process.exit(1); // dừng chương trình nếu không kết nối được với csdl
  }
}