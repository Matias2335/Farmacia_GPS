/**
 * IMPLEMENTAÇÃO: AutenticacaoService
 * Implementa: IAutenticacaoService
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAutenticacaoService } from './IAutenticacaoService';

export class AutenticacaoService extends IAutenticacaoService {

  async autenticar(usuario, senha) {
    try {
      const senhaSalva = await AsyncStorage.getItem(usuario);
      return senhaSalva !== null && senhaSalva === senha;
    } catch (erro) {
      console.log('Erro ao autenticar:', erro);
      return false;
    }
  }

  async cadastrar(usuario, senha) {
    try {
      await AsyncStorage.setItem(usuario, senha);
    } catch (erro) {
      console.log('Erro ao cadastrar:', erro);
      throw erro;
    }
  }
}
