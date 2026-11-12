import { Text, Title } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { CrudPage } from '@web/components/crud/CrudPage';
import { DetailFields } from '@web/components/crud/DetailFields';
import { RecordState } from '@web/components/crud/RecordState';
import { useSession } from '@web/features/auth/hooks/useSession';
import {
  useCompanyDetail,
  useEntities,
} from '@web/features/companies/hooks/useCompanies';

export function CompaniesViewPage() {
  return (
    <CrudPage program="USC" action="read" title="Detail perusahaan">
      <Content />
    </CrudPage>
  );
}
function Content() {
  const { session } = useSession();
  const token = session?.authToken ?? '';
  const { id } = useParams({ from: '/companies/$id' });
  const query = useCompanyDetail(token, Number(id));
  const entity = useEntities(token);

  return (
    <RecordState
      id={Number(id)}
      query={query}
      pending={entity.isPending}
      error={entity.error}
    >
      {(data) => (
        <>
          <DetailFields
            fields={[
              {
                label: 'Badan usaha',
                value:
                  entity.data?.find((e) => e.id === data.entityTypeId)?.value ??
                  data.entityTypeId,
              },
              { label: 'Nama perusahaan', value: data.companyName },
              { label: 'Username', value: data.username },
              { label: 'Email', value: data.email },
              { label: 'Slug', value: data.slug },
              { label: 'Status', value: data.status },
            ]}
          />
          <Title order={2}>Bunga per tenor</Title>
          {data.bungaKredits.map((v) => (
            <Text key={v.id}>
              {v.jangkaWaktuBulan} bulan: {v.bungaPercentage}%
            </Text>
          ))}
          <Title order={2}>Biaya</Title>
          {data.biaya.map((v) => (
            <Text key={v.id}>
              {v.expenseType}: {v.value} ({v.type})
            </Text>
          ))}
          <Link to="/companies">Kembali</Link>
        </>
      )}
    </RecordState>
  );
}
