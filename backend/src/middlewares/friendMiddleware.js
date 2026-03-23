import Friend from "../models/friend.model.js"

const pair = (a, b) => (a < b ? [a , b] : [b , a]); // sắp xếp thứ tự của user a và user b 1 cách nhất quán trc khi truy vấn 

export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString();

        const recipientId = req.body?.recipientId ?? null; // kiểm tra xem vế trái có là null hay ko

        if(!recipientId){
            return res.status(400).json({message: 'Cần cung cấp recipientId'})
        }

        if(recipientId){
            const [userA, userB] = pair(me, recipientId);

            const isFriend = await Friend.findOne({userA, userB});

            if(!isFriend){
                return res.status(403).json({message: "Bạn chưa kết bạn với người này"});
            }
            
            return next();
        }

        // todo: chat nhóm 
    } catch (error) {
        console.error("Lỗi xảy ra khi checkFriendship", error);
        return res.status(500).json({message: "Lỗi hệ thống "})
    }
}