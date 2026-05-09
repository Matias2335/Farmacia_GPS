import React, { useState, useRef } from 'react';
import {
  TextInput, Text, View, TouchableOpacity,
  ImageBackground, FlatList, ScrollView, Image,
  Vibration, Animated, StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import estilos from './components/estilo';
import HigienesNavigator from './components/Higiene_1';
import CabelosNavigator from './components/Cabelos';
import MedicamentosNavigator from './components/Medicamentos';
import MamaeNavigator from './components/Mamae_Bebe'
import Farmaceutico from './components/farmaceutico';
import Perfil from './Perfil/Perfil';
import AppHeader from './components/AppHeader';
import { TODOS_PRODUTOS, useReceitasAprovadas, isBloqueado } from './Busca/produto';



// FIREBASE
import { supabase } from './Config/supabase';


// ─── TEMA ─────────────────────────────────────────────────────────────────────
const TEMA = {
  primario: '#00BFA5',
  secundario: '#0097A7',
  fundo: '#F0FAFA',
  card: '#FFFFFF',
  texto: '#1A2B2B',
  textoSecundario: '#546E6E',
  preco: '#00897B',
  btnAdicionar: '#00BFA5',
  btnRemover: '#EF5350',
  separador: '#E0F2F1',
  amarelo: '#FFFF00',
  vermelho: '#E53935',
  azulClaro: '#38B6FF',
};

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.72;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── CATEGORIAS DO APP ────────────────────────────────────────────────────────
export const CATEGORIAS_APP = [
  { nome: 'Medicamentos', icone: '💊', tela: 'Medicamentos' },
  { nome: 'Higiene', icone: '🧴', tela: 'Higienes' },
  { nome: 'Cabelos', icone: '💇', tela: 'Cabelos' },
  { nome: 'Mamãe Bebes', icone: '👱‍♀️', tela: 'Mamae' },
  
];

// ─── ASYNCSTORAGE SOMENTE PARA CARRINHO ──────────────────────────────────────
const CARRINHO_PREFIX = 'carrinho__';

export class SalvarItens extends React.Component {
  async salvar(pedido, quantidade) {
    try {
      if (quantidade <= 0) {
        await AsyncStorage.removeItem(CARRINHO_PREFIX + pedido);
      } else {
        const valor = JSON.stringify({ pedido, quantidade });
        await AsyncStorage.setItem(CARRINHO_PREFIX + pedido, valor);
      }
    } catch (erro) {
      console.log('Erro ao salvar no carrinho:', erro);
    }
  }
}

export class RemoverItens extends React.Component {
  async remover(chave) {
    try {
      await AsyncStorage.removeItem(CARRINHO_PREFIX + chave);
    } catch (erro) {
      console.log('Erro ao remover do carrinho:', erro);
    }
  }
}

export class ListarItens extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pedidos: [] };
  }

  async componentDidMount() {
    await this.carregarCarrinho();
  }

  async carregarCarrinho() {
    try {
      const todasChaves = await AsyncStorage.getAllKeys();
      const chavesCarrinho = todasChaves.filter(k => k.startsWith(CARRINHO_PREFIX));

      if (chavesCarrinho.length === 0) {
        this.setState({ pedidos: [] });
        return;
      }

      const pares = await AsyncStorage.multiGet(chavesCarrinho);
      const itens = pares
        .map(([, valor]) => {
          try {
            return JSON.parse(valor);
          } catch {
            return null;
          }
        })
        .filter(item => item && item.quantidade > 0);

      this.setState({ pedidos: itens });
    } catch (erro) {
      console.log('Erro ao carregar carrinho:', erro);
    }
  }

  render() {
    return (
      <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
        <View style={estilos.container}>
          {this.state.pedidos.length > 0 ? (
            <FlatList
              data={this.state.pedidos}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <View style={estilos.pedidoContainer}>
                  <Text style={estilos.textoPedido}>Pedido: {item.pedido}</Text>
                  <Text style={estilos.textoQuantidade}>Quantidade: {item.quantidade}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={{ color: TEMA.texto, fontSize: 16 }}>Carrinho vazio</Text>
          )}
        </View>
      </ImageBackground>
    );
  }
}

