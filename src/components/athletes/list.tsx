'use client'
import { Subheading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { useAthleteStore } from '@/lib/athlete.store'
export default function AthletesList() {
  const athlete = useAthleteStore()
  return (
    <>
      <Subheading className="mt-14">ClubAtx Profiles</Subheading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Date of Birth</TableHeader>
            <TableHeader className="max-sm:hidden">Address</TableHeader>
            <TableHeader>Phone</TableHeader>
            <TableHeader className="text-right">&nbsp;</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {athlete.records.map((item) => (
            <TableRow key={item.slug} href={`/athlete/${item.slug}`} title={`#${item.slug}`}>
              <TableCell>{[item.first_name, item.last_name].filter(Boolean).join(' ')}</TableCell>
              <TableCell className="text-zinc-500">
                {item.date_of_birth}
                {item.date_of_birth
                  ? ` (U${new Date().getFullYear() - new Date(item.date_of_birth).getFullYear() + 1})`
                  : ''}
              </TableCell>
              <TableCell className="max-sm:hidden">
                {[
                  item.street_1,
                  item.street_2,
                  item.city_town,
                  [item.state_province, item.postal_zip_code].filter((w) => Boolean(w.trim())).join(' '),
                ]
                  .filter(Boolean)
                  .join(', ')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {/* <Avatar src={item.thumbUrl} className="size-6" /> */}
                  <span className="font-mono text-xs">
                    {item.phone?.split('+1').pop()?.split('')?.filter(Boolean).join('')}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">&nbsp;</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="h-24 w-full sm:hidden" />
    </>
  )
}
