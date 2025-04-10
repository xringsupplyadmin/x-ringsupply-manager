CREATE MIGRATION m1uwrxz6eoe5oj7m2vgrklj2o63jo5htx7vfk7omr7hwwcwbb6ch2q
    ONTO m1sxdihliigvpnkuijnsb3cor2hnkrw6mb75whzbs7qh7527lrt3nq
{
  CREATE MODULE ecommerce IF NOT EXISTS;
  CREATE MODULE utils IF NOT EXISTS;
  CREATE TYPE utils::SassHeader {
      CREATE REQUIRED PROPERTY includeOrder: std::int64;
      CREATE REQUIRED PROPERTY internal: std::bool;
      CREATE CONSTRAINT std::exclusive ON ((.internal, .includeOrder));
      CREATE REQUIRED PROPERTY name: std::str {
          CREATE CONSTRAINT std::exclusive;
          CREATE CONSTRAINT std::min_len_value(1);
      };
      CREATE REQUIRED PROPERTY value: std::str;
  };
  CREATE FUNCTION utils::nextIncludeOrder(internal: std::bool) ->  std::int64 USING (SELECT
      (((SELECT
          std::max(utils::SassHeader.includeOrder)
      FILTER
          (utils::SassHeader.internal = internal)
      ) ?? 0) + 1)
  );
  CREATE TYPE ecommerce::Category {
      CREATE REQUIRED PROPERTY cfId: std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY code: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY description: std::str;
  };
  CREATE TYPE ecommerce::Department {
      CREATE MULTI LINK categories: ecommerce::Category;
      CREATE REQUIRED PROPERTY cfId: std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY code: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY description: std::str;
  };
  ALTER TYPE ecommerce::Category {
      CREATE LINK department := (.<categories[IS ecommerce::Department]);
  };
  CREATE TYPE ecommerce::Manufacturer {
      CREATE REQUIRED PROPERTY cfId: std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY code: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE PROPERTY detailedDescription: std::str;
      CREATE PROPERTY imageId: std::int64;
      CREATE REQUIRED PROPERTY inactive: std::bool;
      CREATE PROPERTY metaDescription: std::str;
  };
  CREATE TYPE ecommerce::Tag {
      CREATE REQUIRED PROPERTY cfId: std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY code: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE PROPERTY detailedDescription: std::str;
      CREATE REQUIRED PROPERTY inactive: std::bool;
      CREATE PROPERTY metaDescription: std::str;
  };
  CREATE TYPE ecommerce::Product {
      CREATE REQUIRED PROPERTY productCategoryIds: array<std::int64>;
      CREATE MULTI LINK productCategories := (SELECT
          ecommerce::Category
      FILTER
          (.cfId IN std::array_unpack(__source__.productCategoryIds))
      );
      CREATE PROPERTY productManufacturerId: std::int64;
      CREATE LINK productManufacturer := (SELECT
          ecommerce::Manufacturer
      FILTER
          (.cfId = __source__.productManufacturerId)
      );
      CREATE REQUIRED PROPERTY productTagIds: array<std::int64>;
      CREATE MULTI LINK productTags := (SELECT
          ecommerce::Tag
      FILTER
          (.cfId IN std::array_unpack(__source__.productTagIds))
      );
      CREATE PROPERTY baseCost: std::float64;
      CREATE REQUIRED PROPERTY cfId: std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY code: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY dateCreated: std::datetime;
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE PROPERTY detailedDescription: std::str;
      CREATE PROPERTY imageId: std::int64;
      CREATE REQUIRED PROPERTY imageUrls: array<std::str>;
      CREATE PROPERTY linkName: std::str;
      CREATE PROPERTY listPrice: std::float64;
      CREATE PROPERTY manufacturerAdvertisedPrice: std::float64;
      CREATE PROPERTY manufacturerImageId: std::int64;
      CREATE PROPERTY manufacturerSku: std::str;
      CREATE PROPERTY model: std::str;
      CREATE REQUIRED PROPERTY sortOrder: std::int64 {
          SET default := 100;
      };
      CREATE REQUIRED PROPERTY timeChanged: std::datetime;
      CREATE PROPERTY upcCode: std::str;
  };
  CREATE TYPE ecommerce::Location {
      CREATE REQUIRED PROPERTY cfId: std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY code: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY inactive: std::bool;
      CREATE REQUIRED PROPERTY internalUse: std::bool;
  };
};
