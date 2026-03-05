

# Replace Favicon with New Sentinel DeFi Icons

## What Will Be Done

Copy all 6 uploaded favicon files into the `public/` directory, replacing the old ones:

1. `user-uploads://favicon-2.ico` -> `public/favicon.ico`
2. `user-uploads://favicon-16x16-2.png` -> `public/favicon-16x16.png`
3. `user-uploads://favicon-32x32-2.png` -> `public/favicon-32x32.png`
4. `user-uploads://apple-touch-icon-2.png` -> `public/apple-touch-icon.png`
5. `user-uploads://android-chrome-192x192-2.png` -> `public/android-chrome-192x192.png`
6. `user-uploads://android-chrome-512x512-2.png` -> `public/android-chrome-512x512.png`

Then add cache-busting query strings (e.g. `?v=2`) to all favicon references in `index.html` so browsers stop showing the old cached icon.

## Technical Details

- Replace 6 files in `public/`
- Update `index.html` favicon `<link>` tags to append `?v=2`
- No other files need changes

