import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, Modal, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { supabase } from '../Config/supabase';

const TEMA = {
  primario: '#00BFA5',
  fundo: '#F0FAFA',
  card: '#FFFFFF',
  texto: '#1A2B2B',
  btnAdicionar: '#00BFA5',
  btnRemover: '#EF5350',
};

export default function Farmaceutico({ navigation }) {

  const [receitas, setReceitas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [idSelecionado, setIdSelecionado] = useState(null);

  useEffect(() => {
    carregarReceitas();
  }, []);

  async function carregarReceitas() {
    const { data, error } = await supabase
      .from('receitas')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.log(error);
      alert('Erro ao carregar receitas');
    } else {
      setReceitas(data);
    }
  }

  function abrirArquivo(url) {
    Linking.openURL(url);
  }

  async function aprovar(id) {
    const { error } = await supabase
      .from('receitas')
      .update({ status: 'aprovado', motivo: null })
      .eq('id', id);

    if (error) {
      console.log(error);
      alert('Erro ao aprovar');
    } else {
      carregarReceitas();
    }
  }

  function abrirModal(id) {
    setIdSelecionado(id);
    setMotivo('');
    setModalVisible(true);
  }

  async function confirmarRejeicao() {
    if (!motivo.trim()) {
      alert('Digite o motivo');
      return;
    }

    const { error } = await supabase
      .from('receitas')
      .update({
        status: 'rejeitado',
        motivo: motivo.trim()
      })
      .eq('id', idSelecionado);

    if (error) {
      console.log(error);
      alert('Erro ao rejeitar');
    } else {
      setModalVisible(false);
      carregarReceitas();
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: TEMA.fundo }}>

      {/* HEADER */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          📄 Receitas
        </Text>

        <TouchableOpacity onPress={logout}>
          <Text style={{ color: 'red', fontWeight: 'bold' }}>
            Sair
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={receitas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {

          const isImagem = item.nome.match(/\.(jpg|jpeg|png)$/i);
          const isPDF = item.nome.toLowerCase().endsWith('.pdf');

          return (
            <View style={{
              backgroundColor: TEMA.card,
              padding: 15,
              margin: 10,
              borderRadius: 12
            }}>
              <Text style={{ fontWeight: 'bold' }}>{item.nome}</Text>

              {isImagem && (
                <TouchableOpacity onPress={() => abrirArquivo(item.uri)}>
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: '100%', height: 200, marginTop: 10 }}
                  />
                </TouchableOpacity>
              )}

              {isPDF && (
                <TouchableOpacity onPress={() => abrirArquivo(item.uri)}>
                  <Text style={{ marginTop: 10 }}>📄 Abrir PDF</Text>
                </TouchableOpacity>
              )}

              <Text>Status: {item.status}</Text>

              {item.motivo && (
                <Text style={{ color: 'red' }}>
                  Motivo: {item.motivo}
                </Text>
              )}

              {/* BOTÕES BONITOS */}
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: TEMA.btnAdicionar,
                    padding: 10,
                    flex: 1,
                    marginRight: 5,
                    borderRadius: 8
                  }}
                  onPress={() => aprovar(item.id)}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>
                    Aprovar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: TEMA.btnRemover,
                    padding: 10,
                    flex: 1,
                    marginLeft: 5,
                    borderRadius: 8
                  }}
                  onPress={() => abrirModal(item.id)}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>
                    Rejeitar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 20
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 10
          }}>
            <Text>Motivo da rejeição:</Text>

            <TextInput
              value={motivo}
              onChangeText={setMotivo}
              style={{
                borderWidth: 1,
                marginVertical: 10,
                padding: 10,
                borderRadius: 8
              }}
              multiline
            />

            <TouchableOpacity
              onPress={confirmarRejeicao}
              style={{
                backgroundColor: TEMA.btnRemover,
                padding: 10,
                borderRadius: 8
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}