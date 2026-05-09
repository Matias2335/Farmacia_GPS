import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  FlatList
} from 'react-native';
import { supabase } from '../Config/supabase';
import AppHeader from '../components/AppHeader';

const TEMA = {
  fundo: '#F0FAFA',
  primario: '#00BFA5',
  card: '#FFFFFF',
  texto: '#1A2B2B',
  aprovado: '#00BFA5',
  rejeitado: '#E53935',
  pendente: '#FFA000'
};

export default function Perfil({ navigation }) {

  const [email, setEmail] = useState('');
  const [receitas, setReceitas] = useState([]);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    const { data } = await supabase.auth.getUser();

    if (data?.user) {
      setEmail(data.user.email);
      carregarReceitas(data.user.id);
    }
  }

  async function carregarReceitas(userId) {
    const { data, error } = await supabase
      .from('receitas')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false });

    if (error) {
      console.log(error);
      alert('Erro ao carregar receitas');
    } else {
      setReceitas(data);
    }
  }

  async function redefinirSenha() {
    try {
      if (!email) {
        alert('Usuário não encontrado');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://farmacia.tccburnout.tech'
});

      if (error) throw error;

      alert('Email de redefinição enviado! Verifique o SPAM.');

    } catch (erro) {
      alert('Erro: ' + erro.message);
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  function corStatus(status) {
    if (status === 'aprovado') return TEMA.aprovado;
    if (status === 'rejeitado') return TEMA.rejeitado;
    return TEMA.pendente;
  }

  function textoStatus(status) {
    if (status === 'aprovado') return 'Aprovado';
    if (status === 'rejeitado') return 'Rejeitado';
    return 'Em análise';
  }

  return (
    <View style={{ flex: 1, backgroundColor: TEMA.fundo }}>

      <AppHeader
        titulo="Perfil"
        onBack={() => navigation.goBack()}
      />

      <View style={{ padding: 20 }}>

        {/* 👤 USUÁRIO */}
        <Text style={{ fontSize: 20, marginBottom: 20 }}>
          👤 Perfil do Usuário
        </Text>

        <Text>Email:</Text>
        <Text style={{ marginBottom: 20 }}>{email}</Text>

        {/* 🔑 RESET SENHA */}
        <TouchableOpacity
          onPress={redefinirSenha}
          style={{
            backgroundColor: TEMA.primario,
            padding: 12,
            borderRadius: 8,
            marginBottom: 10
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            Redefinir senha
          </Text>
        </TouchableOpacity>

        {/* 🚪 LOGOUT */}
        <TouchableOpacity
          onPress={logout}
          style={{
            backgroundColor: 'red',
            padding: 12,
            borderRadius: 8,
            marginBottom: 20
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            Sair
          </Text>
        </TouchableOpacity>

        {/* 📄 RECEITAS */}
        <Text style={{ fontSize: 18, marginBottom: 10 }}>
          📄 Minhas Receitas
        </Text>

        <FlatList
          data={receitas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: TEMA.card,
              padding: 15,
              borderRadius: 10,
              marginBottom: 10
            }}>

              <Text style={{ fontWeight: 'bold' }}>
                {item.nome}
              </Text>

              {/* STATUS */}
              <Text style={{
                color: corStatus(item.status),
                fontWeight: 'bold',
                marginTop: 5
              }}>
                Status: {textoStatus(item.status)}
              </Text>

              {/* 🔥 MOTIVO PROFISSIONAL */}
              {item.status === 'rejeitado' && item.motivo && (
                <View style={{
                  marginTop: 8,
                  backgroundColor: '#FFEAEA',
                  padding: 10,
                  borderRadius: 8
                }}>
                  <Text style={{ color: TEMA.rejeitado, fontWeight: 'bold' }}>
                    Motivo da rejeição:
                  </Text>
                  <Text style={{ color: '#333' }}>
                    {item.motivo}
                  </Text>
                </View>
              )}

              {/* APROVADO */}
              {item.status === 'aprovado' && (
                <Text style={{
                  marginTop: 8,
                  color: TEMA.aprovado
                }}>
                  ✔ Receita validada com sucesso
                </Text>
              )}

            </View>
          )}
        />

      </View>
    </View>
  );
}