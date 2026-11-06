# Aadi Sethi: portfolio

## Run it locally
```
node serve.js
```
Then open http://localhost:5173

## Edit your content
Everything you'll edit is in **projects.js**:
- `SITE`: name, email, social links, about text, tools
- `HERO_SCENES`: the images in the "hover to render" first screen. Add `clay:` with a real blockout or untextured render to reveal it under the lens (like Mountain Street). Without one, a wireframe/solid viewport look is generated automatically.
- `PROJECTS`: one entry per project. Categories are `3d`, `game` or `environment`.

Images and videos live in `assets/`. Keep images around 1920px wide as JPG, and keep videos small (under ~5 MB) so the site loads fast.

## Files
- `index.html`: page structure
- `style.css`: styling (colours are at the top under `:root`)
- `main.js`: the WebGL render-lens hero and all the interactions

## Put it online (free)
Drag the whole `portfolio` folder onto https://app.netlify.com/drop, or push it to GitHub and turn on GitHub Pages or Vercel. There's no build step.
