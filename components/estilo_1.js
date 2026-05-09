import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const DRAWER_WIDTH = SCREEN_WIDTH * 0.72;

// ─── TEMA GLOBAL ─────────────────────────────────────────────────────────────
export const TEMA = {
  primario:        '#00BFA5',
  secundario:      '#0097A7',
  fundo:           '#F0FAFA',
  card:            '#FFFFFF',
  texto:           '#1A2B2B',
  textoSecundario: '#546E6E',
  preco:           '#00897B',
  btnAdicionar:    '#00BFA5',
  btnRemover:      '#EF5350',
  separador:       '#E0F2F1',
  amarelo:         '#FFFF00',
  vermelho:        '#E53935',
  azulClaro:       '#38B6FF',
};

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const estilos = StyleSheet.create({

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  container2: {
    paddingTop: 20,
    marginTop: 20,
  },
  texto: {
    color: 'black',
    fontSize: 17,
    marginBottom: 10,
  },
  caixa: {
    padding: 10,
    borderColor: TEMA.azulClaro,
    borderWidth: 2,
    borderRadius: 50,
    marginBottom: 20,
    width: '150%',
    backgroundColor: 'black',
    color: 'white',
  },

  // ── PEDIDOS (tela de categorias) ───────────────────────────────────────────
  container_nav: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginTop: 150,
  },
  botoes_pedidos: {
    alignItems: 'center',
    backgroundColor: TEMA.amarelo,
    padding: 25,
    borderWidth: 3,
    borderColor: 'black',
    borderRadius: 50,
    width: '200%',
    marginTop: 20,
  },

  // ── PRODUTOS (texto antigo — mantido p/ compatibilidade) ──────────────────
  texto_pedidos: {
    marginTop: 50,
    color: 'white',
    fontSize: 15,
    marginLeft: 20,
  },

  // ── CARRINHO ───────────────────────────────────────────────────────────────
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
    marginBottom: 5,
  },
  textoQuantidade: {
    fontSize: 16,
  },

  // ── CARD DE PRODUTO ────────────────────────────────────────────────────────
  card: {
    backgroundColor: TEMA.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: TEMA.separador,
  },
  cardImagem: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 14,
  },
  imagemProduto: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    borderRadius: 10,
    marginRight: 14,
  },
  cardNome: {
    fontSize: 14,
    fontWeight: '600',
    color: TEMA.texto,
    marginBottom: 4,
  },
  nomeProduto: {
    fontSize: 14,
    fontWeight: '600',
    color: TEMA.texto,
    marginBottom: 4,
  },
  cardPreco: {
    fontSize: 16,
    fontWeight: '800',
    color: TEMA.preco,
    marginBottom: 10,
  },
  precoProduto: {
    fontSize: 16,
    fontWeight: '800',
    color: TEMA.preco,
    marginBottom: 10,
  },
  cardBotoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnAdicionar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: TEMA.btnAdicionar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRemover: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: TEMA.btnRemover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTexto: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardQtd: {
    fontSize: 17,
    fontWeight: '700',
    color: TEMA.texto,
    minWidth: 26,
    textAlign: 'center',
  },

  // ── HEADER ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TEMA.primario,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerBotao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcone: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitulo: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },

  // ── SCROLL / LAYOUT ────────────────────────────────────────────────────────
  scrollConteudo: {
    padding: 16,
    paddingBottom: 32,
  },

  // ── BANNER ─────────────────────────────────────────────────────────────────
  banner: {
    backgroundColor: TEMA.primario,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  bannerTitulo: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '800',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },

  // ── SEÇÃO / GRADE DE CATEGORIAS ────────────────────────────────────────────
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: TEMA.texto,
    marginBottom: 12,
    marginLeft: 2,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  categoriaCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    backgroundColor: TEMA.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: TEMA.separador,
  },
  categoriaIcone: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoriaTexto: {
    fontSize: 11,
    color: TEMA.texto,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── DRAWER ─────────────────────────────────────────────────────────────────
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: TEMA.card,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  drawerHeader: {
    backgroundColor: TEMA.primario,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  drawerHeaderTitulo: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: '800',
    marginBottom: 4,
  },
  drawerHeaderSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  drawerLista: {
    flex: 1,
    paddingTop: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: TEMA.separador,
  },
  drawerItemIcone: {
    fontSize: 22,
    marginRight: 14,
  },
  drawerItemTexto: {
    fontSize: 16,
    color: TEMA.texto,
    fontWeight: '500',
    flex: 1,
  },
  drawerItemSeta: {
    fontSize: 22,
    color: TEMA.textoSecundario,
  },
  drawerFechar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: TEMA.separador,
    alignItems: 'center',
  },
  drawerFecharTexto: {
    fontSize: 15,
    color: TEMA.textoSecundario,
    fontWeight: '600',
  },
});

export default estilos;
