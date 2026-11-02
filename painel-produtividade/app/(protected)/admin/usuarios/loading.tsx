import { Skeleton } from "@/components/ui/skeleton";
export default function UsersLoading() {
  return <div role="status" className="space-y-5"><p>Carregando usuários…</p><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
}
