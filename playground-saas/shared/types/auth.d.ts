// shared/types/auth.d.ts

declare module '#auth-utils' {
  interface User {
    id: number
    uuid: string
    name: string
    email: string
    avatar?: string | null
    role: string
    permissions: Record<string, string[]>
  }

  interface AssignedRole {
    name: string
    resourcePermissions: {
      resource?: { name: string, status: string }
      permission?: { code: string, status: string }
    }[]
  }
}

export {}
