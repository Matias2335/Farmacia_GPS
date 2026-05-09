import React, { useState, useRef } from 'react';
import {
  Text, View, TouchableOpacity, ImageBackground,
  ScrollView, Image, Vibration, Animated, Dimensions,
  StyleSheet, TouchableWithoutFeedback, StatusBar, Platform
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
// Injeção de dependência: importa a IMPLEMENTAÇÃO (que segue ICarrinhoService)
// O componente só chama métodos definidos na interface: salvar(), remover()
import { CarrinhoServiceImpl } from './interfaces/CarrinhoServiceImpl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.72;

const HigienesStack = createStackNavigator();

// ─── CORES DO TEMA ──────────────────────────────────────────────────────────
const TEMA = {
  primario:         '#00BFA5',
  secundario:       '#0097A7',
  fundo:            '#F0FAFA',
  card:             '#FFFFFF',
  texto:            '#1A2B2B',
  textoSecundario:  '#546E6E',
  preco:            '#00897B',
  btnAdicionar:     '#00BFA5',
  btnRemover:       '#EF5350',
  separador:        '#E0F2F1',
};

const CATEGORIAS = [
  { nome: 'Sabonetes',    icone: '🧼', tela: 'Sabonetes'   },
  { nome: 'Desodorantes', icone: '🌿', tela: 'Desodorante' },
  { nome: 'Absorventes',  icone: '🌸', tela: 'Absorventes' },
  { nome: 'Pasta de Dente',  icone: '🦷', tela: 'Pasta de Dente' },
  { nome: 'Escovas',      icone: '🦷', tela: 'Escovas'     },
];

// ─── DRAWER LATERAL ──────────────────────────────────────────────────────────
function DrawerMenu({ visible, onClose, onNavigate }) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(opacity,    { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted && !visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.drawerOverlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawerPanel, { transform: [{ translateX }] }]}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerHeaderTitulo}>🧴 Higiene Pessoal</Text>
          <Text style={styles.drawerHeaderSub}>Escolha uma categoria</Text>
        </View>

        <ScrollView style={styles.drawerLista}>
          {CATEGORIAS.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={styles.drawerItem}
              onPress={() => { onClose(); setTimeout(() => onNavigate(cat.tela), 250); }}
              activeOpacity={0.7}
            >
              <Text style={styles.drawerItemIcone}>{cat.icone}</Text>
              <Text style={styles.drawerItemTexto}>{cat.nome}</Text>
              <Text style={styles.drawerItemSeta}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.drawerFechar} onPress={onClose}>
          <Text style={styles.drawerFecharTexto}>✕  Fechar menu</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── CARD DE PRODUTO ─────────────────────────────────────────────────────────
function CardProduto({ imagem, nome, preco, quantidade, onAdd, onRemove }) {
  return (
    <View style={styles.card}>
      <Image source={imagem} style={styles.cardImagem} resizeMode="contain" />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardNome}>{nome}</Text>
        <Text style={styles.cardPreco}>{preco}</Text>
        <View style={styles.cardBotoes}>
          <TouchableOpacity style={styles.btnRemover} onPress={onRemove} activeOpacity={0.8}>
            <Text style={styles.btnTexto}>−</Text>
          </TouchableOpacity>
          <Text style={styles.cardQtd}>{quantidade}</Text>
          <TouchableOpacity style={styles.btnAdicionar} onPress={onAdd} activeOpacity={0.8}>
            <Text style={styles.btnTexto}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── HEADER CUSTOMIZADO ───────────────────────────────────────────────────────
function AppHeader({ titulo, onBack, onMenu }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.headerBotao}>
        <Text style={styles.headerIcone}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitulo} numberOfLines={1}>{titulo}</Text>
      <TouchableOpacity onPress={onMenu} style={styles.headerBotao}>
        <Text style={styles.headerIcone}>☰</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── TELA BASE (reutilizável para todas as categorias) ───────────────────────
