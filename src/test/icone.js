// Os ícones Solar são só desenho: nos testes qualquer ícone é um componente vazio
module.exports = new Proxy({}, { get: (_, nome) => (nome === '__esModule' ? true : () => null) });
