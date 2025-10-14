create or replace function get_athletes_for(uid uuid)
returns table (
  athlete_slug text,
  team_member_slug text,
  athlete jsonb
)
language sql
strict
stable
as
$$
  select
      a.slug      as athlete_slug,
      tm.slug     as team_member_slug,
      to_jsonb(a) as athlete
  from team_roster tr
  join team_members tm on tm.slug = tr.team_member
  join athletes a       on a.slug = tr.athlete
  where tm."user" = uid or tm."created_by" = uid
  order by a.slug;
$$;

-- Helpful indexes
create index if not exists idx_team_members_user on team_members("user");
create index if not exists idx_team_members_slug on team_members(slug);
create index if not exists idx_team_members_created_by on team_members(created_by);
create index if not exists idx_team_roster_team_member on team_roster(team_member);
create index if not exists idx_team_roster_athlete on team_roster(athlete);
create index if not exists idx_athletes_slug on athletes(slug);