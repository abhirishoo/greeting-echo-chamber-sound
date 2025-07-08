
// Security utility - simplified version that doesn't restrict user interactions
export const initSecurity = () => {
  // Basic console warning only - no restrictions on user interactions
  console.clear();
  console.log('%cWelcome to SwishView!', 'color: blue; font-size: 20px; font-weight: bold;');
  console.log('%cThis console is for developers. Be careful when pasting code from unknown sources.', 'color: orange; font-size: 14px;');
};
