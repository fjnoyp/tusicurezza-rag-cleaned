/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;




/*

// Confused - had to add this to get the pdf to load
// Would get character read errors 
// But the original pdf project did not have this issue (could be a next version issue)

// I also had to add node-loader to the package.json 2.0.0 version but not I can remove it no problem too

and this to devdeps:    "raw-loader": "^4.0.2",


Issue might have been the old version of next.js used. If the same problem happens on the server, add this code back in ... 
const nextConfig = {
    webpack: (
      config, options
    ) => {
      // Important: return the modified config
      config.module.rules.push({
        test: /\.node/,
        use: 'raw-loader',
      });
      return config;
    },
  };
  
export default nextConfig;
*/

