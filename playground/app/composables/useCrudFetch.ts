// composables/useCrudFetch.ts
export async function useCrudFetch(
  method: 'POST' | 'PUT' | 'DELETE',
  resource: string,
  id: number | null = null,
  data: any = null
) {
  const config = useRuntimeConfig().public
  const crudBaseUrl = config.crudBaseUrl || '/api'

  const toastMessage: Record<
    'POST' | 'PUT' | 'DELETE',
    { title: string, successMessage: string, errorMessage: string }
  > = {
    POST: {
      title: `${resource} created`,
      successMessage: `A new ${resource} was added successfully.`,
      errorMessage: `Could not save ${resource}`
    },
    PUT: {
      title: `${resource} updated`,
      successMessage: `${resource} #${id} was updated successfully.`,
      errorMessage: `Could not update ${resource} #${id}`
    },
    DELETE: {
      title: `${resource} deleted`,
      successMessage: `Row ${id} deleted.`,
      errorMessage: `Could not delete ${resource} #${id}`
    }
  }

  try {
    const url
      = method === 'PUT' || method === 'DELETE'
        ? `${crudBaseUrl}/${resource}/${id}`
        : `${crudBaseUrl}/${resource}`

    console.log(url)

    await $fetch(url, {
      method,
      ...(data && { body: data }),
      headers: crudHeaders()
    })

    useToast().add({
      title: toastMessage[method].title,
      description: toastMessage[method].successMessage,
      color: 'success'
    })

    await refreshNuxtData()
  } catch (err) {
    console.log('Server Error: ', err)
    useToast().add({
      title: 'Error',
      description: toastMessage[method].errorMessage,
      color: 'error'
    })
  }
}
