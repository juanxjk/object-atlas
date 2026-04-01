import { ObjectMediaRecord, ObjectRecord } from './object.types';

export type PublicObjectRecord = Pick<
  ObjectRecord,
  'id' | 'publicId' | 'title' | 'description' | 'story' | 'createdAt' | 'updatedAt'
> & {
  media: ObjectMediaRecord[];
};
