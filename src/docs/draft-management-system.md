# Draft Management System

The draft management system provides comprehensive auto-save functionality, progress tracking, and offline synchronization for the lawyer onboarding flow. This system ensures that users never lose their progress and can seamlessly continue their onboarding process across browser sessions and network interruptions.

## Core Features

### 1. Auto-Save Functionality
- **30-second intervals**: Automatically saves form data every 30 seconds
- **Change detection**: Only saves when data has actually changed
- **Immediate save option**: Manual save triggers for critical moments
- **Configurable intervals**: Customizable auto-save timing per step

### 2. Draft Restoration
- **Session persistence**: Restores drafts when users return to incomplete steps
- **Cross-browser support**: Works across different browser sessions
- **Data integrity**: Validates restored data before applying to forms
- **Selective restoration**: Can restore specific fields or entire forms

### 3. Sync and Cleanup Logic
- **Step completion cleanup**: Automatically clears drafts when steps are completed
- **Network-aware sync**: Syncs with backend when connectivity is restored
- **Batch operations**: Sync multiple steps at once
- **Stale draft cleanup**: Removes outdated drafts automatically

### 4. Status Indicators
- **Visual feedback**: Shows save status, sync status, and draft availability
- **Real-time updates**: Updates indicators as status changes
- **Multiple display modes**: Compact, full, and icon-only indicators
- **Global status**: Overview of all steps' draft status

## Architecture

### Core Hooks

#### `useDraftManager(options)`
Primary hook for managing draft data with auto-save functionality.

```typescript
const {
  saveDraft,
  restoreDraft,
  clearDraft,
  hasUnsavedChanges,
  isDraftAvailable,
  autoSaveStatus,
  updatePendingData
} = useDraftManager({
  stepId: 'practice_info',
  autoSaveInterval: 30000, // 30 seconds
  enabled: true
});
```

#### `useDraftSync(options)`
Handles synchronization with backend and cleanup logic.

```typescript
const {
  syncStatus,
  syncNow,
  syncAllSteps,
  markStepCompleted,
  retryFailedSyncs
} = useDraftSync({
  syncOnStepCompletion: true,
  syncOnConnectivity: true,
  clearDraftOnSync: true
});
```

#### `useDraftIndicator(stepId)`
Provides status information for UI indicators.

```typescript
const {
  status,
  message,
  color,
  isDraftAvailable,
  hasUnsavedChanges
} = useDraftIndicator('practice_info');
```

### Components

#### `<DraftIndicator />`
Visual indicator showing draft and sync status.

```tsx
<DraftIndicator 
  stepId="practice_info" 
  compact={true}
  showIcon={true}
  showMessage={true}
/>
```

#### `<StepDraftManager />`
Step-specific draft management controls.

```tsx
<StepDraftManager stepId="practice_info" />
```

#### `<DraftManager />`
Comprehensive draft management interface with sync controls.

```tsx
<DraftManager 
  stepId="practice_info"
  showCleanupControls={true}
  showSyncControls={true}
/>
```

### Integration Utilities

#### `useFormDraftIntegration(options)`
High-level integration hook for connecting with form libraries.

```typescript
const {
  saveFormDraft,
  restoreFormDraft,
  completeStepWithCleanup,
  hasUnsavedChanges
} = useFormDraftIntegration({
  stepId: 'practice_info',
  syncOnComplete: true,
  clearOnComplete: true
});
```

## Usage Patterns

### Basic Form Integration

```tsx
function MyForm({ stepId }: { stepId: OnboardingStep }) {
  const [formData, setFormData] = useState({});
  const {
    saveFormDraft,
    restoreFormDraft,
    completeStepWithCleanup
  } = useFormDraftIntegration({ stepId });

  // Restore draft on mount
  useEffect(() => {
    const draft = restoreFormDraft();
    if (draft) setFormData(draft);
  }, []);

  // Auto-save on changes
  useEffect(() => {
    saveFormDraft(formData);
  }, [formData]);

  const handleSubmit = async () => {
    await completeStepWithCleanup(formData);
  };

  return (
    <div>
      <DraftIndicator stepId={stepId} />
      {/* Form fields */}
      <button onClick={handleSubmit}>Complete Step</button>
    </div>
  );
}
```

### TanStack Form Integration

```tsx
function TanStackFormWithDrafts({ stepId }: { stepId: OnboardingStep }) {
  const form = useForm({
    defaultValues: { name: '', email: '' }
  });

  const {
    saveFormDraft,
    restoreFormDraft,
    completeStepWithCleanup
  } = useFormDraftIntegration({ stepId });

  // Auto-save when form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      saveFormDraft(values);
    });
    return () => subscription.unsubscribe();
  }, [form, saveFormDraft]);

  // Restore draft on mount
  useEffect(() => {
    const draft = restoreFormDraft();
    if (draft) form.reset(draft);
  }, []);

  return (
    <form onSubmit={form.handleSubmit(completeStepWithCleanup)}>
      <DraftIndicator stepId={stepId} />
      {/* Form fields */}
    </form>
  );
}
```

### Multi-Step Management

```tsx
function MultiStepManager() {
  const steps = ['practice_info', 'documents', 'specializations'];
  
  return (
    <div>
      <GlobalDraftIndicator />
      {steps.map(stepId => (
        <div key={stepId}>
          <h3>{stepId}</h3>
          <StepDraftManager stepId={stepId} />
        </div>
      ))}
    </div>
  );
}
```

