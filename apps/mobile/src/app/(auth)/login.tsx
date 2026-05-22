import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Paragraph, Text, YStack } from 'tamagui';

import { useAuth } from '@/auth/AuthContext';
import { GreenGradient } from '@/components/GreenGradient';
import { LogoMark } from '@/components/Logo';
import { LogInIcon } from '@/components/FeatureIcons';
import { BackLink, Field, PrimaryButton } from '@/components/forms';
import { colors } from '@/theme/colors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setErro(null);
    setCarregando(true);
    try {
      await signIn(email, senha);
      // Autenticou: o gate na raiz desmonta esta tela — não chamar setState aqui.
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
      setCarregando(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {/* Header em gradiente */}
        <YStack position="relative" overflow="hidden" pt={insets.top + 16} pb="$8" px="$6" gap="$4">
          <GreenGradient />
          <BackLink tone="light" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <YStack items="center" gap="$2" pt="$2">
            <LogoMark size={52} color={colors.white} />
            <Text fontSize={26} fontWeight="800" color={colors.white}>
              Bem-vindo de volta
            </Text>
            <Paragraph fontSize={14} color="rgba(255,255,255,0.9)" text="center">
              Entre para registrar suas visitas
            </Paragraph>
          </YStack>
        </YStack>

        {/* Card do formulário (sobreposto ao header) */}
        <YStack px="$4" mt={-24}>
          <YStack
            bg={colors.surface}
            rounded={20}
            p="$5"
            gap="$4"
            borderWidth={1}
            borderColor={colors.border}
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }}
          >
            <Field
              label="E-MAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@revenda.com.br"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="SENHA"
              value={senha}
              onChangeText={setSenha}
              placeholder="••••••••"
              secureTextEntry
            />
            {erro ? (
              <Text fontSize={13} color={colors.red}>
                {erro}
              </Text>
            ) : null}
            <Pressable onPress={() => router.push('/esqueci-senha')} hitSlop={8}>
              <Text fontSize={13} fontWeight="600" color={colors.green} text="right">
                Esqueci a senha
              </Text>
            </Pressable>
            <PrimaryButton
              label={carregando ? 'Entrando…' : 'Entrar'}
              icon={carregando ? undefined : <LogInIcon />}
              onPress={entrar}
              disabled={carregando}
            />
          </YStack>

          <Pressable onPress={() => router.push('/cadastro')} hitSlop={8} style={{ marginTop: 24 }}>
            <Text fontSize={14} color={colors.textMuted} text="center">
              Não tem conta?{' '}
              <Text fontSize={14} fontWeight="700" color={colors.green}>
                Criar conta
              </Text>
            </Text>
          </Pressable>
        </YStack>
      </ScrollView>
    </View>
  );
}
