# Mette Birthday App

A small mobile-only website for:
- uploading a picture
- writing a short text
- viewing all uploaded photos and messages in a gallery

## Features
- Phone-first design
- Works as a static website with no backend
- Stores uploaded images and messages in the browser using `localStorage`
- Two pages:
  - `index.html` for uploading
  - `gallery.html` for viewing

## How to use it
1. Open `index.html` in a browser, or deploy the files to GitHub Pages.
2. Choose a picture and write a message.
3. Submit the form.
4. Open the gallery page to see all saved images with text.

## GitHub Pages setup
1. Go to the repository on GitHub.
2. Open Settings > Pages.
3. Set Source to `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder.
5. Save.
6. Your site will be published at a URL like:
   `https://<your-username>.github.io/mette-birthday-app/`

## Notes
This version is designed for phone screens and stores data locally in the browser. If you want a multi-device version with shared uploads, the next step would be adding a backend and database.
