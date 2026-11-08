# asciisoft_redmine_avatar (v1.1.0)

[한국어](README.ko.md)

A Redmine 7.0 plugin that lets users upload a profile photo and shows it wherever Redmine shows a user icon.

## Features
- My account → a "Profile photo" section below "Information" (photo + Change) or the user icon → `/my/avatar`: choose a photo, crop it by dragging and zooming, save or delete
- Saved as a 256x256 square JPEG and shown as a circle (change the shape with `border-radius` in `assets/stylesheets/asciisoft_avatar.css`)
- Users without a photo keep Redmine's default icon (initials or Gravatar)

## Requirements
Redmine 7.0 or later

## Installation (Docker)
### With Git (recommended)
```bash
cd /srv/redmine/plugins
git clone https://github.com/asciisoft/asciisoft-redmine-avatar.git asciisoft_redmine_avatar
cd /srv/redmine && docker compose restart redmine
```
- The repository name uses hyphens (`asciisoft-redmine-avatar`), but the folder must be
  **`asciisoft_redmine_avatar` with underscores** because it has to match the plugin ID.
  Always give the folder name at the end of `git clone`.
- For a private repository, `git clone` needs GitHub authentication (token or SSH key).

Update:
```bash
cd /srv/redmine/plugins/asciisoft_redmine_avatar && git pull
cd /srv/redmine && docker compose restart redmine
```

### From a zip file
```bash
cd /srv/redmine/plugins && unzip ~/asciisoft_redmine_avatar.zip
cd /srv/redmine && docker compose restart redmine
```

### After installation
Check "ASCII SOFT 프로필 사진" in Administration > Plugins. No database migration is needed.
Uninstall: delete the folder and restart. Delete `files/asciisoft_avatars` as well if you no longer need the photos.

## Storage
`files/asciisoft_avatars/<user ID>.jpg` (inside Redmine's attachment storage, so it is included in the Docker `files` volume and its backups)
- File names are user IDs, so users never overwrite each other's photos
- Uploading a new photo deletes the previous file; deleting a user deletes the photo too
- To remove a user's photo as an administrator, delete that file

## Security
- Only JPEG/PNG are accepted, checked by the file's first bytes (magic number), up to 2 MB; the server chooses the file name
- Image responses carry `X-Content-Type-Options: nosniff` and a `Content-Security-Policy` with `sandbox`
- Saving and deleting require login and a CSRF token; users can change only their own photo
- Photos of locked users are shown to administrators only

License: GPL-2.0-or-later (LICENSE)
