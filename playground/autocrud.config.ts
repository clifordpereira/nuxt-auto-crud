export default {
  resources: {
    users: {
      auth: {
        // Only admin can manage users
        admin: true,
        // Public users cannot do anything with users table
        public: false,
      },
    },
    customers: {
      auth: {
        admin: true,
        public: ['list', 'read'],
      },
    },
    products: {
      auth: {
        admin: true,
        public: ['list', 'read'],
      },
      // Public users see limited columns
      publicColumns: ['id', 'name', 'price', 'status', 'image'],
    },
    sales: {
      auth: {
        admin: true,
        public: ['list', 'read'],
      },
    },
    notifications: {
      auth: {
        admin: true,
        public: ['list', 'read'],
      },
    },
  },
}
