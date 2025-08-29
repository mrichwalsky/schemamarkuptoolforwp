# GM8 Schema Manager - WordPress Plugin

A WordPress plugin that allows users to easily add structured data (Schema.org markup) to their posts, pages, and custom post types. The plugin provides user-friendly forms for the most common schema types and automatically injects the JSON-LD markup into the page head.

## Features

- **User-Friendly Interface**: No need to write JSON manually - use simple forms instead
- **Multiple Schema Types**: Support for Organization, Local Business, Person, Article, and Service schemas
- **Real-time Preview**: See the generated JSON-LD markup as you type
- **Automatic Injection**: Schema markup is automatically added to the page head
- **Form Validation**: Built-in validation for URLs, emails, and required fields
- **Smart Country Selection**: 200+ countries with dropdown selection, automatically stores ISO 3166-1 alpha-2 codes for Schema.org compliance
- **Responsive Design**: Works on all devices and screen sizes

## Supported Schema Types

### 1. Organization
- Organization name
- Website URL
- Logo URL
- Description
- Phone number
- Email address

### 2. Local Business
- Business name
- Description
- Website URL
- Phone number
- Email address
- Complete address (street, city, state, postal code, country)
- Opening hours

### 3. Person
- Full name
- Job title
- Works for (company/organization) with type selection
- Description
- Email address
- Phone number
- Profile image

### 4. Article
- Headline
- Description
- Author with type selection (Person/Organization)
- Publisher with type selection (Organization/Local Business)
- Publisher logo
- Date published
- Date modified
- Featured image

### 5. Service
- Service name
- Description
- Service provider with type selection (Person/Organization/Local Business)
- Service areas (multiple locations with type selection - Country, State, City, Administrative Area)
  - **Country**: Dropdown with 200+ countries showing display names but storing ISO 3166-1 alpha-2 codes (e.g., "United States" → "US")
  - **State/Province**: Text input for regional areas
  - **City**: Text input for specific cities
  - **Administrative Area**: Text input for other administrative regions
- Service URL

## Installation

1. Upload the plugin files to the `/wp-content/plugins/schemagm8/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. The "Schema.org Data" meta box will appear on posts, pages, and custom post types

## Usage

### Adding Schema to a Post/Page

1. Edit any post, page, or custom post type
2. Scroll down to find the "Schema.org Data" meta box
3. Select the appropriate schema type from the dropdown
4. Fill in the relevant fields that appear
5. The schema preview will update in real-time
6. Publish or update the post

### Viewing the Generated Schema

The plugin automatically injects the JSON-LD markup into the `<head>` section of your pages. You can view the generated schema by:

1. Viewing the published page
2. Right-clicking and selecting "View Page Source"
3. Looking for `<script type="application/ld+json">` tags

## File Structure

```
schemagm8/
├── gm8-schema-builder.php    # Main plugin file
├── js/
│   └── admin.js              # JavaScript for admin interface
├── css/
│   └── admin.css             # Styles for admin interface
└── README.md                 # This file
```

## Technical Details

- **WordPress Version**: 5.0+
- **PHP Version**: 7.4+
- **Database**: Uses WordPress post meta for storage
- **Output**: JSON-LD format in page head
- **Security**: Proper sanitization and nonce verification

## Customization

### Adding New Schema Types

To add new schema types, you'll need to:

1. Add the schema type to the dropdown in `render_schema_box()`
2. Create a new form section with the appropriate fields
3. Update the `sanitize_schema_data()` method to handle the new fields
4. Add any specific logic in the `inject_schema()` method

### Styling

The plugin includes CSS that follows WordPress admin design patterns. You can override styles by adding custom CSS to your theme or using the WordPress Customizer.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the plugin.

## License

This plugin is developed by Gas Mark 8, Ltd. Please contact for licensing information.

## Changelog

### Version 0.1.0
- Initial release
- Support for 5 core schema types
- User-friendly form interface
- Real-time JSON preview
- Automatic schema injection
