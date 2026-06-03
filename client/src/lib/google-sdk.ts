declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token: string;
              error?: unknown;
            }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

let sdkLoadingPromise: Promise<void> | null = null;

export function loadGoogleSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  if (sdkLoadingPromise) return sdkLoadingPromise;

  sdkLoadingPromise = new Promise<void>((resolve, reject) => {
    // Check if script is already in the document
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      // Script is in DOM, but maybe not loaded yet.
      // Poll to see when it loads
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve();
        }
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        if (!window.google?.accounts?.oauth2) {
          reject(new Error("Google SDK load timeout"));
        }
      }, 10000);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Check if accounts and oauth2 are defined
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve();
        }
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        if (!window.google?.accounts?.oauth2) {
          reject(new Error("Google SDK initialization timeout"));
        }
      }, 5000);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Google SDK script"));
    };
    document.body.appendChild(script);
  });

  return sdkLoadingPromise;
}

export function googleSdkJs(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return Promise.reject(new Error("Google Client ID not configured"));
  }

  // If already loaded, trigger popup synchronously to prevent browser popup blocking
  if (window.google?.accounts?.oauth2) {
    return new Promise((resolve, reject) => {
      try {
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: (response) => {
            if (response.error) {
              reject(new Error(`Google auth error: ${response.error}`));
              return;
            }
            if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error("Failed to get access token from Google"));
            }
          },
        });
        client.requestAccessToken();
      } catch (err) {
        reject(err);
      }
    });
  }

  // Fallback if not loaded yet: load it and then trigger
  return loadGoogleSdk().then(() => {
    if (!window.google?.accounts?.oauth2) {
      throw new Error("Google SDK not fully loaded or initialized");
    }
    return new Promise<string>((resolve, reject) => {
      try {
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: (response) => {
            if (response.error) {
              reject(new Error(`Google auth error: ${response.error}`));
              return;
            }
            if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error("Failed to get access token from Google"));
            }
          },
        });
        client.requestAccessToken();
      } catch (err) {
        reject(err);
      }
    });
  });
}
