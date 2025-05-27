// Define types for API responses
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define base API response structure
interface IBaseApiResponse {
  id?: string | number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Define project-specific response interface
interface IProjectResponse extends IBaseApiResponse {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  githubLink: string;
  externalLink: string;
  technologies: string[];
  year: string;
  icon: string;
}

// Define section interface
interface ISection extends IBaseApiResponse {
  title: string;
  slug: string;
  content: string;
}

// Define certification interface
interface ICertification extends IBaseApiResponse {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  skills: string[];
}

// Define experience interface
interface IExperience extends IBaseApiResponse {
  title: string;
  company: string;
  period: string;
  description: string;
  achievements: string[];
  methodologies: string[];
  order: number;
}

// Define API request function
export async function apiRequest<T, D = Record<string, unknown>>(
  method: string,
  url: string,
  data?: D,
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    let responseData: unknown;

    try {
      responseData = await response.json();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to parse JSON response";

       


      console.warn("Failed to parse JSON response:", errorMessage);
      // If we can't parse JSON, create an empty object with the expected shape
      responseData = {} as T;
    }

    if (!response.ok) {
      const errorMessage =
        (responseData as { message?: string }).message ||
        `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return {
      success: true,
      data: responseData as T,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

     


    console.error("API request failed:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Export interfaces for use in other files
export type {
  ApiResponse,
  IBaseApiResponse,
  IProjectResponse,
  ISection,
  ICertification,
  IExperience,
};
