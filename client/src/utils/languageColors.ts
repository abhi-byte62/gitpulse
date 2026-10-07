const GITHUB_LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  "C#": "#178600",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Shell: "#89e051",
  PowerShell: "#012456",
  Lua: "#000080",
  R: "#198CE7",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Haskell: "#5e5086",
  Solidity: "#AA6746",
  Zig: "#ec915c",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  GraphQL: "#e10098",
  Markdown: "#083fa1"
};

export function getLanguageColor(languageName: string): string {
  if (GITHUB_LANGUAGE_COLORS[languageName]) {
    return GITHUB_LANGUAGE_COLORS[languageName];
  }

  // Deterministic fallback color generation using hash
  let hash = 0;
  for (let i = 0; i < languageName.length; i++) {
    hash = languageName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return `#${"00000".substring(0, 6 - c.length)}${c}`;
}
