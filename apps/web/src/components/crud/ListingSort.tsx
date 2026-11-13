import { type ComboboxData, Select } from '@mantine/core';

export function ListingSort({
  value,
  direction,
  options,
  onSort,
  onDirection,
}: {
  value: string;
  direction: string;
  options: ComboboxData;
  onSort: (value: string) => void;
  onDirection: (value: string) => void;
}) {
  return (
    <>
      <Select
        label="Urutkan"
        data={options}
        value={value}
        allowDeselect={false}
        onChange={(next) => {
          if (next) {
            onSort(next);
          }
        }}
      />
      <Select
        label="Arah urutan"
        data={[
          { value: 'asc', label: 'Naik' },
          { value: 'desc', label: 'Turun' },
        ]}
        value={direction}
        allowDeselect={false}
        onChange={(next) => {
          if (next) {
            onDirection(next);
          }
        }}
      />
    </>
  );
}
