export default {
  auth: {
    enabled: true,
    type: 'jwt',
    jwtSecret: 'test-secret-key-123'
  },
  resources: {
    users: {
      public: false // Private by default to test auth
    }
  }
}
