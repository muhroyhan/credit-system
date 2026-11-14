import {
  Alert,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { PublicPage } from '@web/components/PublicPage';
import { useRegistration } from '@web/features/registration/hooks/useRegistration';
export function RegistrationPage() {
  const { slug } = useParams({ from: '/registration/$slug' });
  const { form, save, loginError } = useRegistration(slug);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  return (
    <PublicPage>
      <Stack>
        <Title>Registrasi nasabah</Title>
        <Text>Perusahaan: {slug}</Text>
        <form noValidate onSubmit={handleSubmit((input) => save.mutate(input))}>
          <Stack>
            <TextInput
              label="Nama lengkap"
              {...register('namaLengkap')}
              error={errors.namaLengkap?.message}
              required
            />
            <TextInput
              label="Username"
              {...register('username')}
              error={errors.username?.message}
              required
            />
            <PasswordInput
              label="Password"
              {...register('password')}
              error={errors.password?.message}
              required
            />
            <PasswordInput
              label="Konfirmasi password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              required
            />
            {save.error && <Alert color="red.8">{save.error.message}</Alert>}
            {loginError && (
              <Alert color="red.8">
                Akun berhasil dibuat. Login otomatis gagal; silakan masuk
                melalui halaman login.
              </Alert>
            )}
            <Button
              type="submit"
              loading={save.isPending}
              disabled={save.isSuccess}
            >
              Daftar
            </Button>
          </Stack>
        </form>
        <Link to="/login">Masuk</Link>
      </Stack>
    </PublicPage>
  );
}
