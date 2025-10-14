import { postRequest } from '../helpers/api'
const OPENPHONE_ENTRYPOINT = 'https://api.openphone.com/v1'
const from = '+13022088820'
const userId = process.env.QUO_USER_ID!
export async function sendMessage({ phone_number, message }: { phone_number: string; message: string }) {
  return await postRequest(
    `${OPENPHONE_ENTRYPOINT}/messages`,
    {
      content: message,
      to: [phone_number.startsWith('+') ? phone_number : `+1${phone_number}`],
      from,
      userId,
    },
    {
      authorization: process.env.QUO_API_KEY!,
    }
  ).catch((e) => console.warn(e))
}
