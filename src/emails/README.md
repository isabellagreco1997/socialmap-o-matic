# Email Templates

This directory contains email templates used by the application.

## Sign-in Email Template

The `sign-in-email.html` file contains the HTML template for the sign-in email. It uses a PNG image instead of SVG for better email client compatibility.

## Required Assets

For the email template to work correctly, you need to create and host the following image:

### share-icon.png

1. Create a 20x20 pixel PNG image with a white share/network icon
2. Host it at `https://relmaps.com/share-icon.png`
3. Ensure the image is publicly accessible

The image should be a simple white share/network icon (three connected circles with connecting lines) on a transparent background.

Alternatively, you can use inline base64-encoded images by replacing:

```html
<img src="https://relmaps.com/share-icon.png" width="20" height="20" alt="RelMaps logo" style="vertical-align: middle;">
```

With:

```html
<img src="data:image/png;base64,YOUR_BASE64_ENCODED_IMAGE" width="20" height="20" alt="RelMaps logo" style="vertical-align: middle;">
```

This approach ensures the image is embedded directly in the email HTML and doesn't require external hosting. 