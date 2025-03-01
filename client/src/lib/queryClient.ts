import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  methodOrUrl: string,
  urlOrData?: string | any,
  data?: any
): Promise<Response> {
  let method: string;
  let url: string;
  let body: string | undefined;
  
  // Handle both apiRequest(url, options) and apiRequest(method, url, data) patterns
  if (typeof urlOrData === 'string') {
    // New pattern: apiRequest('POST', '/api/login', data)
    method = methodOrUrl;
    url = urlOrData;
    body = data ? JSON.stringify(data) : undefined;
  } else {
    // Old pattern: apiRequest('/api/login', { method: 'POST', body: JSON.stringify(data) })
    method = urlOrData?.method || 'GET';
    url = methodOrUrl;
    body = urlOrData?.body;
  }
  
  const headers: Record<string, string> = {};
  
  if (body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Ensure the URL is absolute if running server-side (for syncData functionality)
  const fullUrl = url.startsWith('/') 
    ? (typeof window !== 'undefined' ? url : `http://localhost:5000${url}`)
    : url;
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body,
    credentials: "include",
  });

  if (!res.ok) {
    await throwIfResNotOk(res);
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('/') 
      ? (typeof window !== 'undefined' ? url : `http://localhost:5000${url}`)
      : url;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
