import axios from "axios";

const instance = axios.create({
  baseURL: "http://192.168.2.96:5000",
});

instance.interceptors.response.use((response) => {
  return response.data;
});

export default instance;
