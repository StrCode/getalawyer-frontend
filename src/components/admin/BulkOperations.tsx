import { AlertTriangle, CheckCircle, Loader2, XCircle } from "lucide-react"
import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

export interface BulkOperationResult {
  success: boolean
  message?: string
  itemId?: string
  error?: string
}

export interface BulkOperationProgress {
  total: number
  completed: number
  failed: number
  currentItem?: string
  results: BulkOperationResult[]
}

export interface BulkOperationConfig<T> {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  requiresConfirmation?: boolean
  requiresInput?: boolean
  inputLabel?: string
  inputPlaceholder?: string
  confirmationTitle?: string
  confirmationMessage?: string
  progressTitle?: string
  successMessage?: string
  errorMessage?: string
  permission?: string
  action: (items: T[], input?: string) => Promise<BulkOperationResult[]>
  validatePermission?: (userRole: string, permission?: string) => boolean
}

export interface BulkOperationsProps<T> {
  selectedItems: T[]
  operations: BulkOperationConfig<T>[]
  userRole?: string
  onOperationComplete?: (operationId: string, results: BulkOperationResult[]) => void
  onSelectionClear?: () => void
}

export function BulkOperations<T>({
  selectedItems,
  operations,
  userRole = "user",
  onOperationComplete,
  onSelectionClear,
}: BulkOperationsProps<T>) {
  const [activeOperation, setActiveOperation] = React.useState<BulkOperationConfig<T> | null>(null)
  const [showConfirmation, setShowConfirmation] = React.useState(false)
  const [showProgress, setShowProgress] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [progress, setProgress] = React.useState<BulkOperationProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    results: [],
  })

  const filteredOperations = operations.filter((op) => {
    if (!op.validatePermission) return true
    return op.validatePermission(userRole, op.permission)
  })

  const handleOperationClick = (operation: BulkOperationConfig<T>) => {
    setActiveOperation(operation)
    setInputValue("")
    
    if (operation.requiresConfirmation) {
      setShowConfirmation(true)
    } else {
      executeOperation(operation)
    }
  }

  const executeOperation = async (operation: BulkOperationConfig<T>) => {
    if (!operation) return

    setShowConfirmation(false)
    setShowProgress(true)
    setProgress({
      total: selectedItems.length,
      completed: 0,
      failed: 0,
      results: [],
    })

    try {
      const results = await operation.action(selectedItems, inputValue)
      
      const successCount = results.filter(r => r.success).length
      const failedCount = results.filter(r => !r.success).length

      setProgress({
        total: selectedItems.length,
        completed: successCount,
        failed: failedCount,
        results,
      })

      // Show results dialog
      setTimeout(() => {
        setShowProgress(false)
        setShowResults(true)
      }, 1000)

      onOperationComplete?.(operation.id, results)
      
      // Clear selection if operation was successful
      if (failedCount === 0) {
        onSelectionClear?.()
      }
    } catch (error) {
      console.error("Bulk operation failed:", error)
      setProgress(prev => ({
        ...prev,
        failed: prev.total,
        results: selectedItems.map(() => ({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })),
      }))
      
      setTimeout(() => {
        setShowProgress(false)
        setShowResults(true)
      }, 1000)
    }
  }

  const handleConfirm = () => {
    if (activeOperation) {
      executeOperation(activeOperation)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setActiveOperation(null)
    setInputValue("")
  }

  const handleCloseResults = () => {
    setShowResults(false)
    setActiveOperation(null)
    setInputValue("")
  }

  if (selectedItems.length === 0 || filteredOperations.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {selectedItems.length} selected
        </Badge>
        
        {filteredOperations.map((operation) => (
          <Button
            key={operation.id}
            variant={operation.variant || "outline"}
            size="sm"
            onClick={() => handleOperationClick(operation)}
            disabled={showProgress}
          >
            {operation.icon}
            {operation.label}
          </Button>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {activeOperation?.confirmationTitle || `Confirm ${activeOperation?.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeOperation?.confirmationMessage || 
                `Are you sure you want to ${activeOperation?.label.toLowerCase()} ${selectedItems.length} item(s)? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {activeOperation?.requiresInput && (
            <div className="py-4">
              <Label htmlFor="bulk-input">
                {activeOperation.inputLabel || "Additional Information"}
              </Label>
              <Textarea
                id="bulk-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={activeOperation.inputPlaceholder || "Enter details..."}
                className="mt-2"
                rows={3}
              />
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={activeOperation?.variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              disabled={activeOperation?.requiresInput && !inputValue.trim()}
            >
              {activeOperation?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Progress Dialog */}
      <Dialog open={showProgress} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {activeOperation?.progressTitle || `Processing ${activeOperation?.label}...`}
            </DialogTitle>
            <DialogDescription>
              Please wait while we process your request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.completed + progress.failed} of {progress.total}</span>
              </div>
              
              <Progress 
                value={((progress.completed + progress.failed) / progress.total) * 100} 
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {progress.completed} successful
                </span>
                {progress.failed > 0 && (
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    {progress.failed} failed
                  </span>
                )}
              </div>
              
              {progress.currentItem && (
                <div className="text-xs text-muted-foreground">
                  Processing: {progress.currentItem}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {progress.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              Operation Complete
            </DialogTitle>
            <DialogDescription>
              {progress.failed === 0 
                ? activeOperation?.successMessage || `Successfully ${activeOperation?.label.toLowerCase()} ${progress.completed} item(s).`
                : `Completed with ${progress.failed} error(s). ${progress.completed} item(s) were processed successfully.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {progress.failed > 0 && (
            <div className="max-h-60 overflow-y-auto">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-destructive">Errors:</h4>
                {progress.results
                  .filter(result => !result.success)
                  .map((result, index) => (
                    <div key={`error-${index}`} className="text-xs p-2 bg-destructive/10 rounded border">
                      {result.itemId && <div className="font-medium">Item: {result.itemId}</div>}
                      <div className="text-destructive">{result.error || result.message}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleCloseResults}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Default permission validator
export const defaultPermissionValidator = (userRole: string, permission?: string): boolean => {
  if (!permission) return true
  
  const roleHierarchy: Record<string, number> = {
    user: 0,
    reviewer: 1,
    admin: 2,
    super_admin: 3,
  }
  
  const permissionRequirements: Record<string, number> = {
    read: 0,
    write: 1,
    delete: 2,
    admin: 2,
    super_admin: 3,
  }
  
  const userLevel = roleHierarchy[userRole] || 0
  const requiredLevel = permissionRequirements[permission] || 0
  
  return userLevel >= requiredLevel
}