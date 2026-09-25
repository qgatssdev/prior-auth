import axios from "axios";

export const DefaultErrorMessage = "An error occurred";

/**
 * The API's error text. Business errors return `message` as a string; the
 * validation pipe returns an array of them. Network failures have no response.
 */
export const getApiErrorMessage = (error: Error): string => {
  if (!axios.isAxiosError<{ message?: string | string[] }>(error)) {
    return error.message || DefaultErrorMessage;
  }
  const message = error.response?.data.message;

  if (Array.isArray(message)) {
    return message.filter(Boolean).join(". ") || DefaultErrorMessage;
  }

  return message || error.message || DefaultErrorMessage;
};

// How a person's name is shown everywhere: "Uche Omodu", first name first.
export const fullName = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => `${firstName} ${lastName}`;
