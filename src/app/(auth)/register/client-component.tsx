'use client'
import { Button } from '@/components/button'
import { Checkbox, CheckboxField } from '@/components/checkbox'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Select } from '@/components/select'
import { Strong, Text, TextLink } from '@/components/text'
import { parseForm } from '@/lib/form'
import { supabase } from '@/lib/store'

export default function ClientComponent() {
  const handleSubmit = async (username: string, password: string) => {
    try {
      const {
        error,
        data: { user },
      } = await supabase.auth.signUp({ email: username, password })
      // If the user doesn't exist here and an error hasn't been raised yet,
      // that must mean that a confirmation email has been sent.
      // NOTE: Confirming your email address is required by default.
      if (error) {
        alert('Error with auth: ' + error.message)
      } else if (!user) alert('Signup successful, confirmation mail should be sent soon!')
    } catch (error: any) {
      console.log('error', error)
      alert(error.error_description || error)
    }
  }
  return (
    <form
      action=""
      method="POST"
      className="grid w-full max-w-sm grid-cols-1 gap-8"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const { email, password } = parseForm(form)
        handleSubmit(email, password)
      }}
    >
      <Heading>Create your account</Heading>
      <Field>
        <Label>Email</Label>
        <Input type="email" name="email" />
      </Field>
      <Field>
        <Label>Full name</Label>
        <Input name="name" />
      </Field>
      <Field>
        <Label>Password</Label>
        <Input type="password" name="password" autoComplete="new-password" />
      </Field>
      <Field>
        <Label>Country</Label>
        <Select name="country">
          <option>Canada</option>
          <option>Mexico</option>
          <option>United States</option>
        </Select>
      </Field>
      <CheckboxField>
        <Checkbox name="remember" />
        <Label>Get emails about product updates and news.</Label>
      </CheckboxField>
      <Button type="submit" className="w-full">
        Create account
      </Button>
      <Text>
        Already have an account?{' '}
        <TextLink href="/login">
          <Strong>Sign in</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
