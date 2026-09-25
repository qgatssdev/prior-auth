export { cn } from "cn"

// How a person's name is shown everywhere: "Uche Omodu", first name first.
export const fullName = ({ firstName, lastName }: { firstName: string; lastName: string }) =>
  `${firstName} ${lastName}`;
