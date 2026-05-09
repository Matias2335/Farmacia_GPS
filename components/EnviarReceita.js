import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';

import { Picker } from '@react-native-picker/picker';

import { supabase } from '../Config/supabase';

import { MEDICAMENTOS_CONTROLADOS } from './controlados';

const TEMA = {
  primario: '#00BFA5',
  secundario: '#0097A7',
  fundo: '#F0FAFA',
  card: '#FFFFFF',
  texto: '#1A2B2B',
  textoSecundario: '#546E6E',
  aprovado: '#2E7D32',
  pendente: '#F57F17',
  rejeitado: '#C62828',
};

const STATUS_CONFIG = {
  pendente: {
    cor: TEMA.pendente,
    icone: '⏳',
    label: 'Receita enviada e aguardando aprovação.',
  },

  aprovado: {
    cor: TEMA.aprovado,
    icone: '✅',
    label: 'Receita aprovada!',
  },

  rejeitado: {
    cor: TEMA.rejeitado,
    icone: '❌',
    label: 'Receita rejeitada.',
  },
};

export default function EnviarReceita({ navigation }) {

  const [loading, setLoading] = useState(false);

  const [carregando, setCarregando] = useState(true);

  const [receitas, setReceitas] = useState([]);

  const [medicamento, setMedicamento] = useState('');

  useEffect(() => {
    carregarReceitas();
  }, []);

  async function carregarReceitas() {

    try {

      setCarregando(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {

        console.log(error);

      } else {

        setReceitas(data || []);

      }

    } catch (e) {

      console.log(e);

    } finally {

      setCarregando(false);

    }
  }

  async function enviarReceita() {

    try {

      if (!medicamento) {
        alert('Selecione o medicamento');
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });

      if (result.canceled) return;

      const arquivo = result.assets[0];

      const MAX_SIZE = 5 * 1024 * 1024;

      if (arquivo.size && arquivo.size > MAX_SIZE) {
        alert('Arquivo muito grande. Máximo 5MB.');
        return;
      }

      setLoading(true);

      const response = await fetch(arquivo.uri);

      const arrayBuffer = await response.arrayBuffer();

      const fileName = `${Date.now()}_${arquivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from('receitas')
        .upload(fileName, arrayBuffer, {
          contentType:
            arquivo.mimeType || 'application/octet-stream',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('receitas')
        .getPublicUrl(fileName);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: dbError } = await supabase
        .from('receitas')
        .insert([
          {
            nome: arquivo.name,
            uri: urlData.publicUrl,
            status: 'pendente',
            user_id: user.id,
            motivo: null,
            medicamento: medicamento,
          },
        ]);

      if (dbError) throw dbError;

      alert('Receita enviada com sucesso!');

      setMedicamento('');

      carregarReceitas();

    } catch (erro) {

      console.log(erro);

      alert('Erro ao enviar receita.');

    } finally {

      setLoading(false);

    }
  }

  function renderStatus(receita) {

    const cfg = STATUS_CONFIG[receita.status];

    if (!cfg) return null;

    return (
      <View
        key={receita.id}
        style={[
          styles.statusCard,
          {
            borderLeftColor: cfg.cor,
          },
        ]}
      >

        <Text style={styles.statusIcone}>
          {cfg.icone}
        </Text>

        <View style={{ flex: 1 }}>

          <Text
            style={[
              styles.statusLabel,
              { color: cfg.cor },
            ]}
          >
            {receita.status.toUpperCase()}
          </Text>

          <Text style={styles.statusDesc}>
            {cfg.label}
          </Text>

          <Text style={styles.statusArquivo}>
            💊 {receita.medicamento}
          </Text>

          {receita.status === 'rejeitado' &&
            receita.motivo && (

              <View style={styles.motivoBox}>

                <Text style={styles.motivoTitulo}>
                  Motivo:
                </Text>

                <Text style={styles.motivoTexto}>
                  {receita.motivo}
                </Text>

              </View>

            )}

        </View>

      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: TEMA.fundo }}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.headerBotao}
        >
          <Text style={styles.headerIcone}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitulo}>
          📄 Enviar Receita
        </Text>

        <View style={{ width: 40 }} />

      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>

        {/* INFO */}
        <View style={styles.infoBox}>

          <Text style={styles.infoTitulo}>
            Como funciona?
          </Text>

          <Text style={styles.infoTexto}>
            Envie sua receita médica para liberar
            medicamentos controlados.
          </Text>

        </View>

        {/* LISTA */}
        {carregando ? (

          <ActivityIndicator
            color={TEMA.primario}
            style={{ marginVertical: 30 }}
          />

        ) : receitas.length > 0 ? (

          receitas.map(renderStatus)

        ) : (

          <View style={styles.semReceita}>

            <Text style={styles.semReceitaTexto}>
              Nenhuma receita enviada ainda.
            </Text>

          </View>

        )}

        {/* SELECT */}
        <View style={styles.selectBox}>

          <Text style={styles.selectLabel}>
            Qual medicamento está na receita?
          </Text>

          <Picker
            selectedValue={medicamento}
            onValueChange={(itemValue) =>
              setMedicamento(itemValue)
            }

            style={{
              color: '#000',
              backgroundColor: '#FFF',
            }}

            dropdownIconColor="#000"
          >

            <Picker.Item
              label="Selecione um medicamento"
              value=""
              color="#666"
            />

            {MEDICAMENTOS_CONTROLADOS.map((med) => (

              <Picker.Item
                key={med}
                label={med}
                value={med}
                color="#000"
              />

            ))}

          </Picker>

        </View>

        {/* BOTAO */}
        <TouchableOpacity
          onPress={enviarReceita}
          disabled={loading}
          style={[
            styles.botao,
            loading && { opacity: 0.7 },
          ]}
        >

          {loading ? (

            <ActivityIndicator color="#fff" />

          ) : (

            <Text style={styles.botaoTexto}>
              📤 Selecionar e Enviar
            </Text>

          )}

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: TEMA.primario,

    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight + 8
        : 52,

    paddingBottom: 14,
    paddingHorizontal: 16,

    elevation: 4,
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

  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },

  infoBox: {
    backgroundColor: '#E0F7FA',

    borderRadius: 14,

    padding: 16,

    marginBottom: 20,

    borderLeftWidth: 4,
    borderLeftColor: TEMA.secundario,
  },

  infoTitulo: {
    fontSize: 15,
    fontWeight: '700',

    color: TEMA.texto,

    marginBottom: 6,
  },

  infoTexto: {
    fontSize: 13,
    color: TEMA.textoSecundario,
    lineHeight: 20,
  },

  statusCard: {
    backgroundColor: TEMA.card,

    borderRadius: 14,

    padding: 16,

    marginBottom: 14,

    flexDirection: 'row',

    borderLeftWidth: 5,

    elevation: 2,
  },

  statusIcone: {
    fontSize: 28,
    marginRight: 12,
  },

  statusLabel: {
    fontSize: 13,
    fontWeight: '800',

    marginBottom: 4,
  },

  statusDesc: {
    fontSize: 13,
    color: TEMA.textoSecundario,

    marginBottom: 6,
  },

  statusArquivo: {
    fontSize: 12,
    color: TEMA.textoSecundario,
  },

  motivoBox: {
    marginTop: 10,

    backgroundColor: '#FFEBEE',

    borderRadius: 8,

    padding: 10,
  },

  motivoTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: TEMA.rejeitado,
  },

  motivoTexto: {
    fontSize: 13,
    color: '#B71C1C',
    marginTop: 2,
  },

  semReceita: {
    backgroundColor: '#FFF',

    borderRadius: 12,

    padding: 20,

    alignItems: 'center',

    marginBottom: 20,
  },

  semReceitaTexto: {
    fontSize: 14,
    color: TEMA.textoSecundario,
  },

  selectBox: {
    backgroundColor: '#FFF',

    borderRadius: 12,

    borderWidth: 1,

    borderColor: '#E0E0E0',

    marginBottom: 20,

    overflow: 'hidden',
  },

  selectLabel: {
    fontSize: 14,
    fontWeight: '700',

    paddingHorizontal: 14,
    paddingTop: 14,

    color: TEMA.texto,
  },

  botao: {
    backgroundColor: TEMA.primario,

    paddingVertical: 16,

    borderRadius: 12,

    alignItems: 'center',
  },

  botaoTexto: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },

});