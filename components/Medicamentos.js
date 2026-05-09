import React, { useState, useRef, useEffect } from 'react';
import {
  Text, View, TouchableOpacity, ImageBackground,
  ScrollView, Image, Vibration, Animated, Dimensions,
  StyleSheet, TouchableWithoutFeedback, StatusBar, Platform
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { CarrinhoServiceImpl } from './interfaces/CarrinhoServiceImpl';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../Config/supabase';
import EnviarReceita from './EnviarReceita';
import { MEDICAMENTOS_CONTROLADOS } from './controlados';
import { Picker } from '@react-native-picker/picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.72;

const MedicamentosStack = createStackNavigator();

// ─── CORES DO TEMA ───────────────────────────────────────────────────────────
const TEMA = {
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
  bloqueado:       '#78909C',
  alertaBg:        '#FFF8E1',
  alertaBorda:     '#FFB300',
};

// ─── MEDICAMENTOS QUE NECESSITAM RECEITA ─────────────────────────────────────
// Adicione aqui os nomes exatos dos produtos que exigem receita médica
const REQUER_RECEITA = new Set(MEDICAMENTOS_CONTROLADOS);

const CATEGORIAS = [
  { nome: 'Genéricos',           icone: '💊', tela: 'Genéricos'           },
  { nome: 'Anti-Hipertensivos',  icone: '❤️', tela: 'Anti-Hipertensivos'  },
  { nome: 'Antidiabeticos',      icone: '🚫', tela: 'Antidiabeticos'      },
  { nome: 'Anti-Concepcionais',  icone: '💊', tela: 'Anti-Concepcionais'  },
  { nome: 'Analgésicos',         icone: '🤕', tela: 'Analgésicos'         },
  { nome: 'Enviar Receita',      icone: '📄', tela: 'EnviarReceita'       },
];

// ─── HOOK: STATUS DA RECEITA DO USUÁRIO ──────────────────────────────────────
// Retorna: null (sem receita) | 'pendente' | 'aprovado' | 'rejeitado'
function useReceitasAprovadas() {

  const [medicamentosLiberados, setMedicamentosLiberados] = useState([]);

  async function carregar() {

    try {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMedicamentosLiberados([]);
        return;
      }

      const { data, error } = await supabase
        .from('receitas')
        .select('medicamento')
        .eq('user_id', user.id)
        .eq('status', 'aprovado');

      if (error) {
        console.log(error);
        return;
      }

      const meds = data.map(item => item.medicamento);

      setMedicamentosLiberados(meds);

    } catch (e) {

      console.log(e);

    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return {
    medicamentosLiberados,
    recarregar: carregar,
  };
}

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
          <Text style={styles.drawerHeaderTitulo}>💊 Medicamentos</Text>
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

// ─── BANNER DE AVISO DE RECEITA ───────────────────────────────────────────────
function BannerReceita({ status, onEnviar, onAtualizar }) {
  if (status === 'aprovado') return null; // tudo liberado, não precisa de aviso

  const config = {
    null:      { bg: '#FFF3E0', borda: '#FFB300', icone: '🔒', cor: '#E65100',
                 titulo: 'Receita necessária',
                 desc: 'Esta categoria possui medicamentos que exigem receita médica.' },
    pendente:  { bg: '#E3F2FD', borda: '#1565C0', icone: '⏳', cor: '#0D47A1',
                 titulo: 'Receita em análise',
                 desc: 'Sua receita está sendo analisada pelo farmacêutico. Aguarde a aprovação.' },
    rejeitado: { bg: '#FFEBEE', borda: '#C62828', icone: '❌', cor: '#B71C1C',
                 titulo: 'Receita rejeitada',
                 desc: 'Sua receita foi rejeitada. Envie uma nova para liberar os medicamentos.' },
  };

  const c = config[status] ?? config[null];

  return (
    <View style={[styles.banner, { backgroundColor: c.bg, borderColor: c.borda }]}>
      <Text style={styles.bannerIcone}>{c.icone}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.bannerTitulo, { color: c.cor }]}>{c.titulo}</Text>
        <Text style={styles.bannerDesc}>{c.desc}</Text>
        <View style={styles.bannerBotoes}>
          {(status === null || status === 'rejeitado') && (
            <TouchableOpacity style={[styles.bannerBotao, { backgroundColor: TEMA.primario }]} onPress={onEnviar}>
              <Text style={styles.bannerBotaoTexto}>📤 Enviar Receita</Text>
            </TouchableOpacity>
          )}
          {status === 'pendente' && (
            <TouchableOpacity style={[styles.bannerBotao, { backgroundColor: '#1565C0' }]} onPress={onAtualizar}>
              <Text style={styles.bannerBotaoTexto}>🔃 Verificar status</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── CARD DE PRODUTO ──────────────────────────────────────────────────────────
function CardProduto({ imagem, nome, preco, quantidade, onAdd, onRemove, receitaAprovada }) {
  const precisaReceita = REQUER_RECEITA.has(nome);
  const bloqueado      = precisaReceita && !receitaAprovada;

  return (
    <View style={[styles.card, bloqueado && styles.cardBloqueado]}>
      <Image source={imagem} style={[styles.cardImagem, bloqueado && { opacity: 0.5 }]} resizeMode="contain" />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardNome}>{nome}</Text>
        <Text style={styles.cardPreco}>{preco}</Text>

        {bloqueado ? (
          // ── Card bloqueado ──
          <View style={styles.receitaTag}>
            <Text style={styles.receitaTagTexto}>🔒 Requer receita médica</Text>
          </View>
        ) : (
          // ── Botões normais ──
          <View style={styles.cardBotoes}>
            <TouchableOpacity style={styles.btnRemover} onPress={onRemove} activeOpacity={0.8}>
              <Text style={styles.btnTexto}>−</Text>
            </TouchableOpacity>
            <Text style={styles.cardQtd}>{quantidade}</Text>
            <TouchableOpacity style={styles.btnAdicionar} onPress={onAdd} activeOpacity={0.8}>
              <Text style={styles.btnTexto}>+</Text>
            </TouchableOpacity>
          </View>
        )}
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

// ─── TELA BASE (reutilizável) ─────────────────────────────────────────────────
function TelaBase({ titulo, navigation, temReceita, children }) {
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
function MedicamentosNavigator() {
  return (
    <MedicamentosStack.Navigator screenOptions={{ headerShown: false }}>
      <MedicamentosStack.Screen name="MedicamentosPrincipal" component={MedicamentosPrincipal} />
      <MedicamentosStack.Screen name="Genéricos"            component={Genericos}            />
      <MedicamentosStack.Screen name="Anti-Hipertensivos"   component={Anti_Hipertensivos}   />
      <MedicamentosStack.Screen name="Antidiabeticos"       component={Antidiabeticos}       />
      <MedicamentosStack.Screen name="Anti-Concepcionais"   component={Anti_Concepcionais}   />
      <MedicamentosStack.Screen name="Analgésicos"          component={Analgesicos}          />
      <MedicamentosStack.Screen name="Enxaguante Bucal"     component={Enxaguante_Bucal}     />
      <MedicamentosStack.Screen name="EnviarReceita"        component={EnviarReceita}        />
    </MedicamentosStack.Navigator>
  );
}

// ─── TELA PRINCIPAL ───────────────────────────────────────────────────────────
function MedicamentosPrincipal({ navigation }) {
  const [drawerVisivel, setDrawerVisivel] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: TEMA.fundo }}>
      <AppHeader
        titulo="Medicamentos"
        onBack={() => navigation.goBack()}
        onMenu={() => setDrawerVisivel(true)}
      />
      <ScrollView contentContainerStyle={styles.scrollConteudo}>
        <View style={styles.bannerPrincipal}>
          <Text style={styles.bannerPrincipalTitulo}>💊 Medicamentos</Text>
          <Text style={styles.bannerPrincipalSub}>Toque em ☰ ou escolha uma categoria abaixo</Text>
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

// ─── GENERICOS ────────────────────────────────────────────────────────────────
export const GENERICOS = [
  { nome: 'Paracetamol',  preco: 'R$ 5,95',  img: require('./Medicamentos/Genericos/Paracetamol.webp')  },
  { nome: 'Ibuprofeno',   preco: 'R$ 8,99',  img: require('./Medicamentos/Genericos/Ibuprofeno.webp')    },
  { nome: 'Dipirona',     preco: 'R$ 12,89', img: require('./Medicamentos/Genericos/Dipirona.webp')      },
  { nome: 'Amoxicilina',  preco: 'R$ 18,09', img: require('./Medicamentos/Genericos/Amoxicilina.webp')   },
  { nome: 'Omeprazol',    preco: 'R$ 12,53', img: require('./Medicamentos/Genericos/Omeprazol.webp')     },
  { nome: 'Losartana',    preco: 'R$ 3,35',  img: require('./Medicamentos/Genericos/Losartana.webp')     },
  { nome: 'Metformina',   preco: 'R$ 6,78',  img: require('./Medicamentos/Genericos/Metformina.webp')    },
  { nome: 'Sinvastatina', preco: 'R$ 5,49',  img: require('./Medicamentos/Genericos/Sinvastatina.webp')  },
];
function Genericos({ navigation }) {
  const { qtds, add, remove } = useProdutos(GENERICOS);
  const { medicamentosLiberados, recarregar } = useReceitasAprovadas();
  const temBloqueados   = GENERICOS.some(p => REQUER_RECEITA.has(p.nome));

  return (
    <TelaBase titulo="💊 Genéricos" navigation={navigation}>
      {temBloqueados && (
        <BannerReceita
          status={
            medicamentosLiberados.length > 0
            ? 'aprovado'
            : null
            }
          onEnviar={() => navigation.navigate('EnviarReceita')}
          onAtualizar={recarregar}
        />
      )}
      {GENERICOS.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)}
          receitaAprovada={medicamentosLiberados.includes(p.nome)}
        />
      ))}
    </TelaBase>
  );
}

// ─── ANTI_HIPERTENSIVOS ──────────────────────────────────────────────────────
export const ANTI_HIPERTENSIVOS = [
  { nome: 'Losartana',         preco: 'R$ 2,99',  img: require('./Medicamentos/Anti_Hipertensivos/Losartana.webp')         },
  { nome: 'Enalapril',         preco: 'R$ 29,79', img: require('./Medicamentos/Anti_Hipertensivos/Enalapril.png')          },
  { nome: 'Captopril',         preco: 'R$ 22,50', img: require('./Medicamentos/Anti_Hipertensivos/Captopril.webp')         },
  { nome: 'Anlodipino',        preco: 'R$ 18,99', img: require('./Medicamentos/Anti_Hipertensivos/Anlodipino.webp')        },
  { nome: 'Atenolol',          preco: 'R$ 91,90', img: require('./Medicamentos/Anti_Hipertensivos/Atenolol.webp')          },
  { nome: 'Propranolol',       preco: 'R$ 22,00', img: require('./Medicamentos/Anti_Hipertensivos/Propranolol.webp')       },
  { nome: 'Hidroclorotiazida', preco: 'R$ 23,84', img: require('./Medicamentos/Anti_Hipertensivos/Hidroclorotiazida.webp') },
  { nome: 'Valsartana',        preco: 'R$ 29,99', img: require('./Medicamentos/Anti_Hipertensivos/Valsartana.webp')        },
];
function Anti_Hipertensivos({ navigation }) {
  const { qtds, add, remove } = useProdutos(ANTI_HIPERTENSIVOS);
  const { medicamentosLiberados, recarregar } = useReceitasAprovadas();

  return (
    <TelaBase titulo="❤️ Anti-Hipertensivos" navigation={navigation}>
      <BannerReceita
        status={medicamentosLiberados.length > 0
        ? 'aprovado'
        : null
        }
        onEnviar={() => navigation.navigate('EnviarReceita')}
        onAtualizar={recarregar}
      />
      {ANTI_HIPERTENSIVOS.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)}
          receitaAprovada={medicamentosLiberados.includes(p.nome)}
        />
      ))}
    </TelaBase>
  );
}

