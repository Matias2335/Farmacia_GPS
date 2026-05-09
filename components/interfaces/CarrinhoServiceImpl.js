/**
 * IMPLEMENTAÇÃO: CarrinhoServiceImpl
 * Implementa: ICarrinhoService
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ICarrinhoService } from './ICarrinhoService';

const CARRINHO_PREFIX = 'carrinho__';

export class CarrinhoServiceImpl extends ICarrinhoService {

  async salvar(nomeProduto, quantidade) {
    try {
      if (quantidade <= 0) {
        await AsyncStorage.removeItem(CARRINHO_PREFIX + nomeProduto);
      } else {
        const valor = JSON.stringify({ pedido: nomeProduto, quantidade });
        await AsyncStorage.setItem(CARRINHO_PREFIX + nomeProduto, valor);
      }
    } catch (erro) {
      console.log('Erro ao salvar:', erro);
    }
  }

  async remover(nomeProduto) {
    try {
      await AsyncStorage.removeItem(CARRINHO_PREFIX + nomeProduto);
    } catch (erro) {
      console.log('Erro ao remover:', erro);
    }
  }

  async listar() {
    try {
      const todasChaves = await AsyncStorage.getAllKeys();
      const chavesCarrinho = todasChaves.filter(k => k.startsWith(CARRINHO_PREFIX));
      if (chavesCarrinho.length === 0) return [];
      const pares = await AsyncStorage.multiGet(chavesCarrinho);
      return pares
        .map(([, valor]) => { try { return JSON.parse(valor); } catch { return null; } })
        .filter(item => item && item.quantidade > 0);
    } catch (erro) {
      console.log('Erro ao listar:', erro);
      return [];
    }
  }
}
