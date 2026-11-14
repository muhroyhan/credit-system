import {
  AppShell,
  Burger,
  Button,
  Drawer,
  Group,
  NavLink,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useSession } from '@web/features/auth/hooks/useSession';
import { crudaAccess } from '@web/utils/cruda';

export function AppLayout() {
  const { session, logout } = useSession();
  const [opened, { toggle, close }] = useDisclosure();
  const mobile = useMediaQuery('(max-width: 47.99em)');
  const path = useRouterState({ select: (state) => state.location.pathname });
  if (!session || path === '/login' || path.startsWith('/registration/')) {
    return <Outlet />;
  }
  const items = [
    { label: 'Beranda', to: '/' as const, visible: true },
    {
      label: 'Admin User',
      to: '/admin-users' as const,
      visible: crudaAccess(session, 'USA').read,
    },
    {
      label: 'Perusahaan',
      to: '/companies' as const,
      visible: crudaAccess(session, 'USC').read,
    },
    {
      label: 'Master Karyawan',
      to: '/employees' as const,
      visible: crudaAccess(session, 'CGP').read,
    },
    {
      label: 'Pengajuan Kredit',
      to: '/credits' as const,
      visible: crudaAccess(session, 'CGP').read,
    },
    {
      label: 'Daftar Kredit Karyawan',
      to: '/credit-reviews' as const,
      visible: crudaAccess(session, 'DKN').read,
    },
  ];
  const navigation = (
    <Stack gap={4}>
      {items
        .filter((item) => item.visible)
        .map((item) => (
          <NavLink
            key={item.to}
            color="#005691"
            component={Link}
            to={item.to}
            label={item.label}
            aria-current={
              (
                item.to === '/'
                  ? path === '/'
                  : path === item.to || path.startsWith(`${item.to}/`)
              )
                ? 'page'
                : undefined
            }
            active={
              item.to === '/'
                ? path === '/'
                : path === item.to || path.startsWith(`${item.to}/`)
            }
            onClick={close}
          />
        ))}
    </Stack>
  );
  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: true } }}
      padding={{ base: 'md', sm: 'xl' }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              aria-expanded={opened}
              aria-controls="mobile-navigation"
              aria-label={opened ? 'Tutup menu' : 'Buka menu'}
            />
            <Text fw={700} c="#005691">
              Credit System
            </Text>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Text size="sm" visibleFrom="xs">
              {session.type}
            </Text>
            <Button variant="light" color="#005691" onClick={logout}>
              Keluar
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar
        visibleFrom="sm"
        p="md"
        id="main-navigation"
        style={{ overflowY: 'auto' }}
      >
        <Text size="xs" fw={700} c="dimmed" mb="sm">
          NAVIGASI
        </Text>
        <nav aria-label="Navigasi utama">{navigation}</nav>
      </AppShell.Navbar>
      <Drawer
        id="mobile-navigation"
        opened={opened && mobile}
        onClose={close}
        title="Navigasi"
        size={280}
        hiddenFrom="sm"
        closeButtonProps={{ 'aria-label': 'Tutup navigasi' }}
      >
        <nav aria-label="Navigasi mobile">{navigation}</nav>
      </Drawer>
      <AppShell.Main bg="#f0f0f0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
