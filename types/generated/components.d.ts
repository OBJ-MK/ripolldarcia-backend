import type { Schema, Struct } from '@strapi/strapi';

export interface SharedMediaImageLegende extends Struct.ComponentSchema {
  collectionName: 'components_shared_media_image_legendes';
  info: {
    displayName: 'media.image-legende';
  };
  attributes: {
    Image: Schema.Attribute.Media<'images' | 'files' | 'videos'> &
      Schema.Attribute.Required;
    Legende: Schema.Attribute.Text;
  };
}

export interface SharedOption extends Struct.ComponentSchema {
  collectionName: 'components_shared_options';
  info: {
    displayName: 'Option';
    icon: 'attachment';
  };
  attributes: {};
}

export interface SharedProjetBadge extends Struct.ComponentSchema {
  collectionName: 'components_shared_projet_badges';
  info: {
    displayName: 'projet.badge';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Facebook'>;
    Type: Schema.Attribute.Enumeration<
      ['reseau-social', 'services', 'communication']
    >;
  };
}

export interface SharedProjetLien extends Struct.ComponentSchema {
  collectionName: 'components_shared_projet_liens';
  info: {
    displayName: 'projet.lien';
  };
  attributes: {
    Label: Schema.Attribute.String;
    URL: Schema.Attribute.String;
  };
}

export interface SharedStack extends Struct.ComponentSchema {
  collectionName: 'components_shared_stacks';
  info: {
    displayName: 'Stack';
  };
  attributes: {
    nom: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedStatistique extends Struct.ComponentSchema {
  collectionName: 'components_shared_statistiques';
  info: {
    displayName: 'Statistique';
  };
  attributes: {
    Label: Schema.Attribute.String;
    Valeur: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.media-image-legende': SharedMediaImageLegende;
      'shared.option': SharedOption;
      'shared.projet-badge': SharedProjetBadge;
      'shared.projet-lien': SharedProjetLien;
      'shared.stack': SharedStack;
      'shared.statistique': SharedStatistique;
    }
  }
}
