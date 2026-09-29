import react from '@vitejs/plugin-react';
import { seedDesignPlugin } from '@seed-design/vite-plugin';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const CLARITY_PROJECT_ID = 'ypalq4u0z2';

const CLARITY_SNIPPET = `
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
`;

function clarityPlugin(): Plugin {
  return {
    name: 'zipsai-clarity',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'script',
        attrs: { type: 'text/javascript' },
        children: CLARITY_SNIPPET,
        injectTo: 'head',
      },
    ],
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [
      react(),
      seedDesignPlugin({ colorMode: 'light-only' }),
      clarityPlugin(),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      allowedHosts: true,
      // refresh 쿠키(SameSite=Strict, Path=/api/v1/auth)를 같은 origin으로 주고받기 위해 API를 프록시한다.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: false,
        },
      },
    },
  };
});
