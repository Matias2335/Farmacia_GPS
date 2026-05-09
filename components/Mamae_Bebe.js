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
import { MaterialCommunityIcons } from '@expo/vector-icons';



const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.72;

const MamaeStack = createStackNavigator();

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
  { nome: 'Fralda',    icone: '🧷', tela: 'Fralda'   },
  { nome: 'Lenco Umidecido', icone: '🫧', tela: 'Lenco_Umidecido' },
  { nome: 'Pomada de Assadura',  icone: '🧫', tela: 'Pomada_de_Assadura' },
  { nome: 'Formula Infantil Leite',  icone: '🥛', tela: 'Formula_Infantil_Leite' },
  { nome: 'Shampoo Condicionador Infantil',      icone: '🧴', tela: 'Shampoo_Condicionador_Infantil'     },
  { nome: 'Sabonete Infantil',      icone: '🧼', tela: 'Sabonete_Infantil'     },
  { nome: 'Hidratante Infantil',      icone: '🧴', tela: 'Hidratante_Infantil'     },
  { nome: 'Mamadeira Amamentacao',      icone: '🍼', tela: 'Mamadeira_Amamentacao'     },

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
          <Text style={styles.drawerHeaderTitulo}>👱‍♀️ Mamãe Bebe</Text>
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
function MamaeNavigator() {
  return (
    <MamaeStack.Navigator screenOptions={{ headerShown: false }}>
      <MamaeStack.Screen name="MamaePrincipal" component={MamaePrincipal} />
      <MamaeStack.Screen name="Fralda"         component={Fralda}        />
      <MamaeStack.Screen name="Lenco_Umidecido"       component={Lenco_Umidecido}      />
      <MamaeStack.Screen name="Pomada_de_Assadura"       component={Pomada_de_Assadura}      />
      <MamaeStack.Screen name="Formula_Infantil_Leite"       component={Formula_Infantil_Leite}      />
      <MamaeStack.Screen name="Shampoo_Condicionador_Infantil"           component={Shampoo_Condicionador_Infantil}          />
      <MamaeStack.Screen name="Sabonete_Infantil"   component={Sabonete_Infantil}          />
      <MamaeStack.Screen name="Hidratante_Infantil"   component={Hidratante_Infantil}          />
      <MamaeStack.Screen name="Mamadeira_Amamentacao"   component={Mamadeira_Amamentacao}          />
    </MamaeStack.Navigator>
  );
}

