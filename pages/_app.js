// pages/_app.js
// This is the root component that wraps every page.
// We import global CSS here (including Tailwind's base styles).

import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
