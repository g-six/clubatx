import { Stat } from '@/app/stat'

import AthletesList from '@/app/(app)/athletes/list'
import Greeting from '@/components/greeting'

export default async function Home() {
  console.log(Stat)
  return (
    <>
      <Greeting />
      {/* <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <div>
          <Select name="period">
            <option value="last_week">Last week</option>
            <option value="last_two">Last two weeks</option>
            <option value="last_month">Last month</option>
            <option value="last_quarter">Last quarter</option>
          </Select>
        </div>
      </div> */}
      {/* <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Games attended" value="7" change="+4.5%" />
        <Stat title="Trainings attended" value="12" change="0%" />
        <Stat title="Wins" value="4" change="+4.5%" />
        <Stat title="Loses" value="3" change="+21.2%" />
      </div> */}
      <AthletesList />
    </>
  )
}
