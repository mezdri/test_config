export interface TableConfig {
  header: TableHeader;
  property: string;
}

interface TableHeader {
  text: string;
  align?: string;
  value: string;
}
