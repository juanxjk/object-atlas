export type {
  CollectionRecord,
  CollectionSummary,
  CollectionVisibility,
  CollectionWithObjectsRecord,
  PublicCollectionRecord
} from '../../../../packages/types/src';

export type CreateCollectionInput = {
  title: string;
  description: string | null;
  visibility: 'private' | 'unlisted' | 'public';
};

export type UpdateCollectionInput = Partial<CreateCollectionInput>;
