export function getEnv(name: string): string | undefined {
  const windowKey = `ENV_${name}` as keyof Window;
  const fromWindow = window[windowKey];
  if (typeof fromWindow === 'string' && fromWindow.length > 0) return fromWindow;

  const viteKey = `VITE_${name}`;
  const fromVite = import.meta.env[viteKey as keyof ImportMetaEnv];
  return typeof fromVite === 'string' && fromVite.length > 0 ? fromVite : undefined;
}
