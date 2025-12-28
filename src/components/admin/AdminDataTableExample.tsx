import { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, UserCheck, UserX } from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminDataTable, createActionColumn, createSortableHeader } from "./AdminDataTable"
import { BulkOperationConfig } from "./BulkOperations"
import { FilterField } from "./TableFilters"

// Example data type
interface ExampleUser {
  id: string
  name: string
  email: string
  role: "user" | "admin" | "reviewer"
  status: "active" | "banned" | "pending"
  createdAt: string
  lastLogin?: string
}

// Example data
const exampleUsers: ExampleUser[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    lastLogin: "2024-12-28T09:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-10T10:00:00Z",
    lastLogin: "2024-12-27T15:30:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    status: "banned",
    createdAt: "2024-02-01T10:00:00Z",
  },
]

export function AdminDataTableExample() {
  const [data, setData] = React.useState(exampleUsers)
  const [filters, setFilters] = React.useState<Record<string, unknown>>({})

  // Define columns
  const columns: ColumnDef<ExampleUser>[] = [
    {
      accessorKey: "name",
      header: createSortableHeader("Name"),
    },
    {
      accessorKey: "email",
      header: createSortableHeader("Email"),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variant = status === "active" ? "default" : 
                      status === "banned" ? "destructive" : "secondary"
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      accessorKey: "createdAt",
      header: createSortableHeader("Created"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return date.toLocaleDateString()
      },
    },
    createActionColumn<ExampleUser>([
      {
        label: "Edit",
        onClick: (user) => console.log("Edit user:", user),
      },
      {
        label: "Delete",
        onClick: (user) => console.log("Delete user:", user),
        variant: "destructive",
      },
    ]),
  ]

  // Define filter fields
  const filterFields: FilterField[] = [
    {
      id: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
        { value: "reviewer", label: "Reviewer" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "banned", label: "Banned" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      id: "createdAt",
      label: "Created Date",
      type: "dateRange",
    },
  ]

  // Define bulk operations
  const bulkOperations: BulkOperationConfig<ExampleUser>[] = [
    {
      id: "activate",
      label: "Activate Users",
      icon: <UserCheck className="h-4 w-4 mr-1" />,
      variant: "default",
      requiresConfirmation: true,
      confirmationMessage: "Are you sure you want to activate the selected users?",
      action: async (users) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update local state
        setData(prev => prev.map(user => 
          users.find(u => u.id === user.id) 
            ? { ...user, status: "active" as const }
            : user
        ))
        
        return users.map(user => ({
          success: true,
          message: `User ${user.name} activated successfully`,
          itemId: user.id,
        }))
      },
    },
    {
      id: "ban",
      label: "Ban Users",
      icon: <UserX className="h-4 w-4 mr-1" />,
      variant: "destructive",
      requiresConfirmation: true,
      requiresInput: true,
      inputLabel: "Ban Reason",
      inputPlaceholder: "Enter reason for banning these users...",
      confirmationMessage: "Are you sure you want to ban the selected users?",
      action: async (users, reason) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Update local state
        setData(prev => prev.map(user => 
          users.find(u => u.id === user.id) 
            ? { ...user, status: "banned" as const }
            : user
        ))
        
        return users.map(user => ({
          success: true,
          message: `User ${user.name} banned: ${reason}`,
          itemId: user.id,
        }))
      },
    },
    {
      id: "delete",
      label: "Delete Users",
      icon: <Trash2 className="h-4 w-4 mr-1" />,
      variant: "destructive",
      requiresConfirmation: true,
      confirmationMessage: "Are you sure you want to permanently delete the selected users? This action cannot be undone.",
      action: async (users) => {
        // Simulate API call with some failures
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const results = users.map((user, index) => {
          // Simulate some failures
          if (index === 1) {
            return {
              success: false,
              error: "Cannot delete admin user",
              itemId: user.id,
            }
          }
          
          return {
            success: true,
            message: `User ${user.name} deleted successfully`,
            itemId: user.id,
          }
        })
        
        // Remove successful deletions from local state
        const successfulIds = results
          .filter(r => r.success)
          .map(r => r.itemId)
        
        setData(prev => prev.filter(user => !successfulIds.includes(user.id)))
        
        return results
      },
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Data Table Example</h1>
        <p className="text-muted-foreground">
          Demonstration of the AdminDataTable component with advanced filtering, 
          bulk operations, and server-side features.
        </p>
      </div>

      <AdminDataTable
        data={data}
        columns={columns}
        enableAdvancedFiltering={true}
        filterFields={filterFields}
        advancedFilters={filters}
        onAdvancedFiltersChange={setFilters}
        bulkOperations={bulkOperations}
        userRole="admin"
        enableRowSelection={true}
        searchPlaceholder="Search users..."
        emptyMessage="No users found."
        onBulkOperationComplete={(operationId, results) => {
          console.log(`Operation ${operationId} completed:`, results)
        }}
      />
    </div>
  )
}