## Configuration

### Auto-Save Settings

```typescript
// Default: 30 seconds
const draftManager = useDraftManager({
  stepId: 'practice_info',
  autoSaveInterval: 30000
});

// Custom interval: 10 seconds
const fastSave = useDraftManager({
  stepId: 'documents',
  autoSaveInterval: 10000
});

// Disable auto-save (manual only)
const manualSave = useDraftManager({
  stepId: 'specializations',
  autoSaveInterval: 0
});
```

### Sync Configuration

```typescript
const syncManager = useDraftSync({
  syncOnStepCompletion: true,  // Sync when step is completed
  syncOnConnectivity: true,    // Sync when coming back online
  clearDraftOnSync: true       // Clear draft after successful sync
});
```

## Error Handling

The system includes comprehensive error handling:

### Network Errors
- **Offline detection**: Automatically detects network status
- **Queue operations**: Queues sync operations when offline
- **Retry logic**: Exponential backoff for failed syncs
- **User feedback**: Clear indicators of offline status

### Data Validation
- **Schema validation**: Validates data before saving/restoring
- **Corruption detection**: Handles corrupted draft data gracefully
- **Fallback mechanisms**: Provides fallbacks when restoration fails

### Sync Failures
- **Error reporting**: Clear error messages for sync failures
- **Manual retry**: Users can manually retry failed syncs
- **Partial sync**: Continues with other operations if one fails

## Performance Considerations

### Optimization Features
- **Change detection**: Only saves when data actually changes
- **Debounced saves**: Prevents excessive save operations
- **Lazy loading**: Components load only when needed
- **Memory management**: Automatic cleanup of old drafts

### Storage Management
- **Local storage**: Uses browser local storage for persistence
- **Size limits**: Respects browser storage limitations
- **Cleanup policies**: Automatic cleanup of stale data
- **Compression**: Efficient data serialization

## Testing

The system includes comprehensive testing support:

### Property-Based Tests
- **Auto-save properties**: Validates auto-save behavior
- **Restoration properties**: Tests draft restoration accuracy
- **Sync properties**: Validates synchronization logic

### Unit Tests
- **Component tests**: Tests individual components
- **Hook tests**: Tests custom hooks behavior
- **Integration tests**: Tests form integration patterns

### Example Test

```typescript
// Property test for draft auto-save
test('Draft auto-save preserves data integrity', async () => {
  const { result } = renderHook(() => 
    useDraftManager({ stepId: 'practice_info' })
  );
  
  const testData = { name: 'John', email: 'john@example.com' };
  
  // Save draft
  act(() => {
    result.current.saveDraft(testData);
  });
  
  // Restore draft
  const restored = result.current.restoreDraft();
  
  expect(restored).toEqual(testData);
});
```

## Migration Guide

### From Existing Forms

1. **Add draft integration hook**:
   ```tsx
   const draftIntegration = useFormDraftIntegration({ stepId });
   ```

2. **Add restoration logic**:
   ```tsx
   useEffect(() => {
     const draft = draftIntegration.restoreFormDraft();
     if (draft) setFormData(draft);
   }, []);
   ```

3. **Add auto-save**:
   ```tsx
   useEffect(() => {
     draftIntegration.saveFormDraft(formData);
   }, [formData]);
   ```

4. **Update submit handler**:
   ```tsx
   const handleSubmit = async () => {
     await draftIntegration.completeStepWithCleanup(formData);
   };
   ```

5. **Add status indicators**:
   ```tsx
   <DraftIndicator stepId={stepId} />
   ```

## Best Practices

### Do's
- ✅ Use `useFormDraftIntegration` for new forms
- ✅ Add draft indicators to all forms
- ✅ Handle restoration in `useEffect`
- ✅ Use `completeStepWithCleanup` for submissions
- ✅ Test draft functionality thoroughly

### Don'ts
- ❌ Don't save sensitive data in drafts
- ❌ Don't rely on drafts for critical data
- ❌ Don't ignore sync errors
- ❌ Don't disable auto-save without good reason
- ❌ Don't forget to handle restoration failures

## Troubleshooting

### Common Issues

#### Drafts Not Saving
- Check if auto-save is enabled
- Verify step ID is correct
- Check browser storage permissions
- Look for JavaScript errors

#### Restoration Not Working
- Verify draft exists in storage
- Check data format compatibility
- Ensure restoration happens after component mount
- Validate restored data structure

#### Sync Failures
- Check network connectivity
- Verify API endpoints are accessible
- Check authentication tokens
- Review error logs

### Debug Tools

```typescript
// Enable debug logging
localStorage.setItem('draft-debug', 'true');

// Check draft storage
console.log(localStorage.getItem('enhanced-lawyer-onboarding'));

// Monitor sync status
const { syncStatus } = useDraftSync();
console.log('Sync status:', syncStatus);
```

## Future Enhancements

### Planned Features
- **Conflict resolution**: Handle concurrent edits
- **Version history**: Track draft versions
- **Selective sync**: Sync only changed fields
- **Compression**: Reduce storage usage
- **Analytics**: Track draft usage patterns

### API Integration
- **Real-time sync**: WebSocket-based synchronization
- **Collaborative editing**: Multi-user draft support
- **Cloud backup**: Server-side draft storage
- **Cross-device sync**: Sync across user devices