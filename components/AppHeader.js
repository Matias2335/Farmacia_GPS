import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import estilos from './estilo';

export default function AppHeader({ titulo, onBack, onMenu, onRightPress, rightLabel }) {
  return (
    <View style={estilos.header}>

      {/* ESQUERDA */}
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={estilos.headerBotao}>
          <Text style={estilos.headerIcone}>←</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onRightPress} style={estilos.headerBotao}>
          <Text style={{ color: '#E53935', fontWeight: 'bold' }}>
            {rightLabel || 'Sair'}
          </Text>
        </TouchableOpacity>
      )}

      {/* TÍTULO */}
      <Text style={estilos.headerTitulo}>{titulo}</Text>

      {/* DIREITA */}
      {onMenu ? (
        <TouchableOpacity onPress={onMenu} style={estilos.headerBotao}>
          <Text style={estilos.headerIcone}>☰</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}

    </View>
  );
}