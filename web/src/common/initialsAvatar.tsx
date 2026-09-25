// A small square with a patient's initials, to scan rows by person.
export function InitialsAvatar({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  return (
    <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md border text-xs font-medium">
      {firstName[0]}
      {lastName[0]}
    </span>
  );
}
