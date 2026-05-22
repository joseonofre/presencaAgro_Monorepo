import type { KeyboardTypeOptions } from 'react-native';
import { Pressable } from 'react-native';
import { Input, Text, YStack } from 'tamagui';

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
        bg={colors.surface}
        borderColor={colors.border}
        color={colors.text}
      />
    </YStack>
  );
}

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

/** Botão primário verde (ação principal). */
export function PrimaryButton({ label, onPress, disabled }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {({ pressed }) => (
        <YStack
          py="$3.5"
          rounded="$4"
          items="center"
          bg={disabled ? colors.borderStrong : pressed ? colors.greenDark : colors.green}
        >
          <Text fontSize={16} fontWeight="700" color={colors.white}>
            {label}
          </Text>
        </YStack>
      )}
    </Pressable>
  );
}

/** Botão secundário com contorno verde. */
export function SecondaryButton({ label, onPress, disabled }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {({ pressed }) => (
        <YStack
          py="$3.5"
          rounded="$4"
          items="center"
          borderWidth={1.5}
          borderColor={colors.green}
          bg={pressed ? colors.greenLighter : 'transparent'}
        >
          <Text fontSize={16} fontWeight="700" color={colors.green}>
            {label}
          </Text>
        </YStack>
      )}
    </Pressable>
  );
}

/** Link de voltar (chevron + texto) para o topo das telas públicas. */
export function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12}>
      {({ pressed }) => (
        <Text fontSize={15} fontWeight="600" color={pressed ? colors.greenDark : colors.green}>
          ‹ Voltar
        </Text>
      )}
    </Pressable>
  );
}