// ─── ANTIDIABETICOS ──────────────────────────────────────────────────────────
export const ANTIDIABETICOS = [
  { nome: 'Metformina',    preco: 'R$ 30,50',  img: require('./Medicamentos/Antidiabeticos/Metformina.webp')    },
  { nome: 'Glibenclamida', preco: 'R$ 9,84',   img: require('./Medicamentos/Antidiabeticos/Glibenclamida.webp') },
  { nome: 'Gliclazida',    preco: 'R$ 28,89',  img: require('./Medicamentos/Antidiabeticos/Glibenclamida.webp') },
  { nome: 'Insulina NPH',  preco: 'R$ 70,49',  img: require('./Medicamentos/Antidiabeticos/nph.png')            },
  { nome: 'Insulina Regular', preco: 'R$ 57,41', img: require('./Medicamentos/Antidiabeticos/Regular.webp')    },
  { nome: 'Pioglitazona',  preco: 'R$ 63,90',  img: require('./Medicamentos/Antidiabeticos/Pioglitazona.webp')  },
  { nome: 'Sitagliptina',  preco: 'R$ 139,99', img: require('./Medicamentos/Antidiabeticos/Sitagliptina.webp')  },
  { nome: 'Dapagliflozina',preco: 'R$ 63,90',  img: require('./Medicamentos/Antidiabeticos/Dapagliflozina.webp')},
];
function Antidiabeticos({ navigation }) {
  const { qtds, add, remove } = useProdutos(ANTIDIABETICOS);
  const { medicamentosLiberados, recarregar } = useReceitasAprovadas();

  return (
    <TelaBase titulo="🍫❌ Antidiabéticos" navigation={navigation}>
      <BannerReceita
        status={medicamentosLiberados.length > 0
        ? 'aprovado'
        : null
        }
        onEnviar={() => navigation.navigate('EnviarReceita')}
        onAtualizar={recarregar}
      />
      {ANTIDIABETICOS.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)}
          receitaAprovada={medicamentosLiberados.includes(p.nome)}
        />
      ))}
    </TelaBase>
  );
}

