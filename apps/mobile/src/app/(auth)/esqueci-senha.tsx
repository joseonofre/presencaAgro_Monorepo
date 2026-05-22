import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Paragraph, Text, YStack } from 'tamagui';

import { BackLink, Field, PrimaryButton, SecondaryButton } from '@/components/forms';
import { colors } from '@/theme/colors';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function EsqueciSenhaScreen() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  function enviar() {
    const e = email.trim();
    if (!e) {
      setErro('Informe seu e-mail.');
      return;
    }
    if (!EMAIL_RE.test(e)) {
      setErro('E-mail inválido.');
      return;
    }
    // Mock: não há backend; apenas confirma o pedido sem revelar se a conta existe.
    setErro(null);
    setEnviado(true);
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
              Esqueci a senha
            </Text>
            <Paragraph fontSize={14} color={colors.textMuted}>
              Informe o e-mail da sua conta e enviaremos um link de redefinição.
            </Paragraph>
          </YStack>

          {enviado ? (
            <Card p="$4" borderWidth={1} borderColor={colors.border} bg={colors.greenLighter}>
              <YStack gap="$2">
                <Text fontSize={16} fontWeight="700" color={colors.green}>
                  Pedido enviado
                </Text>
                <Paragraph fontSize={14} color={colors.text} lineHeight={20}>
                  Se houver uma conta para <Text fontWeight="700">{email.trim()}</Text>,
                  você receberá um e-mail com o link para redefinir a senha.
                </Paragraph>
              </YStack>
            </Card>
          ) : (
            <YStack gap="$3">
              <Field
                label="E-MAIL"
                value={email}
                onChangeText={setEmail}
                placeholder="voce@revenda.com.br"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {erro ? (
                <Text fontSize={13} color={colors.red}>
                  {erro}
                </Text>
              ) : null}
              <PrimaryButton label="Enviar link" onPress={enviar} />
            </YStack>
          )}

          <YStack flex={1} />

          <SecondaryButton label="Voltar para o login" onPress={() => router.push('/login')} />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
