import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API基本設定
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 30000; // 30秒

// APIエラーの型定義
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// APIクライアントの作成
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// エラーハンドリング関数
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    // レスポンスがある場合
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      
      // サーバーから明示的なエラーメッセージがある場合
      if (data?.message) {
        return {
          message: data.message,
          status,
          errors: data.errors,
        };
      }
      
      // ステータスコードに基づくデフォルトメッセージ
      switch (status) {
        case 400:
          return {
            message: 'バリデーションエラー',
            status,
            errors: data?.errors,
          };
        case 401:
          return {
            message: '認証エラー。ログインしてください。',
            status,
          };
        case 403:
          return {
            message: '権限がありません。',
            status,
          };
        case 404:
          return {
            message: 'リソースが見つかりません。',
            status,
          };
        case 500:
          return {
            message: 'サーバーエラーが発生しました。',
            status,
          };
        default:
          return {
            message: 'エラーが発生しました。',
            status,
          };
      }
    }
    
    // ネットワークエラー（サーバーに到達できない）
    if (axiosError.request) {
      return {
        message: 'ネットワークエラーが発生しました。接続を確認してください。',
        status: 0,
      };
    }
    
    // リクエスト作成時のエラー
    return {
      message: 'リクエストの送信に失敗しました。',
      status: 0,
    };
  }
  
  // 非Axiosエラー
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 0,
    };
  }
  
  // 不明なエラー
  return {
    message: '不明なエラーが発生しました。',
    status: 0,
  };
};

// インターセプターの設定
export const setupInterceptors = (client: AxiosInstance, navigate?: (path: string) => void) => {
  // リクエストインターセプター
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 認証トークンの付与
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // レスポンスインターセプター
  client.interceptors.response.use(
    (response) => {
      // 正常レスポンスはそのまま返す
      return response;
    },
    async (error) => {
      // 401エラーの場合、トークンを削除してログイン画面へ
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        if (navigate) {
          navigate('/login');
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// デフォルトインターセプターの設定
setupInterceptors(apiClient);

// 共通APIメソッド
export const api = {
  get: <T = any>(url: string, config?: any) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => apiClient.delete<T>(url, config),
};

export default api;