// ─── TELA PRINCIPAL ───────────────────────────────────────────────────────────
function MamaePrincipal({ navigation }) {
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
          <Text style={styles.bannerTitulo}>💊 Mamae_Bebe</Text>
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

// ─── FRALDA ────────────────────────────────────────────────────────────────
export const FRALDA = [
  { nome: 'Pampers Premium Care',   preco: 'R$ 5,95',  img: require('./Mamae_Bebe/Fralda/Pampers_Premium_Care.webp')  },
  { nome: 'Huggies Supreme Care',     preco: 'R$ 8,99',  img: require('./Mamae_Bebe/Fralda/Huggies_Supreme_Care.webp')    },
  { nome: 'MamyPoko Fralda Calça', preco: 'R$ 12,89',  img: require('./Mamae_Bebe/Fralda/MamyPoko_Fralda_Calca.jpg')  },
  { nome: 'BabySec UltraSec',         preco: 'R$ 18,09',  img: require('./Mamae_Bebe/Fralda/BabySec_UltraSec.webp') },
  { nome: 'Pampers Pants Ajuste Total',     preco: 'R$ 12,53',  img: require('./Mamae_Bebe/Fralda/Pampers_Pants_Ajuste_Total.webp')  },
  { nome: 'Huggies Little Swimmers',     preco: 'R$ 3,35', img: require('./Mamae_Bebe/Fralda/Huggies_Little_Swimmers.webp')   },
  { nome: 'Cremer Disney Baby',     preco: 'R$ 6,78', img: require('./Mamae_Bebe/Fralda/Cremer_Disney_Baby.webp')     },
  { nome: 'Pom Pom Derma Proteção',       preco: 'R$ 5,49',  img: require('./Mamae_Bebe/Fralda/Pom_Pom_Derma_Protecao.webp')  },
];
function Fralda({ navigation }) {
  const { qtds, add, remove } = useProdutos(FRALDA);
  return (
    <TelaBase titulo="🧷 Fralda" navigation={navigation}>
      {FRALDA.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── LENCO_UMIDECIDO ─────────────────────────────────────────────────────────────
export const LENCO_UMIDECIDO = [
  { nome: 'Pampers Fresh Clean',  preco: 'R$ 2,99', img: require('./Mamae_Bebe/Lenco_Umidecido/Pampers_Fresh_Clean.webp') },
  { nome: 'Huggies Puro Natural',preco: 'R$ 29,79', img: require('./Mamae_Bebe/Lenco_Umidecido/Huggies_Puro_Natural.webp')  },
  { nome: 'Johnsons Baby Extra Cuidado', preco: 'R$ 22,50', img: require('./Mamae_Bebe/Lenco_Umidecido/Johnsons_Baby_Extra_Cuidado.webp') },
  { nome: 'Natura Mamãe Bebê',  preco: 'R$ 18,99', img: require('./Mamae_Bebe/Lenco_Umidecido/Natura_Mamae_Bebe.webp')                 },
  { nome: 'Granado Bebe',  preco: 'R$ 91,90', img: require('./Mamae_Bebe/Lenco_Umidecido/Granado_Bebe.webp') },
  { nome: 'Baby Wipes Sensitive', preco: 'R$ 22,00', img: require('./Mamae_Bebe/Lenco_Umidecido/Baby_Wipes_Sensitive.webp')             },
  { nome: 'Mustela Lenços Limpeza', preco: 'R$ 23,84', img: require('./Mamae_Bebe/Lenco_Umidecido/Mustela_Lencos_Limpeza.webp') },
  { nome: 'Lencos Umedecidos Isababy', preco: 'R$ 29,99', img: require('./Mamae_Bebe/Lenco_Umidecido/Lencos_Umedecidos_Isababy.webp') },
];
function Lenco_Umidecido({ navigation }) {
  const { qtds, add, remove } = useProdutos(LENCO_UMIDECIDO);
  return (
    <TelaBase titulo="🫧 Lenco Umidecido" navigation={navigation}>
      {LENCO_UMIDECIDO.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── POMADA_DE_ASSADURA ─────────────────────────────────────────────────────────────

export const POMADA_DE_ASSADURA = [
  { nome: 'Bepantol Baby',  preco: 'R$30,50', img: require('./Mamae_Bebe/Pomada_Assadura/Bepantol_Baby.webp') },
  { nome: 'Desitin Maximum Strength',        preco: 'R$ ,84', img: require('./Mamae_Bebe/Pomada_Assadura/Desitin_Maximum_Strength.webp') },
  { nome: 'Hipoglós Amêndoas',        preco: 'R$ 28,89', img: require('./Mamae_Bebe/Pomada_Assadura/Hipoglos_Amendoas.webp')             },
  { nome: 'Bepantol Baby Extra Proteção',  preco: 'R$ 70,49', img: require('./Mamae_Bebe/Pomada_Assadura/Bepantol_Baby_Extra_Protecao.webp') },
  { nome: 'Dermodex Prevent',  preco: 'R$ 57,41', img: require('./Mamae_Bebe/Pomada_Assadura/Dermodex_Prevent.webp') },
  { nome: 'Mustela Creme Vitaminado',     preco: 'R$ 63,90', img: require('./Mamae_Bebe/Pomada_Assadura/Mustela_Creme_Vitaminado.webp')     },
  { nome: 'Weleda Baby Calendula Body Cream',preco: 'R$ 139,99', img: require('./Mamae_Bebe/Pomada_Assadura/Weleda_Baby_Calendula_Body_Cream.webp')},
  { nome: 'Cicatricure Baby',        preco: 'R$ 63,90', img: require('./Mamae_Bebe/Pomada_Assadura/Cicatricure_Baby.webp') },
];
function Pomada_de_Assadura({ navigation }) {
  const { qtds, add, remove } = useProdutos(POMADA_DE_ASSADURA);
  return (
    <TelaBase titulo="🧫 Pomada de Assadura" navigation={navigation}>
      {POMADA_DE_ASSADURA.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── FORMULA_INFANTIL_LEITE ──────────────────────────────────────────────────────────────

export const FORMULA_INFANTIL_LEITE = [
  { nome: 'Aptamil Profutura',  preco: 'R$ 23,13', img: require('./Mamae_Bebe/Formula_Infantil_Leite/Aptamil_Profutura.webp') },
  { nome: 'Nan_Pro',  preco: 'R$ 122,02', img: require('./Mamae_Bebe/Formula_Infantil_Leite/Nan_Pro.webp') },
  { nome: 'Enfamil Premium',            preco: 'R$ 46,32', img: require('./Mamae_Bebe/Formula_Infantil_Leite/Enfamil_Premium.webp') },
  { nome: 'Neslac Comfor',       preco: 'R$ 8,99',  img: require('./Mamae_Bebe/Formula_Infantil_Leite/Neslac_Comfor.webp') },
  { nome: 'Ninho Fases',   preco: 'R$ 50,15', img: require('./Mamae_Bebe/Formula_Infantil_Leite/Ninho_Fases.webp') },
  { nome: 'Pregomin Pepti',     preco: 'R$ 71,18', img: require('./Mamae_Bebe/Formula_Infantil_Leite/Pregomin_Pepti.webp') },
  { nome: 'Nestogeno',      preco: 'R$ 57,90',  img: require('./Mamae_Bebe/Formula_Infantil_Leite/Nestogeno.webp') },
];
function Formula_Infantil_Leite({ navigation }) {
  const { qtds, add, remove } = useProdutos(FORMULA_INFANTIL_LEITE);
  return (
    <TelaBase titulo="🥛 Formula Infantil Leite" navigation={navigation}>
      {FORMULA_INFANTIL_LEITE.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── SHAMPOO_CONDICIONADOR_INFANTIL ──────────────────────────────────────────────────────────────────
export const SHAMPOO_CONDICIONADOR_INFANTIL = [
  { nome: 'Shampoo Johnsons Baby Regular ',preco: 'R$9,90', img: require('./Mamae_Bebe/Shampoo_Condicionador_Infantil/Shampoo_Johnsons_Baby_Regular.webp') },
  { nome: 'Condicionador Johnsons Gotas Brilho',preco: 'R$9,99', img: require('./Mamae_Bebe/Shampoo_Condicionador_Infantil/Condicionador_Johnsons_Gotas_Brilho.webp') },
  { nome: 'Shampoo Granado Bebê Calêndula', preco: 'R$ 13,99', img: require('./Mamae_Bebe/Shampoo_Condicionador_Infantil/Shampoo_Granado_Bebe_Calendula.webp') },
  { nome: 'Condicionador Natura Mamae Bebe',    preco: 'R$ 36,44', img: require('./Mamae_Bebe/Shampoo_Condicionador_Infantil/Condicionador_Natura_Mamae_Bebe.webp') },
  { nome: 'Shampoo Huggies Extra Suave',    preco: 'R$ 19,09',  img: require('./Mamae_Bebe/Shampoo_Condicionador_Infantil/Shampoo_Huggies_Extra_Suave.webp') },
  { nome: 'Condicionador Dove Baby Hidratacao Enriquecida', preco: 'R$ 15,99',  img: require('./Mamae_Bebe/Shampoo_Condicionador_Infantil/Condicionador_Dove_Baby_Hidratacao_Enriquecida.webp') },
  { nome: 'Mustela Gentle Shampoo',      preco: 'R$ 28,79',  img: require('./Mamae_Bebe/Shampoo_Condicionador_Infantil/Mustela_Gentle_Shampoo.webp') },
  { nome: 'Shampoo Bio Extratus_Kids',         preco: 'R$ 66,67', img: require('./Mamae_Bebe/Shampoo_Condicionador_Infantil/Shampoo_Bio_Extratus_Kids.webp') },
];
function Shampoo_Condicionador_Infantil({ navigation }) {
  const { qtds, add, remove } = useProdutos(SHAMPOO_CONDICIONADOR_INFANTIL);
  return (
    <TelaBase titulo="🧴 Shampoo Condicionador Infantil" navigation={navigation}>
      {SHAMPOO_CONDICIONADOR_INFANTIL.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}

// ─── SABONETE_INFANTIL ──────────────────────────────────────────────────────────────────
export const SABONETE_INFANTIL = [
  { nome: 'Cabeca aos Pes',    preco: 'R$ 24,39', img: require('./Mamae_Bebe/Sabonete_Infantil/Cabeca_aos_Pes.webp') },
  { nome: 'Glicerina Granado Bebe',    preco: 'R$19,99', img: require('./Mamae_Bebe/Sabonete_Infantil/Glicerina_Granado_Bebe.webp') },
  { nome: 'Dove Baby Umectacao', preco: 'R$ 16,90', img: require('./Mamae_Bebe/Sabonete_Infantil/Dove_Baby_Umectacao.webp') },
  { nome: 'Natura Mamae Bebe',    preco: 'R$ 8,45', img: require('./Mamae_Bebe/Sabonete_Infantil/Natura_Mamae_Bebe.webp') },
  { nome: 'Mustela Stelatopia',    preco: 'R$ 51,73',  img: require('./Mamae_Bebe/Sabonete_Infantil/Mustela_Stelatopia.webp') },
  { nome: 'Huggies Relaxante', preco: 'R$ 8,13',  img: require('./Mamae_Bebe/Sabonete_Infantil/Huggies_Relaxante.webp') },
  { nome: 'Cetaphil Baby',      preco: 'R$ 25,70',  img: require('./Mamae_Bebe/Sabonete_Infantil/Cetaphil_Baby.webp') },
  { nome: 'Giovanna Baby Blue',         preco: 'R$ 13,49', img: require('./Mamae_Bebe/Sabonete_Infantil/Giovanna_Baby_Blue.webp') },
];
function Sabonete_Infantil({ navigation }) {
  const { qtds, add, remove } = useProdutos(SABONETE_INFANTIL);
  return (
    <TelaBase titulo="🧼 Sabonete Infantil" navigation={navigation}>
      {SABONETE_INFANTIL.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}


// ─── HIDRATANTE_INFANTIL ──────────────────────────────────────────────────────────────────
export const HIDRATANTE_INFANTIL = [
  { nome: 'Locao Hidratante Natura',    preco: 'R$ 24,39', img: require('./Mamae_Bebe/Hidratante_Infantil/Locao_Hidratante_Natura.webp') },
  { nome: 'Aveeno Baby Daily Moisture',    preco: 'R$19,99', img: require('./Mamae_Bebe/Hidratante_Infantil/Aveeno_Baby_Daily_Moisture.webp') },
  { nome: 'Mustela Hydra Bebe', preco: 'R$ 16,90', img: require('./Mamae_Bebe/Hidratante_Infantil/Mustela_Hydra_Bebe.webp') },
  { nome: 'Cetaphil Baby Ultra Soothing',    preco: 'R$ 8,45', img: require('./Mamae_Bebe/Hidratante_Infantil/Cetaphil_Baby_Ultra_Soothing.webp') },
  { nome: 'Johnsons Baby Recem Nascido',    preco: 'R$ 51,73',  img: require('./Mamae_Bebe/Hidratante_Infantil/Johnsons_Baby_Recem_Nascido.webp') },
  { nome: 'Granado Bebe', preco: 'R$ 8,13',  img: require('./Mamae_Bebe/Hidratante_Infantil/Granado_Bebe.webp') },
  { nome: 'Hidratante Fisiogel AI',      preco: 'R$ 25,70',  img: require('./Mamae_Bebe/Hidratante_Infantil/Hidratante_Fisiogel_AI.webp') },
  { nome: 'Chicco Natural Sensation',         preco: 'R$ 13,49', img: require('./Mamae_Bebe/Hidratante_Infantil/Chicco_Natural_Sensation.webp') },
];
function Hidratante_Infantil({ navigation }) {
  const { qtds, add, remove } = useProdutos(HIDRATANTE_INFANTIL);
  return (
    <TelaBase titulo="🧴 Hidratante Infantil" navigation={navigation}>
      {HIDRATANTE_INFANTIL.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)} />
      ))}
    </TelaBase>
  );
}


// ─── MAMADEIRA_AMAMENTACAO ──────────────────────────────────────────────────────────────────
export const MAMADEIRA_AMAMENTACAO = [
  { nome: 'Philips Avent Petala',    preco: 'R$ 24,39', img: require('./Mamae_Bebe/Mamadeira_Amamentacao/Philips_Avent_Petala.webp') },
  { nome: 'Bomba Tira Leite Eletrica GTech',    preco: 'R$19,99', img: require('./Mamae_Bebe/Mamadeira_Amamentacao/Bomba_Tira_Leite_Eletrica_GTech.webp') },
  { nome: 'Conchas Amamentacao', preco: 'R$ 16,90', img: require('./Mamae_Bebe/Mamadeira_Amamentacao/Conchas_Amamentacao.webp') },
  { nome: 'MAM Easy Start',    preco: 'R$ 8,45', img: require('./Mamae_Bebe/Mamadeira_Amamentacao/MAM_Easy_Start.webp') },
  { nome: 'Protetor Seio Descartavel',    preco: 'R$ 51,73',  img: require('./Mamae_Bebe/Mamadeira_Amamentacao/Protetor_Seio_Descartavel.webp') },
  { nome: 'Almofada Amamentacao Boppy', preco: 'R$ 8,13',  img: require('./Mamae_Bebe/Mamadeira_Amamentacao/Almofada_Amamentacao_Boppy.webp') },
  { nome: 'Absorvente Seios Lavavel',      preco: 'R$ 25,70',  img: require('./Mamae_Bebe/Mamadeira_Amamentacao/Absorvente_Seios_Lavavel.webp') },
  { nome: 'Copo Treinamento NUK First Choice',preco: 'R$ 13,49', img: require('./Mamae_Bebe/Mamadeira_Amamentacao/Copo_Treinamento_NUK_First_Choice.webp') },
];
function Mamadeira_Amamentacao({ navigation }) {
  const { qtds, add, remove } = useProdutos(MAMADEIRA_AMAMENTACAO);
  return (
    <TelaBase titulo="🍼 Mamadeira  Amamentacao" navigation={navigation}>
      {MAMADEIRA_AMAMENTACAO.map((p, i) => (
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

export default MamaeNavigator;