// ─── ANTI_CONCEPCIONAIS ──────────────────────────────────────────────────────
export const ANTI_CONCEPCIONAIS = [
  { nome: 'Selene',   preco: 'R$ 23,13',  img: require('./Medicamentos/Anti_Concepcionais/Selene.webp')   },
  { nome: 'Yasmin',   preco: 'R$ 122,02', img: require('./Medicamentos/Anti_Concepcionais/Yasmin.webp')   },
  { nome: 'Diane 35', preco: 'R$ 46,32',  img: require('./Medicamentos/Anti_Concepcionais/Diane_35.webp') },
  { nome: 'Microvlar',preco: 'R$ 8,99',   img: require('./Medicamentos/Anti_Concepcionais/Microvlar.webp')},
  { nome: 'Cerazette',preco: 'R$ 50,15',  img: require('./Medicamentos/Anti_Concepcionais/Cerazette.webp')},
  { nome: 'Qlaira',   preco: 'R$ 71,18',  img: require('./Medicamentos/Anti_Concepcionais/Qlaira.webp')   },
  { nome: 'Elani',    preco: 'R$ 57,90',  img: require('./Medicamentos/Anti_Concepcionais/Elani.webp')    },
  { nome: 'Level',    preco: 'R$ 81,70',  img: require('./Medicamentos/Anti_Concepcionais/Level.png')     },
];
function Anti_Concepcionais({ navigation }) {
  const { qtds, add, remove } = useProdutos(ANTI_CONCEPCIONAIS);
  const { medicamentosLiberados, recarregar } = useReceitasAprovadas();


  return (
    <TelaBase titulo="🌸 Anti-Concepcionais" navigation={navigation}>
      <BannerReceita
        status={medicamentosLiberados.length > 0
        ? 'aprovado'
        : null
          }
        onEnviar={() => navigation.navigate('EnviarReceita')}
        onAtualizar={recarregar}
      />
      {ANTI_CONCEPCIONAIS.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)}
          receitaAprovada={medicamentosLiberados.includes(p.nome)}
        />
      ))}
    </TelaBase>
  );
}

