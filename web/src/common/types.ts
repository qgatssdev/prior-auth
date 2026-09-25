// The API wraps every success in { success, message, data }.
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
