---
applyTo: "**"
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
