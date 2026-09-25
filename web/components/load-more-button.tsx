import { Button } from "@/components/ui/button";

export function LoadMoreButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-center">
      <Button variant="outline" onClick={onClick} disabled={loading}>
        {loading ? "Loading…" : "Load more"}
      </Button>
    </div>
  );
}
