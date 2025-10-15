'use client'
import { Badge } from '@/components/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import useRecordings from '@/lib/models/recordings/store'
import { ViewDialog } from './player'
import TimelineComponent from './timeline'
export default function ClientComponent() {
  const recordings = useRecordings()

  return (
    <>
      <TimelineComponent items={recordings} />
    </>
  )
}

function TableComponent({ recordings }: { recordings: ReturnType<typeof useRecordings> }) {
  return (
    <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
      <TableHead>
        <TableRow>
          <TableHeader>Date</TableHeader>
          <TableHeader>Team</TableHeader>
          <TableHeader>Event</TableHeader>
          <TableHeader className="text-right">View</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {recordings.map((recording) => (
          <TableRow key={recording.slug} title={recording.team}>
            <TableCell className="text-zinc-500">
              {new Intl.DateTimeFormat(undefined, {}).format(
                new Date(`${recording.event_date} ${recording.event_time}`)
              )}
            </TableCell>
            <TableCell>{recording.team}</TableCell>
            <TableCell>
              <Badge
                className="capitalize"
                color={
                  recording.event_type === 'match' ? 'lime' : recording.event_type === 'training' ? 'blue' : 'zinc'
                }
              >
                {recording.event_type}
              </Badge>
            </TableCell>
            <TableCell className="text-right capitalize">
              {recording.status?.toLowerCase() || (
                <ViewDialog src={recording.slug} startTime={recording.starts_at_second} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
