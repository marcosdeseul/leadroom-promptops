'use client';

import { Button, Input, Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validators/auth';
import { Field } from '@/components/ui/field';

interface LoginFormProps {
  onSubmit: (data: LoginInput) => void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={4}>
        <Field
          label="Email"
          invalid={!!errors.email}
          errorText={errors.email?.message}
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
          />
        </Field>

        <Field
          label="Password"
          invalid={!!errors.password}
          errorText={errors.password?.message}
        >
          <Input
            {...register('password')}
            type="password"
            placeholder="Enter your password"
          />
        </Field>

        <Button
          type="submit"
          colorPalette="blue"
          size="lg"
          w="full"
          loading={isLoading}
        >
          Login
        </Button>
      </Stack>
    </form>
  );
}
