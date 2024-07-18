CREATE MIGRATION m1rt7ed3pcjjznrnpdd5jvnhjradqhsq6bqs7kz6dgeggksfuil7ka
    ONTO m1aldjjjtw5zar42ajkgwdpv73ckjrac6c3yrwmbxtfwx4vtfua3fa
{
  CREATE MODULE coreforce IF NOT EXISTS;
  CREATE TYPE coreforce::CartItem {
      CREATE REQUIRED PROPERTY cartId: std::int64;
      CREATE REQUIRED PROPERTY cartItemId: std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY description: std::str {
          SET default := '';
      };
      CREATE REQUIRED PROPERTY imageUrl: std::str;
      CREATE REQUIRED PROPERTY listPrice: std::float64 {
          SET default := 0.0;
      };
      CREATE PROPERTY manufacturerSku: std::str;
      CREATE PROPERTY model: std::str;
      CREATE REQUIRED PROPERTY productId: std::int64;
      CREATE REQUIRED PROPERTY quantity: std::int64;
      CREATE REQUIRED PROPERTY salePrice: std::float64 {
          SET default := 0.0;
      };
      CREATE REQUIRED PROPERTY smallImageUrl: std::str;
      CREATE REQUIRED PROPERTY timeSubmitted: std::datetime;
      CREATE REQUIRED PROPERTY unitPrice: std::float64 {
          SET default := 0.0;
      };
      CREATE PROPERTY upcCode: std::str;
  };
  CREATE TYPE coreforce::ProductAddon {
      CREATE REQUIRED LINK cartItem: coreforce::CartItem {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY cartItemId: std::int64;
      CREATE REQUIRED PROPERTY productAddonId: std::int64;
      CREATE CONSTRAINT std::exclusive ON ((.cartItemId, .productAddonId));
      CREATE REQUIRED PROPERTY cartItemAddonId: std::int64;
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE PROPERTY groupDescription: std::str;
      CREATE REQUIRED PROPERTY productId: std::int64;
      CREATE REQUIRED PROPERTY quantity: std::int64;
      CREATE REQUIRED PROPERTY salePrice: std::float64;
      CREATE REQUIRED PROPERTY sortOrder: std::int64;
  };
  ALTER TYPE coreforce::CartItem {
      CREATE MULTI LINK addons := (.<cartItem[IS coreforce::ProductAddon]);
  };
  CREATE TYPE coreforce::Contact {
      CREATE REQUIRED PROPERTY contactId: std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.contactId);
      CREATE PROPERTY address1: std::str;
      CREATE PROPERTY address2: std::str;
      CREATE PROPERTY alternateEmail: std::str;
      CREATE PROPERTY businessName: std::str;
      CREATE PROPERTY city: std::str;
      CREATE PROPERTY company: std::str;
      CREATE PROPERTY country: std::str;
      CREATE PROPERTY firstName: std::str;
      CREATE PROPERTY lastName: std::str;
      CREATE PROPERTY notes: std::str;
      CREATE PROPERTY phone: std::str;
      CREATE PROPERTY phoneNumbers: std::str;
      CREATE PROPERTY postalCode: std::str;
      CREATE PROPERTY primaryEmailAddress: std::str;
      CREATE PROPERTY salutation: std::str;
      CREATE PROPERTY state: std::str;
  };
  ALTER TYPE coreforce::CartItem {
      CREATE REQUIRED LINK contact: coreforce::Contact;
  };
  ALTER TYPE coreforce::Contact {
      CREATE MULTI LINK items := (.<contact[IS coreforce::CartItem]);
  };
  CREATE TYPE coreforce::EmailTask {
      CREATE REQUIRED LINK contact: coreforce::Contact {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY origination: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE PROPERTY sequence: std::int64 {
          SET default := (<std::int64>{});
      };
  };
};
