import { Tabs } from 'expo-router';
import type { ComponentType } from 'react';
import { Platform, View } from 'react-native';

import {
  AgendaIcon,
  HomeIcon,
  PedidosIcon,
  PerfilIcon,
  VisitaIcon,
} from '@/components/TabIcons';
import { colors } from '@/theme/colors';

interface TabIconProps {
  color: string;
  size?: number;
}

/**
 * Envolve o ícone da tab para reproduzir o nav do Figma:
 * barra verde no topo quando ativa (`focused`) e badge vermelho opcional.
 */
function TabBarIcon({
  Icon,
  color,
  focused,
  badge,
}: {
  Icon: ComponentType<TabIconProps>;
  color: string;
  focused: boolean;
  badge?: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 48 }}>
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: -12,
            width: 48,
            height: 4,
            borderBottomLeftRadius: 999,
            borderBottomRightRadius: 999,
            backgroundColor: colors.green,
          }}
        />
      )}
      <Icon color={color} size={22} />
      {badge && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: colors.red,
            borderWidth: 1,
            borderColor: colors.surface,
          }}
        />
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={HomeIcon} color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={PerfilIcon} color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={AgendaIcon} color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="visitas"
        options={{
          title: 'Visitas',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={VisitaIcon} color={String(color)} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={PedidosIcon} color={String(color)} focused={focused} badge />
          ),
        }}
      />
    </Tabs>
  );
}
