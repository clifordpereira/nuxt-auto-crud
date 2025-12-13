export const db = {
  select: () => ({
    from: () => ({
      where: () => ({
        get: () => null,
        all: () => [],
      }),
      leftJoin: () => ({
        where: () => ({
          get: () => null,
        }),
      }),
    }),
  }),
}

export const schema = {}
