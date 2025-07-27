import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosInstance } from 'axios';

// モックインスタンスをグローバルに定義
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

// Axiosのモック
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn(),
  },
}));

describe('API Service', () => {
  let apiClient: AxiosInstance;
  let handleApiError: (error: unknown) => any;
  let setupInterceptors: (client: AxiosInstance, navigate?: (path: string) => void) => void;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // LocalStorageのモック
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as any;
    
    // モジュールを動的にインポート
    const apiModule = await import('./api');
    apiClient = apiModule.apiClient;
    handleApiError = apiModule.handleApiError;
    setupInterceptors = apiModule.setupInterceptors;
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  describe('apiClient', () => {
    it('APIクライアントが正しく作成される', async () => {
      const axios = await import('axios');
      expect(axios.default.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('リクエストインターセプターが設定される', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it('レスポンスインターセプターが設定される', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('handleApiError', () => {
    it('Axiosエラーの場合、適切なエラーメッセージを返す', async () => {
      const axios = await import('axios');
      const axiosError = {
        response: {
          data: {
            message: 'サーバーエラーが発生しました',
          },
          status: 500,
        },
        message: 'Network Error',
      };

      (axios.default.isAxiosError as any).mockReturnValue(true);

      const error = handleApiError(axiosError);
      expect(error.message).toBe('サーバーエラーが発生しました');
      expect(error.status).toBe(500);
    });

    it('ネットワークエラーの場合、適切なメッセージを返す', async () => {
      const axios = await import('axios');
      const networkError = {
        message: 'Network Error',
        request: {},
      };

      (axios.default.isAxiosError as any).mockReturnValue(true);

      const error = handleApiError(networkError);
      expect(error.message).toBe('ネットワークエラーが発生しました。接続を確認してください。');
      expect(error.status).toBe(0);
    });

    it('リクエストエラーの場合、適切なメッセージを返す', async () => {
      const axios = await import('axios');
      const requestError = {
        message: 'Request failed',
      };

      (axios.default.isAxiosError as any).mockReturnValue(true);

      const error = handleApiError(requestError);
      expect(error.message).toBe('リクエストの送信に失敗しました。');
      expect(error.status).toBe(0);
    });

    it('400エラーの場合、バリデーションエラーメッセージを返す', async () => {
      const axios = await import('axios');
      const validationError = {
        response: {
          data: {
            message: 'バリデーションエラー',
            errors: {
              name: ['名前は必須です'],
              email: ['メールアドレスの形式が正しくありません'],
            },
          },
          status: 400,
        },
      };

      (axios.default.isAxiosError as any).mockReturnValue(true);

      const error = handleApiError(validationError);
      expect(error.message).toBe('バリデーションエラー');
      expect(error.status).toBe(400);
      expect(error.errors).toEqual({
        name: ['名前は必須です'],
        email: ['メールアドレスの形式が正しくありません'],
      });
    });

    it('401エラーの場合、認証エラーメッセージを返す', async () => {
      const axios = await import('axios');
      const authError = {
        response: {
          data: {},
          status: 401,
        },
      };

      (axios.default.isAxiosError as any).mockReturnValue(true);

      const error = handleApiError(authError);
      expect(error.message).toBe('認証エラー。ログインしてください。');
      expect(error.status).toBe(401);
    });

    it('403エラーの場合、権限エラーメッセージを返す', async () => {
      const axios = await import('axios');
      const forbiddenError = {
        response: {
          data: {},
          status: 403,
        },
      };

      (axios.default.isAxiosError as any).mockReturnValue(true);

      const error = handleApiError(forbiddenError);
      expect(error.message).toBe('権限がありません。');
      expect(error.status).toBe(403);
    });

    it('404エラーの場合、リソース不在メッセージを返す', async () => {
      const axios = await import('axios');
      const notFoundError = {
        response: {
          data: {},
          status: 404,
        },
      };

      (axios.default.isAxiosError as any).mockReturnValue(true);

      const error = handleApiError(notFoundError);
      expect(error.message).toBe('リソースが見つかりません。');
      expect(error.status).toBe(404);
    });

    it('500エラーの場合、サーバーエラーメッセージを返す', async () => {
      const axios = await import('axios');
      const serverError = {
        response: {
          data: {},
          status: 500,
        },
      };

      (axios.default.isAxiosError as any).mockReturnValue(true);

      const error = handleApiError(serverError);
      expect(error.message).toBe('サーバーエラーが発生しました。');
      expect(error.status).toBe(500);
    });

    it('非Axiosエラーの場合、一般的なエラーメッセージを返す', async () => {
      const axios = await import('axios');
      const generalError = new Error('Something went wrong');

      (axios.default.isAxiosError as any).mockReturnValue(false);

      const error = handleApiError(generalError);
      expect(error.message).toBe('Something went wrong');
      expect(error.status).toBe(0);
    });
  });

  describe('setupInterceptors', () => {
    it('リクエストインターセプターで認証トークンが設定される', async () => {
      const mockToken = 'test-auth-token';
      localStorage.getItem = vi.fn().mockReturnValue(mockToken);

      const mockUse = vi.fn().mockImplementation((successFn) => {
        const config = { headers: {} };
        const result = successFn(config);
        expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
      });

      const mockApiClient = {
        interceptors: {
          request: { use: mockUse },
          response: { use: vi.fn() },
        },
      };

      setupInterceptors(mockApiClient as any);
      expect(mockUse).toHaveBeenCalled();
    });

    it('トークンがない場合、Authorizationヘッダーが設定されない', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(null);

      const mockUse = vi.fn().mockImplementation((successFn) => {
        const config = { headers: {} };
        const result = successFn(config);
        expect(result.headers.Authorization).toBeUndefined();
      });

      const mockApiClient = {
        interceptors: {
          request: { use: mockUse },
          response: { use: vi.fn() },
        },
      };

      setupInterceptors(mockApiClient as any);
      expect(mockUse).toHaveBeenCalled();
    });

    it('レスポンスインターセプターが正常レスポンスを処理する', () => {
      const mockUse = vi.fn().mockImplementation((successFn) => {
        const response = { data: { message: 'Success' } };
        const result = successFn(response);
        expect(result).toBe(response);
      });

      const mockApiClient = {
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockUse },
        },
      };

      setupInterceptors(mockApiClient as any);
      expect(mockUse).toHaveBeenCalled();
    });

    it('レスポンスインターセプターが401エラーを処理する', async () => {
      const mockNavigate = vi.fn();
      const mockUse = vi.fn().mockImplementation((successFn, errorFn) => {
        const error = {
          response: { status: 401 },
        };
        const promise = errorFn(error);
        return promise;
      });

      const mockApiClient = {
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockUse },
        },
      };

      localStorage.removeItem = vi.fn();

      setupInterceptors(mockApiClient as any, mockNavigate);

      // エラーハンドリングの確認
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('API呼び出しヘルパー', () => {
    it('GET リクエストが正しく実行される', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await apiClient.get('/test');
      expect(result.data).toEqual(mockData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test');
    });

    it('POST リクエストが正しく実行される', async () => {
      const postData = { name: 'New Item' };
      const mockResponse = { id: 1, ...postData };
      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.post('/test', postData);
      expect(result.data).toEqual(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData);
    });

    it('PUT リクエストが正しく実行される', async () => {
      const putData = { id: 1, name: 'Updated Item' };
      mockAxiosInstance.put.mockResolvedValue({ data: putData });

      const result = await apiClient.put('/test/1', putData);
      expect(result.data).toEqual(putData);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', putData);
    });

    it('DELETE リクエストが正しく実行される', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });

      const result = await apiClient.delete('/test/1');
      expect(result.data).toEqual({ success: true });
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1');
    });
  });
});