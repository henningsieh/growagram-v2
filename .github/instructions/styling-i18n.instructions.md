---
applyTo: "**"
title: "Styling & Internationalization"
description: "Tailwind CSS patterns, responsive design, and internationalization guidelines"
tags: [styling, tailwind, responsive, i18n, forms]
last_updated: 2025-01-07
---

# 🎨 Styling & Internationalization

## Styling Guidelines

### Tailwind CSS Best Practices

- Use semantic class combinations
- Prefer responsive design patterns: `xs:gap-3 sm:gap-4 md:gap-6`
- Use consistent spacing scale
- Implement proper aspect ratios: `aspect-square`

### Component Styling

```typescript
// Use conditional classes properly
className={`text-${color}/70 hover:text-${color} text-xs`}

// Responsive breakpoints
className="xs:h-16 xs:w-16 h-14 w-14 sm:h-24 sm:w-24"
```

### CSS Custom Properties

- Maintain Tailwind's design system
- Use CSS variables for theming
- Follow shadcn/ui patterns for component styling

### Form Styling Standards

**CRITICAL: All forms must follow these exact styling patterns for consistency across the application.**

#### Form Container Layout

```typescript
// Main form grid with items-start for consistent height alignment
<div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-4 lg:gap-6 xl:gap-8">
  {/* Form fields */}
</div>
```

#### Card Titles (Section Headings)

```typescript
// Main form heading - use default color with text-3xl
<CardTitle as="h2" className="text-3xl">
  {t("form-heading")}
</CardTitle>

// Sub-section headings
<CardTitle as="h3" className="mb-4 text-2xl">
  {t("subsection-title")}
</CardTitle>
```

#### Form Labels

```typescript
// Field labels MUST be text-primary with text-lg font-semibold
<FormLabel className="text-primary text-lg font-semibold">
  {t("field-label")}
</FormLabel>

// Date field labels (same styling)
<FormLabel className="text-primary text-lg font-semibold">
  {label}
</FormLabel>
```

#### Input & Select Styling

```typescript
// Input fields MUST have bg-muted background and proper text contrast
<Input
  className="bg-muted text-foreground pl-10 md:text-base"
  placeholder="Enter value"
  {...field}
/>

// Select triggers MUST match input styling
<SelectTrigger className="bg-muted text-foreground w-full pl-10 md:text-base">
  <SelectValue placeholder="Select option" />
</SelectTrigger>

// For selects without icons, remove pl-10
<SelectTrigger className="bg-muted text-foreground w-full md:text-base">
  <SelectValue placeholder="Select option" />
</SelectTrigger>
```

#### Date Field Styling

```typescript
// Date picker buttons should use outline variant with proper focus styling
<Button
  variant="outline"
  className={cn(
    "w-full justify-between pr-1 pl-2 text-left font-normal md:text-base",
    field.value && "text-foreground",
    "focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-1",
  )}
>
  <div className="flex items-center gap-2">
    <Icon size={20} className={cn("opacity-80", iconClassName)} />
    {field.value ? formatDate(field.value) : t("form-pick-a-date")}
  </div>
</Button>
```

#### Form Field Structure

```typescript
// Standard form field pattern with icon
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-primary text-lg font-semibold">
        {t("field-label")}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Icon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            className="bg-muted text-foreground pl-10 md:text-base"
            placeholder={t("field-placeholder")}
            {...field}
          />
        </div>
      </FormControl>
      <FormDescription>
        {t("field-description")}
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Grid Alignment Rules

```typescript
// ALWAYS use items-start in grid containers to prevent misalignment
// when FormDescription text wraps to multiple lines

// ✅ CORRECT:
<div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-4 lg:gap-6 xl:gap-8">

// ❌ WRONG:
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
```

#### Form Sections Organization

```typescript
// Each logical form section should be wrapped in a space-y container
<div className="space-y-6">
  <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-4 lg:gap-6 xl:gap-8">
    {/* Basic form fields */}
  </div>

  <CardTitle as="h3" className="mb-4 text-2xl">
    {t("section-title")}
  </CardTitle>
  <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-4 lg:gap-6 xl:gap-8">
    {/* Section-specific fields */}
  </div>
</div>
```

#### Entity Naming Consistency

- **"Grows" are "Grows"** - Never use "Grow Projects" or similar variations
- **"Plants" are "Plants"** - Use consistent terminology
- Keep entity names simple and consistent throughout the UI

#### Common Styling Mistakes to Avoid

```typescript
// ❌ WRONG: Inconsistent label sizing
<FormLabel className="text-primary text-xl font-semibold">

