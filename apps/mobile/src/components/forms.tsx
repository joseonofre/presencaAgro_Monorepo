import type { ReactNode } from 'react';
import type { KeyboardTypeOptions } from 'react-native';
import { Pressable } from 'react-native';
import { Input, Text, XStack, YStack } from 'tamagui';

import { BackIcon } from '@/components/TabIcons';
import { colors } from '@/theme/colors';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

/** Campo de formulário rotulado, no estilo visual do app. */
export function Field({ label, ...inputProps }: FieldProps) {
  return (
    <YStack gap="$2">
      <Text fontSize={13} fontWeight="700" color={colors.textMuted}>
        {label}
      </Text>
      <Input
        {...inputProps}
        size="$4"
        height={52}
        rounded={12}
        bg={colors.bg}
        borderColor={colors.border}
        borderWidth={1}
        color={colors.text}
      />
    </YStack>
  );
}

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

/** Botão primário verde (ação principal), com sombra e ícone opcional. */
export function PrimaryButton({ label, onPress, disabled, icon }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {({ pressed }) => (
        <XStack
          height={56}
          rounded={12}
          items="center"
          justify="center"
          gap="$2"
          bg={disabled ? colors.borderStrong : pressed ? colors.greenDark : colors.green}
          style={{
            shadowColor: colors.greenDeep,
            shadowOpacity: disabled ? 0 : 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: disabled ? 0 : 3,
          }}
        >
          {icon}
          <Text fontSize={16} fontWeight="700" color={colors.white}>
            {label}
          </Text>
        </XStack>
      )}
    </Pressable>
  );
}

/** Botão secundário com contorno verde e ícone opcional. */
export function SecondaryButton({ label, onPress, disabled, icon }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {({ pressed }) => (
        <XStack
          height={56}
          rounded={12}
          items="center"
          justify="center"
          gap="$2"
          borderWidth={2}
          borderColor={colors.green}
          bg={pressed ? colors.greenLighter : colors.surface}
        >
          {icon}
          <Text fontSize={16} fontWeight="700" color={colors.green}>
            {label}
          </Text>
        </XStack>
      )}
    </Pressable>
  );
}

/** Link de voltar (chevron + texto). `tone="light"` para usar sobre fundo verde. */
export function BackLink({ onPress, tone = 'green' }: { onPress: () => void; tone?: 'green' | 'light' }) {
  const base = tone === 'light' ? colors.white : colors.green;
  return (
    <Pressable onPress={onPress} hitSlop={12}>
      {({ pressed }) => (
        <XStack items="center" gap="$1.5" opacity={pressed ? 0.7 : 1}>
          <BackIcon color={base} size={20} />
          <Text fontSize={15} fontWeight="600" color={base}>
            Voltar
          </Text>
        </XStack>
      )}
    </Pressable>
  );
}
