export type {
  ObjectMediaRecord,
  ObjectRecord,
  PublicObjectRecord
} from '../../../../packages/types/src';

export type CreateObjectInput = {
  title: string;
  description: string | null;
  story: string | null;
  tags: string[];
  collectionId: string | null;
  metadata: Record<string, unknown>;
};

export type UpdateObjectInput = Partial<CreateObjectInput>;