function TelaBase({ titulo, navigation, children }) {
  const [drawerVisivel, setDrawerVisivel] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: TEMA.fundo }}>
      <AppHeader
        titulo={titulo}
        onBack={() => navigation.goBack()}
        onMenu={() => setDrawerVisivel(true)}
      />
      <ScrollView contentContainerStyle={styles.scrollConteudo}>
        {children}
      </ScrollView>
      <DrawerMenu
        visible={drawerVisivel}
        onClose={() => setDrawerVisivel(false)}
        onNavigate={(tela) => navigation.navigate(tela)}
      />
    </View>
  );
}

// ─── HOOK DE PRODUTOS ─────────────────────────────────────────────────────────
function useProdutos(lista) {
  const [qtds, setQtds] = useState(
    Object.fromEntries(lista.map(p => [p.nome, 0]))
  );
  // Recebe a implementação via interface ICarrinhoService (injeção de dependência)
  const carrinhoService = new CarrinhoServiceImpl();

  function add(nome) {
    Vibration.vibrate(30);
    setQtds(prev => {
      const nova = prev[nome] + 1;
      carrinhoService.salvar(nome, nova);
      return { ...prev, [nome]: nova };
    });
  }
  function remove(nome) {
    setQtds(prev => {
      if (prev[nome] <= 0) return prev;
      const nova = prev[nome] - 1;
      carrinhoService.salvar(nome, nova);
      return { ...prev, [nome]: nova };
    });
  }
  return { qtds, add, remove };
}

// ─── NAVIGATOR ────────────────────────────────────────────────────────────────
function HigienesNavigator() {
  return (
    // headerShown: false em TODOS — remove o header padrão do Stack
    <HigienesStack.Navigator screenOptions={{ headerShown: false }}>
      <HigienesStack.Screen name="HigienePrincipal" component={HigienePrincipal} />
      <HigienesStack.Screen name="Sabonetes"         component={Sabonetes}        />
      <HigienesStack.Screen name="Desodorante"       component={Desodorante}      />
      <HigienesStack.Screen name="Absorventes"       component={Absorventes}      />
      <HigienesStack.Screen name="Pasta de Dente"       component={Pasta}      />
      <HigienesStack.Screen name="Escovas"           component={Escovas}          />
      <HigienesStack.Screen name="Enxaguante Bucal"   component={Enxaguante_Bucal}          />
    </HigienesStack.Navigator>
  );
}

// ─── TELA PRINCIPAL ───────────────────────────────────────────────────────────
function HigienePrincipal({ navigation }) {
  const [drawerVisivel, setDrawerVisivel] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: TEMA.fundo }}>
      <AppHeader
        titulo="Higiene Pessoal"
        onBack={() => navigation.goBack()}
        onMenu={() => setDrawerVisivel(true)}
      />
      <ScrollView contentContainerStyle={styles.scrollConteudo}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitulo}>🧴 Higiene Pessoal</Text>
          <Text style={styles.bannerSub}>Toque em ☰ ou escolha uma categoria abaixo</Text>
        </View>

        <Text style={styles.secaoTitulo}>Categorias</Text>
        <View style={styles.grade}>
          {CATEGORIAS.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={styles.categoriaCard}
              onPress={() => navigation.navigate(cat.tela)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoriaIcone}>{cat.icone}</Text>
              <Text style={styles.categoriaTexto}>{cat.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <DrawerMenu
        visible={drawerVisivel}
        onClose={() => setDrawerVisivel(false)}
        onNavigate={(tela) => navigation.navigate(tela)}
      />
    </View>
  );
}

