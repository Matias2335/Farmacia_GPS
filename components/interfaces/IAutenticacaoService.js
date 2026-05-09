/**
 * INTERFACE: IAutenticacaoService
 *
 * Fornecida por: Componente Login (App.js)
 * Requerida por: Componente Cadastro (App.js)
 */
export class IAutenticacaoService {

  autenticar(usuario, senha) {
    throw new Error('Método autenticar() deve ser implementado');
  }

  cadastrar(usuario, senha) {
    throw new Error('Método cadastrar() deve ser implementado');
  }
}
