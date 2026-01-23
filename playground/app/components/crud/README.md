# CRUD Components

This directory contains the components used for the dynamic CRUD interface.

- **Table.vue**: The main table component that displays the list of resources. It handles pagination, sorting (via API), and actions.
- **CreateRow.vue**: A modal component for creating a new resource record.
- **EditRow.vue**: A modal component for editing an existing resource record.
- **ViewRow.vue**: A modal component for viewing the details of a resource record.
- **Form.vue**: A dynamic form component that renders fields based on the resource schema.
- **NameList.vue**: A select menu component for handling foreign key relationships (e.g., selecting a user for a ticket).

## Usage

These components are primarily used in `app/pages/resource/[...slug].vue` to render the CRUD interface for any resource defined in the schema.
