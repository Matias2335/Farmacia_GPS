  import * as React from 'react';
  import { TextInput, Text, View, Button, StyleSheet, TouchableOpacity, ImageBackground,FlatList,ScrollView,Image } from 'react-native';
  import { NavigationContainer } from '@react-navigation/native';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  import { MaterialCommunityIcons } from '@expo/vector-icons';
  import { createStackNavigator } from '@react-navigation/stack';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import estilos from './components/estilo'
  import HigienesNavigator from './components/Higiene';

  import { Vibration } from 'react-native';

  const Tab = createBottomTabNavigator();
  const Stack = createStackNavigator();

  class Principal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        usuario: '',
        senha: ''
      };
    }

 render() {
      return (
        <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
          <View style={estilos.container}>
            <Text style={estilos.texto}>Login:</Text>
            <TextInput
              style={estilos.caixa}
              onChangeText={(texto) => this.setState({ usuario: texto })}
              placeholder="            Usuário             " 
              placeholderTextColor="#38B6FF"
            />
            <Text style={estilos.texto}>Senha:</Text>
            <TextInput
              style={estilos.caixa}
              onChangeText={(texto) => this.setState({ senha: texto })}
              secureTextEntry={true}
              placeholder="            Senha                "
              placeholderTextColor="#38B6FF"
            />
            <Button title=" Login " onPress={() => this.ler()} color="red" />
          </View>
        </ImageBackground>
      );
    }

    async ler() {
      try {
        const senha = await AsyncStorage.getItem(this.state.usuario);
        if (senha !== null) {
          if (senha === this.state.senha) {
            this.props.navigation.navigate('Pedidos');
          } else {
            alert('Senha Incorreta!');
          }
        } else {
          alert('Usuário não encontrado!');
        }
      } catch (erro) {
        console.log(erro);
      }
    }
  }

export class SalvarItens extends React.Component {
  salvar(pedido, quantidade) {
    firebase.database().ref('/pedidos').push({
      pedidos: pedido,
      quantidade: quantidade,
    }).then(() => {
      Alert.alert("Salvo com sucesso");
      
    }).catch((error) => {
      Alert.alert("Erro ao salvar: " + error.message);
    });
  }
}
export class RemoverItens extends React.Component {
  remover(chaveDoPedido) {
    firebase.database().ref(`/pedidos/${chaveDoPedido}`).remove()
      .then(() => {
        Alert.alert("Removido com sucesso");
      })
      .catch((error) => {
        Alert.alert("Erro ao remover: " + error.message);
      });
  }
}

