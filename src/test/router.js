// expo-router nos testes: um link mostra só o que tem dentro e o ecrã está sempre à vista
const { createElement } = require('react');
const { Text } = require('react-native');

module.exports = {
  Link: ({ children, asChild }) => (asChild ? children : createElement(Text, null, children)),
  Stack: { Screen: () => null },
  useIsFocused: () => true,
};
