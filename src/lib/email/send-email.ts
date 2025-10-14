// competition_registration_confirmation
export async function sendEmail({
  TrackOpens = true,
  TemplateModel,
  TemplateAlias,
  ...body
}: {
  To: string
  TemplateAlias: string
  TemplateModel: Record<string, string>
  TrackOpens?: boolean
}) {
  const conf = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': process.env.POSTMARK_SERVER_TOKEN || '',
    },
    body: JSON.stringify({
      ...body,
      TemplateAlias,
      TemplateModel: {
        ...TemplateModel,
        copy: `${new Date().getFullYear()} ${TemplateModel.organization_name || 'ClubAthletix'}`,
      },
      TrackOpens,
      From: `${TemplateModel.organization_name || 'ClubAthletix'} <no-reply@clubathletix.com>`,
      Bcc: 'Rey <gerard@nerubia.com>',
      ReplyTo: 'Academy Registrations <register@progressfooty.com>',
      MessageStream: 'notifications',
    }),
  }
  const xhr = await fetch('https://api.postmarkapp.com/email/withTemplate', conf)

  if (!xhr.ok) {
    const errorResponse = await xhr.json()
    console.log(errorResponse)
    console.warn('Error sending email:', xhr.status, xhr.statusText)
    return errorResponse
  }

  return await xhr.json()
}
