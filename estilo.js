import { StyleSheet } from 'react-native';

const estilos = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center'
  },
  texto: {
    color: 'black',
    fontSize: 17,
    marginBottom: 10,
  },
  caixa: {
    padding: 10,
    borderColor: '#38B6FF',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 20,
    borderRadius: 50,
    width: '150%',
    backgroundColor: 'black',
    color: 'white'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8
  },
   container2: {
     paddingTop: 20,
     marginTop: 20,
   },

  container_nav: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginTop: 150,
  },
  botoes_pedidos: {
    alignItems: 'center',
    backgroundColor: '#ffff00',
    padding: 25, 
    borderWidth: 3,
    borderColor: 'black',
    borderRadius: 50,
    width: '200%',
    marginTop: 20 
  },
  texto_pedidos: {
    marginTop: 50,
    color: 'white', 
    fontSize: 15,
    textAlign: 'flex-end',
    marginLeft: 20,
  },
  texto_desodorante: {
    marginTop: 50,
    color: 'Black', 
    fontSize: 10,
    textAlign: 'flex-end',
    marginLeft: 5,
  },
  pedidoContainer: {
    backgroundColor: 'rgba(0, 255, 255, 0.5)',
    padding: 5,
    marginVertical: 5,
    borderRadius: 10,
    marginTop: 30,
  },
  textoPedido: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  textoQuantidade: {
    fontSize: 16
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginVertical: 10,
    borderRadius: 12,
    elevation: 4,
    width: 300,
    alignSelf: 'center'
  },

  imagemProduto: {
    width: '100%',
    height: 140,
    resizeMode: 'contain',
    marginBottom: 5
  },

  nomeProduto: {
    fontSize: 15,
    color: '#000',
    marginBottom: 3,
    textAlign: 'center'
  },

  precoProduto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 8,
    textAlign: 'center'
  },
  
});
  

export default estilos;
