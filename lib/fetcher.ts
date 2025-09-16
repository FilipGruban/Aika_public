import axiosInstance from "@/lib/axios";

const fetcher = <T= any> (url: string ): Promise<T> => axiosInstance.get(url).then((response) => response.data);

export default fetcher;