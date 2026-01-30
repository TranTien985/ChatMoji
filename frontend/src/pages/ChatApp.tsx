import Logout from "@/components/auth/logout"
import { useAuthStore } from "@/stores/useAuthStore"

const ChatApp = () => {
  const user = useAuthStore(s => s.user); // cú pháp này là chỉ lấy đúng trường user trong store
  return (
    <div>
      {user?.username}
      <Logout/>
    </div>
  )
}

export default ChatApp