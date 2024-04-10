interface ProviderOffersJsonItem {
  id: string;
  encryption: Record<string, string>;
  resource: Record<string, string>;
}

export type ProviderOffersJson = ProviderOffersJsonItem[];

type ResourceFileContent = Omit<ProviderOffersJsonItem, 'id'>;

export interface InputOffer {
  id: ProviderOffersJsonItem['id'];
  resourceFileContent: ResourceFileContent;
}
