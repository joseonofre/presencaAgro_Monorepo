import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Text, YStack } from 'tamagui';

import { useAuth } from '@/auth/AuthContext';
import { LogoFull } from '@/components/Logo';
import { BackLink, Field, PrimaryButton } from '@/components/forms';
import { colors } from '@/theme/colors';

export default function LoginScreen() {
  const { signIn } = useAuth();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <YStack flex={1} gap="$5">
          <BackLink onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />

          <YStack items="center" pt="$2">
            <LogoFull size={200} />
          </YStack>

          <YStack gap="$2">
            <Text fontSize={24} fontWeight="800" color={colors.text}>
              Entrar
            </Text>
            <Paragraph fontSize={14} color={colors.textMuted}>
              Acesse sua conta para registrar visitas.
            </Paragraph>
          </YStack>

          <YStack gap="$3">
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
              <Text fontSize={13} fontWeight="600" color={colors.green}>
                Esqueci a senha
              </Text>
            </Pressable>
          </YStack>

          <PrimaryButton
            label={carregando ? 'Entrando…' : 'Entrar'}
            onPress={entrar}
            disabled={carregando}
          />

          <YStack flex={1} />

          <Pressable onPress={() => router.push('/cadastro')} hitSlop={8}>
            <Text fontSize={14} color={colors.textMuted} text="center">
              Não tem conta?{' '}
              <Text fontSize={14} fontWeight="700" color={colors.green}>
                Criar conta
              </Text>
            </Text>
          </Pressable>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