// ─── ANALGESICOS ─────────────────────────────────────────────────────────────
export const ANALGESICOS = [
  { nome: 'Dipirona',    preco: 'R$ 9,90',  img: require('./Medicamentos/Analgesicos/Dipirona.webp')    },
  { nome: 'Paracetamol', preco: 'R$ 9,99',  img: require('./Medicamentos/Analgesicos/Paracetamol.webp') },
  { nome: 'Tramadol',    preco: 'R$ 13,99', img: require('./Medicamentos/Analgesicos/tramadol.webp')    },
  { nome: 'Codeína',     preco: 'R$ 36,44', img: require('./Medicamentos/Analgesicos/codeina.webp')     },
  { nome: 'Dorflex',     preco: 'R$ 19,09', img: require('./Medicamentos/Analgesicos/Dorflex.webp')     },
  { nome: 'Torsilax',    preco: 'R$ 15,99', img: require('./Medicamentos/Analgesicos/Torsilax.png')     },
  { nome: 'Neosaldina',  preco: 'R$ 28,79', img: require('./Medicamentos/Analgesicos/Neosaldina.webp')  },
  { nome: 'Lisador',     preco: 'R$ 66,67', img: require('./Medicamentos/Analgesicos/Lisador.webp')     },
];
function Analgesicos({ navigation }) {
  const { qtds, add, remove } = useProdutos(ANALGESICOS);
  const { medicamentosLiberados, recarregar } = useReceitasAprovadas();
  
  const temBloqueados   = ANALGESICOS.some(p => REQUER_RECEITA.has(p.nome));

  return (
    <TelaBase titulo="🤕 Analgésicos" navigation={navigation}>
      {temBloqueados && (
        <BannerReceita
          status={
            medicamentosLiberados.length > 0
            ? 'aprovado'
            : null
            }
          onEnviar={() => navigation.navigate('EnviarReceita')}
          onAtualizar={recarregar}
        />
      )}
      {ANALGESICOS.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)}
          receitaAprovada={medicamentosLiberados.includes(p.nome)}
        />
      ))}
    </TelaBase>
  );
}

