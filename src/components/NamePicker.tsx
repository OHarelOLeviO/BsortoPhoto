import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { listMembers, listTeams, signImagePaths } from "@/lib/api";
import { signInAs } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Entry screen: a member picks their name from the predefined company roster. */
export function NamePicker() {
  const [selectedId, setSelectedId] = useState("");

  const membersQuery = useQuery({ queryKey: ["members"], queryFn: listMembers });
  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: listTeams });

  const members = membersQuery.data ?? [];
  const teams = teamsQuery.data ?? [];

  const avatarPaths = useMemo(
    () => members.map((m) => m.profile_image).filter((p): p is string => Boolean(p)),
    [members],
  );
  const avatarsQuery = useQuery({
    queryKey: ["signed", ...avatarPaths.slice().sort()],
    queryFn: () => signImagePaths(avatarPaths),
    enabled: avatarPaths.length > 0,
    staleTime: 50 * 60 * 1000,
  });
  const avatarUrls = avatarsQuery.data ?? {};

  const loading = membersQuery.isLoading || teamsQuery.isLoading;
  const failed = membersQuery.isError || teamsQuery.isError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md rounded-3xl shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Camera className="size-7" />
          </div>
          <CardTitle className="text-2xl">הפלוגה</CardTitle>
          <CardDescription className="text-base">בחרו את השם שלכם כדי להיכנס</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          )}

          {failed && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">משהו השתבש. נסה שוב.</p>
              <Button variant="outline" onClick={() => membersQuery.refetch()}>
                נסה שוב
              </Button>
            </div>
          )}

          {!loading && !failed && (
            <>
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-card px-3 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                aria-label="בחרו את השם שלכם"
              >
                <option value="" disabled>
                  בחרו את השם שלכם…
                </option>
                {teams.map((team) => (
                  <optgroup key={team.id} label={team.name}>
                    {members
                      .filter((member) => member.team_id === team.id)
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>

              {selectedId && (
                <div className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2">
                  {(() => {
                    const member = members.find((m) => m.id === selectedId);
                    if (!member) return null;
                    const url = member.profile_image ? avatarUrls[member.profile_image] : undefined;
                    return (
                      <>
                        {url ? (
                          <img src={url} alt={member.name} className="size-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="text-sm">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-muted-foreground">{member.team?.name}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <Button
                className="h-12 w-full rounded-xl text-base"
                disabled={!selectedId || membersQuery.isFetching}
                onClick={() => selectedId && signInAs(selectedId)}
              >
                {membersQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : "כניסה"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
