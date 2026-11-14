import { AccountTypeEnum } from '@credit/contracts';
import {
  Alert,
  Button,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Link, Navigate } from '@tanstack/react-router';
import { PublicPage } from '@web/components/PublicPage';

import { useCompanies } from '@web/features/auth/hooks/useCompanies';
import { useLoginForm } from '@web/features/auth/hooks/useLoginForm';
import { useSession } from '@web/features/auth/hooks/useSession';
import { Controller, useWatch } from 'react-hook-form';

export function LoginPage() {
  const { session, loading, error, login } = useSession();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useLoginForm();
  const type = useWatch({ control, name: 'type' });
  const slug = useWatch({ control, name: 'slug' });
  const { companies, companyError } = useCompanies(type);
  if (session) {
    return <Navigate to="/" replace />;
  }
  return (
    <PublicPage>
      <Stack>
        <Title>Credit System</Title>
        <Text>Masuk ke akun</Text>
        {error && <Alert color="red">{error}</Alert>}
        {companyError && <Alert color="red">{companyError}</Alert>}
        <form noValidate onSubmit={handleSubmit((data) => login(data))}>
          <Stack>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  label="Jenis akun"
                  data={[
                    { value: 'admin', label: 'Admin bank' },
                    { value: 'company', label: 'Perusahaan / HRD' },
                    { value: 'debitor', label: 'Debitor' },
                  ]}
                  value={field.value}
                  onBlur={field.onBlur}
                  allowDeselect={false}
                  error={errors.type?.message}
                  onChange={(v) => {
                    if (
                      v === AccountTypeEnum.Admin ||
                      v === AccountTypeEnum.Company ||
                      v === AccountTypeEnum.Debitor
                    ) {
                      field.onChange(v);
                      setValue('slug', undefined, { shouldValidate: true });
                    }
                  }}
                />
              )}
            />
            {type !== AccountTypeEnum.Admin && (
              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Perusahaan"
                    data={companies}
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? undefined)}
                    onBlur={field.onBlur}
                    required
                    error={errors.slug?.message}
                  />
                )}
              />
            )}
            <TextInput
              label="Username atau email"
              required
              {...register('username')}
              error={errors.username?.message}
            />
            <PasswordInput
              label="Password"
              required
              {...register('password')}
              error={errors.password?.message}
            />
            <Button type="submit" loading={loading}>
              Masuk
            </Button>
          </Stack>
        </form>
        {type === AccountTypeEnum.Debitor && slug && (
          <Link to="/registration/$slug" params={{ slug }}>
            Daftar nasabah
          </Link>
        )}
      </Stack>
    </PublicPage>
  );
}
