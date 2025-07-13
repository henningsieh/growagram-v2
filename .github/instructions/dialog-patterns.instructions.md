---
applyTo: "**"
title: "Dialog & Modal Patterns"
description: "ResponsiveDialog component usage, modal patterns, and composition guidelines"
tags: [dialog, modal, ui, components, responsive]
last_updated: 2025-01-07
---

# 🪟 Dialog & Modal Patterns

## ResponsiveDialog Component

**The ResponsiveDialog is the standard dialog component for GrowAGram. Use this for all modal interactions.**

### Standard Usage Pattern

```tsx
import { Button } from "~/components/ui/button";
import { ResponsiveDialog } from "~/components/ui/responsive-dialog";

export function MyFeature() {
  const [open, setOpen] = useState(false);

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button>Open Dialog</Button>}
    >
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Dialog Title</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Optional description text
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Content>
        {/* Main dialog content */}
      </ResponsiveDialog.Content>

      <ResponsiveDialog.Footer>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Confirm</Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}
```

### Component Architecture Principles

#### 1. Composition Over Configuration

✅ **CORRECT: Use composition pattern**

```tsx
<ResponsiveDialog open={open} onOpenChange={setOpen}>
  <ResponsiveDialog.Header>
    <ResponsiveDialog.Title>{title}</ResponsiveDialog.Title>
  </ResponsiveDialog.Header>
  <ResponsiveDialog.Content>{children}</ResponsiveDialog.Content>
</ResponsiveDialog>
```

❌ **WRONG: Props-heavy configuration**

```tsx
<ResponsiveDialog
  title={title}
  description={description}
  showFooter={true}
  footerContent={<div>...</div>}
>
  {children}
</ResponsiveDialog>
```

#### 2. Responsive Behavior

The ResponsiveDialog automatically adapts:

- **Desktop**: Modal dialog overlay
- **Mobile**: Full-screen drawer from bottom

#### 3. Accessibility Features

Built-in accessibility features:

- Focus management and trap
- ESC key handling
- Proper ARIA attributes
- Screen reader announcements

### Dialog Content Organization

#### For Complex Dialogs (e.g., Filters, Forms)

Break down complex dialogs into focused components:

```tsx
// Main dialog wrapper component
export function FiltersDialog({ children, ...props }) {
  return (
    <ResponsiveDialog {...props}>
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>{t("filters.title")}</ResponsiveDialog.Title>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Content>
        <FilterControls />
        <SortControls />
        <ActiveFiltersBadges />
      </ResponsiveDialog.Content>

      <ResponsiveDialog.Footer>
        <FilterDialogActions />
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}

// Separate components for each section
function FilterControls() {
  /* ... */
}
function SortControls() {
  /* ... */
}
function ActiveFiltersBadges() {
  /* ... */
}
function FilterDialogActions() {
  /* ... */
}
```

#### Component File Structure

```
components/features/FeatureName/
├── index.ts                    # Clean exports
├── feature-dialog.tsx          # Main dialog wrapper
├── feature-controls.tsx        # Main controls/content
├── feature-actions.tsx         # Action buttons
└── sub-components/            # Additional components
    ├── control-section-a.tsx
    └── control-section-b.tsx
```

### Best Practices

#### 1. State Management

- Keep dialog state in parent component
- Use controlled `open` and `onOpenChange` props
- Pass necessary data through props, not context (unless truly global)

#### 2. Performance

- Lazy load dialog content if heavy
- Use React.memo for complex dialog children
- Debounce form inputs within dialogs

#### 3. User Experience

- Always provide clear cancel/close options
- Include loading states for async operations
- Show validation errors inline
- Maintain scroll position when appropriate

#### 4. Internationalization

```tsx
function MyDialog() {
  const t = useTranslations("DialogNamespace");

  return (
    <ResponsiveDialog>
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>{t("title")}</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {t("description")}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      {/* ... */}
    </ResponsiveDialog>
  );
}
```

### Common Dialog Types

#### 1. Confirmation Dialogs

```tsx
<ResponsiveDialog>
  <ResponsiveDialog.Header>
    <ResponsiveDialog.Title>Confirm Action</ResponsiveDialog.Title>
    <ResponsiveDialog.Description>
      Are you sure you want to perform this action?
    </ResponsiveDialog.Description>
  </ResponsiveDialog.Header>
  <ResponsiveDialog.Footer>
    <Button variant="outline" onClick={onCancel}>
      Cancel
    </Button>
    <Button variant="destructive" onClick={onConfirm}>
      Delete
    </Button>
  </ResponsiveDialog.Footer>
</ResponsiveDialog>
```

#### 2. Form Dialogs

```tsx
<ResponsiveDialog>
  <ResponsiveDialog.Header>
    <ResponsiveDialog.Title>Create New Item</ResponsiveDialog.Title>
  </ResponsiveDialog.Header>
  <ResponsiveDialog.Content>
    <form onSubmit={handleSubmit}>{/* Form fields */}</form>
  </ResponsiveDialog.Content>
  <ResponsiveDialog.Footer>
    <Button type="button" variant="outline" onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Creating..." : "Create"}
    </Button>
  </ResponsiveDialog.Footer>
</ResponsiveDialog>
```

#### 3. Filter/Search Dialogs

```tsx
<ResponsiveDialog>
  <ResponsiveDialog.Header>
    <ResponsiveDialog.Title>Filter Results</ResponsiveDialog.Title>
    <ResponsiveDialog.Description>
      Refine your search results
    </ResponsiveDialog.Description>
  </ResponsiveDialog.Header>
  <ResponsiveDialog.Content>
    <FilterControls onFiltersChange={handleFiltersChange} />
    <ActiveFilters filters={activeFilters} onClear={handleClearFilter} />
  </ResponsiveDialog.Content>
  <ResponsiveDialog.Footer>
    <Button variant="outline" onClick={handleClearAll}>
      Clear All
    </Button>
    <Button onClick={handleApplyFilters}>Apply Filters ({resultCount})</Button>
  </ResponsiveDialog.Footer>
</ResponsiveDialog>
```

## Component Separation Guidelines

### Single Responsibility Principle

Each component should have one clear purpose:

- **Dialog Wrapper**: Manages dialog state and structure
- **Content Components**: Handle specific sections (filters, forms, etc.)
- **Action Components**: Manage button interactions and submissions

### File Size Guidelines

- **Main components**: < 200 lines
- **Dialog wrappers**: < 150 lines
- **Content sections**: < 250 lines
- **If larger**: Break into sub-components

### Import Organization

Create index.ts files for clean imports:

```typescript
// Usage in other files
import {
  ExploreFiltersDialog,
  FilterControls,
} from "~/components/features/Exploration";

// components/features/Exploration/index.ts
export { ExploreFiltersDialog } from "./explore-filters-dialog";
export { FilterControls } from "./filter-controls";
export { SortControls } from "./sort-controls";
export { ActiveFiltersBadges } from "./active-filters-badges";
```

This pattern ensures:

- Clean, maintainable code
- Consistent user experience across the application
- Better performance through proper component separation
- Improved developer experience with predictable patterns
