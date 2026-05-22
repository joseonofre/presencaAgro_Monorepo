import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Paragraph, Text, YStack } from 'tamagui';

import { EMAIL_RE } from '@/auth/AuthContext';
import { GreenGradient } from '@/components/GreenGradient';
import { LogoMark } from '@/components/Logo';
import { CheckIcon } from '@/components/FeatureIcons';
import { BackLink, Field, PrimaryButton, SecondaryButton } from '@/components/forms';
import { colors } from '@/theme/colors';

export default function EsqueciSenhaScreen() {
  const insets = useSafeAreaInsets();
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
              Esqueci a senha
            </Text>
            <Paragraph fontSize={14} color="rgba(255,255,255,0.9)" text="center">
              Enviaremos um link de redefinição
            </Paragraph>
          </YStack>
        </YStack>

        {/* Card (sobreposto ao header) */}
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
            {enviado ? (
              <YStack gap="$3" items="center" py="$2">
                <YStack width={56} height={56} rounded={9999} bg={colors.greenLight} items="center" justify="center">
                  <CheckIcon size={28} />
                </YStack>
                <Text fontSize={18} fontWeight="800" color={colors.text}>
                  Pedido enviado
                </Text>
                <Paragraph fontSize={14} color={colors.textMuted} text="center" lineHeight={20}>
                  Se houver uma conta para <Text fontWeight="700" color={colors.text}>{email.trim()}</Text>, você
                  receberá um e-mail com o link para redefinir a senha.
                </Paragraph>
              </YStack>
            ) : (
              <>
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
              </>
            )}
          </YStack>

          <YStack mt="$5">
            <SecondaryButton label="Voltar para o login" onPress={() => router.push('/login')} />
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  );
}
