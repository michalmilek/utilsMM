import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { useCallback, useEffect, useState } from "react";

interface UseApiHookProps<OnSuccessResponse, OnErrorResponse> {
	url: string;
	method: "get" | "post" | "put" | "patch" | "delete";
	onSuccess: (data: OnSuccessResponse) => void;
	onError: (error: OnErrorResponse) => void;
	onRequest?: (
		config: AxiosRequestConfig
	) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
}

interface FetchDataArgs<RequestData> {
	body?: RequestData;
	params?: RequestData;
	headers?: AxiosRequestHeaders;
}

interface UseApiHookReturn<RequestData> {
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
	fetchData: (args?: FetchDataArgs<RequestData>) => Promise<void>;
}

function useApi<
	OnSuccessResponse = unknown,
	OnErrorResponse = unknown,
	RequestData = unknown
>({
	url,
	method,
	onSuccess,
	onError,
	onRequest,
}: UseApiHookProps<
	OnSuccessResponse,
	OnErrorResponse
>): UseApiHookReturn<RequestData> {
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [isError, setIsError] = useState(false);

	useEffect(() => {
		const requestInterceptor = axios.interceptors.request.use(
			//eslint-disable-next-line
			(config: any) => (onRequest ? onRequest(config) : config),
			error => Promise.reject(error)
		);

		return () => {
			axios.interceptors.request.eject(requestInterceptor);
		};
	}, [onRequest]);

	const fetchData = useCallback(
		async ({ body, params, headers }: FetchDataArgs<RequestData> = {}) => {
			const requestConfig: AxiosRequestConfig = {
				url: url,
				method: method,
				headers: headers,
				...(params && { params }),
				...(body && { data: body }),
			};

			setIsLoading(true);
			setIsError(false);
			setIsSuccess(false);

			try {
				const response = await axios(requestConfig);
				setIsSuccess(true);
				onSuccess(response.data as OnSuccessResponse);
			} catch (error) {
				setIsError(true);
				onError(error as OnErrorResponse);
			} finally {
				setIsLoading(false);
			}
		},
		[url, method, onSuccess, onError]
	);

	return {
		isError,
		isLoading,
		isSuccess,
		fetchData,
	};
}

export default useApi;

/*

example usage:

PS. works even better with axios instance
PS2. Authorization: to send token use just standard axios interceptors

const { isError, isLoading, isSuccess, fetchData } = useApi<ApiResponse, ApiError>({
  url: 'https://api.example.com/posts',
  method: 'post',
  onSuccess: (data) => console.log('Data posted successfully:', data),
  onError: (error) => console.error('Error posting data:', error.message),
});

fetchData({
  body: { content: 'Hello, world!' },
  params: { page: 1, limit: 10 }
});



file upload:

const { fetchData, isLoading, isError, isSuccess } = useApi({
        url: 'https://api.example.com/upload',
        method: 'post',
        onSuccess: data => console.log('Upload successful:', data),
        onError: error => console.error('Upload failed:', error),
    });

    const handleFileUpload = event => {
        const [file] = event.target.files;
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetchData({ body: formData });
        }
    };

*/
