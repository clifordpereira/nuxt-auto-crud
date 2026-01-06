export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate',
    },
  },
  crud: {
    // Columns to always hide from the UI table
    globalHide: ['updatedAt', 'deletedAt', 'createdBy', 'updatedBy', 'resetToken'],
    // Export specific settings
    exports: {
      pdf: {
        // Excluded from ALL resources in PDF
        globalExclude: ['avatar', 'resetToken', 'resetExpires'],
        // Resource specific overrides
        resourceExclude: {
          users: ['password', 'googleId', 'githubId'],
        },
      },
      excel: {
        globalExclude: [],
        resourceExclude: {
          users: ['password'],
        },
      },
    },
  },
})