// ✅ CORRECT: Standard label styling
<FormLabel className="text-primary text-lg font-semibold">

// ❌ WRONG: Missing background/contrast styling
<Input className="pl-10" />

// ✅ CORRECT: Proper input styling
<Input className="bg-muted text-foreground pl-10 md:text-base" />

// ❌ WRONG: Missing items-start in grid
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">

// ✅ CORRECT: Grid with proper alignment
<div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
```

## Internationalization (i18n)

### Translation File Structure

```
messages/
├── en.json              # English (default/fallback language)
├── de.json              # German
├── es.json              # Spanish
├── fr.json              # French
└── [locale].json        # Additional locales as needed
```

### Translation File Organization

Each translation file should follow a consistent nested structure:

```json
{
  "Common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit"
    },
    "navigation": {
      "home": "Home",
      "profile": "Profile",
      "settings": "Settings"
    }
  },
  "Pages": {
    "HomePage": {
      "title": "Welcome to GrowAGram",
      "subtitle": "Connect with plant enthusiasts worldwide"
    },
    "ProfilePage": {
      "title": "Your Profile",
      "tabs": {
        "posts": "Posts",
        "followers": "Followers",
        "following": "Following"
      }
    }
  },
  "Components": {
    "FeaturesSection": {
      "title": "Features",
      "cards": {
        "growDiary": {
          "title": "Grow Diary",
          "description": "Track your plant's journey"
        }
      }
    },
    "ErrorBoundary": {
      "title": "Something went wrong",
      "message": "Please try refreshing the page"
    }
  },
  "Forms": {
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email",
      "minLength": "Must be at least {min} characters"
    }
  }
}
```

### Translation Usage

```typescript
const t = useTranslations("NamespaceKey");

// Basic usage
{t("Pages.HomePage.title")}

// With interpolation
{t("Forms.validation.minLength", { min: 8 })}

// Rich text with components
{t.rich("Pages.Welcome.description", {
  strong: (chunks) => <strong>{chunks}</strong>
})}
```

### Translation Key Naming Conventions

- **Hierarchy**: Use dot notation for nested keys
- **Consistency**: Follow `Category.Component.Element.Property` pattern
- **Descriptive**: Use clear, descriptive names
- **Pluralization**: Use `_one`, `_other` suffixes for plural forms

```json
{
  "Posts": {
    "count_one": "1 post",
    "count_other": "{count} posts"
  }
}
```

### Adding New Translations

1. **Add to English first** (`messages/en.json`) as the source of truth
2. **Maintain consistent structure** across all locale files
3. **Use descriptive keys** that reflect the content purpose
4. **Group related translations** under logical namespaces
5. **Keep translations concise** but descriptive

### Translation File Maintenance

- **Sync across locales**: Ensure all locale files have the same key structure
- **Use default values**: English acts as fallback for missing translations
- **Regular audits**: Remove unused translation keys
- **Professional translation**: Consider professional translation services for production locales

### Dynamic Translation Loading

```typescript
// For large applications, consider dynamic imports
const messages = await import(`~/messages/${locale}.json`);
```

### Translation Validation

- Validate that all locale files have consistent key structures
- Use TypeScript for type-safe translation keys
- Implement lint rules for missing or unused translations

## Translation Consistency Guidelines

### Terminology Standards

#### Entity Naming

- **Grows**: Always capitalize "Grows" when referring to the entity/feature
  - ✅ "Explore Grows"
  - ✅ "No Grows found"
  - ❌ "explore grows" or "no grows found"

#### Professional Language

- Use professional, clear terminology in both English and German
- Ensure parallel structure between translations
- Maintain consistency in feature descriptions

#### Recent Fixes Applied

- Fixed German search label: "Suche" → "Grows suchen" for consistency
- Corrected edit form description to match English (environmental conditions vs plants)
- Standardized English capitalization: "grows" → "Grows" in titles and messages
- Verified professional terminology across both language files

#### Verification Checklist

- [ ] All "Grows" terminology uses proper capitalization
- [ ] German translations accurately reflect English meanings
- [ ] Form descriptions match between languages
- [ ] Professional tone maintained throughout
- [x] Search labels are consistent
- [x] Success/error messages are parallel
