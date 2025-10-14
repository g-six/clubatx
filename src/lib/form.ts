export const parseForm = (form: HTMLFormElement) => {
  const formData = new FormData(form)
  const data = Object.fromEntries(formData.entries())

  return data as Record<string, string>
}