export class ListarItens extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pedidos: []
    };
  }

  componentDidMount() {
    firebase.database().ref("pedidos").on('value', snapshot => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        let pedidos = Object.values(data);
        console.log("Dados recuperados:", pedidos); 
        this.setState({ pedidos });
      } else {
        console.log("Nenhum dado encontrado"); 
      }
    }, error => {
      console.error("Erro ao buscar os dados:", error); 
    });
  }

  clique(){
    db.ref('/pedidos').orderByChild("marca").equalTo(this.state.buscar).on('val'.once('value',snapshot =>{
      snapshot.forEach((child) =>{
        console.log(child.key)
        db.ref('/pedidos').child(child.key)
        console.log("removido");
      })
    }))
  }

  
  render() {
    return (
      <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
        <View style={estilos.container}>
          {this.state.pedidos.length > 0 ? 
            <FlatList
              data={this.state.pedidos}
              renderItem={({ item }) => (
                <View style={estilos.pedidoContainer}>
                  <Text style={estilos.textoPedido}>Pedido: {item.pedidos}</Text>
                  <Text style={estilos.textoQuantidade}>Quantidade: {item.quantidade}</Text>
                </View>
              )}
            /> 
            : 
            null 
          }
        </View>
      </ImageBackground>
    );
  }
}

  class Cadastro extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        user: '',
        password: ''
      };
    }

    async gravar() {
      try {
        await AsyncStorage.setItem(this.state.user, this.state.password);
        alert('Salvo com sucesso!!!');
      } catch (erro) {
        alert('Erro!');
      }
    }

    render() {
      return (
        <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
          <View style={estilos.container}>
            <Text style={estilos.texto}>Cadastrar usuário:</Text>
            <TextInput
              style={estilos.caixa}
              onChangeText={(texto) => this.setState({ user: texto })}
              placeholder="          Novo usuário          "
              placeholderTextColor="#38B6FF"
            />
            <Text style={estilos.texto}>Cadastrar senha:</Text>
            <TextInput
              style={estilos.caixa}
              onChangeText={(texto) => this.setState({ password: texto })}
              secureTextEntry={true}
              placeholder="         Nova senha             "
              placeholderTextColor="#38B6FF"
            />
            <Button title="   Cadastrar   " onPress={() => this.gravar()} color="red" />
          </View>
        </ImageBackground>
      );
    }
  }

  class Nav2 extends React.Component {   
    render() {
      return (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Principal} />
          <Stack.Screen name="Pedidos" component={Pedidos} />
          <Stack.Screen name="Remedios" component={Remedios} />
          <Stack.Screen name="Higienes" component={HigienesNavigator} />
          <Stack.Screen name="Pasteis" component={Pasteis} />
          <Stack.Screen name="Bebidas" component={Bebidas} />
          <Stack.Screen name="Salgados" component={Salgados} />
          <Stack.Screen name="SalvarItens" component ={SalvarItens}/>
          <Stack.Screen name="RemoverItens" component ={RemoverItens}/>
        </Stack.Navigator>
      );
    }
  }

  class Salgados extends React.Component {
    constructor(props) {
    super(props);
    this.state = {
      pedidos: {
        'Hamburgão': 0,
        'Neosaldina': 0,
        'Esfiha': 0,
        'Empadinha': 0,
        'Pão de Queijo': 0,
        'Coxinha': 0,
        'Kibe': 0,
        'Bolinho Japonês': 0,
        'Bolinho de Carne': 0,
      }
    };
    this.salvarItens = new SalvarItens();
  }
  handlePress(pedido) {
    Vibration.vibrate();
    this.setState(prevState => {
      const quantidade = prevState.pedidos[pedido] + 1;
      return {
        pedidos: {
          ...prevState.pedidos,
          [pedido]: quantidade
        }
      };
    }, () => {
      this.salvarItens.salvar(pedido, this.state.pedidos[pedido]);
    });
  }
  handleRemove(pedido) {
    if (this.state.pedidos[pedido] > 0) {
      this.setState(prevState => {
        const quantidade = prevState.pedidos[pedido] - 1;
        return {
          pedidos: {
            ...prevState.pedidos,
            [pedido]: quantidade
          }
        };
      }, () => {
        this.salvarItens.salvar(pedido, this.state.pedidos[pedido]);
      });
    }
  }
  render(){
    const { pedidos } = this.state;
    return (
      <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
      <View style={estilos.container}>
        <Text style={estilos.texto_pedidos}>
          {"\n"}
          {"\n"}
          {"\n"}
          Menu Salgados:
          {"\n"}1- Hamburgão <Button title={`+ (${pedidos['Hamburgão']})`} onPress={() => this.handlePress('Hamburgão')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Hamburgão')} color="red" />
          {"\n"}2- Neosaldina <Button title={`+ (${pedidos['Neosaldina']})`} onPress={() => this.handlePress('Neosaldina')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Neosaldina')} color="red" />
          {"\n"}3- Esfiha <Button title={`+ (${pedidos['Esfiha']})`} onPress={() => this.handlePress('Esfiha')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Esfiha')} color="red" />
          {"\n"}4- Empadinha <Button title={`+ (${pedidos['Empadinha']})`} onPress={() => this.handlePress('Empadinha')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Empadinha')} color="red" />
          {"\n"}5- Pão de Queijo <Button title={`+ (${pedidos['Pão de Queijo']})`} onPress={() => this.handlePress('Pão de Queijo')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Pão de Queijo')} color="red" />
          {"\n"}6- Coxinha <Button title={`+ (${pedidos['Coxinha']})`} onPress={() => this.handlePress('Coxinha')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Coxinha')} color="red" />
          {"\n"}7- Kibe <Button title={`+ (${pedidos['Kibe']})`} onPress={() => this.handlePress('Kibe')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Kibe')} color="red" />
          {"\n"}8- Bolinho Japonês <Button title={`+ (${pedidos['Bolinho Japonês']})`} onPress={() => this.handlePress('Bolinho Japonês')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Bolinho Japonês')} color="red" />
          {"\n"}9- Bolinho de Carne <Button title={`+ (${pedidos['Bolinho de Carne']})`} onPress={() => this.handlePress('Bolinho de Carne')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Bolinho de Carne')} color="red" />
        </Text>
      </View>
      </ImageBackground>
    );
  }
}


  class Bebidas extends React.Component {
    constructor(props) {
    super(props);
    this.state = {
      pedidos: {
        'Refrigerante': 0,
        'Suco': 0,
        'Água Mineral': 0,
        'Café': 0,
        'Energetico': 0,
        'Cerveja': 0,
      }
    };
    this.salvarItens = new SalvarItens();
  }
  handlePress(pedido) {
    Vibration.vibrate();
    this.setState(prevState => {
      const quantidade = prevState.pedidos[pedido] + 1;
      return {
        pedidos: {
          ...prevState.pedidos,
          [pedido]: quantidade
        }
      };
    }, () => {
      this.salvarItens.salvar(pedido, this.state.pedidos[pedido]);
    });
  }
  handleRemove(pedido) {
    if (this.state.pedidos[pedido] > 0) {
      this.setState(prevState => {
        const quantidade = prevState.pedidos[pedido] - 1;
        return {
          pedidos: {
            ...prevState.pedidos,
            [pedido]: quantidade
          }
        };
      }, () => {
        this.salvarItens.salvar(pedido, this.state.pedidos[pedido]);
      });
    }
  }
  render(){
    const { pedidos } = this.state;
    return (
       <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
      <View style={estilos.container}>
        <Text style={estilos.texto_pedidos}>
          Menu Bebidas:
          {"\n"}1- Refrigerante <Button title={`+ (${pedidos['Refrigerante']})`} onPress={() => this.handlePress('Refrigerante')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Refrigerante')} color="red" />
          {"\n"}2- Suco <Button title={`+ (${pedidos['Suco']})`} onPress={() => this.handlePress('Suco')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Suco')} color="red" />
          {"\n"}3- Água Mineral<Button title={`+ (${pedidos['Água Mineral']})`} onPress={() => this.handlePress('Água Mineral')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Água Mineral')} color="red" />
          {"\n"}4- Café <Button title={`+ (${pedidos['Café']})`} onPress={() => this.handlePress('Café')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Café')} color="red" />
          {"\n"}4- Energetico <Button title={`+ (${pedidos['Energetico']})`} onPress={() => this.handlePress('Energetico')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Energetico')} color="red" />
          {"\n"}4- Cerveja <Button title={`+ (${pedidos['Cerveja']})`} onPress={() => this.handlePress('Cerveja')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Cerveja')} color="red" />
        </Text>
      </View>
      </ImageBackground>
    );
  }
}

  class Pasteis extends React.Component {
    constructor(props) {
    super(props);
    this.state = {
      pedidos: {
        'Carne': 0,
        'Queijo': 0,
        'Sabonete Dove Original': 0,
        'Frango c/Catupiry': 0,
        'Carne  c/Queijo': 0,
        'Pizza': 0,
        'Neosaldina': 0,
        'Carne Queijo e ovo': 0,
      }
    };
    this.salvarItens = new SalvarItens();
  }
  handlePress(pedido) {
    Vibration.vibrate();
    this.setState(prevState => {
      const quantidade = prevState.pedidos[pedido] + 1;
      return {
        pedidos: {
          ...prevState.pedidos,
          [pedido]: quantidade
        }
      };
    }, () => {
      this.salvarItens.salvar(pedido, this.state.pedidos[pedido]);
    });
  }
  handleRemove(pedido) {
    if (this.state.pedidos[pedido] > 0) {
      this.setState(prevState => {
        const quantidade = prevState.pedidos[pedido] - 1;
        return {
          pedidos: {
            ...prevState.pedidos,
            [pedido]: quantidade
          }
        };
      }, () => {
        this.salvarItens.salvar(pedido, this.state.pedidos[pedido]);
      });
    }
  }
  render(){
    const { pedidos } = this.state;
    return (
       <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
      <View style={estilos.container}>
        <Text style={estilos.texto_pedidos}>
          {"\n"}
          Menu Pasteis:
          {"\n"}1- Carne <Button title={`+ (${pedidos['Carne']})`} onPress={() => this.handlePress('Carne')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Carne')} color="red" />
          {"\n"}2- Queijo <Button title={`+ (${pedidos['Queijo']})`} onPress={() => this.handlePress('Queijo')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Queijo')} color="red" />
          {"\n"}3- Sabonete Dove Original <Button title={`+ (${pedidos['Sabonete Dove Original']})`} onPress={() => this.handlePress('Sabonete Dove Original')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Sabonete Dove Original')} color="red" />
          {"\n"}4- Frango c/Catupiry <Button title={`+ (${pedidos['Frango c/Catupiry']})`} onPress={() => this.handlePress('Frango c/Catupiry')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Frango c/Catupiry')} color="red" />
          {"\n"}5- Carne  c/Queijo <Button title={`+ (${pedidos['Carne  c/Queijo']})`} onPress={() => this.handlePress('Carne  c/Queijo')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Carne  c/Queijo')} color="red" />
          {"\n"}6- Pizza <Button title={`+ (${pedidos['Pizza']})`} onPress={() => this.handlePress('Pizza')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Pizza')} color="red" />
          {"\n"}7- Neosaldina <Button title={`+ (${pedidos['Neosaldina']})`} onPress={() => this.handlePress('Neosaldina')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Neosaldina')} color="red" />
          {"\n"}8- Carne Queijo e ovo <Button title={`+ (${pedidos['Carne Queijo e ovo']})`} onPress={() => this.handlePress('Carne Queijo e ovo')} color="#66ccff" />
          <Button title="   -   " onPress={() => this.handleRemove('Carne Queijo e ovo')} color="red" />
        </Text>
      </View>
      </ImageBackground>
    );
  }
}

  


  class Remedios extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        pedidos :{
          'Dorflex': 0,
          'Dipirona': 0,
          'Paracetamol': 0,
          'Ibuprofeno' : 0,
          'Omeprazol': 0,
          'Loratadina': 0,
          'Buscopan': 0,
          'Neosaldina':0,
          'Sabonete Protex Vitamina E': 0,
          'Sal de Fruta':0,
        }
      };
      this.salvarItens = new SalvarItens();
    }
    handlePress(pedido) {
      Vibration.vibrate();
    this.setState(prevState => {
      const quantidade = prevState.pedidos[pedido] + 1;
      return {
        pedidos: {
          ...prevState.pedidos,
          [pedido]: quantidade
        }
      };
    }, () => {
      this.salvarItens.salvar(pedido, this.state.pedidos[pedido]);
    });
  }
  handleRemove(pedido) {
    if (this.state.pedidos[pedido] > 0) {
      this.setState(prevState => {
        const quantidade = prevState.pedidos[pedido] - 1;
        return {
          pedidos: {
            ...prevState.pedidos,
            [pedido]: quantidade
          }
        };
      }, () => {
        this.salvarItens.salvar(pedido, this.state.pedidos[pedido]);
      });
    }
  }
  render(){
    const { pedidos } = this.state;
    return (
       <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
      <View style={estilos.container2}>
        <Text style={estilos.texto_pedidos}>
            {"\n"}
            {"\n"}
            {"\n"}Menu Remedios:
            {"\n"}1- Dorflex <Button title={`+ (${pedidos['Dorflex']})`} onPress={() => this.handlePress('Dorflex')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Dorflex')} color="red" />
            {"\n"}2- Dipirona  <Button  title={`+ (${pedidos['Dipirona']})`} onPress={() => this.handlePress('Dipirona')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Dipirona')} color="red" />
            {"\n"}3- Paracetamol <Button title={`+ (${pedidos['Paracetamol']})`} onPress={() => this.handlePress('Paracetamol')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Paracetamol')} color="red" />
            {"\n"}4- Ibuprofeno <Button title={`+ (${pedidos['Ibuprofeno']})`} onPress={() => this.handlePress('Ibuprofeno')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Ibuprofeno')} color="red" />
            {"\n"}5- Omeprazol <Button title={`+ (${pedidos['Omeprazol']})`} onPress={() => this.handlePress('Omeprazol')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Omeprazol')} color="red" />
            {"\n"}6- Loratadina <Button title={`+ (${pedidos['Loratadina']})`} onPress={() => this.handlePress('Loratadina')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Loratadina')} color="red" />
            {"\n"}7- Buscopan <Button title={`+ (${pedidos['Buscopan']})`} onPress={() => this.handlePress('Buscopan')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Buscopan')} color="red" />
            {"\n"}8- Neosaldina <Button title={`+ (${pedidos['Neosaldina']})`} onPress={() => this.handlePress('Neosaldina')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Neosaldina')} color="red" />
            {"\n"}9- Sabonete Protex Vitamina E <Button title={`+ (${pedidos['Sabonete Protex Vitamina E']})`} onPress={() => this.handlePress('Sabonete Protex Vitamina E')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Sabonete Protex Vitamina E')} color="red" />
            {"\n"}10- Sal de Fruta <Button title={`+ (${pedidos['Sal de Fruta']})`} onPress={() => this.handlePress('Sal de Fruta')} color="#66ccff" />
            <Button title="   -   " onPress={() => this.handleRemove('Sal de Fruta')} color="red" />
            
          
        </Text>
      </View>
      </ImageBackground>
    );
  }
}
 
  class Pedidos extends React.Component {
    render() {
      return (
        <ImageBackground source={require('./assets/fundo_farmacia.png')} style={estilos.background}>
        <View style={estilos.container_nav}>
          <TouchableOpacity style={estilos.botoes_pedidos} onPress={() => this.props.navigation.navigate('Remedios')}>
            <Text>Remedios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.botoes_pedidos} onPress={() => this.props.navigation.navigate('Higienes')}>
            <Text>Higienes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.botoes_pedidos} onPress={() => this.props.navigation.navigate('Pasteis')}>
            <Text>Pasteis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.botoes_pedidos} onPress={() => this.props.navigation.navigate('Bebidas')}>
            <Text>Bebidas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.botoes_pedidos} onPress={() => this.props.navigation.navigate('Salgados')}>
            <Text>Salgados</Text>
          </TouchableOpacity>
        </View>
        </ImageBackground>
      );
    }
  }

  class App extends React.Component {
    render() {
      return (
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen
              name="Login"
              component={Nav2}
              options={{
                tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-account" color={color} size={size} />,
                headerShown: false
              }}
            />
            <Tab.Screen
              name="Criar Usuário"
              component={Cadastro}
              options={{
                tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-details" color={color} size={size} />
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
