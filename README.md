# QuickTyre

A responsive reproduction of the supplied QuickTyre layout using React, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui components with Radix primitives.

## Run locally

Use Node.js 24, matching the Netlify build configuration.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. `npm run build` creates production assets in `dist`; `npm run preview` serves the build.

## Images

Original photographs and logos live in `public/images`, including the Services and Our Works assets and local country flags.

## Quote form

All pages submit through FormSubmit to `aaronmaraya7@gmail.com`, with sending, success and retry feedback. Email is required; Message is optional and blank messages stay blank. Each submission has a unique subject to keep independent requests separate. Home, Services and Our Works also require first and last names; the Contact page makes names optional.

The form service needs no Netlify environment variables or server functions. FormSubmit requires the recipient to confirm its activation email if the address has not already been activated. Actual delivery should be checked once from the deployed website.

## Deploy to Netlify

For deployment from a Git repository, import the repository into Netlify and use the project root as the base directory. `netlify.toml` supplies:

- Build command: `npm run build`
- Publish directory: `dist`
- Node.js version: `24`

For a manual deployment, run `npm ci` and `npm run build`, then upload the `dist` folder to [Netlify Drop](https://app.netlify.com/drop). Upload the built folder, not the source project.

`public/_redirects` is copied into `dist/_redirects` during the build. It serves `index.html` for page routes, allowing `/services`, `/our-works`, `/ourworks` and `/contact` to open directly and survive refreshes. Existing images and JavaScript/CSS assets are served normally.

Configuration follows Netlify's [Vite setup](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/), [SPA rewrites](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/), and [Node version configuration](https://docs.netlify.com/build/configure-builds/manage-dependencies/).

## UI components

Local shadcn/ui components live in `src/components/ui`. The mobile menu uses a Radix dialog for keyboard navigation, focus handling, and Escape dismissal. `components.json` configures shadcn for this project.