// ─── SABONETES ────────────────────────────────────────────────────────────────
const SABONETES = [
  { nome: 'Granado Enxofre',   preco: 'R$ 8,00',  img: require('./Higiene_Pessoal/Sabonete/SaboneteEnxofre.webp')  },
  { nome: 'Dove Original',     preco: 'R$ 4,99',  img: require('./Higiene_Pessoal/Sabonete/Dove_Original.webp')    },
  { nome: 'Protex Vitamina E', preco: 'R$ 4,19',  img: require('./Higiene_Pessoal/Sabonete/sabonete_protex.webp')  },
  { nome: 'Dove Baby',         preco: 'R$ 4,39',  img: require('./Higiene_Pessoal/Sabonete/sabonetedovebaby.webp') },
  { nome: 'Johnsons Baby',     preco: 'R$ 4,39',  img: require('./Higiene_Pessoal/Sabonete/johnsonsbaby.webp')     },
  { nome: 'Íntimo Kronel',     preco: 'R$ 27,90', img: require('./Higiene_Pessoal/Sabonete/saboneteKronel.webp')   },
  { nome: 'Líquido Nivea',     preco: 'R$ 18,99', img: require('./Higiene_Pessoal/Sabonete/sabonetenivea.jpg')     },
  { nome: 'Protex Baby',       preco: 'R$ 5,49',  img: require('./Higiene_Pessoal/Sabonete/sabonete_protex.webp')  },
];
function Sabonetes({ navigation }) {
  const { qtds, add, remove } = useProdutos(SABONETES);
  return (
    <TelaBase titulo="🧼 Sabonetes" navigation={navigation}>
      {SABONETES.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── DESODORANTES ─────────────────────────────────────────────────────────────
const DESODORANTES = [
  { nome: 'Rexona Men Clinical',  preco: 'R$ 23,90', img: require('./Higiene_Pessoal/Desodorante/Desodorante_Rexona_Men_Clinical_Clean.webp') },
  { nome: 'Dove Men+Care',        preco: 'R$ 29,79', img: require('./Higiene_Pessoal/Desodorante/DesodoranteDoveMenCare.webp')                },
  { nome: 'Dove Original',        preco: 'R$ 15,50', img: require('./Higiene_Pessoal/Desodorante/Desodorante_Dove_Original.webp')             },
  { nome: 'Nivea Black & White',  preco: 'R$ 15,50', img: require('./Higiene_Pessoal/Desodorante/desodoranteblackwhite.webp')                 },
  { nome: 'Rexona Women Powder',  preco: 'R$ 19,49', img: require('./Higiene_Pessoal/Desodorante/Desodorante_Women_Power.webp') },
  { nome: 'Dove Sem Perfume',     preco: 'R$ 16,90', img: require('./Higiene_Pessoal/Desodorante/Desodorante_Dove_SemPerfume.webp')             },
  { nome: 'Nivea Sensitive',      preco: 'R$ 23,84', img: require('./Higiene_Pessoal/Desodorante/Desodorante_Sensitive.webp')                 },
  { nome: 'Rexona Bamboo',        preco: 'R$ 14,90', img: require('./Higiene_Pessoal/Desodorante/Desodorante_Bamboo.webp') },
];
function Desodorante({ navigation }) {
  const { qtds, add, remove } = useProdutos(DESODORANTES);
  return (
    <TelaBase titulo="🌿 Desodorantes" navigation={navigation}>
      {DESODORANTES.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── PASTA DE DENTE ─────────────────────────────────────────────────────────────
const PASTA = [
  { nome: 'Boni Natural',  preco: 'R$19,99', img: require('./Higiene_Pessoal/Pasta_de_Dente/Pasta_Boni.webp') },
  { nome: 'Close UP',        preco: 'R$ 6,49', img: require('./Higiene_Pessoal/Pasta_de_Dente/Pasta_Closeup.webp')                },
  { nome: 'Colgate',        preco: 'R$ 6,89', img: require('./Higiene_Pessoal/Pasta_de_Dente/Pasta_Colgate.webp')             },
  { nome: 'Curaprox',  preco: 'R$ 41,99', img: require('./Higiene_Pessoal/Pasta_de_Dente/Pasta_Curaprox.webp')                 },
  { nome: 'Elmex',  preco: 'R$ 26,39', img: require('./Higiene_Pessoal/Pasta_de_Dente/Pasta_Elmex.webp') },
  { nome: 'Oral-B',     preco: 'R$ 7,64', img: require('./Higiene_Pessoal/Pasta_de_Dente/Pasta_OralB.webp')             },
  { nome: 'Parodontax',      preco: 'R$ 23,90', img: require('./Higiene_Pessoal/Pasta_de_Dente/Pasta_Paradontax.webp')                 },
  { nome: 'Sensodyne',        preco: 'R$ 31,99', img: require('./Higiene_Pessoal/Pasta_de_Dente/Pasta_Sensodyne.webp') },
];
function Pasta({ navigation }) {
  const { qtds, add, remove } = useProdutos(PASTA);
  return (
    <TelaBase titulo="🌿 Pasta de Dente" navigation={navigation}>
      {PASTA.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── ABSORVENTES ──────────────────────────────────────────────────────────────
const ABSORVENTES = [
  { nome: 'Always Suave',           preco: 'R$ 12,90', img: require('./Higiene_Pessoal/Absorvente/Absorvente_Always_Suave.webp') },
  { nome: 'Always Noturno',         preco: 'R$ 14,90', img: require('./Higiene_Pessoal/Absorvente/Always_noturno.webp') },
  { nome: 'Intimus Gel',            preco: 'R$ 11,50', img: require('./Higiene_Pessoal/Absorvente/Intimus_Gel.webp') },
  { nome: 'Intimus Protetor',       preco: 'R$ 9,90',  img: require('./Higiene_Pessoal/Absorvente/Intimus_Protetor.webp') },
  { nome: 'Sempre Livre Noturno',   preco: 'R$ 13,90', img: require('./Higiene_Pessoal/Absorvente/Sempre_Livre_Noturno.webp') },
  { nome: 'Sempre Livre Suave',     preco: 'R$ 10,90', img: require('./Higiene_Pessoal/Absorvente/Sempre_Livre_Suave.webp') },
  { nome: 'Carefree Original',      preco: 'R$ 7,90',  img: require('./Higiene_Pessoal/Absorvente/Carrefree.webp') },
  { nome: 'Always Protetor Diário', preco: 'R$ 8,90',  img: require('./Higiene_Pessoal/Absorvente/Always_Protetor_Diario.webp') },
];
function Absorventes({ navigation }) {
  const { qtds, add, remove } = useProdutos(ABSORVENTES);
  return (
    <TelaBase titulo="🌸 Absorventes" navigation={navigation}>
      {ABSORVENTES.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── ESCOVAS ──────────────────────────────────────────────────────────────────
const ESCOVAS = [
  { nome: 'Oral-B Series 1',    preco: 'R$ 239,90', img: require('./Higiene_Pessoal/Escovas/Escova_Oral_Pro.webp') },
  { nome: 'Oral-B Pro-Saúde',    preco: 'R$27,19', img: require('./Higiene_Pessoal/Escovas/Escova_Oral_B.webp') },
  { nome: 'Sensodyne Sensitive', preco: 'R$ 11,90', img: require('./Higiene_Pessoal/Escovas/Escova_Sensodyne.webp') },
  { nome: 'Philips Sonicare',    preco: 'R$ 160,45', img: require('./Higiene_Pessoal/Escovas/Escova_Sonicare.webp') },
  { nome: 'Oral-B Ultrafino',    preco: 'R$ 17,99',  img: require('./Higiene_Pessoal/Escovas/Escova_Ultrafino.webp') },
  { nome: 'Colgate Extra Clean', preco: 'R$ 19,90',  img: require('./Higiene_Pessoal/Escovas/Escova_Extra_Clean.webp') },
  { nome: 'Reach Advanced',      preco: 'R$ 138,60',  img: require('./Higiene_Pessoal/Escovas/Escova_Reach.webp') },
  { nome: 'Oral-B Kids',         preco: 'R$ 11,90', img: require('./Higiene_Pessoal/Escovas/Escova_Kids.webp') },
];
function Escovas({ navigation }) {
  const { qtds, add, remove } = useProdutos(ESCOVAS);
  return (
    <TelaBase titulo="🦷 Escovas de Dente" navigation={navigation}>
      {ESCOVAS.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── ENXAGUANTE BUCAL ──────────────────────────────────────────────────────────────────
const ENXAGUANTE_BUCAL = [
  { nome: 'Listerine Cool Mint',    preco: 'R$ 24,39', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Listerine_Cool_Mint.webp') },
  { nome: 'Colgate Plax Fresh',    preco: 'R$19,99', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Colgate_Plax_Fresh.webp') },
  { nome: 'Oral-B Completee', preco: 'R$ 16,90', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Oral_B_Complete.webp') },
  { nome: 'CloseUp Fresh',    preco: 'R$ 8,45', img: require('./Higiene_Pessoal/Enxaguante_Bucal/CloseUp_Fresh.webp') },
  { nome: 'Scope Fresh Mint',    preco: 'R$ 51,73',  img: require('./Higiene_Pessoal/Enxaguante_Bucal/Scope_Fresh_Mint.webp') },
  { nome: 'Cepacol Ice', preco: 'R$ 8,13',  img: require('./Higiene_Pessoal/Enxaguante_Bucal/Cepacol_Ice.webp') },
  { nome: 'Periogard Clean',      preco: 'R$ 25,70',  img: require('./Higiene_Pessoal/Enxaguante_Bucal/Periogard_Clean.webp') },
  { nome: 'Colgate Total Fresh',         preco: 'R$ 13,49', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Colgate_Total_Fresh.webp') },
];
function Enxaguante_Bucal({ navigation }) {
  const { qtds, add, remove } = useProdutos(ENXAGUANTE_BUCAL);
  return (
    <TelaBase titulo="🦷 Enxaguante Bucal" navigation={navigation}>
      {ENXAGUANTE_BUCAL.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}



// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerIcone:  { fontSize: 20, color: '#FFF', fontWeight: 'bold' },
  headerTitulo: { fontSize: 18, color: '#FFF', fontWeight: '700', flex: 1, textAlign: 'center' },

  scrollConteudo: { padding: 16, paddingBottom: 32 },

  banner: {
    backgroundColor: TEMA.primario,
    borderRadius: 16, padding: 24,
    marginBottom: 20, alignItems: 'center',
  },
  bannerTitulo: { fontSize: 24, color: '#FFF', fontWeight: '800', marginBottom: 6 },
  bannerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  secaoTitulo: {
    fontSize: 16, fontWeight: '700', color: TEMA.texto,
    marginBottom: 12, marginLeft: 2,
  },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  categoriaCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    backgroundColor: TEMA.card, borderRadius: 14,
    padding: 16, alignItems: 'center',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
    borderWidth: 1, borderColor: TEMA.separador,
  },
  categoriaIcone: { fontSize: 28, marginBottom: 6 },
  categoriaTexto: { fontSize: 11, color: TEMA.texto, fontWeight: '600', textAlign: 'center' },

  card: {
    backgroundColor: TEMA.card, borderRadius: 16,
    padding: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4,
    borderWidth: 1, borderColor: TEMA.separador,
  },
  cardImagem:  { width: 72, height: 72, borderRadius: 10, marginRight: 14 },
  cardNome:    { fontSize: 14, fontWeight: '600', color: TEMA.texto, marginBottom: 4 },
  cardPreco:   { fontSize: 16, fontWeight: '800', color: TEMA.preco, marginBottom: 10 },
  cardBotoes:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnAdicionar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: TEMA.btnAdicionar,
    alignItems: 'center', justifyContent: 'center',
  },
  btnRemover: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: TEMA.btnRemover,
    alignItems: 'center', justifyContent: 'center',
  },
  btnTexto: { color: '#FFF', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  cardQtd:  { fontSize: 17, fontWeight: '700', color: TEMA.texto, minWidth: 26, textAlign: 'center' },

  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawerPanel: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
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
    paddingBottom: 20, paddingHorizontal: 20,
  },
  drawerHeaderTitulo: { fontSize: 22, color: '#FFF', fontWeight: '800', marginBottom: 4 },
  drawerHeaderSub:    { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  drawerLista:        { flex: 1, paddingTop: 8 },
  drawerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: TEMA.separador,
  },
  drawerItemIcone: { fontSize: 22, marginRight: 14 },
  drawerItemTexto: { fontSize: 16, color: TEMA.texto, fontWeight: '500', flex: 1 },
  drawerItemSeta:  { fontSize: 22, color: TEMA.textoSecundario },
  drawerFechar: {
    padding: 20, borderTopWidth: 1,
    borderTopColor: TEMA.separador, alignItems: 'center',
  },
  drawerFecharTexto: { fontSize: 15, color: TEMA.textoSecundario, fontWeight: '600' },
});

export default HigienesNavigator;