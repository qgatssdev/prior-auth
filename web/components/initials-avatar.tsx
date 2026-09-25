// A small square with a patient's initials, to scan rows by person.
export function InitialsAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-medium text-muted-foreground">
      {firstName[0]}
      {lastName[0]}
    </span>
  );
}
