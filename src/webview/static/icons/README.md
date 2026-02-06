## Icons

The project uses a custom icon font (icomoon) with semantic class names:

```html
<i class="icon-bin"></i>
<!-- Delete/trash icon -->
<i class="icon-inbox"></i>
<!-- Inbox icon -->
<i class="icon-draft"></i>
<!-- Draft icon -->
<i class="icon-github"></i>
<!-- GitHub icon -->
<i class="icon-eye"></i>
<!-- Eye/view icon -->
```

The icon font is generated using the [online icomoon tool](https://icomoon.io/app/).

### How to edit our icon palette?

The idea is to choose the palette of icons we need via the the icomoon webapp, and download the font and style.css to put in `src/webview/static/icons`.
Select the icons in the "Selection" tab, and edit the name/settings, and download from the "Generate Font" tab.

The parameters (click the cog icon next to the Download button on icomoon) we use are the default (name "icomoon", prefix "icon-") without "Support IE 8", and with "Use i (for selecting \<i\>)" in "CSS Selector".

The icons we use are:

- "pen", that we rename to "draft"
- "drawer", that we rename to "inbox"
- "bin"
- "eye"
- "github"
- "folder"
- "folder-plus"
- "folder-minus"
- "search"
- "user-plus"
- "user-minus"
