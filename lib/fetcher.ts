import axiosInstance from "@/lib/axios";
import axios from "axios";
const fetcher = <T= any> (url: string ): Promise<T> => axiosInstance.get(url).then((response) => response.data).catch((error) => {if (axios.isAxiosError(error)){const message = error.response?.data?.message || 'Something went wrong';throw new Error(message);}throw error;});

export default fetcher;