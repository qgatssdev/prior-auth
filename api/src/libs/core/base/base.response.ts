export class BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T | null;

  constructor(success: boolean, message: string, data?: T | null) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static successResponse<T>(data?: T, message = 'Success'): BaseResponse<T> {
    return new BaseResponse<T>(true, message, data);
  }
}
