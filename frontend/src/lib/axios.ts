import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : '/api', 
  // nếu chạy ở môi trường dev thì gọi local còn khi lên sever thì sẽ gọi /api
  withCredentials: true, // nếu ko có dòng này thì cookie sẽ ko được gửi lên server 
})

export default api; 