// ─── ENXAGUANTE BUCAL (sem receita) ──────────────────────────────────────────
export const ENXAGUANTE_BUCAL = [
  { nome: 'Listerine Cool Mint',  preco: 'R$ 24,39', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Listerine_Cool_Mint.webp')  },
  { nome: 'Colgate Plax Fresh',   preco: 'R$ 19,99', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Colgate_Plax_Fresh.webp')   },
  { nome: 'Oral-B Complete',      preco: 'R$ 16,90', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Oral_B_Complete.webp')      },
  { nome: 'CloseUp Fresh',        preco: 'R$ 8,45',  img: require('./Higiene_Pessoal/Enxaguante_Bucal/CloseUp_Fresh.webp')        },
  { nome: 'Scope Fresh Mint',     preco: 'R$ 51,73', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Scope_Fresh_Mint.webp')     },
  { nome: 'Cepacol Ice',          preco: 'R$ 8,13',  img: require('./Higiene_Pessoal/Enxaguante_Bucal/Cepacol_Ice.webp')          },
  { nome: 'Periogard Clean',      preco: 'R$ 25,70', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Periogard_Clean.webp')      },
  { nome: 'Colgate Total Fresh',  preco: 'R$ 13,49', img: require('./Higiene_Pessoal/Enxaguante_Bucal/Colgate_Total_Fresh.webp')  },
];
function Enxaguante_Bucal({ navigation }) {
  const { qtds, add, remove } = useProdutos(ENXAGUANTE_BUCAL);
  return (
    <TelaBase titulo="🦷 Enxaguante Bucal" navigation={navigation}>
      {ENXAGUANTE_BUCAL.map((p, i) => (
        <CardProduto key={i} imagem={p.img} nome={p.nome} preco={p.preco}
          quantidade={qtds[p.nome]} onAdd={() => add(p.nome)} onRemove={() => remove(p.nome)}
          receitaAprovada={true} // enxaguante não precisa de receita
        />
      ))}
    </TelaBase>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: TEMA.primario,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 52,
    paddingBottom: 14, paddingHorizontal: 16,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  headerBotao: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerIcone:  { fontSize: 20, color: '#FFF', fontWeight: 'bold' },
  headerTitulo: { fontSize: 18, color: '#FFF', fontWeight: '700', flex: 1, textAlign: 'center' },

  scrollConteudo: { padding: 16, paddingBottom: 32 },

  // Banner de receita
  banner: {
    borderRadius: 14, padding: 14, marginBottom: 16,
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1.5,
  },
  bannerIcone:  { fontSize: 26, marginRight: 10, marginTop: 2 },
  bannerTitulo: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  bannerDesc:   { fontSize: 12, color: TEMA.textoSecundario, lineHeight: 17, marginBottom: 10 },
  bannerBotoes: { flexDirection: 'row', gap: 8 },
  bannerBotao:  { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  bannerBotaoTexto: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // Cards
  card: {
    backgroundColor: TEMA.card, borderRadius: 16,
    padding: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4,
    borderWidth: 1, borderColor: TEMA.separador,
  },
  cardBloqueado: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CFD8DC',
    opacity: 0.85,
  },
  cardImagem:  { width: 72, height: 72, borderRadius: 10, marginRight: 14 },
  cardNome:    { fontSize: 14, fontWeight: '600', color: TEMA.texto, marginBottom: 4 },
  cardPreco:   { fontSize: 16, fontWeight: '800', color: TEMA.preco, marginBottom: 10 },
  cardBotoes:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnAdicionar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: TEMA.btnAdicionar, alignItems: 'center', justifyContent: 'center',
  },
  btnRemover: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: TEMA.btnRemover, alignItems: 'center', justifyContent: 'center',
  },
  btnTexto: { color: '#FFF', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  cardQtd:  { fontSize: 17, fontWeight: '700', color: TEMA.texto, minWidth: 26, textAlign: 'center' },

  receitaTag: {
    backgroundColor: '#ECEFF1',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  receitaTagTexto: { fontSize: 11, color: TEMA.bloqueado, fontWeight: '600' },

  // Tela principal
  bannerPrincipal: {
    backgroundColor: TEMA.primario, borderRadius: 16, padding: 24,
    marginBottom: 20, alignItems: 'center',
  },
  bannerPrincipalTitulo: { fontSize: 24, color: '#FFF', fontWeight: '800', marginBottom: 6 },
  bannerPrincipalSub:    { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  secaoTitulo: { fontSize: 16, fontWeight: '700', color: TEMA.texto, marginBottom: 12, marginLeft: 2 },
  grade:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  categoriaCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    backgroundColor: TEMA.card, borderRadius: 14,
    padding: 16, alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
    borderWidth: 1, borderColor: TEMA.separador,
  },
  categoriaIcone: { fontSize: 28, marginBottom: 6 },
  categoriaTexto: { fontSize: 11, color: TEMA.texto, fontWeight: '600', textAlign: 'center' },

  // Drawer
  drawerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  drawerPanel: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: DRAWER_WIDTH,
    backgroundColor: TEMA.card, elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 12,
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
  drawerFechar: { padding: 20, borderTopWidth: 1, borderTopColor: TEMA.separador, alignItems: 'center' },
  drawerFecharTexto: { fontSize: 15, color: TEMA.textoSecundario, fontWeight: '600' },
});

export default MedicamentosNavigator;
