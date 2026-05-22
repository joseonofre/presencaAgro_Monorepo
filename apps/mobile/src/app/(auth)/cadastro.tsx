import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Text, YStack } from 'tamagui';

import { useAuth } from '@/auth/AuthContext';
import { BackLink, Field, PrimaryButton } from '@/components/forms';
import { colors } from '@/theme/colors';

export default function CadastroScreen() {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function criar() {
    setErro(null);
    setCarregando(true);
    try {
      await signUp({ nome, email, senha });
      // Conta criada: o gate na raiz redireciona para a área logada.
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack flex={1} gap="$5">
          <BackLink onPress={() => router.back()} />

          <YStack gap="$2" pt="$2">
            <Text fontSize={26} fontWeight="800" color={colors.text}>
              Criar conta
            </Text>
            <Paragraph fontSize={14} color={colors.textMuted}>
              Comece a registrar suas visitas técnicas em minutos.
            </Paragraph>
          </YStack>

          <YStack gap="$3">
            <Field
              label="NOME"
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome completo"
              autoCapitalize="words"
            />
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
              placeholder="Crie uma senha"
              secureTextEntry
            />
            {erro ? (
              <Text fontSize={13} color={colors.red}>
                {erro}
              </Text>
            ) : null}
          </YStack>

          <PrimaryButton
            label={carregando ? 'Criando…' : 'Criar conta'}
            onPress={criar}
            disabled={carregando}
          />

          <YStack flex={1} />

          <Pressable onPress={() => router.push('/login')} hitSlop={8}>
            <Text fontSize={14} color={colors.textMuted} text="center">
              Já tem conta?{' '}
              <Text fontSize={14} fontWeight="700" color={colors.green}>
                Entrar
              </Text>
            </Text>
          </Pressable>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
