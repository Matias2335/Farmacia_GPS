/**
 * INTERFACE: ICarrinhoService
 *
 * Fornecida por: Componente Carrinho (App.js)
 * Requerida por: Componente Produtos (Higiene_1.js, Cabelos.js)
 */
export class ICarrinhoService {

  salvar(nomeProduto, quantidade) {
    throw new Error('Método salvar() deve ser implementado');
  }

  remover(nomeProduto) {
    throw new Error('Método remover() deve ser implementado');
  }

  listar() {
    throw new Error('Método listar() deve ser implementado');
  }
}
