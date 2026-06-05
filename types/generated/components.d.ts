import type { Schema, Struct } from '@strapi/strapi';

export interface SharedStack extends Struct.ComponentSchema {
  collectionName: 'components_shared_stacks';
  info: {
    displayName: 'Stack';
  };
  attributes: {
    nom: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.stack': SharedStack;
    }
  }
}