// ─── DRAWER ───────────────────────────────────────────────────────────────────
export function DrawerMenu({ visible, onClose, onNavigate, categorias }) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted && !visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[estilos.drawerOverlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[estilos.drawerPanel, { transform: [{ translateX }] }]}>
        <View style={estilos.drawerHeader}>
          <Text style={estilos.drawerHeaderTitulo}>🏥 FarmaApp</Text>
          <Text style={estilos.drawerHeaderSub}>Escolha uma categoria</Text>
        </View>

        <ScrollView style={estilos.drawerLista}>
          {categorias.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={estilos.drawerItem}
              onPress={() => {
                onClose();
                setTimeout(() => onNavigate(cat.tela), 250);
              }}
              activeOpacity={0.7}
            >
              <Text style={estilos.drawerItemIcone}>{cat.icone}</Text>
              <Text style={estilos.drawerItemTexto}>{cat.nome}</Text>
              <Text style={estilos.drawerItemSeta}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={estilos.drawerFechar} onPress={onClose}>
          <Text style={estilos.drawerFecharTexto}>✕ Fechar menu</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── CARD PRODUTO ─────────────────────────────────────────────────────────────
export function CardProduto({ imagem, nome, preco, quantidade, onAdd, onRemove, receitaAprovada }) {
  const bloqueado = isBloqueado(nome, receitaAprovada ? [nome] : []);

  return (
    <View style={[estilos.card, bloqueado && { opacity: 0.6, backgroundColor: '#f0f0f0' }]}>
      {imagem && <Image source={imagem} style={estilos.cardImagem} resizeMode="contain" />}
      <View style={{ flex: 1 }}>
        <Text style={estilos.cardNome}>{nome}</Text>
        <Text style={estilos.cardPreco}>{preco}</Text>
        {bloqueado ? (
          <View style={{ marginTop: 6, backgroundColor: '#FFF3CD', borderRadius: 8, padding: 6 }}>
            <Text style={{ fontSize: 11, color: '#856404', fontWeight: '600' }}>
              🔒 Requer receita médica
            </Text>
          </View>
        ) : (
          <View style={estilos.cardBotoes}>
            <TouchableOpacity style={estilos.btnRemover} onPress={onRemove} activeOpacity={0.8}>
              <Text style={estilos.btnTexto}>−</Text>
            </TouchableOpacity>
            <Text style={estilos.cardQtd}>{quantidade}</Text>
            <TouchableOpacity style={estilos.btnAdicionar} onPress={onAdd} activeOpacity={0.8}>
              <Text style={estilos.btnTexto}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── HOOK PRODUTOS ────────────────────────────────────────────────────────────
export function useProdutos(lista) {
  const [qtds, setQtds] = useState(
    Object.fromEntries(lista.map(p => [p.nome, 0]))
  );
  const salvarItens = new SalvarItens();

  function add(nome) {
    Vibration.vibrate(30);
    setQtds(prev => {
      const nova = prev[nome] + 1;
      salvarItens.salvar(nome, nova);
      return { ...prev, [nome]: nova };
    });
  }

  function remove(nome) {
    setQtds(prev => {
      if (prev[nome] <= 0) return prev;
      const nova = prev[nome] - 1;
      salvarItens.salvar(nome, nova);
      return { ...prev, [nome]: nova };
    });
  }

  return { qtds, add, remove };
}

// ─── TELA BASE ────────────────────────────────────────────────────────────────
export function TelaBase({ titulo, navigation, children }) {
  const [drawerVisivel, setDrawerVisivel] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: TEMA.fundo }}>
      <AppHeader
        titulo={titulo}
        onBack={() => navigation.goBack()}
        onMenu={() => setDrawerVisivel(true)}
      />
      <ScrollView contentContainerStyle={estilos.scrollConteudo}>
        {children}
      </ScrollView>
      <DrawerMenu
        visible={drawerVisivel}
        onClose={() => setDrawerVisivel(false)}
        onNavigate={tela => navigation.navigate(tela)}
        categorias={CATEGORIAS_APP}
      />
    </View>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
class Principal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { usuario: '', senha: '' };
  }

  async componentDidMount() {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    this.props.navigation.reset({
      index: 0,
      routes: [{ name: 'Pedidos' }],
    });
  }
}

componentWillUnmount() {
  if (this.listener?.data?.subscription) {
    this.listener.data.subscription.unsubscribe();
  }
}

  // 🔥 LOGIN
  async ler() {
  try {
    let email = this.state.usuario.trim();
    let senhaInput = this.state.senha.trim();

    if (!email || !senhaInput) {
      alert('Preencha email e senha.');
      return;
    }

    // ADMIN
    if (email === 'admin' && senhaInput === '@2335') {
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'Farmaceutico' }],
      });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senhaInput,
    });

    if (error) throw error;

    this.props.navigation.reset({
      index: 0,
      routes: [{ name: 'Pedidos' }],
    });

  } catch (erro) {
    console.log(erro);

    if (erro.message.includes('Invalid login credentials')) {
      alert('Email ou senha incorretos.');
    } else {
      alert('Erro ao fazer login.');
    }
  }
}

  // 🔥 RECUPERAR SENHA (EMAIL)
  async recuperarSenha() {
  const email = this.state.usuario.trim();

  if (!email) {
    alert('Digite seu email.');
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://farmacia.tccburnout.tech'
  });

  if (error) {
    alert('Erro ao enviar email.');
  } else {
    alert('Email de recuperação enviado!');
  }
}
  
  render() {
    return (
      <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
        <View style={estilos.container}>

          <Text style={estilos.texto}>Email:</Text>
          <TextInput
            style={estilos.caixa}
            value={this.state.usuario}
            onChangeText={texto => this.setState({ usuario: texto })}
            placeholder="Seu email"
            placeholderTextColor={TEMA.azulClaro}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={estilos.texto}>Senha:</Text>
          <TextInput
            style={estilos.caixa}
            value={this.state.senha}
            onChangeText={texto => this.setState({ senha: texto })}
            secureTextEntry
            placeholder="Sua senha"
            placeholderTextColor={TEMA.azulClaro}
          />

          {/* LOGIN */}
          <TouchableOpacity style={estilos.botao} onPress={() => this.ler()}>
            <Text style={estilos.textoBotao}>LOGIN</Text>
          </TouchableOpacity>

          {/* RECUPERAR SENHA */}
          <TouchableOpacity onPress={() => this.recuperarSenha()}>
            <Text style={{ color: TEMA.azulClaro, marginTop: 12 }}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>

        </View>
      </ImageBackground>
    );
  }
}
// ─── CADASTRO ─────────────────────────────────────────────────────────────────
class Cadastro extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: '', password: '' };
  }

  async gravar() {
  try {
    const email = this.state.user.trim();
    const password = this.state.password;

    if (!email || !password) {
      alert('Preencha email e senha.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // pegar usuário
    const user = data.user;

    // salvar no banco
    await supabase.from('usuarios').insert([
      {
        id: user.id,
        email: email,
        tipo: 'cliente',
      }
    ]);

    alert('Usuário cadastrado!');

    await supabase.auth.signOut();

    this.props.navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });

  } catch (erro) {
    console.log(erro);

    if (erro.message.includes('already registered')) {
      alert('Email já cadastrado.');
    } else {
      alert('Erro no cadastro.');
    }
  }
}
  render() {
    return (
      <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
        <View style={estilos.container}>
          <Text style={estilos.texto}>Cadastrar email:</Text>
          <TextInput
            style={estilos.caixa}
            value={this.state.user}
            onChangeText={texto => this.setState({ user: texto })}
            placeholder="Novo email"
            placeholderTextColor={TEMA.azulClaro}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={estilos.texto}>Cadastrar senha:</Text>
          <TextInput
            style={estilos.caixa}
            value={this.state.password}
            onChangeText={texto => this.setState({ password: texto })}
            secureTextEntry
            placeholder="Nova senha"
            placeholderTextColor={TEMA.azulClaro}
          />

          <TouchableOpacity style={estilos.botao} onPress={() => this.gravar()}>
            <Text style={estilos.textoBotao}>CADASTRO</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
}

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────
export function Pedidos({ navigation }) {
  const [drawerVisivel, setDrawerVisivel] = useState(false);

  const [busca, setBusca] = useState('');
  const [resultado, setResultado] = useState([]);

  // 🔥 CONTROLE DE QUANTIDADE (igual catálogo)
  const { qtds, add, remove } = useProdutos(TODOS_PRODUTOS);

  // 🔒 PROTEÇÃO LOGIN
 React.useEffect(() => {
  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  checkUser();
}, []);


  // 🔒 RECEITAS APROVADAS — bloqueia controlados sem receita
  const { medicamentosLiberados, recarregar } = useReceitasAprovadas();

  // 🔍 BUSCA
  function buscarProduto(texto) {
    setBusca(texto);

    if (!texto) {
      setResultado([]);
      return;
    }

    const filtrados = TODOS_PRODUTOS.filter(p =>
      p.nome.toLowerCase().includes(texto.toLowerCase())
    );

    setResultado(filtrados);
  }

  // 🚪 LOGOUT
  async function logout() {
  await supabase.auth.signOut();

  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
}

  return (
    <View style={{ flex: 1, backgroundColor: TEMA.fundo }}>

      {/* HEADER */}
      <AppHeader
        titulo="Pedidos"
        onBack={null}
        onMenu={() => setDrawerVisivel(true)}
        onRightPress={logout}
        rightLabel="Sair"
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* BANNER */}
        <View style={{
          backgroundColor: '#00BFA5',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20
        }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
            🏥 Farmácia Cuida+
          </Text>

          <Text style={{ color: '#fff', marginTop: 5 }}>
            Toque em ☰ ou busque o produto 🔍
          </Text>
        </View>

        {/* 🔍 BUSCA */}
        <TextInput
          placeholder="🔍 Buscar produto (ex: Dorflex)"
          value={busca}
          onChangeText={buscarProduto}
          style={{
            backgroundColor: '#fff',
            padding: 12,
            borderRadius: 10,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: '#ddd'
          }}
        />

        {/* 🔥 RESULTADO COM CARD BONITO */}
        {resultado.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
              Resultados:
            </Text>

            {resultado.map((item, i) => (
              <CardProduto
                key={i}
                imagem={item.imagem}
                nome={item.nome}
                preco={item.preco}
                quantidade={qtds[item.nome] || 0}
                onAdd={() => add(item.nome)}
                onRemove={() => remove(item.nome)}
                receitaAprovada={medicamentosLiberados.includes(item.nome)}
              />
            ))}
          </View>
        )}

        {/* 🔥 CATEGORIAS */}
        {busca === '' && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
              Categorias
            </Text>

            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10
            }}>
              {[
                { nome: 'Medicamentos', tela: 'Medicamentos', icone: '💊' },
                { nome: 'Higiene', tela: 'Higienes', icone: '🧴' },
                { nome: 'Cabelos', tela: 'Cabelos', icone: '💇' },
                { nome: 'Mamãe Bebes', tela: 'Mamae', icone: '👱‍♀️' }
                
              ].map((cat, i) => (
                <View
                  key={i}
                  style={{
                    width: '30%',
                    backgroundColor: '#fff',
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center'
                  }}
                  onTouchEnd={() => navigation.navigate(cat.tela)}
                >
                  <Text style={{ fontSize: 22 }}>{cat.icone}</Text>
                  <Text>{cat.nome}</Text>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>

      {/* MENU */}
      <DrawerMenu
        visible={drawerVisivel}
        onClose={() => setDrawerVisivel(false)}
        onNavigate={tela => navigation.navigate(tela)}
        categorias={[
          { nome: 'Medicamentos', icone: '💊', tela: 'Medicamentos' },
          { nome: 'Higiene', icone: '🧴', tela: 'Higienes' },
          { nome: 'Cabelos', icone: '💇', tela: 'Cabelos' },
          { nome: 'Mamãe Bebes', icone: '👱‍♀️', tela: 'Mamae' },
          { nome: 'Perfil', icone: '👤', tela: 'Perfil' },
        ]}
      />
    </View>
  );
}
// ─── STACK NAVIGATOR ──────────────────────────────────────────────────────────
function Nav2() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Principal} />
      <Stack.Screen name="Pedidos" component={Pedidos} />
      <Stack.Screen name="Medicamentos" component={MedicamentosNavigator} />
      <Stack.Screen name="Higienes" component={HigienesNavigator} />
      <Stack.Screen name="Cabelos" component={CabelosNavigator} />
      <Stack.Screen name="Farmaceutico" component={Farmaceutico} />
      <Stack.Screen name="Mamae" component={MamaeNavigator} />
      <Stack.Screen name="Perfil" component={Perfil} />
      
      
    </Stack.Navigator>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: TEMA.primario,
            tabBarInactiveTintColor: '#888',
            tabBarStyle: { elevation: 8 },
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Login"
            component={Nav2}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home-account" color={color} size={size} />
              ),
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Criar Usuário"
            component={Cadastro}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="account-details" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Carrinho"
            component={ListarItens}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cart" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;